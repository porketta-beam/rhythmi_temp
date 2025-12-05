"""
HTTP API 부하 테스트 스크립트

300명의 동시 참가자 등록 및 추첨 시나리오를 테스트합니다.

사용법:
    python http_test.py --users 300 --prizes 100
    python http_test.py --host http://your-server.com --users 300
"""

import asyncio
import argparse
import time
import statistics
import json
from dataclasses import dataclass, field
from typing import List, Dict, Optional, Tuple
from datetime import datetime

try:
    import aiohttp
except ImportError:
    print("aiohttp 라이브러리가 필요합니다: pip install aiohttp")
    exit(1)


# ============================================================
# 설정
# ============================================================

DEFAULT_API_URL = "http://localhost:8000"
DEFAULT_EVENT_ID = "550e8400-e29b-41d4-a716-446655440000"


@dataclass
class RequestResult:
    """개별 요청 결과"""
    success: bool
    status_code: int
    response_time_ms: float
    error: Optional[str] = None
    data: Optional[Dict] = None


@dataclass
class TestReport:
    """테스트 보고서"""
    scenario: str
    total_requests: int
    successful_requests: int = 0
    failed_requests: int = 0
    response_times_ms: List[float] = field(default_factory=list)
    errors: List[str] = field(default_factory=list)
    status_codes: Dict[int, int] = field(default_factory=dict)

    def calculate_stats(self) -> Dict:
        """통계 계산"""
        stats = {
            "scenario": self.scenario,
            "total_requests": self.total_requests,
            "successful_requests": self.successful_requests,
            "failed_requests": self.failed_requests,
            "success_rate": f"{(self.successful_requests / max(self.total_requests, 1) * 100):.1f}%",
            "status_codes": self.status_codes,
        }

        if self.response_times_ms:
            sorted_times = sorted(self.response_times_ms)
            stats["response_time_ms"] = {
                "min": f"{min(sorted_times):.2f}",
                "max": f"{max(sorted_times):.2f}",
                "avg": f"{statistics.mean(sorted_times):.2f}",
                "p50": f"{sorted_times[int(len(sorted_times) * 0.50)]:.2f}",
                "p95": f"{sorted_times[int(len(sorted_times) * 0.95)]:.2f}" if len(sorted_times) > 1 else "N/A",
                "p99": f"{sorted_times[int(len(sorted_times) * 0.99)]:.2f}" if len(sorted_times) > 1 else "N/A",
            }

        return stats


# ============================================================
# HTTP 클라이언트
# ============================================================

class HTTPLoadTester:
    """HTTP API 부하 테스터"""

    def __init__(self, base_url: str, event_id: str):
        self.base_url = base_url.rstrip("/")
        self.event_id = event_id
        self.session: Optional[aiohttp.ClientSession] = None
        self.registered_tokens: List[str] = []

    async def __aenter__(self):
        self.session = aiohttp.ClientSession(
            timeout=aiohttp.ClientTimeout(total=30)
        )
        return self

    async def __aexit__(self, *args):
        if self.session:
            await self.session.close()

    async def make_request(
        self,
        method: str,
        endpoint: str,
        json_data: Optional[Dict] = None
    ) -> RequestResult:
        """HTTP 요청 실행"""
        url = f"{self.base_url}{endpoint}"
        start_time = time.perf_counter()

        try:
            async with self.session.request(
                method, url, json=json_data
            ) as response:
                end_time = time.perf_counter()
                response_time = (end_time - start_time) * 1000

                data = None
                try:
                    data = await response.json()
                except:
                    pass

                return RequestResult(
                    success=200 <= response.status < 300,
                    status_code=response.status,
                    response_time_ms=response_time,
                    data=data
                )

        except asyncio.TimeoutError:
            return RequestResult(
                success=False,
                status_code=0,
                response_time_ms=(time.perf_counter() - start_time) * 1000,
                error="Timeout"
            )
        except aiohttp.ClientError as e:
            return RequestResult(
                success=False,
                status_code=0,
                response_time_ms=(time.perf_counter() - start_time) * 1000,
                error=str(e)
            )
        except Exception as e:
            return RequestResult(
                success=False,
                status_code=0,
                response_time_ms=(time.perf_counter() - start_time) * 1000,
                error=str(e)
            )

    async def register_participant(self, session_token: Optional[str] = None) -> RequestResult:
        """참가자 등록"""
        payload = {"event_id": self.event_id}
        if session_token:
            payload["session_token"] = session_token

        result = await self.make_request(
            "POST",
            "/api/luckydraw/register",
            json_data=payload
        )

        if result.success and result.data:
            token = result.data.get("data", {}).get("session_token")
            if token:
                self.registered_tokens.append(token)

        return result

    async def get_participants(self) -> RequestResult:
        """참가자 목록 조회"""
        return await self.make_request(
            "GET",
            f"/api/luckydraw/admin/{self.event_id}/participants"
        )

    async def start_draw(
        self,
        prize_name: str,
        prize_rank: int,
        draw_mode: str = "slot",
        winner_count: int = 1
    ) -> RequestResult:
        """추첨 시작"""
        return await self.make_request(
            "POST",
            f"/api/luckydraw/admin/{self.event_id}/draw/start-animation",
            json_data={
                "prize_name": prize_name,
                "prize_rank": prize_rank,
                "draw_mode": draw_mode,
                "winner_count": winner_count
            }
        )

    async def reveal_winner(self) -> RequestResult:
        """결과 발표"""
        return await self.make_request(
            "POST",
            f"/api/luckydraw/admin/{self.event_id}/draw/reveal"
        )

    async def reset_event(
        self,
        reset_participants: bool = False,
        reset_draws: bool = True
    ) -> RequestResult:
        """이벤트 리셋"""
        return await self.make_request(
            "POST",
            f"/api/luckydraw/admin/{self.event_id}/reset",
            json_data={
                "reset_participants": reset_participants,
                "reset_draws": reset_draws
            }
        )


