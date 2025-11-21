"""
AI 피부 타입 분류 서비스

OpenAI GPT를 사용하여 설문 응답을 분석하고 8가지 피부 타입 중 하나로 분류합니다.
"""

import asyncio
import logging
from typing import Dict, Optional, Tuple
from openai import AsyncOpenAI
from openai import APIError, APITimeoutError, RateLimitError

from config.ai_config import AIConfig

# 로거 설정
logger = logging.getLogger(__name__)


class AIClassifier:
    """AI 기반 피부 타입 분류기"""

    def __init__(self):
        """AI 분류기 초기화"""
        self.client = AsyncOpenAI(
            api_key=AIConfig.OPENAI_API_KEY,
            timeout=AIConfig.AI_TIMEOUT_SECONDS
        )
        self.model = AIConfig.OPENAI_MODEL
        self.max_retries = AIConfig.AI_MAX_RETRIES
        self.retry_delay = AIConfig.AI_RETRY_DELAY
        self.valid_types = set(AIConfig.VALID_RESULT_TYPES)

    def _build_user_prompt(self, answers: Dict[str, str]) -> str:
        """
        설문 응답을 AI가 이해할 수 있는 프롬프트로 변환합니다.

        Args:
            answers: 설문 응답 딕셔너리 {question_id: answer_id}

        Returns:
            str: 구조화된 프롬프트
        """
        # 질문-답변 매핑
        question_mapping = {
            "100": {
                "question": "성별",
                "answers": {
                    "gender_male": "남성",
                    "gender_female": "여성"
                }
            },
            "101": {
                "question": "연령대",
                "answers": {
                    "age_10s": "10대",
                    "age_20s": "20대",
                    "age_30s": "30대",
                    "age_40s": "40대",
                    "age_50p": "50대 이상"
                }
            },
            "1": {
                "question": "세안 후 피부 상태",
                "answers": {
                    "q1a1": "매우 건조하고 당긴다",
                    "q1a2": "약간 건조하다",
                    "q1a3": "편안하다",
                    "q1a4": "살짝 유분이 있다",
                    "q1a5": "유분이 많다"
                }
            },
            "2": {
                "question": "오후 얼굴 유분 상태",
                "answers": {
                    "q2a1": "여전히 건조하다",
                    "q2a2": "코 주변만 살짝 유분",
                    "q2a3": "T존 위주로 유분",
                    "q2a4": "얼굴 전체적으로 유분"
                }
            },
            "3": {
                "question": "피부 붉어짐/따가움",
                "answers": {
                    "q3a1": "매우 자주",
                    "q3a2": "자주",
                    "q3a3": "가끔",
                    "q3a4": "거의 없음"
                }
            },
            "4": {
                "question": "환절기/온도 변화 영향",
                "answers": {
                    "q4a1": "항상 크게 영향",
                    "q4a2": "자주 영향",
                    "q4a3": "가끔 변화",
                    "q4a4": "거의 없음"
                }
            },
            "5": {
                "question": "미세먼지/공기오염 민감도",
                "answers": {
                    "q5a1": "바로 반응",
                    "q5a2": "자주 민감",
                    "q5a3": "가끔 민감",
                    "q5a4": "거의 없음"
                }
            },
            "6": {
                "question": "새 스킨케어 제품 반응",
                "answers": {
                    "q6a1": "거의 항상 반응",
                    "q6a2": "종종 반응",
                    "q6a3": "가끔 반응",
                    "q6a4": "거의 없음"
                }
            },
            "7": {
                "question": "주 활동 환경",
                "answers": {
                    "q7a1": "사무실/학교 등 실내",
                    "q7a2": "카페/코워킹 등 다양한 공간",
                    "q7a3": "외근/야외 활동 많음",
                    "q7a4": "운동 시설/헬스장"
                }
            },
            "8": {
                "question": "머무는 공간 환경",
                "answers": {
                    "q8a1": "건조한 냉난방",
                    "q8a2": "환기 어려운 밀폐",
                    "q8a3": "온도 변화 큰 환경",
                    "q8a4": "다양한 공간 이동"
                }
            },
            "9": {
                "question": "피부 관리 루틴",
                "answers": {
                    "q9a1": "거의 관리 안함",
                    "q9a2": "토너/크림 정도",
                    "q9a3": "여러 단계 꾸준히",
                    "q9a4": "매우 적극적"
                }
            },
            "10": {
                "question": "외출 시 스킨케어 휴대",
                "answers": {
                    "q10a1": "거의 휴대 안함",
                    "q10a2": "가끔 들고 다님",
                    "q10a3": "미스트 꼭 챙김",
                    "q10a4": "여러 제품 세트로"
                }
            }
        }

        # 응답을 읽기 쉬운 형식으로 변환
        formatted_answers = []
        for q_id, answer_id in answers.items():
            q_key = str(q_id).replace("q", "")
            if q_key in question_mapping:
                q_data = question_mapping[q_key]
                answer_text = q_data["answers"].get(answer_id, "알 수 없음")
                formatted_answers.append(
                    f"- {q_data['question']}: {answer_text}"
                )

        prompt = "다음은 사용자의 피부 진단 설문 응답입니다:\n\n"
        prompt += "\n".join(formatted_answers)
        prompt += "\n\n위 응답을 분석하여 가장 적합한 피부 타입 하나를 선택해주세요."

        return prompt

    def _validate_response(self, response_text: str) -> Optional[str]:
        """
        AI 응답이 유효한 결과 타입인지 검증합니다.

        Args:
            response_text: AI 응답 텍스트

        Returns:
            Optional[str]: 유효한 결과 타입 또는 None
        """
        # 응답 텍스트 정리
        cleaned = response_text.strip().lower()

        # 정확히 일치하는지 확인
        if cleaned in self.valid_types:
            return cleaned

        # 응답에 유효한 타입이 포함되어 있는지 확인
        for valid_type in self.valid_types:
            if valid_type in cleaned:
                logger.warning(
                    f"AI 응답에서 결과 타입 추출: '{cleaned}' -> '{valid_type}'"
                )
                return valid_type

        logger.error(f"유효하지 않은 AI 응답: '{response_text}'")
        return None

    async def classify(
        self,
        answers: Dict[str, str],
        retry_count: int = 0
    ) -> Tuple[Optional[str], Optional[str]]:
        """
        설문 응답을 분석하여 피부 타입을 분류합니다.

        Args:
            answers: 설문 응답 딕셔너리
            retry_count: 현재 재시도 횟수

        Returns:
            Tuple[result_type, error_message]:
                - result_type: 분류 결과 (성공 시)
                - error_message: 에러 메시지 (실패 시)
        """
        try:
            # 프롬프트 생성
            user_prompt = self._build_user_prompt(answers)

            logger.info(f"AI 분류 시작 (시도: {retry_count + 1}/{self.max_retries + 1})")

            # OpenAI API 호출
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": AIConfig.SYSTEM_PROMPT},
                    {"role": "user", "content": user_prompt}
                ],
                max_tokens=AIConfig.OPENAI_MAX_TOKENS,
                temperature=AIConfig.OPENAI_TEMPERATURE,
                timeout=AIConfig.AI_TIMEOUT_SECONDS
            )

            # 응답 추출
            result_text = response.choices[0].message.content

            # 응답 검증
            result_type = self._validate_response(result_text)

            if result_type:
                logger.info(f"AI 분류 성공: {result_type}")
                return result_type, None
            else:
                error_msg = f"유효하지 않은 AI 응답: {result_text}"
                logger.error(error_msg)

                # 재시도 가능하면 재시도
                if retry_count < self.max_retries:
                    logger.info(f"{self.retry_delay}초 후 재시도...")
                    await asyncio.sleep(self.retry_delay)
                    return await self.classify(answers, retry_count + 1)
                else:
                    return None, error_msg

        except APITimeoutError as e:
            error_msg = f"AI API 타임아웃: {str(e)}"
            logger.error(error_msg)

            # 재시도
            if retry_count < self.max_retries:
                logger.info(f"{self.retry_delay}초 후 재시도...")
                await asyncio.sleep(self.retry_delay)
                return await self.classify(answers, retry_count + 1)
            else:
                return None, error_msg

        except RateLimitError as e:
            error_msg = f"AI API 사용량 초과: {str(e)}"
            logger.error(error_msg)

            # Rate limit은 재시도해도 소용없으므로 즉시 반환
            return None, error_msg

        except APIError as e:
            error_msg = f"AI API 오류: {str(e)}"
            logger.error(error_msg)

            # 재시도
            if retry_count < self.max_retries:
                logger.info(f"{self.retry_delay}초 후 재시도...")
                await asyncio.sleep(self.retry_delay)
                return await self.classify(answers, retry_count + 1)
            else:
                return None, error_msg

        except Exception as e:
            error_msg = f"예상치 못한 오류: {str(e)}"
            logger.error(error_msg, exc_info=True)
            return None, error_msg


# 싱글톤 인스턴스 (전역 사용)
_classifier_instance = None


def get_classifier() -> AIClassifier:
    """
    AI 분류기 싱글톤 인스턴스를 반환합니다.

    Returns:
        AIClassifier: AI 분류기 인스턴스
    """
    global _classifier_instance
    if _classifier_instance is None:
        _classifier_instance = AIClassifier()
    return _classifier_instance


# 편의 함수
async def classify_skin_type(answers: Dict[str, str]) -> Tuple[Optional[str], Optional[str]]:
    """
    설문 응답을 분석하여 피부 타입을 분류합니다.

    Args:
        answers: 설문 응답 딕셔너리

    Returns:
        Tuple[result_type, error_message]
    """
    classifier = get_classifier()
    return await classifier.classify(answers)
