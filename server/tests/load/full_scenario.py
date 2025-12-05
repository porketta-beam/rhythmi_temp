"""
통합 부하 테스트 스크립트

300명 동시 접속 + 100개 경품 추첨의 전체 시나리오를 테스트합니다.
HTTP API와 WebSocket을 동시에 테스트합니다.

사용법:
    python full_scenario.py --users 300 --prizes 100
    python full_scenario.py --host http://your-server.com --users 300 --prizes 100
"""

import asyncio
import argparse
import time
import json
import statistics
from dataclasses import dataclass, field
from typing import List, Dict, Optional
from datetime import datetime

try:
    import aiohttp
    import websockets
except ImportError:
    print("필요한 라이브러리를 설치하세요: pip install aiohttp websockets")
    exit(1)


# ============================================================
# 설정
# ============================================================

DEFAULT_HTTP_URL = "http://localhost:8000"
DEFAULT_EVENT_ID = "550e8400-e29b-41d4-a716-446655440000"


@dataclass
class ParticipantResult:
    """참가자 테스트 결과"""
    user_id: int
    registered: bool = False
    draw_number: Optional[int] = None
    session_token: Optional[str] = None
    ws_connected: bool = False
    messages_received: int = 0
    won_prizes: List[str] = field(default_factory=list)
    registration_time_ms: float = 0
    errors: List[str] = field(default_factory=list)


@dataclass
class ScenarioReport:
    """전체 시나리오 보고서"""
    total_users: int
    total_prizes: int
    duration_seconds: float = 0

    # 등록 통계
    successful_registrations: int = 0
    failed_registrations: int = 0
    registration_times_ms: List[float] = field(default_factory=list)

    # WebSocket 통계
    successful_connections: int = 0
    failed_connections: int = 0
    total_messages_received: int = 0

    # 추첨 통계
    successful_draws: int = 0
    failed_draws: int = 0
    winners_found: int = 0

    # 에러
    errors: List[str] = field(default_factory=list)

    def to_dict(self) -> Dict:
        """딕셔너리 변환"""
        reg_times = self.registration_times_ms

        result = {
            "summary": {
                "total_users": self.total_users,
                "total_prizes": self.total_prizes,
                "duration_seconds": f"{self.duration_seconds:.1f}",
            },
            "registration": {
                "success": self.successful_registrations,
                "failed": self.failed_registrations,
                "success_rate": f"{(self.successful_registrations / max(self.total_users, 1) * 100):.1f}%",
            },
            "websocket": {
                "connected": self.successful_connections,
                "failed": self.failed_connections,
                "messages_received": self.total_messages_received,
            },
            "draw": {
                "success": self.successful_draws,
                "failed": self.failed_draws,
                "winners_found": self.winners_found,
            },
            "errors_count": len(self.errors),
        }

        if reg_times:
            sorted_times = sorted(reg_times)
            result["registration"]["time_ms"] = {
                "min": f"{min(sorted_times):.2f}",
                "max": f"{max(sorted_times):.2f}",
                "avg": f"{statistics.mean(sorted_times):.2f}",
                "p95": f"{sorted_times[int(len(sorted_times) * 0.95)]:.2f}" if len(sorted_times) > 1 else "N/A",
            }

        return result


# ============================================================
# 통합 테스트 클라이언트
# ============================================================

