"""
AI 분류기 테스트 스크립트

8가지 피부 타입을 대표하는 설문 응답 패턴으로 AI 분류 테스트
"""

import asyncio
import sys
from collections import Counter

# 프로젝트 루트를 sys.path에 추가
sys.path.insert(0, '.')

from services.ai_classifier import classify_skin_type


# 8가지 타입을 대표하는 설문 응답 패턴
TEST_PATTERNS = {
    "office_thirst": {
        "name": "오후 3시 사무실의 갈증형 (건조 + 실내)",
        "answers": {
            "100": "gender_female",
            "101": "age_20s",
            "1": "q1a1",    # 매우 건조하고 당긴다
            "2": "q2a1",    # 여전히 건조하다
            "3": "q3a3",    # 가끔 붉어짐
            "4": "q4a2",    # 환절기 자주 영향
            "5": "q5a3",    # 미세먼지 가끔 민감
            "6": "q6a3",    # 제품 가끔 반응
            "7": "q7a1",    # 사무실/학교 등 실내
            "8": "q8a1",    # 건조한 냉난방
            "9": "q9a2",    # 토너/크림 정도
            "10": "q10a3"   # 미스트 꼭 챙김
        }
    },
    "city_routine": {
        "name": "바람 속을 걷는 도시 루틴러형 (야외 + 복합/건조)",
        "answers": {
            "100": "gender_male",
            "101": "age_30s",
            "1": "q1a2",    # 약간 건조
            "2": "q2a2",    # 코 주변만 살짝 유분
            "3": "q3a3",    # 가끔 붉어짐
            "4": "q4a3",    # 가끔 변화
            "5": "q5a2",    # 자주 민감
            "6": "q6a3",    # 가끔 반응
            "7": "q7a3",    # 외근/야외 활동 많음
            "8": "q8a4",    # 다양한 공간 이동
            "9": "q9a2",    # 토너/크림 정도
            "10": "q10a2"   # 가끔 들고 다님
        }
    },
    "post_workout": {
        "name": "땀과 샤워 후의 고요형 (활동 + 지성)",
        "answers": {
            "100": "gender_male",
            "101": "age_20s",
            "1": "q1a4",    # 살짝 유분이 있다
            "2": "q2a3",    # T존 위주로 유분
            "3": "q3a4",    # 거의 안 붉어짐
            "4": "q4a4",    # 환절기 영향 거의 없음
            "5": "q5a4",    # 미세먼지 민감 거의 없음
            "6": "q6a4",    # 제품 반응 거의 없음
            "7": "q7a4",    # 운동 시설/헬스장
            "8": "q8a4",    # 다양한 공간 이동
            "9": "q9a3",    # 여러 단계 꾸준히
            "10": "q10a2"   # 가끔 들고 다님
        }
    },
    "minimal_routine": {
        "name": "가방 속 작은 루틴 수집가형 (미니멀 케어)",
        "answers": {
            "100": "gender_male",
            "101": "age_30s",
            "1": "q1a3",    # 편안하다
            "2": "q2a2",    # 코 주변만 살짝 유분
            "3": "q3a4",    # 거의 안 붉어짐
            "4": "q4a4",    # 환절기 영향 거의 없음
            "5": "q5a4",    # 미세먼지 민감 거의 없음
            "6": "q6a4",    # 제품 반응 거의 없음
            "7": "q7a2",    # 카페/코워킹 등 다양한 공간
            "8": "q8a4",    # 다양한 공간 이동
            "9": "q9a1",    # 거의 관리 안함
            "10": "q10a1"   # 거의 휴대 안함
        }
    },
    "screen_fatigue": {
        "name": "화면 빛에 지는 오후의 얼굴형 (실내 + 민감)",
        "answers": {
            "100": "gender_female",
            "101": "age_20s",
            "1": "q1a2",    # 약간 건조
            "2": "q2a2",    # 코 주변만 살짝 유분
            "3": "q3a2",    # 자주 붉어짐
            "4": "q4a2",    # 환절기 자주 영향
            "5": "q5a2",    # 미세먼지 자주 민감
            "6": "q6a2",    # 제품 종종 반응
            "7": "q7a1",    # 사무실/학교 등 실내
            "8": "q8a2",    # 환기 어려운 밀폐
            "9": "q9a2",    # 토너/크림 정도
            "10": "q10a2"   # 가끔 들고 다님
        }
    },
    "sensitive_fragile": {
        "name": "마음처럼 여린 피부결형 (매우 민감)",
        "answers": {
            "100": "gender_female",
            "101": "age_30s",
            "1": "q1a2",    # 약간 건조
            "2": "q2a2",    # 코 주변만 살짝 유분
            "3": "q3a1",    # 매우 자주 붉어짐
            "4": "q4a1",    # 환절기 항상 크게 영향
            "5": "q5a1",    # 미세먼지 바로 반응
            "6": "q6a1",    # 제품 거의 항상 반응
            "7": "q7a1",    # 사무실/학교 등 실내
            "8": "q8a3",    # 온도 변화 큰 환경
            "9": "q9a4",    # 매우 적극적 관리
            "10": "q10a4"   # 여러 제품 세트로
        }
    },
    "urban_explorer": {
        "name": "먼지와 마찰 속의 도시 탐험가형 (야외 + 민감)",
        "answers": {
            "100": "gender_male",
            "101": "age_20s",
            "1": "q1a3",    # 편안하다
            "2": "q2a2",    # 코 주변만 살짝 유분
            "3": "q3a2",    # 자주 붉어짐
            "4": "q4a2",    # 환절기 자주 영향
            "5": "q5a1",    # 미세먼지 바로 반응
            "6": "q6a2",    # 제품 종종 반응
            "7": "q7a3",    # 외근/야외 활동 많음
            "8": "q8a3",    # 온도 변화 큰 환경
            "9": "q9a3",    # 여러 단계 꾸준히
            "10": "q10a3"   # 미스트 꼭 챙김
        }
    },
    "active_energetic": {
        "name": "열과 속도로 달리는 활력형 (매우 활동적 + 지성)",
        "answers": {
            "100": "gender_male",
            "101": "age_20s",
            "1": "q1a5",    # 유분이 많다
            "2": "q2a4",    # 얼굴 전체적으로 유분
            "3": "q3a4",    # 거의 안 붉어짐
            "4": "q4a4",    # 환절기 영향 거의 없음
            "5": "q5a4",    # 미세먼지 민감 거의 없음
            "6": "q6a4",    # 제품 반응 거의 없음
            "7": "q7a4",    # 운동 시설/헬스장
            "8": "q8a4",    # 다양한 공간 이동
            "9": "q9a4",    # 매우 적극적 관리
            "10": "q10a4"   # 여러 제품 세트로
        }
    }
}


