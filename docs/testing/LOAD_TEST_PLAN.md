# 부하 테스트 계획서 (Load Test Plan)

**버전:** 1.0
**작성일:** 2025-12-04
**목적:** 300명 동시 접속 + 100개 경품 추첨 상황에서의 시스템 안정성 검증

---

## 1. 테스트 개요

### 1.1 테스트 시나리오
| 항목 | 값 | 비고 |
|------|------|------|
| 동시 참가자 | 300명 | 1-2분 내 스파이크 접속 |
| 경품 수 | 100개 | 다양한 등급 |
| 추첨 횟수 | 100회 | 경품당 1회 |
| WebSocket 연결 | 300개 | 모든 참가자 + 관리자 1명 |

### 1.2 테스트 환경

#### 로컬 테스트
- **서버**: Windows 개발 환경
- **목적**: 코드 레벨 검증, 메모리 누수 탐지

#### Lightsail 테스트
- **서버**: AWS Lightsail (사양 미정)
- **목적**: 실제 배포 환경 성능 검증

### 1.3 성공 기준

| 지표 | 목표 | 임계값 |
|------|------|--------|
| API 응답 시간 (p95) | < 500ms | < 1000ms |
| API 응답 시간 (p99) | < 1000ms | < 2000ms |
| 에러율 | < 1% | < 5% |
| WebSocket 연결 성공률 | > 99% | > 95% |
| 메모리 사용량 | < 512MB | < 1GB |
| CPU 사용률 | < 70% | < 90% |

---

## 2. 코드 분석: 잠재적 위험 요소

### 2.1 메모리 관련

#### 위험 1: 무제한 이벤트 데이터 증가
```python
# server/services/luckydraw_service.py:100
self._storage: Dict[str, EventData] = {}
```
- **문제**: 이벤트가 계속 생성되면 메모리 무한 증가
- **영향**: 장기 운영 시 OOM (Out of Memory)
- **완화책**: 이벤트별 TTL 또는 주기적 정리 필요

#### 위험 2: 참가자 데이터 구조
```python
# EventData 내부
participants: Dict[str, Participant]  # session_token → Participant
```
- **300명 기준 예상 메모리**:
  - Participant: ~200 bytes × 300 = 60KB
  - DrawRecord: ~150 bytes × 100 = 15KB
  - WinnerInfo: ~200 bytes × 100 = 20KB
  - **총계: ~100KB** (안전 범위)

#### 위험 3: Lock 객체 미정리
```python
# server/services/luckydraw_service.py:103
self._locks: Dict[str, asyncio.Lock] = {}
```
- **문제**: 이벤트 종료 후에도 Lock 객체가 메모리에 남음
- **영향**: 미미하지만 장기 운영 시 축적

### 2.2 WebSocket 관련

#### 위험 4: 연결 해제 누락
```python
# server/services/connection_manager.py:81-88
def disconnect(self, websocket: WebSocket, event_id: str) -> None:
    if event_id in self._connections:
        self._connections[event_id].discard(websocket)
```
- **문제**: 네트워크 끊김 시 `WebSocketDisconnect` 예외가 발생하지 않을 수 있음
- **영향**: 죽은 연결이 Set에 남아 브로드캐스트 시 지연

#### 위험 5: 브로드캐스트 동시성
```python
# server/services/connection_manager.py:113-122
for websocket in self._connections[event_id]:
    try:
        await websocket.send_json(message)
```
- **문제**: 300개 연결에 순차 전송 → 전송 시간 누적
- **영향**: 마지막 클라이언트는 수백 ms 지연 가능

### 2.3 동시성 관련

#### 위험 6: Lock 경합
```python
# 참가자 등록 시 Lock 획득
async with lock:
    # 신규 참가자 등록 로직
```
- **문제**: 300명 동시 등록 시 Lock 대기
- **영향**: 등록 지연, 타임아웃 가능

### 2.4 네트워크 관련

#### 위험 7: CORS Preflight 오버헤드
- **문제**: 모든 API 요청 전 OPTIONS 요청 발생
- **영향**: 실제 요청의 2배 트래픽

#### 위험 8: WebSocket Handshake
- **문제**: 300개 동시 연결 시 handshake 병목
- **영향**: 연결 실패 또는 지연

---

## 3. 테스트 시나리오

### 3.1 시나리오 A: 참가자 등록 스파이크

```
시간축:
0s ─────────────────────────────── 120s

[0-10s]   300명 동시 QR 스캔 → POST /api/luckydraw/register
[10-30s]  300명 WebSocket 연결 → /api/luckydraw/ws/{event_id}
[30-120s] WebSocket 연결 유지 (ping/pong)

측정 항목:
- 참가자 등록 API 응답 시간
- WebSocket 연결 성공률
- 서버 메모리 사용량
- 서버 CPU 사용량
```

### 3.2 시나리오 B: 추첨 브로드캐스트