class ParticipantClient:
    """개별 참가자 클라이언트 (HTTP + WebSocket)"""

    def __init__(
        self,
        user_id: int,
        http_url: str,
        event_id: str,
        http_session: aiohttp.ClientSession
    ):
        self.user_id = user_id
        self.http_url = http_url.rstrip("/")
        self.event_id = event_id
        self.http_session = http_session

        self.result = ParticipantResult(user_id=user_id)
        self.ws = None
        self._running = True

    async def register(self) -> bool:
        """참가자 등록"""
        url = f"{self.http_url}/api/luckydraw/register"
        payload = {"event_id": self.event_id}

        start_time = time.perf_counter()

        try:
            async with self.http_session.post(url, json=payload) as response:
                end_time = time.perf_counter()
                self.result.registration_time_ms = (end_time - start_time) * 1000

                if response.status == 201:
                    data = await response.json()
                    self.result.registered = True
                    self.result.draw_number = data.get("data", {}).get("draw_number")
                    self.result.session_token = data.get("data", {}).get("session_token")
                    return True
                else:
                    self.result.errors.append(f"Registration failed: {response.status}")
                    return False

        except Exception as e:
            self.result.errors.append(f"Registration error: {str(e)}")
            return False

    async def connect_websocket(self) -> bool:
        """WebSocket 연결"""
        ws_protocol = "wss" if self.http_url.startswith("https") else "ws"
        ws_host = self.http_url.replace("http://", "").replace("https://", "")
        ws_url = f"{ws_protocol}://{ws_host}/api/luckydraw/ws/{self.event_id}"

        try:
            self.ws = await asyncio.wait_for(
                websockets.connect(
                    ws_url,
                    ping_interval=20,
                    ping_timeout=10
                ),
                timeout=10.0
            )
            self.result.ws_connected = True
            return True

        except Exception as e:
            self.result.errors.append(f"WS connect error: {str(e)}")
            return False

    async def listen_websocket(self, duration: float):
        """WebSocket 메시지 수신"""
        if not self.ws:
            return

        end_time = time.time() + duration

        while time.time() < end_time and self._running:
            try:
                message = await asyncio.wait_for(
                    self.ws.recv(),
                    timeout=2.0
                )
                self.result.messages_received += 1

                data = json.loads(message)
                msg_type = data.get("type")

                # 당첨 확인
                if msg_type == "winner_announced":
                    winners = data.get("winners", [])
                    if self.result.draw_number in winners:
                        prize_name = data.get("prize_name", "Unknown")
                        self.result.won_prizes.append(prize_name)

            except asyncio.TimeoutError:
                continue
            except websockets.ConnectionClosed:
                break
            except Exception as e:
                self.result.errors.append(f"WS receive error: {str(e)}")
                break

    async def close(self):
        """연결 종료"""
        self._running = False
        if self.ws:
            try:
                await self.ws.close()
            except:
                pass

    def stop(self):
        """중지 플래그 설정"""
        self._running = False


# ============================================================
# 관리자 클라이언트
# ============================================================

class AdminClient:
    """관리자 클라이언트"""

    def __init__(
        self,
        http_url: str,
        event_id: str,
        http_session: aiohttp.ClientSession
    ):
        self.http_url = http_url.rstrip("/")
        self.event_id = event_id
        self.http_session = http_session

    async def start_draw(
        self,
        prize_name: str,
        prize_rank: int,
        draw_mode: str = "slot",
        winner_count: int = 1
    ) -> bool:
        """추첨 시작"""
        url = f"{self.http_url}/api/luckydraw/admin/{self.event_id}/draw/start-animation"
        payload = {
            "prize_name": prize_name,
            "prize_rank": prize_rank,
            "draw_mode": draw_mode,
            "winner_count": winner_count
        }

        try:
            async with self.http_session.post(url, json=payload) as response:
                return response.status == 200
        except:
            return False

    async def reveal_winner(self) -> bool:
        """결과 발표"""
        url = f"{self.http_url}/api/luckydraw/admin/{self.event_id}/draw/reveal"

        try:
            async with self.http_session.post(url) as response:
                return response.status == 200
        except:
            return False

    async def reset_event(self) -> bool:
        """이벤트 리셋"""
        url = f"{self.http_url}/api/luckydraw/admin/{self.event_id}/reset"
        payload = {
            "reset_participants": True,
            "reset_draws": True
        }

        try:
            async with self.http_session.post(url, json=payload) as response:
                return response.status == 200
        except:
            return False


# ============================================================
# 시나리오 러너
# ============================================================

