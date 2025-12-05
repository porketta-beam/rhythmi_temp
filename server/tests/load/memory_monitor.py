"""
메모리 모니터링 스크립트

서버 프로세스의 메모리 사용량을 실시간으로 모니터링합니다.
메모리 누수 탐지 및 리소스 사용량 분석에 사용됩니다.

사용법:
    python memory_monitor.py --pid <server_pid> --duration 300
    python memory_monitor.py --name python --duration 600
"""

import argparse
import time
import json
from datetime import datetime
from typing import List, Dict, Optional
from dataclasses import dataclass, field

try:
    import psutil
except ImportError:
    print("psutil 라이브러리가 필요합니다: pip install psutil")
    exit(1)


# ============================================================
# 데이터 구조
# ============================================================

@dataclass
class MemorySnapshot:
    """메모리 스냅샷"""
    timestamp: str
    rss_mb: float  # Resident Set Size (실제 사용 메모리)
    vms_mb: float  # Virtual Memory Size (가상 메모리)
    cpu_percent: float
    num_threads: int
    num_connections: int


@dataclass
class MemoryReport:
    """메모리 모니터링 보고서"""
    process_name: str
    pid: int
    duration_seconds: float
    snapshots: List[MemorySnapshot] = field(default_factory=list)

    def calculate_stats(self) -> Dict:
        """통계 계산"""
        if not self.snapshots:
            return {}

        rss_values = [s.rss_mb for s in self.snapshots]
        cpu_values = [s.cpu_percent for s in self.snapshots]
        thread_values = [s.num_threads for s in self.snapshots]
        conn_values = [s.num_connections for s in self.snapshots]

        return {
            "process": {
                "name": self.process_name,
                "pid": self.pid,
            },
            "duration_seconds": self.duration_seconds,
            "samples": len(self.snapshots),
            "memory_mb": {
                "initial": f"{rss_values[0]:.2f}",
                "final": f"{rss_values[-1]:.2f}",
                "min": f"{min(rss_values):.2f}",
                "max": f"{max(rss_values):.2f}",
                "avg": f"{sum(rss_values) / len(rss_values):.2f}",
                "growth": f"{rss_values[-1] - rss_values[0]:.2f}",
                "growth_percent": f"{((rss_values[-1] - rss_values[0]) / max(rss_values[0], 0.1) * 100):.1f}%",
            },
            "cpu_percent": {
                "min": f"{min(cpu_values):.1f}",
                "max": f"{max(cpu_values):.1f}",
                "avg": f"{sum(cpu_values) / len(cpu_values):.1f}",
            },
            "threads": {
                "min": min(thread_values),
                "max": max(thread_values),
                "avg": f"{sum(thread_values) / len(thread_values):.1f}",
            },
            "connections": {
                "min": min(conn_values),
                "max": max(conn_values),
                "avg": f"{sum(conn_values) / len(conn_values):.1f}",
            }
        }


# ============================================================
# 프로세스 탐지
# ============================================================

def find_process_by_name(name: str) -> Optional[psutil.Process]:
    """이름으로 프로세스 찾기"""
    for proc in psutil.process_iter(['pid', 'name', 'cmdline']):
        try:
            # 프로세스 이름 확인
            if name.lower() in proc.info['name'].lower():
                return proc

            # 커맨드라인에서 확인
            cmdline = proc.info.get('cmdline', [])
            if cmdline:
                cmdline_str = ' '.join(cmdline).lower()
                if name.lower() in cmdline_str:
                    return proc
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            continue

    return None


def find_server_process() -> Optional[psutil.Process]:
    """FastAPI/uvicorn 서버 프로세스 찾기"""
    # uvicorn이나 python main.py를 찾음
    for proc in psutil.process_iter(['pid', 'name', 'cmdline']):
        try:
            cmdline = proc.info.get('cmdline', [])
            if cmdline:
                cmdline_str = ' '.join(cmdline).lower()
                if 'uvicorn' in cmdline_str or 'main.py' in cmdline_str:
                    return proc
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            continue

    return None


# ============================================================
# 모니터링
# ============================================================

