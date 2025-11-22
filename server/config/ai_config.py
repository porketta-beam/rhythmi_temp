"""
AI 분류 서비스 설정

이 모듈은 OpenAI API를 사용한 피부 타입 분류 시스템의 설정을 관리합니다.
환경 변수를 통해 API 키, 타임아웃, 재시도 정책 등을 설정할 수 있습니다.
"""

import os
from typing import List
from dotenv import load_dotenv

# .env 파일 로드
load_dotenv()


class AIConfig:
    """AI 분류 서비스 설정 클래스"""

    # ===== OpenAI 설정 =====
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    OPENAI_MODEL: str = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
    OPENAI_MAX_TOKENS: int = int(os.getenv("OPENAI_MAX_TOKENS", "50"))
    OPENAI_TEMPERATURE: float = float(os.getenv("OPENAI_TEMPERATURE", "0"))

    # ===== 타임아웃 및 재시도 설정 =====
    AI_TIMEOUT_SECONDS: int = int(os.getenv("AI_TIMEOUT_SECONDS", "10"))
    AI_MAX_RETRIES: int = int(os.getenv("AI_MAX_RETRIES", "2"))
    AI_RETRY_DELAY: float = float(os.getenv("AI_RETRY_DELAY", "0.5"))

    # ===== Fallback 설정 =====
    ENABLE_FALLBACK: bool = os.getenv("ENABLE_FALLBACK", "true").lower() == "true"
    LOG_FALLBACK: bool = os.getenv("LOG_FALLBACK", "true").lower() == "true"

    # ===== 유효한 결과 타입 (resultData.js와 동일) =====
    VALID_RESULT_TYPES: List[str] = [
        "office_thirst",        # 오후 3시 사무실의 갈증형
        "city_routine",         # 바람 속을 걷는 도시 루틴러형
        "post_workout",         # 땀과 샤워 후의 고요형
        "minimal_routine",      # 가방 속 작은 루틴 수집가형
        "screen_fatigue",       # 화면 빛에 지는 오후의 얼굴형
        "sensitive_fragile",    # 마음처럼 여린 피부결형
        "urban_explorer",       # 먼지와 마찰 속의 도시 탐험가형
        "active_energetic"      # 열과 속도로 달리는 활력형
    ]

    # ===== 프롬프트 설정 =====
    SYSTEM_PROMPT: str = """You are a skin type classification expert. Analyze the survey responses and classify into ONE of these 8 types:

1. **office_thirst** - Dry skin in air-conditioned indoor environments (high dry score + indoor environment)
2. **city_routine** - Outdoor urban lifestyle with combination/dry skin (outdoor activity + dry/combination)
3. **post_workout** - Active lifestyle with oily skin (high active score + oily skin)
4. **minimal_routine** - Simple, basic skincare routine (low active/minimal care scores)
5. **screen_fatigue** - Indoor sedentary lifestyle with sensitive skin (indoor + moderate sensitivity)
6. **sensitive_fragile** - Highly sensitive skin (very high sensitivity score)
7. **urban_explorer** - Outdoor activity with sensitive skin (outdoor + high sensitivity)
8. **active_energetic** - Highly active lifestyle with oily skin (very high active + oily)

CLASSIFICATION PRIORITY (check in this order):
1. If sensitivity ≥9 → sensitive_fragile
2. If active ≥7 AND oily ≥2 → active_energetic
3. If active ≥5 AND oily ≥1 → post_workout
4. If outdoor ≥2 AND sensitivity ≥6 → urban_explorer
5. If indoor ≥3 AND sensitivity ≥4 → screen_fatigue
6. If dry ≥5 AND indoor ≥2 → office_thirst
7. If outdoor ≥2 AND (combination ≥1 OR dry ≥3) → city_routine
8. Otherwise → minimal_routine

CRITICAL RULES:
- You MUST choose the BEST FIT type from the 8 options above
- Return ONLY the English key (e.g., "office_thirst")
- NO explanations, NO Korean text, NO additional words
- Even if patterns are unclear, select the type with the strongest matching characteristics

EXAMPLES:
User: Very dry, indoor office, sensitive to new products
Response: office_thirst

User: Gym frequently, oily skin, carries multiple skincare products
Response: active_energetic

User: Highly sensitive, reacts to everything
Response: sensitive_fragile"""

    @classmethod
    def validate(cls) -> None:
        """
        설정값의 유효성을 검증합니다.

        Raises:
            ValueError: 필수 설정값이 없거나 유효하지 않은 경우
        """
        # API 키 검증
        if not cls.OPENAI_API_KEY:
            raise ValueError("OPENAI_API_KEY 환경 변수가 설정되지 않았습니다.")

        # 타임아웃 검증 (1~30초)
        if cls.AI_TIMEOUT_SECONDS < 1 or cls.AI_TIMEOUT_SECONDS > 30:
            raise ValueError(
                f"AI_TIMEOUT_SECONDS는 1~30 사이여야 합니다. "
                f"현재 값: {cls.AI_TIMEOUT_SECONDS}"
            )

        # 재시도 횟수 검증 (0~5회)
        if cls.AI_MAX_RETRIES < 0 or cls.AI_MAX_RETRIES > 5:
            raise ValueError(
                f"AI_MAX_RETRIES는 0~5 사이여야 합니다. "
                f"현재 값: {cls.AI_MAX_RETRIES}"
            )

        # Temperature 검증 (0~1)
        if cls.OPENAI_TEMPERATURE < 0 or cls.OPENAI_TEMPERATURE > 1:
            raise ValueError(
                f"OPENAI_TEMPERATURE는 0~1 사이여야 합니다. "
                f"현재 값: {cls.OPENAI_TEMPERATURE}"
            )

        # Max Tokens 검증 (10~200)
        if cls.OPENAI_MAX_TOKENS < 10 or cls.OPENAI_MAX_TOKENS > 200:
            raise ValueError(
                f"OPENAI_MAX_TOKENS는 10~200 사이여야 합니다. "
                f"현재 값: {cls.OPENAI_MAX_TOKENS}"
            )

    @classmethod
    def get_config_summary(cls) -> dict:
        """
        현재 설정값을 요약하여 반환합니다 (API 키 제외).

        Returns:
            dict: 설정값 요약
        """
        return {
            "model": cls.OPENAI_MODEL,
            "max_tokens": cls.OPENAI_MAX_TOKENS,
            "temperature": cls.OPENAI_TEMPERATURE,
            "timeout_seconds": cls.AI_TIMEOUT_SECONDS,
            "max_retries": cls.AI_MAX_RETRIES,
            "retry_delay": cls.AI_RETRY_DELAY,
            "fallback_enabled": cls.ENABLE_FALLBACK,
            "log_fallback": cls.LOG_FALLBACK,
            "valid_result_types": cls.VALID_RESULT_TYPES
        }


# 모듈 임포트 시 설정 검증 (선택적)
# AIConfig.validate()  # 주석 해제하면 임포트 시 자동 검증
