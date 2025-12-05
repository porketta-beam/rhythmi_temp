"""
WebSocket 동시 연결 테스트 스크립트

300명의 동시 WebSocket 연결을 시뮬레이션하여
서버의 안정성을 검증합니다.

사용법:
    python websocket_test.py --users 300 --duration 120
    python websocket_test.py --host ws://your-server.com --users 300
"""

import asyncio
import argparse
import time
import statistics
import json
from dataclasses import dataclass, field
from typing import List, Dict, Optional
from datetime import datetime

try:
    import websockets
except ImportError:
    print("websockets 라이브러리가 필요합니다: pip install websockets")
    exit(1)


# ============================================================
# 설정
# ============================================================

DEFAULT_WS_URL = "ws://localhost:8000/api/luckydraw/ws"
DEFAULT_EVENT_ID = "550e8400-e29b-41d4-a716-446655440000"


@dataclass
class TestResult:
    """개별 연결 테스트 결과"""
    user_id: int
    connected: bool = False
    connect_time_ms: float = 0
    messages_received: int = 0
    errors: List[str] = field(default_factory=list)
    disconnect_reason: Optional[str] = None


@dataclass
class TestReport:
    """전체 테스트 보고서"""
    total_users: int
    duration_seconds: float
    successful_connections: int = 0
    failed_connections: int = 0
    total_messages_received: int = 0
    connect_times_ms: List[float] = field(default_factory=list)
    errors: List[str] = field(default_factory=list)

    def calculate_stats(self) -> Dict:
        """통계 계산"""
        stats = {
            "total_users": self.total_users,
            "duration_seconds": self.duration_seconds,
            "successful_connections": self.successful_connections,
            "failed_connections": self.failed_connections,
            "connection_success_rate": f"{(self.successful_connections / self.total_users * 100):.1f}%",
            "total_messages_received": self.total_messages_received,
        }

        if self.connect_times_ms:
            stats["connect_time_ms"] = {
                "min": f"{min(self.connect_times_ms):.2f}",
                "max": f"{max(self.connect_times_ms):.2f}",
                "avg": f"{statistics.mean(self.connect_times_ms):.2f}",
                "p50": f"{statistics.median(self.connect_times_ms):.2f}",
                "p95": f"{sorted(self.connect_times_ms)[int(len(self.connect_times_ms) * 0.95)]:.2f}" if len(self.connect_times_ms) > 1 else "N/A",
                "p99": f"{sorted(self.connect_times_ms)[int(len(self.connect_times_ms) * 0.99)]:.2f}" if len(self.connect_times_ms) > 1 else "N/A",
            }

        return stats


# ============================================================
# WebSocket 클라이언트 시뮬레이터
# ============================================================

class WebSocketClient:
    """개별 WebSocket 클라이언트"""

    def __init__(self, user_id: int, ws_url: str, event_id: str):
        self.user_id = user_id
        self.ws_url = f"{ws_url}/{event_id}"
        self.result = TestResult(user_id=user_id)
        self.ws = None
        self._running = True

    async def connect_and_listen(self, duration: float) -> TestResult:
        """연결 후 메시지 수신"""
        start_time = time.time()

        try:
            # 연결 시도
            connect_start = time.perf_counter()
            self.ws = await asyncio.wait_for(
                websockets.connect(
                    self.ws_url,
                    ping_interval=20,
                    ping_timeout=10,
                    close_timeout=5
                ),
                timeout=10.0
            )
            connect_end = time.perf_counter()

            self.result.connected = True
            self.result.connect_time_ms = (connect_end - connect_start) * 1000

            # 메시지 수신 루프
            end_time = start_time + duration

            while time.time() < end_time and self._running:
                try:
                    message = await asyncio.wait_for(
                        self.ws.recv(),
                        timeout=5.0
                    )
                    self.result.messages_received += 1

                    # ping에 pong 응답
                    data = json.loads(message)
                    if data.get("type") == "ping":
                        await self.ws.send(json.dumps({"type": "pong"}))

                except asyncio.TimeoutError:
                    # 타임아웃은 정상 (메시지가 없는 경우)
                    continue
                except websockets.ConnectionClosed as e:
                    self.result.disconnect_reason = f"ConnectionClosed: {e.code} {e.reason}"
                    break

        except asyncio.TimeoutError:
            self.result.errors.append("Connection timeout")
        except ConnectionRefusedError:
            self.result.errors.append("Connection refused")
        except Exception as e:
            self.result.errors.append(f"Error: {str(e)}")
        finally:
            if self.ws:
                try:
                    await self.ws.close()
                except:
                    pass

        return self.result

    def stop(self):
        """연결 중지"""
        self._running = False


# ============================================================
# 테스트 러너
# ============================================================