class FullScenarioRunner:
    """전체 시나리오 실행기"""

    def __init__(
        self,
        http_url: str,
        event_id: str,
        num_users: int,
        num_prizes: int
    ):
        self.http_url = http_url
        self.event_id = event_id
        self.num_users = num_users
        self.num_prizes = num_prizes

        self.participants: List[ParticipantClient] = []
        self.report = ScenarioReport(
            total_users=num_users,
            total_prizes=num_prizes
        )

    async def run(self) -> ScenarioReport:
        """전체 시나리오 실행"""
        print(f"\n{'='*70}")
        print("통합 부하 테스트 시작")
        print(f"{'='*70}")
        print(f"  서버: {self.http_url}")
        print(f"  이벤트 ID: {self.event_id}")
        print(f"  참가자 수: {self.num_users}")
        print(f"  경품 수: {self.num_prizes}")
        print(f"{'='*70}\n")

        start_time = time.time()

        async with aiohttp.ClientSession(
            timeout=aiohttp.ClientTimeout(total=30)
        ) as session:

            # 1. 이벤트 리셋
            print("[1/5] 이벤트 리셋...")
            admin = AdminClient(self.http_url, self.event_id, session)
            await admin.reset_event()

            # 2. 참가자 등록 (동시 스파이크)
            print(f"\n[2/5] 참가자 등록 ({self.num_users}명)...")
            await self._phase_registration(session)

            # 3. WebSocket 연결
            print(f"\n[3/5] WebSocket 연결...")
            await self._phase_websocket_connect()

            # 4. WebSocket 리스닝 + 추첨 진행 (병렬)
            print(f"\n[4/5] 추첨 진행 ({self.num_prizes}개 경품)...")
            await self._phase_draw_with_listeners(admin)

            # 5. 정리
            print(f"\n[5/5] 정리...")
            await self._phase_cleanup()
            await admin.reset_event()

        self.report.duration_seconds = time.time() - start_time
        return self.report

    async def _phase_registration(self, session: aiohttp.ClientSession):
        """참가자 등록 단계"""
        # 참가자 클라이언트 생성
        self.participants = [
            ParticipantClient(i, self.http_url, self.event_id, session)
            for i in range(self.num_users)
        ]

        # 동시 등록 (10초 내에 모두 등록)
        ramp_up_time = 10.0
        delay_per_user = ramp_up_time / self.num_users
        tasks = []

        for i, participant in enumerate(self.participants):
            task = asyncio.create_task(participant.register())
            tasks.append(task)

            if (i + 1) % 50 == 0:
                print(f"  - {i + 1}/{self.num_users} 등록 요청...")

            await asyncio.sleep(delay_per_user)

        results = await asyncio.gather(*tasks, return_exceptions=True)

        # 결과 집계
        for participant in self.participants:
            if participant.result.registered:
                self.report.successful_registrations += 1
                self.report.registration_times_ms.append(
                    participant.result.registration_time_ms
                )
            else:
                self.report.failed_registrations += 1
                self.report.errors.extend(participant.result.errors)

        print(f"  [OK] 등록 완료: {self.report.successful_registrations}/{self.num_users}")

    async def _phase_websocket_connect(self):
        """WebSocket 연결 단계"""
        tasks = [
            asyncio.create_task(p.connect_websocket())
            for p in self.participants
            if p.result.registered
        ]

        if tasks:
            await asyncio.gather(*tasks, return_exceptions=True)

        for p in self.participants:
            if p.result.ws_connected:
                self.report.successful_connections += 1
            elif p.result.registered:
                self.report.failed_connections += 1

        print(f"  [OK] WebSocket 연결: {self.report.successful_connections}")

    async def _phase_draw_with_listeners(self, admin: AdminClient):
        """추첨 + 리스닝 단계"""
        # WebSocket 리스닝 태스크 시작
        listen_duration = self.num_prizes * 3 + 30  # 경품당 3초 + 여유
        listen_tasks = [
            asyncio.create_task(p.listen_websocket(listen_duration))
            for p in self.participants
            if p.result.ws_connected
        ]

        # 추첨 진행
        await asyncio.sleep(2.0)  # 연결 안정화 대기

        for i in range(self.num_prizes):
            prize_name = f"{i + 1}등 상품"
            prize_rank = i + 1

            # 추첨 시작
            if await admin.start_draw(prize_name, prize_rank):
                self.report.successful_draws += 1
            else:
                self.report.failed_draws += 1
                self.report.errors.append(f"Draw failed: {prize_name}")
                continue

            await asyncio.sleep(0.5)  # 애니메이션 대기

            # 결과 발표
            if await admin.reveal_winner():
                pass
            else:
                self.report.errors.append(f"Reveal failed: {prize_name}")

            if (i + 1) % 10 == 0:
                print(f"  - {i + 1}/{self.num_prizes} 추첨 완료")

            await asyncio.sleep(2.0)  # 다음 추첨까지 대기

        # 리스닝 종료 대기 (짧게)
        for p in self.participants:
            p.stop()

        await asyncio.sleep(2.0)

        # 결과 집계
        for p in self.participants:
            self.report.total_messages_received += p.result.messages_received
            if p.result.won_prizes:
                self.report.winners_found += len(p.result.won_prizes)

        print(f"  [OK] 추첨 완료: {self.report.successful_draws}/{self.num_prizes}")
        print(f"  [OK] 당첨자 확인: {self.report.winners_found}명")

    async def _phase_cleanup(self):
        """정리 단계"""
        for p in self.participants:
            await p.close()

        self.participants = []

    def print_report(self):
        """보고서 출력"""
        stats = self.report.to_dict()

        print(f"\n{'='*70}")
        print("통합 테스트 결과")
        print(f"{'='*70}")

        print(f"\n[요약]")
        print(f"  총 참가자: {stats['summary']['total_users']}")
        print(f"  총 경품: {stats['summary']['total_prizes']}")
        print(f"  소요 시간: {stats['summary']['duration_seconds']}초")

        print(f"\n[참가자 등록]")
        reg = stats['registration']
        print(f"  성공: {reg['success']}")
        print(f"  실패: {reg['failed']}")
        print(f"  성공률: {reg['success_rate']}")
        if 'time_ms' in reg:
            print(f"  응답시간: {reg['time_ms']['avg']}ms (avg), {reg['time_ms']['p95']}ms (p95)")

        print(f"\n[WebSocket]")
        ws = stats['websocket']
        print(f"  연결 성공: {ws['connected']}")
        print(f"  연결 실패: {ws['failed']}")
        print(f"  수신 메시지: {ws['messages_received']}")

        print(f"\n[추첨]")
        draw = stats['draw']
        print(f"  성공: {draw['success']}")
        print(f"  실패: {draw['failed']}")
        print(f"  당첨자 확인: {draw['winners_found']}명")

        if stats['errors_count'] > 0:
            print(f"\n[에러]")
            print(f"  총 에러: {stats['errors_count']}건")

        print(f"\n{'='*70}")

        # 최종 판정
        reg_rate = self.report.successful_registrations / max(self.num_users, 1) * 100
        ws_rate = self.report.successful_connections / max(self.report.successful_registrations, 1) * 100
        draw_rate = self.report.successful_draws / max(self.num_prizes, 1) * 100

        all_pass = reg_rate >= 95 and ws_rate >= 95 and draw_rate >= 95

        if all_pass:
            print("[PASS] 테스트 통과")
        else:
            print("[FAIL] 테스트 실패")
            if reg_rate < 95:
                print(f"  - 등록 성공률 미달: {reg_rate:.1f}%")
            if ws_rate < 95:
                print(f"  - WebSocket 연결률 미달: {ws_rate:.1f}%")
            if draw_rate < 95:
                print(f"  - 추첨 성공률 미달: {draw_rate:.1f}%")

        print(f"{'='*70}\n")

        return stats


# ============================================================
# 메인
# ============================================================

async def main():
    parser = argparse.ArgumentParser(description="통합 부하 테스트")
    parser.add_argument("--host", default=DEFAULT_HTTP_URL, help="서버 URL")
    parser.add_argument("--event-id", default=DEFAULT_EVENT_ID, help="이벤트 ID")
    parser.add_argument("--users", type=int, default=300, help="참가자 수")
    parser.add_argument("--prizes", type=int, default=100, help="경품 수")
    parser.add_argument("--output", help="결과 저장 파일 (JSON)")

    args = parser.parse_args()

    runner = FullScenarioRunner(
        http_url=args.host,
        event_id=args.event_id,
        num_users=args.users,
        num_prizes=args.prizes
    )

    try:
        await runner.run()
        stats = runner.print_report()

        if args.output:
            with open(args.output, "w", encoding="utf-8") as f:
                json.dump(stats, f, indent=2, ensure_ascii=False)
            print(f"결과 저장: {args.output}")

    except KeyboardInterrupt:
        print("\n테스트 중단됨")
        for p in runner.participants:
            p.stop()


if __name__ == "__main__":
    asyncio.run(main())
