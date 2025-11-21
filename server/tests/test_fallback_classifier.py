"""
Fallback 분류 시스템 테스트
"""

import sys
import os

# 프로젝트 루트를 Python 경로에 추가
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from services.fallback_classifier import calculate_scores, determine_result_type, fallback_classify


# Task 1에서 검증한 테스트 케이스 재사용
TEST_CASES = {
    "sensitive_fragile": {
        "100": "gender_female",
        "101": "age_20s",
        "1": "q1a1",    # 매우 건조
        "2": "q2a1",    # 여전히 건조
        "3": "q3a1",    # 매우 자주 붉어짐
        "4": "q4a1",    # 항상 크게 영향
        "5": "q5a1",    # 바로 반응
        "6": "q6a1",    # 거의 항상 반응
        "7": "q7a1",    # 실내
        "8": "q8a2",    # 밀폐 공간
        "9": "q9a3",    # 꾸준히 관리
        "10": "q10a3"   # 미스트 챙김
    },
    "office_thirst": {
        "100": "gender_male",
        "101": "age_30s",
        "1": "q1a1",    # 매우 건조
        "2": "q2a1",    # 여전히 건조
        "3": "q3a4",    # 거의 안 붉어짐
        "4": "q4a4",    # 영향 없음
        "5": "q5a4",    # 미세먼지 영향 없음
        "6": "q6a4",    # 제품 반응 없음
        "7": "q7a1",    # 사무실
        "8": "q8a1",    # 건조한 냉난방
        "9": "q9a2",    # 토너/크림만
        "10": "q10a1"   # 휴대 안함
    },
    "active_energetic": {
        "100": "gender_male",
        "101": "age_20s",
        "1": "q1a5",    # 유분 많음
        "2": "q2a4",    # 전체적으로 유분
        "3": "q3a4",    # 붉어짐 없음
        "4": "q4a4",    # 온도 변화 영향 없음
        "5": "q5a4",    # 공기오염 영향 없음
        "6": "q6a4",    # 제품 반응 없음
        "7": "q7a4",    # 헬스장
        "8": "q8a4",    # 다양한 공간 이동
        "9": "q9a4",    # 매우 적극적 관리
        "10": "q10a4"   # 여러 제품 세트
    },
    "post_workout": {
        "100": "gender_female",
        "101": "age_20s",
        "1": "q1a4",    # 살짝 유분
        "2": "q2a3",    # T존 유분
        "3": "q3a3",    # 가끔 붉어짐
        "4": "q4a3",    # 가끔 변화
        "5": "q5a3",    # 가끔 민감
        "6": "q6a3",    # 가끔 반응
        "7": "q7a4",    # 헬스장 (active +3, indoor +1)
        "8": "q8a4",    # 다양한 공간 (active +2)
        "9": "q9a2",    # 토너/크림만 (minimal +1, active 안 오름!)
        "10": "q10a3"   # 미스트 챙김 (dry +1)
    },
    "urban_explorer": {
        "100": "gender_male",
        "101": "age_30s",
        "1": "q1a2",    # 약간 건조
        "2": "q2a2",    # 코 주변만 유분
        "3": "q3a2",    # 자주 붉어짐
        "4": "q4a2",    # 자주 영향
        "5": "q5a2",    # 자주 민감
        "6": "q6a2",    # 종종 반응
        "7": "q7a3",    # 외근/야외
        "8": "q8a3",    # 온도 변화 큰 환경
        "9": "q9a2",    # 토너/크림
        "10": "q10a2"   # 가끔 챙김
    },
    "screen_fatigue": {
        "100": "gender_female",
        "101": "age_20s",
        "1": "q1a2",    # 약간 건조
        "2": "q2a2",    # 코 주변만 유분
        "3": "q3a2",    # 자주 붉어짐
        "4": "q4a2",    # 자주 영향
        "5": "q5a2",    # 자주 민감
        "6": "q6a3",    # 가끔 반응
        "7": "q7a1",    # 실내
        "8": "q8a1",    # 건조한 냉난방
        "9": "q9a2",    # 토너/크림
        "10": "q10a2"   # 가끔 챙김
    },
    "city_routine": {
        "100": "gender_male",
        "101": "age_30s",
        "1": "q1a2",    # 약간 건조
        "2": "q2a2",    # 코 주변만 유분
        "3": "q3a3",    # 가끔 붉어짐
        "4": "q4a3",    # 가끔 변화
        "5": "q5a3",    # 가끔 민감
        "6": "q6a4",    # 반응 없음
        "7": "q7a3",    # 외근/야외
        "8": "q8a3",    # 온도 변화
        "9": "q9a2",    # 토너/크림
        "10": "q10a2"   # 가끔 챙김
    },
    "minimal_routine": {
        "100": "gender_male",
        "101": "age_20s",
        "1": "q1a3",    # 편안
        "2": "q2a2",    # 코 주변만 유분
        "3": "q3a4",    # 붉어짐 없음
        "4": "q4a4",    # 영향 없음
        "5": "q5a4",    # 민감 없음
        "6": "q6a4",    # 반응 없음
        "7": "q7a2",    # 다양한 공간
        "8": "q8a4",    # 다양한 공간
        "9": "q9a1",    # 거의 안함
        "10": "q10a1"   # 휴대 안함
    }
}