class LoadTestRunner:
    """부하 테스트 실행기"""

    def __init__(self, ws_url: str, event_id: str, num_users: int, duration: float):
        self.ws_url = ws_url
        self.event_id = event_id
        self.num_users = num_users
        self.duration = duration
        self.clients: List[WebSocketClient] = []
        self.report = TestReport(
            total_users=num_users,
            duration_seconds=duration
        )

    async def run(self, ramp_up_time: float = 10.0) -> TestReport:
        """테스트 실행"""
        print(f"\n{'='*60}")
        print(f"WebSocket 부하 테스트 시작")
        print(f"{'='*60}")
        print(f"  서버 URL: {self.ws_url}/{self.event_id}")
        print(f"  사용자 수: {self.num_users}")
        print(f"  테스트 시간: {self.duration}초")
        print(f"  Ramp-up: {ramp_up_time}초")
        print(f"{'='*60}\n")

        # 클라이언트 생성
        self.clients = [
            WebSocketClient(i, self.ws_url, self.event_id)
            for i in range(self.num_users)
        ]

        # 점진적 연결 (ramp-up)
        delay_per_user = ramp_up_time / self.num_users
        tasks = []

        print(f"[{datetime.now().strftime('%H:%M:%S')}] 연결 시작...")

        for i, client in enumerate(self.clients):
            task = asyncio.create_task(
                client.connect_and_listen(self.duration)
            )
            tasks.append(task)

            # 진행 상황 출력
            if (i + 1) % 50 == 0 or i == 0:
                print(f"  - {i + 1}/{self.num_users} 클라이언트 연결 시작...")

            await asyncio.sleep(delay_per_user)

        print(f"\n[{datetime.now().strftime('%H:%M:%S')}] 모든 연결 시작 완료, 대기 중...")

        # 모든 작업 완료 대기
        results = await asyncio.gather(*tasks, return_exceptions=True)

        # 결과 집계
        for result in results:
            if isinstance(result, TestResult):
                if result.connected:
                    self.report.successful_connections += 1
                    self.report.connect_times_ms.append(result.connect_time_ms)
                else:
                    self.report.failed_connections += 1

                self.report.total_messages_received += result.messages_received
                self.report.errors.extend(result.errors)
            elif isinstance(result, Exception):
                self.report.failed_connections += 1
                self.report.errors.append(str(result))

        return self.report

    def print_report(self):
        """결과 보고서 출력"""
        stats = self.report.calculate_stats()

        print(f"\n{'='*60}")
        print("테스트 결과 보고서")
        print(f"{'='*60}")

        print(f"\n[연결 통계]")
        print(f"  총 사용자: {stats['total_users']}")
        print(f"  성공: {stats['successful_connections']}")
        print(f"  실패: {stats['failed_connections']}")
        print(f"  성공률: {stats['connection_success_rate']}")

        if "connect_time_ms" in stats:
            print(f"\n[연결 시간 (ms)]")
            ct = stats["connect_time_ms"]
            print(f"  최소: {ct['min']} ms")
            print(f"  최대: {ct['max']} ms")
            print(f"  평균: {ct['avg']} ms")
            print(f"  P50: {ct['p50']} ms")
            print(f"  P95: {ct['p95']} ms")
            print(f"  P99: {ct['p99']} ms")

        print(f"\n[메시지 통계]")
        print(f"  총 수신 메시지: {stats['total_messages_received']}")

        if self.report.errors:
            print(f"\n[에러 요약]")
            error_counts = {}
            for err in self.report.errors:
                error_counts[err] = error_counts.get(err, 0) + 1
            for err, count in sorted(error_counts.items(), key=lambda x: -x[1])[:10]:
                print(f"  - {err}: {count}건")

        print(f"\n{'='*60}")

        # 성공/실패 판정
        success_rate = self.report.successful_connections / self.report.total_users * 100
        if success_rate >= 99:
            print("✅ 테스트 통과 (성공률 99% 이상)")
        elif success_rate >= 95:
            print("⚠️ 주의 필요 (성공률 95-99%)")
        else:
            print("❌ 테스트 실패 (성공률 95% 미만)")

        print(f"{'='*60}\n")

        return stats


# ============================================================
# 메인
# ============================================================

async def main():
    parser = argparse.ArgumentParser(description="WebSocket 부하 테스트")
    parser.add_argument("--host", default=DEFAULT_WS_URL, help="WebSocket 서버 URL")
    parser.add_argument("--event-id", default=DEFAULT_EVENT_ID, help="이벤트 ID")
    parser.add_argument("--users", type=int, default=300, help="동시 사용자 수")
    parser.add_argument("--duration", type=float, default=120, help="테스트 시간 (초)")
    parser.add_argument("--ramp-up", type=float, default=10, help="Ramp-up 시간 (초)")
    parser.add_argument("--output", help="결과 저장 파일 (JSON)")

    args = parser.parse_args()

    runner = LoadTestRunner(
        ws_url=args.host,
        event_id=args.event_id,
        num_users=args.users,
        duration=args.duration
    )

    try:
        await runner.run(ramp_up_time=args.ramp_up)
        stats = runner.print_report()

        # 결과 저장
        if args.output:
            with open(args.output, "w", encoding="utf-8") as f:
                json.dump(stats, f, indent=2, ensure_ascii=False)
            print(f"결과 저장: {args.output}")

    except KeyboardInterrupt:
        print("\n테스트 중단됨")
        for client in runner.clients:
            client.stop()


if __name__ == "__main__":
    asyncio.run(main())