async def test_ai_classification():
    """AI 분류 테스트 실행"""
    print("=" * 80)
    print("[TEST] AI Classifier Test Started")
    print("=" * 80)
    print()

    results = []
    result_counts = Counter()

    for expected_type, pattern in TEST_PATTERNS.items():
        print(f"[TEST] {pattern['name']}")
        print(f"   Expected: {expected_type}")

        # AI 분류 호출
        result_type, error = await classify_skin_type(pattern['answers'])

        if result_type:
            print(f"   AI Result: {result_type}")
            match = "[MATCH]" if result_type == expected_type else "[MISMATCH]"
            print(f"   {match}")
            results.append({
                "expected": expected_type,
                "actual": result_type,
                "match": result_type == expected_type
            })
            result_counts[result_type] += 1
        else:
            print(f"   [ERROR] {error}")
            results.append({
                "expected": expected_type,
                "actual": None,
                "error": error,
                "match": False
            })

        print()

    # 결과 요약
    print("=" * 80)
    print("[SUMMARY] Test Results")
    print("=" * 80)
    print()

    # 정확도 계산
    total = len(results)
    matches = sum(1 for r in results if r.get("match", False))
    accuracy = (matches / total * 100) if total > 0 else 0

    print(f"[ACCURACY] {matches}/{total} ({accuracy:.1f}%)")
    print()

    # 결과 분포
    print("[DISTRIBUTION] Result Type Distribution:")
    for result_type, count in result_counts.most_common():
        percentage = (count / total * 100) if total > 0 else 0
        bar = "#" * int(percentage / 5)
        print(f"   {result_type:20} : {count:2} times ({percentage:5.1f}%) {bar}")
    print()

    # 문제 케이스
    mismatches = [r for r in results if not r.get("match", False)]
    if mismatches:
        print("[MISMATCHES] Cases:")
        for i, r in enumerate(mismatches, 1):
            print(f"   {i}. Expected: {r['expected']:20} -> Actual: {r.get('actual', 'ERROR')}")
        print()

    # 다양성 평가
    unique_types = len(result_counts)
    print(f"[DIVERSITY] {unique_types}/8 types appeared")

    if unique_types >= 6:
        print("   [EXCELLENT] Various types evenly classified")
    elif unique_types >= 4:
        print("   [MODERATE] Some type bias detected")
    else:
        print("   [POOR] Concentrated on few types")
    print()

    # minimal_routine 비율 체크
    minimal_count = result_counts.get('minimal_routine', 0)
    minimal_ratio = (minimal_count / total * 100) if total > 0 else 0

    print(f"[MINIMAL_ROUTINE] Ratio: {minimal_count}/{total} ({minimal_ratio:.1f}%)")

    if minimal_ratio > 50:
        print("   [BAD] Still biased to minimal_routine!")
    elif minimal_ratio > 20:
        print("   [WARNING] minimal_routine slightly high")
    else:
        print("   [GOOD] minimal_routine ratio normal")

    print()
    print("=" * 80)


if __name__ == "__main__":
    asyncio.run(test_ai_classification())