# ============================================================
# 테스트 시나리오
# ============================================================

async def scenario_registration_spike(
    tester: HTTPLoadTester,
    num_users: int,
    ramp_up_time: float
) -> TestReport:
    """
    시나리오 A: 참가자 등록 스파이크

    300명이 동시에 참가자 등록을 시도합니다.
    """
    report = TestReport(
        scenario="참가자 등록 스파이크",
        total_requests=num_users
    )

    print(f"\n[시나리오 A] 참가자 등록 스파이크 ({num_users}명)")
    print(f"  Ramp-up: {ramp_up_time}초\n")

    delay_per_request = ramp_up_time / num_users
    tasks = []

    for i in range(num_users):
        task = asyncio.create_task(tester.register_participant())
        tasks.append(task)

        if (i + 1) % 50 == 0:
            print(f"  - {i + 1}/{num_users} 요청 시작...")

        await asyncio.sleep(delay_per_request)

    results = await asyncio.gather(*tasks, return_exceptions=True)

    for result in results:
        if isinstance(result, RequestResult):
            if result.success:
                report.successful_requests += 1
            else:
                report.failed_requests += 1
                if result.error:
                    report.errors.append(result.error)

            report.response_times_ms.append(result.response_time_ms)
            report.status_codes[result.status_code] = report.status_codes.get(result.status_code, 0) + 1
        else:
            report.failed_requests += 1
            report.errors.append(str(result))

    return report


async def scenario_draw_sequence(
    tester: HTTPLoadTester,
    num_prizes: int,
    delay_between_draws: float = 3.0
) -> TestReport:
    """
    시나리오 B: 추첨 시퀀스

    100개의 경품에 대해 순차적으로 추첨을 진행합니다.
    """
    report = TestReport(
        scenario="추첨 시퀀스",
        total_requests=num_prizes * 2  # start + reveal
    )

    print(f"\n[시나리오 B] 추첨 시퀀스 ({num_prizes}개 경품)")
    print(f"  추첨 간격: {delay_between_draws}초\n")

    for i in range(num_prizes):
        prize_name = f"{i + 1}등 상품"
        prize_rank = i + 1

        # 추첨 시작
        start_result = await tester.start_draw(
            prize_name=prize_name,
            prize_rank=prize_rank
        )

        if start_result.success:
            report.successful_requests += 1
        else:
            report.failed_requests += 1
            if start_result.error:
                report.errors.append(f"start[{prize_name}]: {start_result.error}")

        report.response_times_ms.append(start_result.response_time_ms)
        report.status_codes[start_result.status_code] = report.status_codes.get(start_result.status_code, 0) + 1

        # 잠시 대기 (애니메이션 시간)
        await asyncio.sleep(0.5)

        # 결과 발표
        reveal_result = await tester.reveal_winner()

        if reveal_result.success:
            report.successful_requests += 1
        else:
            report.failed_requests += 1
            if reveal_result.error:
                report.errors.append(f"reveal[{prize_name}]: {reveal_result.error}")

        report.response_times_ms.append(reveal_result.response_time_ms)
        report.status_codes[reveal_result.status_code] = report.status_codes.get(reveal_result.status_code, 0) + 1

        if (i + 1) % 10 == 0:
            print(f"  - {i + 1}/{num_prizes} 추첨 완료")

        await asyncio.sleep(delay_between_draws)

    return report


