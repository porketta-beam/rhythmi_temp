"""
통합 피부 타입 분류 시스템

AI 우선 시도 → Fallback 대체 → 로깅
"""

import logging
from typing import Dict, Tuple, Optional

from services.ai_classifier import classify_skin_type
from services.fallback_classifier import fallback_classify
from config.ai_config import AIConfig

logger = logging.getLogger(__name__)


async def classify_with_fallback(
    answers: Dict[str, str]
) -> Tuple[Optional[str], str, Optional[str]]:
    """
    AI 분류 시도 후 실패 시 Fallback 사용

    Args:
        answers: 설문 응답 딕셔너리

    Returns:
        Tuple[result_type, source, error_message]
        - result_type: 분류 결과 (8가지 중 하나), 완전 실패 시 None
        - source: "ai" | "fallback" | "none"
        - error_message: AI 실패 시 에러 메시지 (성공 시 None)
    """
    # 1단계: AI 분류 시도
    logger.info("=== 통합 분류 시작 ===")
    logger.info("AI 분류 시도 중...")

    ai_result, ai_error = await classify_skin_type(answers)

    if ai_result:
        # AI 성공
        logger.info(f"[SUCCESS] AI 분류 성공: {ai_result}")
        return ai_result, "ai", None

    # 2단계: AI 실패 로깅
    logger.warning(f"[FAIL] AI 분류 실패: {ai_error}")

    # 3단계: Fallback 활성화 확인
    if not AIConfig.ENABLE_FALLBACK:
        # Fallback 비활성화 상태
        logger.error("[ERROR] Fallback이 비활성화되어 있어 분류 불가")
        return None, "none", ai_error

    # 4단계: Fallback 실행
    logger.info("Fallback 분류 시도 중...")

    try:
        fallback_result = fallback_classify(answers)

        # Fallback 성공
        logger.info(f"[SUCCESS] Fallback 분류 성공: {fallback_result}")

        # Fallback 사용 로깅
        if AIConfig.LOG_FALLBACK:
            logger.warning(
                f"[FALLBACK USED] "
                f"AI 실패 원인: {ai_error} | "
                f"Fallback 결과: {fallback_result}"
            )

        return fallback_result, "fallback", ai_error

    except Exception as e:
        # Fallback도 실패
        fallback_error = f"Fallback 실패: {str(e)}"
        logger.error(f"[ERROR] {fallback_error}")
        return None, "none", f"{ai_error} | {fallback_error}"


def get_classification_stats() -> Dict[str, int]:
    """
    분류 통계 조회 (향후 확장)

    Returns:
        {
            "ai_success": 150,
            "ai_failure": 10,
            "fallback_used": 10,
            "total_failures": 0
        }
    """
    # TODO: 데이터베이스에서 통계 조회
    # 현재는 placeholder 반환
    return {
        "ai_success": 0,
        "ai_failure": 0,
        "fallback_used": 0,
        "total_failures": 0
    }
