# 부하 테스트 스크립트

300명 동시 접속 + 100개 경품 추첨 시나리오를 테스트합니다.

## 설치

```bash
cd server/tests/load
pip install -r requirements.txt
```

## 테스트 스크립트

### 1. WebSocket 동시 연결 테스트 (`websocket_test.py`)

300개의 동시 WebSocket 연결을 테스트합니다.

```bash
# 로컬 테스트 (300명, 120초)
python websocket_test.py --users 300 --duration 120

# 원격 서버 테스트
python websocket_test.py --host ws://your-server.com/api/luckydraw/ws --users 300

# 결과 저장
python websocket_test.py --users 300 --output results/ws_test.json
```

**주요 옵션:**
- `--host`: WebSocket 서버 URL (기본: ws://localhost:8000/api/luckydraw/ws)
- `--users`: 동시 사용자 수 (기본: 300)
- `--duration`: 테스트 시간 (초, 기본: 120)
- `--ramp-up`: Ramp-up 시간 (초, 기본: 10)

### 2. HTTP API 부하 테스트 (`http_test.py`)

참가자 등록 및 추첨 API를 테스트합니다.

```bash
# 참가자 등록 스파이크 테스트
python http_test.py --scenario registration --users 300

# 추첨 시퀀스 테스트
python http_test.py --scenario draw --prizes 100

# 혼합 테스트 (등록 + 추첨)
python http_test.py --scenario mixed --users 300 --prizes 100

# 결과 저장
python http_test.py --scenario mixed --output results/http_test.json
```

**주요 옵션:**
- `--host`: API 서버 URL (기본: http://localhost:8000)
- `--scenario`: 테스트 시나리오 (registration, draw, mixed)
- `--users`: 참가자 수 (기본: 300)
- `--prizes`: 경품 수 (기본: 100)

### 3. 메모리 모니터링 (`memory_monitor.py`)

서버 프로세스의 메모리 사용량을 모니터링합니다.

```bash
# 자동으로 서버 프로세스 찾기
python memory_monitor.py --auto --duration 300

# PID로 직접 지정
python memory_monitor.py --pid 1234 --duration 600

# 프로세스 이름으로 찾기
python memory_monitor.py --name python --duration 300

# 결과 저장
python memory_monitor.py --auto --duration 300 --output results/memory.json
```

**주요 옵션:**
- `--auto`: FastAPI/uvicorn 서버 자동 탐지
- `--pid`: 프로세스 ID
- `--name`: 프로세스 이름
- `--duration`: 모니터링 시간 (초, 기본: 300)
- `--interval`: 샘플링 간격 (초, 기본: 1)

### 4. 통합 테스트 (`full_scenario.py`)

전체 시나리오 (HTTP + WebSocket)를 테스트합니다.

```bash
# 기본 테스트 (300명, 100경품)
python full_scenario.py --users 300 --prizes 100

# 소규모 테스트
python full_scenario.py --users 50 --prizes 20

# 결과 저장
python full_scenario.py --users 300 --prizes 100 --output results/full_test.json
```

**주요 옵션:**
- `--host`: 서버 URL (기본: http://localhost:8000)
- `--users`: 참가자 수 (기본: 300)
- `--prizes`: 경품 수 (기본: 100)

## 테스트 순서 권장

### 로컬 테스트

```bash
# 1. 서버 시작 (별도 터미널)
cd server && python main.py

# 2. 메모리 모니터링 시작 (별도 터미널)
cd server/tests/load
python memory_monitor.py --auto --duration 600 --output results/memory_local.json

# 3. 통합 테스트 실행
python full_scenario.py --users 50 --prizes 20 --output results/full_local_small.json

# 4. 대규모 테스트
python full_scenario.py --users 300 --prizes 100 --output results/full_local.json
```

### Lightsail 테스트

```bash
# 서버 URL 설정
export API_URL="https://your-lightsail-domain.com"

# 1. 연결 테스트
python websocket_test.py --host wss://your-domain.com/api/luckydraw/ws --users 50 --duration 30

# 2. 본격 테스트
python full_scenario.py --host $API_URL --users 300 --prizes 100 --output results/full_lightsail.json
```

## 성공 기준

| 지표 | 목표 | 임계값 |
|------|------|--------|
| API 응답 시간 (P95) | < 500ms | < 1000ms |
| 에러율 | < 1% | < 5% |
| WebSocket 연결 성공률 | > 99% | > 95% |
| 메모리 증가율 | < 20% | < 50% |

## 결과 분석

```python
import json

# 결과 파일 로드
with open("results/full_test.json") as f:
    results = json.load(f)

# 주요 지표 확인
print(f"등록 성공률: {results['registration']['success_rate']}")
print(f"WebSocket 연결: {results['websocket']['connected']}")
print(f"추첨 성공: {results['draw']['success']}")
```
