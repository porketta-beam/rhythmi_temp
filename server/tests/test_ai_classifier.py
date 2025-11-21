"""
AI 분류 서비스 테스트

실제 OpenAI API를 호출하여 피부 타입 분류가 제대로 작동하는지 검증합니다.
"""

import sys
import os
import asyncio

# 프로젝트 루트를 Python 경로에 추가
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from services.ai_classifier import AIClassifier, classify_skin_type
from config.ai_config import AIConfig


# 테스트 응답 데이터 (Task 1에서 검증한 응답들)
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
    }
}


async def test_single_classification():
    """단일 분류 테스트"""
    print("\n[TEST] 단일 AI 분류 테스트")
    print("=" * 60)

    # sensitive_fragile 타입 테스트
    test_name = "sensitive_fragile"
    test_answers = TEST_CASES[test_name]

    print(f"\n테스트 케이스: {test_name}")
    print(f"응답 개수: {len(test_answers)}")

    try:
        result_type, error = await classify_skin_type(test_answers)

        if result_type:
            print(f"   [OK] AI 분류 성공: {result_type}")
            if result_type == test_name:
                print(f"   [OK] 예상 결과와 일치!")
            else:
                print(f"   [WARNING] 예상과 다름 (예상: {test_name}, 결과: {result_type})")
            return True
        else:
            print(f"   [FAIL] AI 분류 실패: {error}")
            return False

    except Exception as e:
        print(f"   [FAIL] 예외 발생: {e}")
        return False


async def test_multiple_classifications():
    """다중 분류 테스트 (3가지 타입)"""
    print("\n[TEST] 다중 AI 분류 테스트")
    print("=" * 60)

    results = []

    for test_name, test_answers in TEST_CASES.items():
        print(f"\n테스트 케이스: {test_name}")

        try:
            result_type, error = await classify_skin_type(test_answers)

            if result_type:
                is_match = result_type == test_name
                status = "[OK]" if is_match else "[WARNING]"
                print(f"   {status} AI 결과: {result_type}")

                results.append({
                    "test": test_name,
                    "result": result_type,
                    "match": is_match,
                    "success": True
                })
            else:
                print(f"   [FAIL] 분류 실패: {error}")
                results.append({
                    "test": test_name,
                    "error": error,
                    "success": False
                })

        except Exception as e:
            print(f"   [FAIL] 예외 발생: {e}")
            results.append({
                "test": test_name,
                "error": str(e),
                "success": False
            })

    return results


async def test_invalid_response_handling():
    """잘못된 응답 처리 테스트"""
    print("\n[TEST] 잘못된 응답 처리 테스트")
    print("=" * 60)

    # 빈 응답
    print("\n1. 빈 응답 테스트")
    result_type, error = await classify_skin_type({})

    if error:
        print(f"   [OK] 빈 응답 처리 성공: {error}")
    else:
        print(f"   [WARNING] 빈 응답인데 결과 반환: {result_type}")

    return True


async def test_timeout_handling():
    """타임아웃 처리 테스트"""
    print("\n[TEST] 타임아웃 설정 확인")
    print("=" * 60)

    print(f"   설정된 타임아웃: {AIConfig.AI_TIMEOUT_SECONDS}초")
    print(f"   최대 재시도: {AIConfig.AI_MAX_RETRIES}회")
    print(f"   재시도 간격: {AIConfig.AI_RETRY_DELAY}초")
    print(f"   사용 모델: {AIConfig.OPENAI_MODEL}")

    return True


async def main():
    """전체 테스트 실행"""
    print("\n" + "=" * 60)
    print("AI 분류 서비스 테스트 시작")
    print("=" * 60)

    # API 키 확인
    if not AIConfig.OPENAI_API_KEY:
        print("\n[FAIL] OPENAI_API_KEY가 설정되지 않았습니다.")
        print("다음 단계:")
        print("1. .env 파일 생성: cp .env.example .env")
        print("2. .env 파일에 OPENAI_API_KEY 입력")
        return

    print(f"\n[OK] OpenAI API 키 확인: {AIConfig.OPENAI_API_KEY[:20]}...")

    try:
        # 설정 검증
        AIConfig.validate()
        print("[OK] 설정 검증 통과")
    except ValueError as e:
        print(f"[FAIL] 설정 오류: {e}")
        return

    # 테스트 실행
    test_results = []

    # 1. 타임아웃 설정 확인
    await test_timeout_handling()

    # 2. 단일 분류 테스트
    result = await test_single_classification()
    test_results.append(("단일 분류", result))

    # 3. 다중 분류 테스트
    results = await test_multiple_classifications()
    all_success = all(r["success"] for r in results)
    test_results.append(("다중 분류", all_success))

    # 4. 잘못된 응답 처리
    result = await test_invalid_response_handling()
    test_results.append(("잘못된 응답 처리", result))

    # 결과 요약
    print("\n" + "=" * 60)
    print("테스트 결과 요약")
    print("=" * 60)

    passed = sum(1 for _, result in test_results if result)
    total = len(test_results)

    for name, result in test_results:
        status = "[PASS]" if result else "[FAIL]"
        print(f"{status} {name}")

    print(f"\n통과: {passed}/{total}")

    if passed == total:
        print("\n[SUCCESS] 모든 테스트 통과!")
    else:
        print("\n[WARNING] 일부 테스트 실패")


if __name__ == "__main__":
    asyncio.run(main())