async def scenario_mixed_load(
    tester: HTTPLoadTester,
    num_users: int,
    num_prizes: int
) -> Tuple[TestReport, TestReport]:
    """
    시나리오 C: 혼합 부하

    참가자 등록과 추첨을 동시에 진행합니다.
    """
    print(f"\n[시나리오 C] 혼합 부하")
    print(f"  참가자: {num_users}명, 경품: {num_prizes}개\n")

    # 참가자 등록
    reg_report = await scenario_registration_spike(
        tester, num_users, ramp_up_time=10.0
    )

    # 대기
    print(f"\n  참가자 등록 완료, 추첨 시작...\n")
    await asyncio.sleep(2.0)

    # 추첨 진행
    draw_report = await scenario_draw_sequence(
        tester, num_prizes, delay_between_draws=2.0
    )

    return reg_report, draw_report


# ============================================================
# 결과 출력
# ============================================================

def print_report(report: TestReport):
    """보고서 출력"""
    stats = report.calculate_stats()

    print(f"\n{'='*50}")
    print(f"[{stats['scenario']}] 테스트 결과")
    print(f"{'='*50}")

    print(f"\n[요청 통계]")
    print(f"  총 요청: {stats['total_requests']}")
    print(f"  성공: {stats['successful_requests']}")
    print(f"  실패: {stats['failed_requests']}")
    print(f"  성공률: {stats['success_rate']}")

    if "response_time_ms" in stats:
        print(f"\n[응답 시간]")
        rt = stats["response_time_ms"]
        print(f"  최소: {rt['min']} ms")
        print(f"  최대: {rt['max']} ms")
        print(f"  평균: {rt['avg']} ms")
        print(f"  P50: {rt['p50']} ms")
        print(f"  P95: {rt['p95']} ms")
        print(f"  P99: {rt['p99']} ms")

    print(f"\n[상태 코드 분포]")
    for code, count in sorted(stats["status_codes"].items()):
        print(f"  {code}: {count}건")

    if report.errors:
        print(f"\n[에러 요약 (상위 5개)]")
        error_counts = {}
        for err in report.errors:
            error_counts[err] = error_counts.get(err, 0) + 1
        for err, count in sorted(error_counts.items(), key=lambda x: -x[1])[:5]:
            print(f"  - {err}: {count}건")

    print(f"\n{'='*50}")

    # 성공/실패 판정
    success_rate = report.successful_requests / max(report.total_requests, 1) * 100
    if success_rate >= 99:
        print("✅ 테스트 통과")
    elif success_rate >= 95:
        print("⚠️ 주의 필요")
    else:
        print("❌ 테스트 실패")

    print(f"{'='*50}\n")

    return stats


# ============================================================
# 메인
# ============================================================

async def main():
    parser = argparse.ArgumentParser(description="HTTP API 부하 테스트")
    parser.add_argument("--host", default=DEFAULT_API_URL, help="API 서버 URL")
    parser.add_argument("--event-id", default=DEFAULT_EVENT_ID, help="이벤트 ID")
    parser.add_argument("--users", type=int, default=300, help="참가자 수")
    parser.add_argument("--prizes", type=int, default=100, help="경품 수")
    parser.add_argument("--scenario", choices=["registration", "draw", "mixed"], default="mixed",
                       help="테스트 시나리오")
    parser.add_argument("--output", help="결과 저장 파일 (JSON)")

    args = parser.parse_args()

    print(f"\n{'='*60}")
    print(f"HTTP API 부하 테스트")
    print(f"{'='*60}")
    print(f"  서버 URL: {args.host}")
    print(f"  이벤트 ID: {args.event_id}")
    print(f"  시나리오: {args.scenario}")
    print(f"{'='*60}")

    all_stats = {}

    async with HTTPLoadTester(args.host, args.event_id) as tester:
        # 테스트 전 리셋
        print("\n[준비] 이벤트 데이터 리셋...")
        await tester.reset_event(reset_participants=True, reset_draws=True)

        if args.scenario == "registration":
            report = await scenario_registration_spike(
                tester, args.users, ramp_up_time=10.0
            )
            all_stats["registration"] = print_report(report)

        elif args.scenario == "draw":
            # 먼저 참가자 등록
            print("\n[준비] 참가자 등록 중...")
            for i in range(args.users):
                await tester.register_participant()
                if (i + 1) % 50 == 0:
                    print(f"  - {i + 1}/{args.users} 등록 완료")

            report = await scenario_draw_sequence(
                tester, args.prizes, delay_between_draws=1.0
            )
            all_stats["draw"] = print_report(report)

        elif args.scenario == "mixed":
            reg_report, draw_report = await scenario_mixed_load(
                tester, args.users, args.prizes
            )
            all_stats["registration"] = print_report(reg_report)
            all_stats["draw"] = print_report(draw_report)

        # 테스트 후 리셋
        print("\n[정리] 이벤트 데이터 리셋...")
        await tester.reset_event(reset_participants=True, reset_draws=True)

    # 결과 저장
    if args.output:
        with open(args.output, "w", encoding="utf-8") as f:
            json.dump(all_stats, f, indent=2, ensure_ascii=False)
        print(f"\n결과 저장: {args.output}")


if __name__ == "__main__":
    asyncio.run(main())