class MemoryMonitor:
    """메모리 모니터"""

    def __init__(self, process: psutil.Process):
        self.process = process
        self.report = MemoryReport(
            process_name=process.name(),
            pid=process.pid,
            duration_seconds=0
        )

    def take_snapshot(self) -> MemorySnapshot:
        """현재 메모리 스냅샷"""
        try:
            mem_info = self.process.memory_info()
            num_connections = len(self.process.connections())

            return MemorySnapshot(
                timestamp=datetime.now().isoformat(),
                rss_mb=mem_info.rss / 1024 / 1024,
                vms_mb=mem_info.vms / 1024 / 1024,
                cpu_percent=self.process.cpu_percent(),
                num_threads=self.process.num_threads(),
                num_connections=num_connections
            )
        except (psutil.NoSuchProcess, psutil.AccessDenied) as e:
            raise RuntimeError(f"프로세스 접근 오류: {e}")

    def run(self, duration: float, interval: float = 1.0) -> MemoryReport:
        """모니터링 실행"""
        print(f"\n{'='*60}")
        print(f"메모리 모니터링 시작")
        print(f"{'='*60}")
        print(f"  PID: {self.process.pid}")
        print(f"  프로세스: {self.process.name()}")
        print(f"  시간: {duration}초")
        print(f"  간격: {interval}초")
        print(f"{'='*60}\n")

        start_time = time.time()
        end_time = start_time + duration

        sample_count = 0
        while time.time() < end_time:
            try:
                snapshot = self.take_snapshot()
                self.report.snapshots.append(snapshot)
                sample_count += 1

                # 진행 상황 출력
                if sample_count % 10 == 0 or sample_count == 1:
                    print(
                        f"  [{datetime.now().strftime('%H:%M:%S')}] "
                        f"RSS: {snapshot.rss_mb:.1f}MB | "
                        f"CPU: {snapshot.cpu_percent:.1f}% | "
                        f"Threads: {snapshot.num_threads} | "
                        f"Connections: {snapshot.num_connections}"
                    )

                time.sleep(interval)

            except RuntimeError as e:
                print(f"\n[오류] {e}")
                break
            except KeyboardInterrupt:
                print("\n[중단됨]")
                break

        self.report.duration_seconds = time.time() - start_time
        return self.report

    def print_report(self):
        """보고서 출력"""
        if not self.report.snapshots:
            print("수집된 데이터가 없습니다.")
            return {}

        stats = self.report.calculate_stats()

        print(f"\n{'='*60}")
        print("메모리 모니터링 결과")
        print(f"{'='*60}")

        print(f"\n[프로세스 정보]")
        print(f"  이름: {stats['process']['name']}")
        print(f"  PID: {stats['process']['pid']}")
        print(f"  모니터링 시간: {stats['duration_seconds']:.1f}초")
        print(f"  샘플 수: {stats['samples']}")

        print(f"\n[메모리 사용량 (MB)]")
        mem = stats["memory_mb"]
        print(f"  초기: {mem['initial']} MB")
        print(f"  최종: {mem['final']} MB")
        print(f"  최소: {mem['min']} MB")
        print(f"  최대: {mem['max']} MB")
        print(f"  평균: {mem['avg']} MB")
        print(f"  증가량: {mem['growth']} MB ({mem['growth_percent']})")

        print(f"\n[CPU 사용률 (%)]")
        cpu = stats["cpu_percent"]
        print(f"  최소: {cpu['min']}%")
        print(f"  최대: {cpu['max']}%")
        print(f"  평균: {cpu['avg']}%")

        print(f"\n[스레드 수]")
        thr = stats["threads"]
        print(f"  최소: {thr['min']}")
        print(f"  최대: {thr['max']}")
        print(f"  평균: {thr['avg']}")

        print(f"\n[네트워크 연결 수]")
        conn = stats["connections"]
        print(f"  최소: {conn['min']}")
        print(f"  최대: {conn['max']}")
        print(f"  평균: {conn['avg']}")

        print(f"\n{'='*60}")

        # 메모리 누수 판정
        growth = float(mem['growth'])
        growth_pct = float(mem['growth_percent'].rstrip('%'))

        if growth_pct > 50:
            print(f"⚠️ 메모리 누수 의심 (증가율 {growth_pct:.1f}%)")
        elif growth_pct > 20:
            print(f"⚠️ 주의 필요 (증가율 {growth_pct:.1f}%)")
        else:
            print(f"✅ 메모리 사용 안정적 (증가율 {growth_pct:.1f}%)")

        # 최대 메모리 판정
        max_mem = float(mem['max'])
        if max_mem > 512:
            print(f"⚠️ 메모리 사용량 높음 ({max_mem:.1f}MB)")
        else:
            print(f"✅ 메모리 사용량 정상 ({max_mem:.1f}MB)")

        print(f"{'='*60}\n")

        return stats


# ============================================================
# 메인
# ============================================================

def main():
    parser = argparse.ArgumentParser(description="서버 메모리 모니터링")
    parser.add_argument("--pid", type=int, help="프로세스 ID")
    parser.add_argument("--name", help="프로세스 이름 (python, uvicorn 등)")
    parser.add_argument("--duration", type=float, default=300, help="모니터링 시간 (초)")
    parser.add_argument("--interval", type=float, default=1.0, help="샘플링 간격 (초)")
    parser.add_argument("--output", help="결과 저장 파일 (JSON)")
    parser.add_argument("--auto", action="store_true", help="FastAPI 서버 자동 탐지")

    args = parser.parse_args()

    # 프로세스 찾기
    process = None

    if args.pid:
        try:
            process = psutil.Process(args.pid)
        except psutil.NoSuchProcess:
            print(f"오류: PID {args.pid}를 찾을 수 없습니다.")
            exit(1)
    elif args.name:
        process = find_process_by_name(args.name)
        if not process:
            print(f"오류: '{args.name}' 프로세스를 찾을 수 없습니다.")
            exit(1)
    elif args.auto:
        process = find_server_process()
        if not process:
            print("오류: FastAPI/uvicorn 서버를 찾을 수 없습니다.")
            print("서버가 실행 중인지 확인하거나 --pid 또는 --name 옵션을 사용하세요.")
            exit(1)
    else:
        print("오류: --pid, --name, 또는 --auto 옵션이 필요합니다.")
        exit(1)

    # 모니터링 실행
    monitor = MemoryMonitor(process)

    try:
        monitor.run(duration=args.duration, interval=args.interval)
        stats = monitor.print_report()

        # 결과 저장
        if args.output:
            output_data = {
                "stats": stats,
                "snapshots": [
                    {
                        "timestamp": s.timestamp,
                        "rss_mb": s.rss_mb,
                        "vms_mb": s.vms_mb,
                        "cpu_percent": s.cpu_percent,
                        "num_threads": s.num_threads,
                        "num_connections": s.num_connections
                    }
                    for s in monitor.report.snapshots
                ]
            }

            with open(args.output, "w", encoding="utf-8") as f:
                json.dump(output_data, f, indent=2, ensure_ascii=False)
            print(f"결과 저장: {args.output}")

    except KeyboardInterrupt:
        print("\n모니터링 중단됨")
        monitor.print_report()


if __name__ == "__main__":
    main()
