"""
WebSocket 연결 관리자

실시간 통신을 위한 WebSocket 연결을 관리합니다.
싱글톤 패턴으로 구현되어 서버 전체에서 하나의 인스턴스만 존재합니다.
"""

import logging
from typing import Dict, Set, Optional
from fastapi import WebSocket

logger = logging.getLogger(__name__)


class ConnectionManager:
    """
    WebSocket 연결 관리 클래스 (싱글톤)

    이벤트별로 연결된 클라이언트들을 관리하고,
    메시지 브로드캐스트 기능을 제공합니다.
    """

    _instance: Optional["ConnectionManager"] = None

    def __new__(cls) -> "ConnectionManager":
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        if self._initialized:
            return

        # 이벤트별 WebSocket 연결 저장
        # 구조: {event_id: Set[WebSocket]}
        self._connections: Dict[str, Set[WebSocket]] = {}
        self._initialized = True

        logger.info("[ConnectionManager] 초기화 완료")

    @classmethod
    def get_instance(cls) -> "ConnectionManager":
        """싱글톤 인스턴스 반환"""
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    async def connect(self, websocket: WebSocket, event_id: str) -> None:
        """
        WebSocket 연결 수락 및 등록

        Args:
            websocket: WebSocket 연결 객체
            event_id: 이벤트 ID
        """
        await websocket.accept()

        if event_id not in self._connections:
            self._connections[event_id] = set()

        self._connections[event_id].add(websocket)

        count = len(self._connections[event_id])
        logger.info(f"[WS 연결] event_id={event_id}, 현재 연결 수: {count}")

        # 새 연결 알림 브로드캐스트
        await self.broadcast(event_id, {
            "type": "connection_count",
            "count": count
        }, exclude=websocket)

    def disconnect(self, websocket: WebSocket, event_id: str) -> None:
        """
        WebSocket 연결 해제

        Args:
            websocket: WebSocket 연결 객체
            event_id: 이벤트 ID
        """
        if event_id in self._connections:
            self._connections[event_id].discard(websocket)
            count = len(self._connections[event_id])
            logger.info(f"[WS 연결 해제] event_id={event_id}, 현재 연결 수: {count}")

            # 빈 이벤트 정리
            if not self._connections[event_id]:
                del self._connections[event_id]

    async def broadcast(
        self,
        event_id: str,
        message: dict,
        exclude: Optional[WebSocket] = None
    ) -> int:
        """
        이벤트의 모든 연결에 메시지 브로드캐스트

        Args:
            event_id: 이벤트 ID
            message: 전송할 메시지 (dict)
            exclude: 제외할 WebSocket (선택)

        Returns:
            성공적으로 전송된 연결 수
        """
        if event_id not in self._connections:
            return 0

        sent_count = 0
        dead_connections: Set[WebSocket] = set()

        for websocket in self._connections[event_id]:
            if websocket == exclude:
                continue

            try:
                await websocket.send_json(message)
                sent_count += 1
            except Exception as e:
                logger.warning(f"[WS 전송 실패] {e}")
                dead_connections.add(websocket)

        # 죽은 연결 정리
        self._connections[event_id] -= dead_connections

        if sent_count > 0:
            logger.info(
                f"[WS 브로드캐스트] event_id={event_id}, "
                f"type={message.get('type')}, sent={sent_count}"
            )

        return sent_count

    async def send_to_winner(
        self,
        event_id: str,
        draw_number: int,
        message: dict
    ) -> bool:
        """
        특정 당첨 번호를 가진 클라이언트에게 메시지 전송
        (구현 참고: 클라이언트가 자신의 번호를 저장하고 있어야 함)

        현재는 브로드캐스트 방식으로 모든 클라이언트에게 전송하고,
        클라이언트 측에서 자신의 번호와 비교하여 처리합니다.
        """
        message["draw_number"] = draw_number
        sent = await self.broadcast(event_id, message)
        return sent > 0

    def get_connection_count(self, event_id: str) -> int:
        """
        이벤트의 현재 연결 수 반환

        Args:
            event_id: 이벤트 ID

        Returns:
            연결된 클라이언트 수
        """
        if event_id not in self._connections:
            return 0
        return len(self._connections[event_id])

    def get_all_connection_counts(self) -> Dict[str, int]:
        """
        모든 이벤트의 연결 수 반환

        Returns:
            {event_id: connection_count} 형태의 딕셔너리
        """
        return {
            event_id: len(connections)
            for event_id, connections in self._connections.items()
        }


# 편의를 위한 싱글톤 인스턴스 접근
def get_connection_manager() -> ConnectionManager:
    """ConnectionManager 싱글톤 인스턴스 반환"""
    return ConnectionManager.get_instance()