def test_score_calculation():
    """스코어 계산 검증"""
    print("\n[TEST] 스코어 계산 검증")
    print("=" * 60)

    # sensitive_fragile 케이스
    answers = TEST_CASES["sensitive_fragile"]
    scores = calculate_scores(answers)

    print(f"\n테스트 케이스: sensitive_fragile")
    print(f"계산된 스코어:")
    for key, value in scores.items():
        if value > 0:
            print(f"  - {key}: {value}")

    # sensitive 점수가 높은지 확인
    if scores["sensitive"] >= 9:
        print(f"\n[OK] sensitive >= 9 확인 (실제: {scores['sensitive']})")
        return True
    else:
        print(f"\n[FAIL] Expected sensitive >= 9, got {scores['sensitive']}")
        return False


def test_result_determination():
    """결과 타입 결정 검증 (8가지 모두)"""
    print("\n[TEST] 결과 타입 결정 검증 (전체 8가지)")
    print("=" * 60)

    passed = 0
    total = len(TEST_CASES)

    for expected_type, answers in TEST_CASES.items():
        result_type = fallback_classify(answers)

        is_match = result_type == expected_type
        status = "[OK]" if is_match else "[FAIL]"

        print(f"\n{status} 테스트: {expected_type}")
        print(f"   결과: {result_type}")

        if is_match:
            passed += 1
        else:
            # 실패 시 스코어 출력
            scores = calculate_scores(answers)
            print(f"   스코어: {scores}")

    print(f"\n통과: {passed}/{total}")
    return passed == total


def test_empty_answers():
    """빈 응답 처리 테스트"""
    print("\n[TEST] 빈 응답 처리")
    print("=" * 60)

    # 빈 응답
    result_type = fallback_classify({})

    print(f"\n빈 응답 결과: {result_type}")

    # minimal_routine이어야 함 (기본 fallback)
    if result_type == "minimal_routine":
        print("[OK] 빈 응답 처리 성공 (minimal_routine)")
        return True
    else:
        print(f"[FAIL] Expected minimal_routine, got {result_type}")
        return False


def main():
    """전체 테스트 실행"""
    print("\n" + "=" * 60)
    print("Fallback 분류 시스템 테스트")
    print("=" * 60)

    results = []

    # 1. 스코어 계산 테스트
    result = test_score_calculation()
    results.append(("스코어 계산", result))

    # 2. 결과 결정 테스트 (8가지)
    result = test_result_determination()
    results.append(("결과 타입 결정 (8가지)", result))

    # 3. 빈 응답 처리
    result = test_empty_answers()
    results.append(("빈 응답 처리", result))

    # 결과 요약
    print("\n" + "=" * 60)
    print("테스트 결과 요약")
    print("=" * 60)

    passed = sum(1 for _, result in results if result)
    total = len(results)

    for name, result in results:
        status = "[PASS]" if result else "[FAIL]"
        print(f"{status} {name}")

    print(f"\n통과: {passed}/{total}")

    if passed == total:
        print("\n[SUCCESS] 모든 테스트 통과!")
        return 0
    else:
        print("\n[WARNING] 일부 테스트 실패")
        return 1


if __name__ == "__main__":
    exit(main())
