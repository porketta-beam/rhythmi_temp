# services 모듈
"""
서비스 레이어 모듈

이 패키지는 다음 기능을 제공합니다:

1. 피부 타입 분류 (Rythmi 고객사)
   - classify_with_fallback: AI 우선, 실패 시 Fallback 분류
   - get_classification_stats: 분류 통계 조회

2. 경품추첨 (Lucky Draw)
   - ConnectionManager: WebSocket 연결 관리 (싱글톤)
   - LuckyDrawService: 경품추첨 비즈니스 로직 (싱글톤)
"""

# ============================================================
# 피부 타입 분류 서비스 (Rythmi)
# ============================================================
from .classifier import (
    classify_with_fallback,
    get_classification_stats,
)

# ============================================================
# 경품추첨 서비스 (Lucky Draw)
# ============================================================
from .connection_manager import (
    ConnectionManager,
    get_connection_manager,
)

from .luckydraw_service import (
    LuckyDrawService,
    get_luckydraw_service,
)

__all__ = [
    # === 피부 타입 분류 ===
    "classify_with_fallback",
    "get_classification_stats",
    # === 경품추첨: 클래스 ===
    "ConnectionManager",
    "LuckyDrawService",
    # === 경품추첨: 싱글톤 접근자 ===
    "get_connection_manager",
    "get_luckydraw_service",
]
