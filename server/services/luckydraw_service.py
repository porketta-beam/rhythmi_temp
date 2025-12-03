"""
경품추첨 서비스 레이어

메모리 기반으로 참가자 추첨번호 할당 및 추첨 기능을 제공합니다.
싱글톤 패턴으로 구현되어 서버 전체에서 하나의 인스턴스만 존재합니다.
서버 재시작 시 모든 데이터가 초기화됩니다.
"""

import asyncio
import logging
import secrets
import random
from typing import Dict, Optional, List
from datetime import datetime
from dataclasses import dataclass, field

from .connection_manager import ConnectionManager, get_connection_manager

logger = logging.getLogger(__name__)


# ============================================================
# 데이터 클래스 정의
# ============================================================

@dataclass
class Participant:
    """참가자 정보"""
    draw_number: int
    created_at: str
    session_token: str


@dataclass
class DrawRecord:
    """추첨 기록"""
    prize_name: str
    prize_rank: int
    draw_number: int
    drawn_at: str


@dataclass
class PendingDraw:
    """대기 중인 추첨 결과 (결과 발표 전까지 보관)"""
    prize_name: str
    prize_rank: int
    prize_image: Optional[str]
    winners: List[int]
    drawn_at: str


@dataclass
class EventData:
    """이벤트별 데이터"""
    participants: Dict[str, Participant] = field(default_factory=dict)
    draws: List[DrawRecord] = field(default_factory=list)
    next_draw_number: int = 1
    pending_draw: Optional[PendingDraw] = None  # 결과 발표 대기 중인 추첨


# ============================================================
# LuckyDrawService 클래스
# ============================================================

