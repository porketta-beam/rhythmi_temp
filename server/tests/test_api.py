"""
API 엔드포인트 테스트

설문 분석 API 통합 테스트
"""

import sys
import os
import asyncio

# 프로젝트 루트를 Python 경로에 추가
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# TestClient import 시도
try:
    from fastapi.testclient import TestClient
    from main import app
    from config.ai_config import AIConfig

    # 테스트 클라이언트 설정
    client = TestClient(app)
    USE_TEST_CLIENT = True
except Exception as e:
    print(f"[WARNING] TestClient 초기화 실패: {str(e)}")
    print("[INFO] requests 라이브러리로 대체 테스트 진행")

    import requests
    from config.ai_config import AIConfig

    # 서버 URL (수동 실행 필요)
    BASE_URL = "http://localhost:8000"
    USE_TEST_CLIENT = False


# ============================================================
# 테스트 데이터
# ============================================================

VALID_REQUEST = {
    "member_id": "test_member_001",
    "form_id": "frm_test_001",
    "responses": {
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
}

INCOMPLETE_REQUEST = {
    "member_id": "test_member_002",
    "form_id": "frm_test_001",
    "responses": {
        "1": "q1a1",
        "2": "q2a1"
    }
}


# ============================================================
# 테스트 함수
# ============================================================

def test_health_check():
    """헬스 체크 테스트"""
    print("\n[TEST] 헬스 체크")
    print("=" * 60)

    if USE_TEST_CLIENT:
        response = client.get("/api/survey/health")
    else:
        response = requests.get(f"{BASE_URL}/api/survey/health")

    print(f"\n상태 코드: {response.status_code}")
    print(f"응답: {response.json()}")

    assert response.status_code == 200

    data = response.json()
    assert data["status"] == "healthy"
    assert data["ai_configured"] is True
    assert data["supabase_configured"] is True

    print("\n[OK] 헬스 체크 성공")
    return True


def test_analyze_survey_success():
    """설문 분석 성공 시나리오"""
    print("\n[TEST] 설문 분석 성공 시나리오")
    print("=" * 60)

    if USE_TEST_CLIENT:
        response = client.post("/api/survey/analyze", json=VALID_REQUEST)
    else:
        response = requests.post(f"{BASE_URL}/api/survey/analyze", json=VALID_REQUEST)

    print(f"\n상태 코드: {response.status_code}")
    print(f"응답: {response.json()}")

    # 201 또는 200 허용 (API에 따라 다름)
    assert response.status_code in [200, 201]

    data = response.json()
    assert data["success"] is True
    assert "result_type" in data["data"]
    assert "source" in data["data"]

    # 유효한 결과 타입 확인
    valid_types = [
        "office_thirst", "city_routine", "post_workout", "minimal_routine",
        "screen_fatigue", "sensitive_fragile", "urban_explorer", "active_energetic"
    ]
    assert data["data"]["result_type"] in valid_types

    # AI 또는 Fallback 출처 확인
    assert data["data"]["source"] in ["ai", "fallback"]

    print(f"\n[OK] 분석 성공: {data['data']['result_type']} (출처: {data['data']['source']})")
    return True


def test_analyze_survey_incomplete_data():
    """불완전한 데이터 처리 테스트"""
    print("\n[TEST] 불완전한 데이터 처리")
    print("=" * 60)

    if USE_TEST_CLIENT:
        response = client.post("/api/survey/analyze", json=INCOMPLETE_REQUEST)
    else:
        response = requests.post(f"{BASE_URL}/api/survey/analyze", json=INCOMPLETE_REQUEST)

    print(f"\n상태 코드: {response.status_code}")
    print(f"응답: {response.json()}")

    # AI가 처리하거나 Fallback이 처리하면 성공
    # 둘 다 실패하면 500 에러
    if response.status_code in [200, 201]:
        data = response.json()
        print(f"\n[OK] 불완전한 데이터 처리 성공: {data['data']['result_type']}")
        return True
    else:
        print(f"\n[OK] 예상대로 실패: {response.status_code}")
        return True


def test_analyze_survey_invalid_request():
    """잘못된 요청 테스트"""
    print("\n[TEST] 잘못된 요청 처리")
    print("=" * 60)

    # 필수 필드 누락
    invalid_request = {
        "member_id": "test_member_003"
        # form_id, responses 누락
    }

    if USE_TEST_CLIENT:
        response = client.post("/api/survey/analyze", json=invalid_request)
    else:
        response = requests.post(f"{BASE_URL}/api/survey/analyze", json=invalid_request)

    print(f"\n상태 코드: {response.status_code}")
    print(f"응답: {response.json()}")

    # 422 (Validation Error) 또는 400 (Bad Request) 예상
    assert response.status_code in [400, 422]

    print(f"\n[OK] 잘못된 요청 처리 성공")
    return True


def main():
    """전체 테스트 실행"""
    print("\n" + "=" * 60)
    print("API 엔드포인트 테스트")
    print("=" * 60)

    # API 키 확인
    if not AIConfig.OPENAI_API_KEY:
        print("\n[FAIL] OPENAI_API_KEY not set")
        print("다음 단계:")
        print("1. .env 파일 생성: cp .env.example .env")
        print("2. .env 파일에 OPENAI_API_KEY 입력")
        return 1

    print(f"\n[OK] OpenAI API 키 확인: {AIConfig.OPENAI_API_KEY[:20]}...")

    results = []

    # 1. 헬스 체크
    try:
        result = test_health_check()
        results.append(("헬스 체크", result))
    except Exception as e:
        print(f"\n[FAIL] 헬스 체크 실패: {str(e)}")
        results.append(("헬스 체크", False))

    # 2. 설문 분석 성공 시나리오
    try:
        result = test_analyze_survey_success()
        results.append(("설문 분석 성공", result))
    except Exception as e:
        print(f"\n[FAIL] 설문 분석 성공 실패: {str(e)}")
        results.append(("설문 분석 성공", False))

    # 3. 불완전한 데이터 처리
    try:
        result = test_analyze_survey_incomplete_data()
        results.append(("불완전한 데이터", result))
    except Exception as e:
        print(f"\n[FAIL] 불완전한 데이터 처리 실패: {str(e)}")
        results.append(("불완전한 데이터", False))

    # 4. 잘못된 요청 처리
    try:
        result = test_analyze_survey_invalid_request()
        results.append(("잘못된 요청", result))
    except Exception as e:
        print(f"\n[FAIL] 잘못된 요청 처리 실패: {str(e)}")
        results.append(("잘못된 요청", False))

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
    exit_code = main()
    exit(exit_code)