```
시간축:
0s ─────────────────────────────── 300s

[준비]    300명 WebSocket 연결 완료
[0-300s]  100회 추첨 실행 (3초 간격)
          각 추첨마다:
          1. POST /admin/{event_id}/draw/standby
          2. POST /admin/{event_id}/draw/start-animation
          3. POST /admin/{event_id}/draw/reveal
          4. WebSocket: draw_complete

측정 항목:
- 브로드캐스트 지연 시간 (첫 번째 클라이언트 ~ 마지막 클라이언트)
- 메시지 도달률
- 메모리 변화 추이
```

### 3.3 시나리오 C: 혼합 부하

```
시간축:
0s ─────────────────────────────── 600s

[0-60s]     참가자 등록 (300명/분)
[60-120s]   대기 (WebSocket만 유지)
[120-420s]  추첨 진행 (100회)
[420-600s]  결과 확인 + 당첨자 정보 제출

측정 항목:
- 전체 시나리오 성공률
- 메모리 누수 여부 (시작 vs 종료 메모리)
- 에러 로그 분석
```

### 3.4 시나리오 D: 장시간 연결 유지

```
시간축:
0s ─────────────────────────────── 3600s (1시간)

[0-60s]    300명 연결
[60-3600s] WebSocket 연결 유지 (30초마다 ping)

측정 항목:
- 연결 드롭률
- 메모리 증가 추이
- 죽은 연결 정리 정상 작동 여부
```

---

## 4. 테스트 도구 및 스크립트

### 4.1 필요 도구

| 도구 | 용도 | 설치 |
|------|------|------|
| locust | HTTP 부하 테스트 | `pip install locust` |
| websockets | WebSocket 테스트 | `pip install websockets` |
| psutil | 메모리 모니터링 | `pip install psutil` |
| matplotlib | 결과 시각화 | `pip install matplotlib` |

### 4.2 테스트 스크립트 구조

```
server/tests/load/
├── locustfile.py         # HTTP API 부하 테스트
├── websocket_test.py     # WebSocket 동시 연결 테스트
├── memory_monitor.py     # 메모리 사용량 모니터링
├── full_scenario.py      # 전체 시나리오 통합 테스트
└── results/              # 테스트 결과 저장
    └── .gitkeep
```

### 4.3 실행 방법

#### 로컬 테스트
```bash
# 1. 서버 시작
cd server && python main.py

# 2. 별도 터미널에서 부하 테스트
cd server/tests/load
python websocket_test.py --users 300 --duration 120

# 3. 메모리 모니터링 (선택)
python memory_monitor.py --pid <server_pid>
```

#### Lightsail 테스트
```bash
# 1. 서버 배포 후
# 2. 로컬에서 원격 테스트
python websocket_test.py --host wss://your-domain.com --users 300
```

---

## 5. 예상 결과 및 대응 방안

### 5.1 예상 병목 지점

| 순위 | 병목 지점 | 예상 증상 | 대응 방안 |
|------|----------|----------|----------|
| 1 | Lock 경합 | 참가자 등록 지연 | 번호 할당 로직 최적화 |
| 2 | 순차 브로드캐스트 | 메시지 도달 지연 | asyncio.gather로 병렬화 |
| 3 | WebSocket handshake | 연결 실패 | 연결 retry 로직 |
| 4 | 메모리 누수 | OOM 크래시 | 이벤트 데이터 TTL |

### 5.2 Lightsail 사양 권장

테스트 결과에 따른 예상 권장 사양:

| 시나리오 | 예상 메모리 | 권장 사양 |
|----------|------------|----------|
| 300명 + 100경품 | ~200MB | $5 플랜 (512MB) |
| 500명 + 200경품 | ~400MB | $10 플랜 (1GB) |
| 1000명 + 500경품 | ~800MB | $20 플랜 (2GB) |

---

## 6. 테스트 체크리스트

### 6.1 사전 준비
- [ ] 테스트 도구 설치 완료
- [ ] 서버 로그 레벨 설정 (INFO 이상)
- [ ] 베이스라인 측정 (빈 서버 메모리)

### 6.2 로컬 테스트
- [ ] 시나리오 A: 참가자 등록 스파이크
- [ ] 시나리오 B: 추첨 브로드캐스트
- [ ] 시나리오 C: 혼합 부하
- [ ] 시나리오 D: 장시간 연결 유지

### 6.3 Lightsail 테스트
- [ ] 서버 배포 완료
- [ ] SSL 인증서 설정
- [ ] 네트워크 지연 측정
- [ ] 전체 시나리오 실행

### 6.4 결과 분석
- [ ] 성공 기준 충족 여부
- [ ] 병목 지점 식별
- [ ] 개선 사항 도출
- [ ] 최종 권장 사양 결정

---

## 7. 다음 단계

1. **테스트 스크립트 작성** → `server/tests/load/`
2. **로컬 테스트 실행** → 결과 분석
3. **코드 개선** (필요시)
4. **Lightsail 테스트** → 최종 검증
5. **권장 사양 확정**

---

**문서 버전:** 1.0
**최종 업데이트:** 2025-12-04