class LuckyDrawService:
    """
    경품추첨 서비스 클래스 (싱글톤)

    참가자 등록, 추첨 실행, 당첨자 관리 기능을 제공합니다.
    ConnectionManager와 연동하여 실시간 브로드캐스트를 지원합니다.
    """

    _instance: Optional["LuckyDrawService"] = None

    def __new__(cls) -> "LuckyDrawService":
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        if self._initialized:
            return

        # 이벤트별 데이터 저장소
        self._storage: Dict[str, EventData] = {}

        # 이벤트별 Lock (동시성 제어)
        self._locks: Dict[str, asyncio.Lock] = {}

        # ConnectionManager 참조 (지연 초기화)
        self._connection_manager: Optional[ConnectionManager] = None

        self._initialized = True
        logger.info("[LuckyDrawService] 초기화 완료")

    @classmethod
    def get_instance(cls) -> "LuckyDrawService":
        """싱글톤 인스턴스 반환"""
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    @property
    def connection_manager(self) -> ConnectionManager:
        """ConnectionManager 인스턴스 (지연 초기화)"""
        if self._connection_manager is None:
            self._connection_manager = get_connection_manager()
        return self._connection_manager

    def _get_lock(self, event_id: str) -> asyncio.Lock:
        """이벤트별 Lock 가져오기 (없으면 생성)"""
        if event_id not in self._locks:
            self._locks[event_id] = asyncio.Lock()
        return self._locks[event_id]

    def _get_event_data(self, event_id: str) -> EventData:
        """이벤트 데이터 가져오기 (없으면 초기화)"""
        if event_id not in self._storage:
            self._storage[event_id] = EventData()
            logger.info(f"[이벤트 생성] event_id={event_id}")
        return self._storage[event_id]

    @staticmethod
    def _generate_session_token() -> str:
        """세션 토큰 생성 (32바이트 URL-safe 랜덤 문자열)"""
        return secrets.token_urlsafe(32)

    # ============================================================
    # 참가자 관련 메서드
    # ============================================================

    async def register_participant(
        self,
        event_id: str,
        session_token: Optional[str] = None
    ) -> Dict:
        """
        참가자 등록 및 추첨번호 할당

        Args:
            event_id: 이벤트 ID
            session_token: 기존 세션 토큰 (있으면 해당 번호 반환)

        Returns:
            {
                "draw_number": int,
                "session_token": str,
                "event_id": str,
                "is_existing": bool
            }
        """
        lock = self._get_lock(event_id)
        event_data = self._get_event_data(event_id)

        async with lock:
            # 기존 토큰이 있으면 해당 번호 반환
            if session_token and session_token in event_data.participants:
                participant = event_data.participants[session_token]
                logger.info(
                    f"[기존 참가자] event_id={event_id}, "
                    f"draw_number={participant.draw_number}, "
                    f"token={session_token[:8]}..."
                )
                return {
                    "draw_number": participant.draw_number,
                    "session_token": session_token,
                    "event_id": event_id,
                    "is_existing": True
                }

            # 신규 참가자 등록
            new_token = session_token or self._generate_session_token()
            draw_number = event_data.next_draw_number
            event_data.next_draw_number += 1

            participant = Participant(
                draw_number=draw_number,
                created_at=datetime.now().isoformat(),
                session_token=new_token
            )
            event_data.participants[new_token] = participant

            logger.info(
                f"[신규 참가자] event_id={event_id}, "
                f"draw_number={draw_number}, "
                f"token={new_token[:8]}..."
            )

            # 참가자 수 브로드캐스트
            total_count = len(event_data.participants)
            await self.connection_manager.broadcast(event_id, {
                "type": "participant_joined",
                "total_count": total_count,
                "draw_number": draw_number
            })

            return {
                "draw_number": draw_number,
                "session_token": new_token,
                "event_id": event_id,
                "is_existing": False
            }

    async def get_participant_by_token(
        self,
        event_id: str,
        session_token: str
    ) -> Optional[Dict]:
        """
        세션 토큰으로 참가자 정보 조회

        Args:
            event_id: 이벤트 ID
            session_token: 세션 토큰

        Returns:
            {"draw_number": int, "created_at": str} 또는 None
        """
        event_data = self._get_event_data(event_id)
        participant = event_data.participants.get(session_token)

        if participant:
            return {
                "draw_number": participant.draw_number,
                "event_id": event_id,
                "created_at": participant.created_at
            }
        return None

    async def get_all_participants(self, event_id: str) -> Dict:
        """
        이벤트의 모든 참가자 목록 조회

        Args:
            event_id: 이벤트 ID

        Returns:
            {
                "total_count": int,
                "participants": List[{"draw_number": int, "created_at": str}]
            }
        """
        event_data = self._get_event_data(event_id)

        participant_list = [
            {
                "draw_number": p.draw_number,
                "created_at": p.created_at
            }
            for p in event_data.participants.values()
        ]

        # draw_number 순으로 정렬
        participant_list.sort(key=lambda x: x["draw_number"])

        return {
            "total_count": len(participant_list),
            "participants": participant_list
        }

    # ============================================================
    # 추첨 관련 메서드
    # ============================================================

    async def draw_winner(
        self,
        event_id: str,
        prize_name: str,
        prize_rank: int,
        count: int = 1
    ) -> Dict:
        """
        추첨 실행

        Args:
            event_id: 이벤트 ID
            prize_name: 상품 이름 (예: "1등 상")
            prize_rank: 상품 등급 (1, 2, 3...)
            count: 당첨자 수 (기본값: 1)

        Returns:
            {
                "prize_name": str,
                "prize_rank": int,
                "winners": List[{"draw_number": int}],
                "drawn_at": str
            }
        """
        lock = self._get_lock(event_id)
        event_data = self._get_event_data(event_id)

        async with lock:
            # 참가자 목록 확인
            if not event_data.participants:
                raise ValueError("참가자가 없습니다. 추첨을 진행할 수 없습니다.")

            # 이미 당첨된 번호 목록 (해당 등급에서)
            existing_winners = {
                draw.draw_number
                for draw in event_data.draws
                if draw.prize_rank == prize_rank
            }

            # 추첨 가능한 번호 목록
            available_numbers = [
                p.draw_number
                for p in event_data.participants.values()
                if p.draw_number not in existing_winners
            ]

            if not available_numbers:
                raise ValueError(
                    f"추첨 가능한 참가자가 없습니다. "
                    f"(이미 {prize_rank}등 상에 당첨된 참가자만 남았습니다)"
                )

            if len(available_numbers) < count:
                raise ValueError(
                    f"요청한 당첨자 수({count})가 "
                    f"추첨 가능한 참가자 수({len(available_numbers)})보다 많습니다."
                )

            # 랜덤 추첨
            selected_numbers = random.sample(available_numbers, count)
            drawn_at = datetime.now().isoformat()

            # 추첨 기록 저장
            for draw_number in selected_numbers:
                record = DrawRecord(
                    prize_name=prize_name,
                    prize_rank=prize_rank,
                    draw_number=draw_number,
                    drawn_at=drawn_at
                )
                event_data.draws.append(record)

            logger.info(
                f"[추첨 완료] event_id={event_id}, "
                f"prize_name={prize_name}, "
                f"prize_rank={prize_rank}, "
                f"winners={selected_numbers}"
            )

            # 당첨자 브로드캐스트
            await self.connection_manager.broadcast(event_id, {
                "type": "winner_announced",
                "prize_name": prize_name,
                "prize_rank": prize_rank,
                "winners": selected_numbers,
                "drawn_at": drawn_at
            })

            return {
                "prize_name": prize_name,
                "prize_rank": prize_rank,
                "winners": [{"draw_number": num} for num in selected_numbers],
                "drawn_at": drawn_at
            }

    async def standby_draw(
        self,
        event_id: str,
        prize_name: str,
        prize_rank: int,
        prize_image: Optional[str] = None
    ) -> None:
        """
        추첨 대기 브로드캐스트

        관리자가 상품을 선택하고 대기 버튼을 누르면 호출됩니다.
        모든 클라이언트에 상품 정보를 미리 알려줍니다.

        Args:
            event_id: 이벤트 ID
            prize_name: 상품 이름
            prize_rank: 상품 등급
            prize_image: 상품 이미지 URL (선택)
        """
        await self.connection_manager.broadcast(event_id, {
            "type": "draw_standby",
            "prize_name": prize_name,
            "prize_rank": prize_rank,
            "prize_image": prize_image,
            "status": "standby"
        })

        logger.info(
            f"[추첨 대기] event_id={event_id}, prize_name={prize_name}"
        )

    async def start_draw_animation(
        self,
        event_id: str,
        prize_name: str,
        prize_rank: int,
        prize_image: Optional[str] = None
    ) -> Dict:
        """
        추첨 시작: 실제 추첨 실행 + 결과 임시 저장 + 애니메이션 시작 브로드캐스트

        추첨 결과는 reveal_winner() 호출 전까지 공개되지 않습니다.

        Args:
            event_id: 이벤트 ID
            prize_name: 상품 이름
            prize_rank: 상품 등급
            prize_image: 상품 이미지 URL (선택)

        Returns:
            {"success": True, "message": str}
        """
        lock = self._get_lock(event_id)
        event_data = self._get_event_data(event_id)

        async with lock:
            # 참가자 목록 확인
            if not event_data.participants:
                raise ValueError("참가자가 없습니다. 추첨을 진행할 수 없습니다.")

            # 이미 당첨된 번호 목록 (해당 등급에서)
            existing_winners = {
                draw.draw_number
                for draw in event_data.draws
                if draw.prize_rank == prize_rank
            }

            # 추첨 가능한 번호 목록
            available_numbers = [
                p.draw_number
                for p in event_data.participants.values()
                if p.draw_number not in existing_winners
            ]

            if not available_numbers:
                raise ValueError(
                    f"추첨 가능한 참가자가 없습니다. "
                    f"(이미 {prize_rank}등 상에 당첨된 참가자만 남았습니다)"
                )

            # 랜덤 추첨 (1명)
            selected_number = random.choice(available_numbers)
            drawn_at = datetime.now().isoformat()

            # 결과를 pending_draw에 임시 저장 (아직 draws에 기록 안 함)
            event_data.pending_draw = PendingDraw(
                prize_name=prize_name,
                prize_rank=prize_rank,
                prize_image=prize_image,
                winners=[selected_number],
                drawn_at=drawn_at
            )

            logger.info(
                f"[추첨 실행] event_id={event_id}, "
                f"prize_name={prize_name}, "
                f"winner={selected_number} (미공개)"
            )

        # 애니메이션 시작 브로드캐스트 (당첨번호는 포함하지 않음)
        await self.connection_manager.broadcast(event_id, {
            "type": "draw_started",
            "prize_name": prize_name,
            "prize_rank": prize_rank,
            "prize_image": prize_image
        })

        logger.info(
            f"[추첨 애니메이션 시작] event_id={event_id}, prize_name={prize_name}"
        )

        return {"success": True, "message": "추첨이 완료되었습니다. 결과 발표를 진행해주세요."}

    async def reveal_winner(self, event_id: str) -> Dict:
        """
        결과 발표: main 페이지에 당첨번호 전송

        pending_draw에 저장된 결과를 main 페이지에만 전송합니다.
        main에서 애니메이션 완료 후 complete_draw()를 호출해야 합니다.

        Args:
            event_id: 이벤트 ID

        Returns:
            {"winners": List[int], "prize_name": str, ...}
        """
        event_data = self._get_event_data(event_id)

        if not event_data.pending_draw:
            raise ValueError("대기 중인 추첨 결과가 없습니다. 먼저 추첨을 시작해주세요.")

        pending = event_data.pending_draw

        # main 페이지에 당첨번호 전송 (winner_revealed 이벤트)
        await self.connection_manager.broadcast(event_id, {
            "type": "winner_revealed",
            "prize_name": pending.prize_name,
            "prize_rank": pending.prize_rank,
            "prize_image": pending.prize_image,
            "winners": pending.winners,
            "drawn_at": pending.drawn_at
        })

        logger.info(
            f"[결과 발표] event_id={event_id}, "
            f"prize_name={pending.prize_name}, "
            f"winners={pending.winners}"
        )

        return {
            "prize_name": pending.prize_name,
            "prize_rank": pending.prize_rank,
            "winners": pending.winners,
            "drawn_at": pending.drawn_at
        }

    async def complete_draw(self, event_id: str) -> Dict:
        """
        추첨 완료: main 애니메이션 종료 후 호출

        pending_draw를 draws에 기록하고, waiting/admin에 당첨번호를 전송합니다.

        Args:
            event_id: 이벤트 ID

        Returns:
            {"success": True, "winners": List[int]}
        """
        lock = self._get_lock(event_id)
        event_data = self._get_event_data(event_id)

        async with lock:
            if not event_data.pending_draw:
                raise ValueError("완료할 추첨이 없습니다.")

            pending = event_data.pending_draw

            # draws에 기록
            for winner in pending.winners:
                record = DrawRecord(
                    prize_name=pending.prize_name,
                    prize_rank=pending.prize_rank,
                    draw_number=winner,
                    drawn_at=pending.drawn_at
                )
                event_data.draws.append(record)

            # pending_draw 초기화
            event_data.pending_draw = None

            logger.info(
                f"[추첨 완료] event_id={event_id}, "
                f"prize_name={pending.prize_name}, "
                f"winners={pending.winners} → draws에 기록됨"
            )

        # waiting/admin에 당첨번호 전송 (winner_announced 이벤트)
        await self.connection_manager.broadcast(event_id, {
            "type": "winner_announced",
            "prize_name": pending.prize_name,
            "prize_rank": pending.prize_rank,
            "prize_image": pending.prize_image,
            "winners": pending.winners,
            "drawn_at": pending.drawn_at
        })

        return {
            "success": True,
            "prize_name": pending.prize_name,
            "winners": pending.winners
        }

    async def get_draw_history(self, event_id: str) -> List[Dict]:
        """
        추첨 이력 조회

        Args:
            event_id: 이벤트 ID

        Returns:
            List[{
                "prize_name": str,
                "prize_rank": int,
                "draw_number": int,
                "drawn_at": str
            }]
        """
        event_data = self._get_event_data(event_id)

        return [
            {
                "prize_name": draw.prize_name,
                "prize_rank": draw.prize_rank,
                "draw_number": draw.draw_number,
                "drawn_at": draw.drawn_at
            }
            for draw in event_data.draws
        ]

    # ============================================================
    # 리셋 관련 메서드
    # ============================================================

    async def reset_event(
        self,
        event_id: str,
        reset_participants: bool = False,
        reset_draws: bool = True
    ) -> Dict:
        """
        이벤트 데이터 리셋

        Args:
            event_id: 이벤트 ID
            reset_participants: 참가자 목록도 삭제할지 (기본값: False)
            reset_draws: 추첨 이력 삭제 (기본값: True)

        Returns:
            {"message": str}
        """
        lock = self._get_lock(event_id)
        event_data = self._get_event_data(event_id)

        async with lock:
            if reset_participants:
                event_data.participants = {}
                event_data.next_draw_number = 1
                logger.info(f"[리셋] event_id={event_id}, 참가자 목록 삭제")

            if reset_draws:
                event_data.draws = []
                logger.info(f"[리셋] event_id={event_id}, 추첨 이력 삭제")

            if not reset_participants and not reset_draws:
                return {"message": "리셋할 항목이 없습니다."}

            # 리셋 브로드캐스트
            await self.connection_manager.broadcast(event_id, {
                "type": "event_reset",
                "reset_participants": reset_participants,
                "reset_draws": reset_draws
            })

            messages = []
            if reset_participants:
                messages.append("참가자 목록")
            if reset_draws:
                messages.append("추첨 이력")

            return {
                "message": f"{', '.join(messages)}이(가) 리셋되었습니다."
            }

    # ============================================================
    # 상태 조회 메서드
    # ============================================================

    def get_event_stats(self, event_id: str) -> Dict:
        """
        이벤트 통계 조회

        Args:
            event_id: 이벤트 ID

        Returns:
            {
                "participant_count": int,
                "draw_count": int,
                "connection_count": int
            }
        """
        event_data = self._get_event_data(event_id)

        return {
            "participant_count": len(event_data.participants),
            "draw_count": len(event_data.draws),
            "connection_count": self.connection_manager.get_connection_count(event_id)
        }


# ============================================================
# 싱글톤 접근자
# ============================================================

def get_luckydraw_service() -> LuckyDrawService:
    """LuckyDrawService 싱글톤 인스턴스 반환"""
    return LuckyDrawService.get_instance()
