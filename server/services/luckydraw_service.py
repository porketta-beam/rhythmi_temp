"""
경품추첨 서비스 레이어

메모리 기반으로 참가자 추첨번호 할당 및 추첨 기능을 제공합니다.
서버 재시작 시 모든 데이터가 초기화됩니다.
"""

import asyncio
import logging
import secrets
import random
from typing import Dict, Optional, List
from datetime import datetime

logger = logging.getLogger(__name__)

# ============================================================
# 메모리 스토리지 구조
# ============================================================

# 전역 메모리 스토리지
# 구조: {event_id: {participants: {}, draws: [], next_draw_number: int}}
_luckydraw_storage: Dict[str, Dict] = {}

# 이벤트별 Lock (동시성 제어)
_event_locks: Dict[str, asyncio.Lock] = {}


def _get_event_lock(event_id: str) -> asyncio.Lock:
    """이벤트별 Lock 가져오기 (없으면 생성)"""
    if event_id not in _event_locks:
        _event_locks[event_id] = asyncio.Lock()
    return _event_locks[event_id]


def _get_event_data(event_id: str) -> Dict:
    """이벤트 데이터 가져오기 (없으면 초기화)"""
    if event_id not in _luckydraw_storage:
        _luckydraw_storage[event_id] = {
            "participants": {},  # {session_token: {draw_number, created_at}}
            "draws": [],  # [{prize_name, prize_rank, draw_number, drawn_at}]
            "next_draw_number": 1
        }
    return _luckydraw_storage[event_id]


def _generate_session_token() -> str:
    """세션 토큰 생성 (32바이트 URL-safe 랜덤 문자열)"""
    return secrets.token_urlsafe(32)


# ============================================================
# 참가자 관련 함수
# ============================================================

async def register_participant(
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
    lock = _get_event_lock(event_id)
    event_data = _get_event_data(event_id)

    async with lock:
        # 기존 토큰이 있으면 해당 번호 반환
        if session_token and session_token in event_data["participants"]:
            participant = event_data["participants"][session_token]
            logger.info(
                f"[기존 참가자] event_id={event_id}, "
                f"draw_number={participant['draw_number']}, "
                f"token={session_token[:8]}..."
            )
            return {
                "draw_number": participant["draw_number"],
                "session_token": session_token,
                "event_id": event_id,
                "is_existing": True
            }

        # 신규 참가자 등록
        new_token = session_token or _generate_session_token()
        draw_number = event_data["next_draw_number"]
        event_data["next_draw_number"] += 1

        event_data["participants"][new_token] = {
            "draw_number": draw_number,
            "created_at": datetime.now().isoformat()
        }

        logger.info(
            f"[신규 참가자] event_id={event_id}, "
            f"draw_number={draw_number}, "
            f"token={new_token[:8]}..."
        )

        return {
            "draw_number": draw_number,
            "session_token": new_token,
            "event_id": event_id,
            "is_existing": False
        }


async def get_participant_by_token(
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
    event_data = _get_event_data(event_id)
    participant = event_data["participants"].get(session_token)

    if participant:
        return {
            "draw_number": participant["draw_number"],
            "event_id": event_id,
            "created_at": participant["created_at"]
        }
    return None


async def get_all_participants(event_id: str) -> Dict:
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
    event_data = _get_event_data(event_id)
    participants = event_data["participants"]

    participant_list = [
        {
            "draw_number": p["draw_number"],
            "created_at": p["created_at"]
        }
        for p in participants.values()
    ]

    # draw_number 순으로 정렬
    participant_list.sort(key=lambda x: x["draw_number"])

    return {
        "total_count": len(participant_list),
        "participants": participant_list
    }


# ============================================================
# 추첨 관련 함수
# ============================================================

async def draw_winner(
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
    lock = _get_event_lock(event_id)
    event_data = _get_event_data(event_id)

    async with lock:
        # 참가자 목록 가져오기
        participants = event_data["participants"]
        if not participants:
            raise ValueError("참가자가 없습니다. 추첨을 진행할 수 없습니다.")

        # 이미 당첨된 번호 목록
        existing_winners = {
            draw["draw_number"]
            for draw in event_data["draws"]
            if draw["prize_rank"] == prize_rank
        }

        # 추첨 가능한 번호 목록 (당첨되지 않은 번호만)
        available_numbers = [
            p["draw_number"]
            for p in participants.values()
            if p["draw_number"] not in existing_winners
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

        # 추첨 기록 저장
        drawn_at = datetime.now().isoformat()
        for draw_number in selected_numbers:
            event_data["draws"].append({
                "prize_name": prize_name,
                "prize_rank": prize_rank,
                "draw_number": draw_number,
                "drawn_at": drawn_at
            })

        logger.info(
            f"[추첨 완료] event_id={event_id}, "
            f"prize_name={prize_name}, "
            f"prize_rank={prize_rank}, "
            f"winners={selected_numbers}"
        )

        return {
            "prize_name": prize_name,
            "prize_rank": prize_rank,
            "winners": [{"draw_number": num} for num in selected_numbers],
            "drawn_at": drawn_at
        }


async def get_draw_history(event_id: str) -> List[Dict]:
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
    event_data = _get_event_data(event_id)
    return event_data["draws"].copy()


# ============================================================
# 리셋 관련 함수
# ============================================================

async def reset_event(
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
    lock = _get_event_lock(event_id)
    event_data = _get_event_data(event_id)

    async with lock:
        if reset_participants:
            event_data["participants"] = {}
            event_data["next_draw_number"] = 1
            logger.info(f"[리셋] event_id={event_id}, 참가자 목록 삭제")

        if reset_draws:
            event_data["draws"] = []
            logger.info(f"[리셋] event_id={event_id}, 추첨 이력 삭제")

        if not reset_participants and not reset_draws:
            return {"message": "리셋할 항목이 없습니다."}

        messages = []
        if reset_participants:
            messages.append("참가자 목록")
        if reset_draws:
            messages.append("추첨 이력")

        return {
            "message": f"{', '.join(messages)}이(가) 리셋되었습니다."
        }
