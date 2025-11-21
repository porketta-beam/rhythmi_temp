"""
Fallback 피부 타입 분류 시스템

AI 실패 시 기존 클라이언트 사이드 스코어링 로직 사용
JavaScript 로직을 Python으로 포팅
"""

from typing import Dict
import logging

logger = logging.getLogger(__name__)


def calculate_scores(answers: Dict[str, str]) -> Dict[str, int]:
    """
    설문 응답을 9가지 차원의 점수로 변환

    Args:
        answers: {question_id: answer_id} 딕셔너리

    Returns:
        {
            "dry": 0-10,
            "oily": 0-10,
            "sensitive": 0-10,
            "normal": 0-10,
            "indoor": 0-10,
            "outdoor": 0-10,
            "active": 0-10,
            "minimal": 0-10,
            "combination": 0-10
        }
    """
    scores = {
        "dry": 0,
        "oily": 0,
        "sensitive": 0,
        "normal": 0,
        "indoor": 0,
        "outdoor": 0,
        "active": 0,
        "minimal": 0,
        "combination": 0
    }

    # Q1: 세안 후 피부 상태
    q1 = answers.get("1", "")
    if q1 == "q1a1":  # 매우 건조하고 당긴다
        scores["dry"] += 3
    elif q1 == "q1a2":  # 약간 건조하다
        scores["dry"] += 2
    elif q1 == "q1a3":  # 편안하다
        scores["normal"] += 2
    elif q1 == "q1a4":  # 살짝 유분이 있다
        scores["oily"] += 1
    elif q1 == "q1a5":  # 유분이 많다
        scores["oily"] += 3

    # Q2: 오후 얼굴 유분 상태
    q2 = answers.get("2", "")
    if q2 == "q2a1":  # 여전히 건조하다
        scores["dry"] += 2
    elif q2 == "q2a2":  # 코 주변만 살짝 유분
        scores["combination"] += 2
    elif q2 == "q2a3":  # T존 위주로 유분
        scores["combination"] += 2
        scores["oily"] += 1
    elif q2 == "q2a4":  # 얼굴 전체적으로 유분
        scores["oily"] += 2

    # Q3: 피부 붉어짐/따가움
    q3 = answers.get("3", "")
    if q3 == "q3a1":  # 매우 자주
        scores["sensitive"] += 3
    elif q3 == "q3a2":  # 자주
        scores["sensitive"] += 2
    elif q3 == "q3a3":  # 가끔
        scores["sensitive"] += 1
    # q3a4 거의 없음 → 점수 없음

    # Q4: 환절기/온도 변화 영향
    q4 = answers.get("4", "")
    if q4 == "q4a1":  # 항상 크게 영향
        scores["sensitive"] += 2
    elif q4 == "q4a2":  # 자주 영향
        scores["sensitive"] += 1
    # q4a3, q4a4 → 점수 없음

    # Q5: 미세먼지/공기오염 민감도
    q5 = answers.get("5", "")
    if q5 == "q5a1":  # 바로 반응
        scores["sensitive"] += 2
    elif q5 == "q5a2":  # 자주 민감
        scores["sensitive"] += 1
    # q5a3, q5a4 → 점수 없음

    # Q6: 새 스킨케어 제품 반응
    q6 = answers.get("6", "")
    if q6 == "q6a1":  # 거의 항상 반응
        scores["sensitive"] += 2
    elif q6 == "q6a2":  # 종종 반응
        scores["sensitive"] += 1
    # q6a3, q6a4 → 점수 없음

    # Q7: 주 활동 환경
    q7 = answers.get("7", "")
    if q7 == "q7a1":  # 사무실/학교 등 실내
        scores["indoor"] += 3
    elif q7 == "q7a2":  # 카페/코워킹 등 다양한 공간
        scores["indoor"] += 1
        scores["outdoor"] += 1
    elif q7 == "q7a3":  # 외근/야외 활동 많음
        scores["outdoor"] += 3
    elif q7 == "q7a4":  # 운동 시설/헬스장
        scores["active"] += 3
        scores["indoor"] += 1

    # Q8: 머무는 공간 환경
    q8 = answers.get("8", "")
    if q8 == "q8a1":  # 건조한 냉난방
        scores["indoor"] += 2
        scores["dry"] += 1
    elif q8 == "q8a2":  # 환기 어려운 밀폐
        scores["indoor"] += 2
    elif q8 == "q8a3":  # 온도 변화 큰 환경
        scores["outdoor"] += 1
        scores["sensitive"] += 1
    elif q8 == "q8a4":  # 다양한 공간 이동
        scores["active"] += 2

    # Q9: 피부 관리 루틴
    q9 = answers.get("9", "")
    if q9 == "q9a1":  # 거의 관리 안함
        scores["minimal"] += 3
    elif q9 == "q9a2":  # 토너/크림 정도
        scores["minimal"] += 1
    elif q9 == "q9a3":  # 여러 단계 꾸준히
        scores["active"] += 2
    elif q9 == "q9a4":  # 매우 적극적
        scores["active"] += 3

    # Q10: 외출 시 스킨케어 휴대
    q10 = answers.get("10", "")
    if q10 == "q10a1":  # 거의 휴대 안함
        scores["minimal"] += 2
    elif q10 == "q10a2":  # 가끔 들고 다님
        scores["minimal"] += 1
    elif q10 == "q10a3":  # 미스트 꼭 챙김
        scores["dry"] += 1
    elif q10 == "q10a4":  # 여러 제품 세트로
        scores["active"] += 2

    return scores


