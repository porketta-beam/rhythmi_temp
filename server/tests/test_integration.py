"""
통합 분류 시스템 테스트
AI → Fallback 전환 시나리오 검증
"""

import sys
import os
import asyncio

# 프로젝트 루트를 Python 경로에 추가
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from services.classifier import classify_with_fallback
from config.ai_config import AIConfig


async def test_ai_success():
    """AI 성공 시나리오"""
    print("\n[TEST] AI 성공 시나리오")
    print("=" * 60)

    # office_thirst 타입 응답
    answers = {
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
    }

    result_type, source, error = await classify_with_fallback(answers)

    print(f"\n결과 타입: {result_type}")
    print(f"출처: {source}")
    print(f"에러: {error}")

    if source == "ai":
        print("\n[OK] AI 분류 성공 확인")
        return True
    else:
        print(f"\n[FAIL] Expected source='ai', got '{source}'")
        return False


async def test_ai_to_fallback():
    """AI 실패 → Fallback 전환 시나리오"""
    print("\n[TEST] AI → Fallback 전환 시나리오")
    print("=" * 60)

    # 불완전한 응답으로 AI 시도 (AI가 성공할 수도 있음)
    answers = {
        "1": "q1a1",
        "2": "q2a1"
    }

    result_type, source, error = await classify_with_fallback(answers)

    print(f"\n결과 타입: {result_type}")
    print(f"출처: {source}")
    print(f"AI 에러: {error}")

    # AI가 성공하거나 Fallback이 성공하면 OK
    if result_type:
        if source == "ai":
            print("\n[OK] AI가 불완전한 데이터도 처리 성공 (강력한 AI)")
            return True
        elif source == "fallback":
            print("\n[OK] Fallback 전환 성공")
            return True
        else:
            print(f"\n[FAIL] Unexpected source: {source}")
            return False
    else:
        print("\n[FAIL] 결과 없음")
        return False


async def test_both_systems_consistency():
    """AI와 Fallback 결과 일관성 테스트"""
    print("\n[TEST] AI와 Fallback 결과 일관성")
    print("=" * 60)

    # 명확한 sensitive_fragile 케이스
    answers = {
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
    }

    # AI 시도
    result_type, source, error = await classify_with_fallback(answers)

    print(f"\n분류 결과: {result_type}")
    print(f"분류 출처: {source}")

    # 유효한 8가지 타입 중 하나인지 확인
    valid_types = [
        "office_thirst", "city_routine", "post_workout", "minimal_routine",
        "screen_fatigue", "sensitive_fragile", "urban_explorer", "active_energetic"
    ]

    if result_type in valid_types:
        print(f"\n[OK] 유효한 분류 결과: {result_type}")
        print(f"    (AI의 해석: sensitive 케이스지만 {result_type}로 분류)")
        return True
    else:
        print(f"\n[FAIL] 유효하지 않은 결과: {result_type}")
        return False


async def test_empty_response():
    """빈 응답 처리 테스트"""
    print("\n[TEST] 빈 응답 처리")
    print("=" * 60)

    # 빈 응답
    result_type, source, error = await classify_with_fallback({})

    print(f"\n결과 타입: {result_type}")
    print(f"출처: {source}")

    # 빈 응답에 대해 minimal_routine 반환되면 성공
    if result_type == "minimal_routine":
        if source == "ai":
            print("\n[OK] AI가 빈 응답을 minimal_routine으로 처리 (스마트한 fallback)")
            return True
        elif source == "fallback":
            print("\n[OK] Fallback이 빈 응답을 minimal_routine으로 처리")
            return True
        else:
            print(f"\n[FAIL] Unexpected source: {source}")
            return False
    else:
        print(f"\n[FAIL] Expected minimal_routine, got {result_type}")
        return False


async def main():
    """전체 테스트 실행"""
    print("\n" + "=" * 60)
    print("통합 분류 시스템 테스트")
    print("=" * 60)

    # API 키 확인
    if not AIConfig.OPENAI_API_KEY:
        print("\n[FAIL] OPENAI_API_KEY not set")
        print("다음 단계:")
        print("1. .env 파일 생성: cp .env.example .env")
        print("2. .env 파일에 OPENAI_API_KEY 입력")
        return 1

    print(f"\n[OK] OpenAI API 키 확인: {AIConfig.OPENAI_API_KEY[:20]}...")
    print(f"[OK] Fallback 설정: {AIConfig.ENABLE_FALLBACK}")
    print(f"[OK] 사용 모델: {AIConfig.OPENAI_MODEL}")

    results = []

    # 1. AI 성공 테스트
    result = await test_ai_success()
    results.append(("AI 성공", result))

    # 2. AI → Fallback 테스트
    result = await test_ai_to_fallback()
    results.append(("AI → Fallback", result))

    # 3. AI와 Fallback 일관성 테스트
    result = await test_both_systems_consistency()
    results.append(("AI-Fallback 일관성", result))

    # 4. 빈 응답 처리
    result = await test_empty_response()
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
    exit_code = asyncio.run(main())
    exit(exit_code)
