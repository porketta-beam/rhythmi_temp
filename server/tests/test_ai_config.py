"""
AI 설정 테스트

설정 파일이 제대로 로드되고 검증되는지 확인합니다.
"""

import sys
import os

# 프로젝트 루트를 Python 경로에 추가
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))


def test_config_import():
    """설정 파일 임포트 테스트"""
    print("\n[TEST] 설정 파일 임포트 테스트")
    try:
        from config.ai_config import AIConfig
        print("   [OK] AIConfig 임포트 성공")
        return True, AIConfig
    except ImportError as e:
        print(f"   [FAIL] 임포트 실패: {e}")
        return False, None


def test_config_values(AIConfig):
    """설정값 로드 테스트"""
    print("\n[TEST] 설정값 로드 테스트")

    tests = [
        ("OPENAI_MODEL", AIConfig.OPENAI_MODEL, str),
        ("OPENAI_MAX_TOKENS", AIConfig.OPENAI_MAX_TOKENS, int),
        ("OPENAI_TEMPERATURE", AIConfig.OPENAI_TEMPERATURE, float),
        ("AI_TIMEOUT_SECONDS", AIConfig.AI_TIMEOUT_SECONDS, int),
        ("AI_MAX_RETRIES", AIConfig.AI_MAX_RETRIES, int),
        ("ENABLE_FALLBACK", AIConfig.ENABLE_FALLBACK, bool),
        ("LOG_FALLBACK", AIConfig.LOG_FALLBACK, bool),
        ("VALID_RESULT_TYPES", AIConfig.VALID_RESULT_TYPES, list),
    ]

    all_passed = True
    for name, value, expected_type in tests:
        if isinstance(value, expected_type):
            print(f"   [OK] {name}: {value}")
        else:
            print(f"   [FAIL] {name}: 타입 불일치 (expected {expected_type}, got {type(value)})")
            all_passed = False

    return all_passed


def test_valid_result_types(AIConfig):
    """유효한 결과 타입 검증"""
    print("\n[TEST] 유효한 결과 타입 검증")

    expected_types = [
        "office_thirst",
        "city_routine",
        "post_workout",
        "minimal_routine",
        "screen_fatigue",
        "sensitive_fragile",
        "urban_explorer",
        "active_energetic"
    ]

    actual_types = AIConfig.VALID_RESULT_TYPES

    if len(actual_types) != 8:
        print(f"   [FAIL] 결과 타입 개수: {len(actual_types)} (예상: 8)")
        return False

    missing = set(expected_types) - set(actual_types)
    extra = set(actual_types) - set(expected_types)

    if missing:
        print(f"   [FAIL] 누락된 타입: {missing}")
        return False

    if extra:
        print(f"   [FAIL] 추가된 타입: {extra}")
        return False

    print(f"   [OK] 8가지 결과 타입 모두 정의됨")
    for result_type in actual_types:
        print(f"        - {result_type}")

    return True


def test_config_validation(AIConfig):
    """설정 검증 로직 테스트"""
    print("\n[TEST] 설정 검증 로직 테스트")

    # API 키가 없으면 검증 실패가 예상됨
    if not AIConfig.OPENAI_API_KEY:
        print("   [WARNING] OPENAI_API_KEY가 설정되지 않음 (.env 파일 확인 필요)")
        print("   [INFO] validate() 호출 시 ValueError 발생 예상")
        try:
            AIConfig.validate()
            print("   [FAIL] 검증이 통과됨 (API 키 없이는 실패해야 함)")
            return False
        except ValueError as e:
            print(f"   [OK] 예상대로 검증 실패: {e}")
            return True
    else:
        print(f"   [OK] OPENAI_API_KEY 설정됨: {AIConfig.OPENAI_API_KEY[:20]}...")
        try:
            AIConfig.validate()
            print("   [OK] 설정 검증 통과")
            return True
        except ValueError as e:
            print(f"   [FAIL] 검증 실패: {e}")
            return False


def test_config_summary(AIConfig):
    """설정 요약 테스트"""
    print("\n[TEST] 설정 요약 테스트")

    try:
        summary = AIConfig.get_config_summary()
        print("   [OK] 설정 요약 생성 성공:")
        for key, value in summary.items():
            print(f"        {key}: {value}")
        return True
    except Exception as e:
        print(f"   [FAIL] 설정 요약 생성 실패: {e}")
        return False


def test_env_file_exists():
    """환경 변수 파일 존재 확인"""
    print("\n[TEST] 환경 변수 파일 확인")

    env_path = os.path.join(os.path.dirname(__file__), '..', '.env')
    env_example_path = os.path.join(os.path.dirname(__file__), '..', '.env.example')

    if os.path.exists(env_example_path):
        print(f"   [OK] .env.example 파일 존재")
    else:
        print(f"   [FAIL] .env.example 파일 없음")
        return False

    if os.path.exists(env_path):
        print(f"   [OK] .env 파일 존재")
        return True
    else:
        print(f"   [WARNING] .env 파일 없음")
        print(f"   [INFO] 다음 명령으로 생성하세요: cp .env.example .env")
        return False


def main():
    """전체 테스트 실행"""
    print("=" * 60)
    print("AI Config 테스트 시작")
    print("=" * 60)

    results = []

    # 1. 환경 파일 확인
    results.append(("ENV 파일 확인", test_env_file_exists()))

    # 2. 설정 임포트
    success, AIConfig = test_config_import()
    results.append(("설정 임포트", success))

    if not success:
        print("\n[FAIL] 설정을 임포트할 수 없어 테스트를 중단합니다.")
        return

    # 3. 설정값 로드
    results.append(("설정값 로드", test_config_values(AIConfig)))

    # 4. 결과 타입 검증
    results.append(("결과 타입 검증", test_valid_result_types(AIConfig)))

    # 5. 설정 검증
    results.append(("설정 검증", test_config_validation(AIConfig)))

    # 6. 설정 요약
    results.append(("설정 요약", test_config_summary(AIConfig)))

    # 결과 출력
    print("\n" + "=" * 60)
    print("테스트 결과")
    print("=" * 60)

    passed = sum(1 for _, result in results if result)
    total = len(results)

    for name, result in results:
        status = "[PASS]" if result else "[FAIL]"
        print(f"{status} {name}")

    print(f"\n통과: {passed}/{total}")

    if passed == total:
        print("\n[SUCCESS] 모든 테스트 통과!")
    else:
        print("\n[WARNING] 일부 테스트 실패")
        print("다음 단계:")
        print("1. .env 파일이 없다면: cp .env.example .env")
        print("2. .env 파일을 열어서 OPENAI_API_KEY 입력")
        print("3. 테스트 다시 실행: python tests/test_ai_config.py")


if __name__ == "__main__":
    main()