def determine_result_type(scores: Dict[str, int]) -> str:
    """
    스코어를 기반으로 8가지 피부 타입 중 하나를 결정

    우선순위 로직 (AI와 동일):
    1. sensitive_fragile (매우 높은 민감도)
    2. active_energetic (높은 활동 + 지성)
    3. post_workout (중간 활동 + 지성)
    4. urban_explorer (야외 + 민감)
    5. screen_fatigue (실내 + 민감)
    6. office_thirst (건조 + 실내)
    7. city_routine (야외 + 복합/건조)
    8. minimal_routine (나머지 모두)

    Args:
        scores: calculate_scores()의 반환값

    Returns:
        결과 타입 키 (예: "office_thirst")
    """
    # 1순위: 매우 민감한 피부
    if scores["sensitive"] >= 9:
        return "sensitive_fragile"

    # 2순위: 매우 활동적 + 지성
    if scores["active"] >= 7 and scores["oily"] >= 2:
        return "active_energetic"

    # 3순위: 활동적 + 지성
    if scores["active"] >= 5 and scores["oily"] >= 1:
        return "post_workout"

    # 4순위: 야외 + 민감
    if scores["outdoor"] >= 2 and scores["sensitive"] >= 6:
        return "urban_explorer"

    # 5순위: 실내 + 민감
    if scores["indoor"] >= 3 and scores["sensitive"] >= 4:
        return "screen_fatigue"

    # 6순위: 건조 + 실내
    if scores["dry"] >= 5 and scores["indoor"] >= 2:
        return "office_thirst"

    # 7순위: 야외 + (복합 또는 건조)
    if scores["outdoor"] >= 2 and (scores["combination"] >= 1 or scores["dry"] >= 3):
        return "city_routine"

    # 8순위: 기본 fallback
    return "minimal_routine"


def fallback_classify(answers: Dict[str, str]) -> str:
    """
    Fallback 분류 (통합 함수)

    Args:
        answers: 설문 응답 딕셔너리

    Returns:
        결과 타입 키
    """
    logger.info("Fallback 분류 시작")

    # 스코어 계산
    scores = calculate_scores(answers)

    # 결과 타입 결정
    result_type = determine_result_type(scores)

    logger.info(f"Fallback 분류 완료: {result_type}")
    logger.debug(f"계산된 스코어: {scores}")

    return result_type
