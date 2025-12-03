# AWS Lightsail 배포 가이드

**버전**: 1.0
**최종 업데이트**: 2025-12-04
**작성자**: 개발팀

---

## 목차

1. [개요](#개요)
2. [하드코딩 부분 분석](#하드코딩-부분-분석)
3. [환경변수 설정](#환경변수-설정)
4. [서버 배포 (Lightsail)](#서버-배포-lightsail)
5. [프론트엔드 배포 (Vercel)](#프론트엔드-배포-vercel)
6. [배포 후 테스트](#배포-후-테스트)

---

## 개요

### 배포 아키텍처

```
┌─────────────────┐     ┌──────────────────┐
│   Vercel        │────▶│  AWS Lightsail   │
│  (Frontend)     │     │    (Backend)     │
│  Next.js 16     │     │    FastAPI       │
│  Port: 443      │     │    Port: 8000    │
└─────────────────┘     └──────────────────┘
        │                       │
        └───── WebSocket ───────┘
```

### 필수 요구사항

- AWS Lightsail 인스턴스 (Ubuntu 22.04 권장)
- Python 3.9+ 설치
- Vercel 계정 (프론트엔드 배포)
- 도메인 (선택사항, SSL 인증서용)

---

## 하드코딩 부분 분석

### 서버 (`server/`)

| 파일 | 위치 | 하드코딩 값 | 환경변수 | 해결방안 |
|------|------|------------|----------|----------|
| `main.py` | L84 | `port=8000` | - | 배포 시 변경 필요 |
| `main.py` | L37 | `https://event-manager-gax2.vercel.app` | - | `FRONT_URLS`에 추가 |
| `main.py` | L31 | `http://localhost:3000` | `FRONT_URL` | 환경변수로 설정됨 |
| `main.py` | L23 | `DEBUG=true` | `DEBUG` | `false`로 설정 필요 |

**서버 환경변수 현황**:
- `DEBUG`: 이미 지원됨 (기본: `true`)
- `FRONT_URL`: 이미 지원됨 (기본: `http://localhost:3000`)
- `FRONT_URLS`: 이미 지원됨 (콤마 구분 다중 URL)

### 프론트엔드 (`front/`)

| 파일 | 위치 | 하드코딩 값 | 환경변수 | 해결방안 |
|------|------|------------|----------|----------|
| `lib/apiConfig.js` | L4,8 | `http://localhost:8000` | `NEXT_PUBLIC_API_BASE` | 환경변수로 설정됨 |
| `lottery/page.js` | L14 | `http://localhost:3000` | `NEXT_PUBLIC_FRONTEND_URL` | 환경변수로 설정됨 |
| `lottery/constants.js` | L6 | `sfs-2025` | - | 이벤트별 상수 (의도적 하드코딩) |
| `lottery/page.js` | L78-84 | 이벤트 명칭 | - | 이벤트별 UI (의도적 하드코딩) |
| `lottery/admin/page.js` | L97 | WebSocket URL | - | ✅ **수정 완료** (API_BASE 사용) |

**프론트엔드 환경변수 현황**:
- `NEXT_PUBLIC_API_BASE`: 이미 지원됨 (기본: `http://localhost:8000`)
- `NEXT_PUBLIC_FRONTEND_URL`: 이미 지원됨 (기본: `http://localhost:3000`)

### 의도적 하드코딩 (이벤트별 커스터마이징)

다음 항목은 이벤트별로 다르게 설정해야 하므로 **코드에서 직접 수정**합니다:

1. **이벤트 ID** (`constants.js`): `DEFAULT_EVENT_ID = "sfs-2025"`
2. **이벤트 이름** (`page.js`, `waiting/page.js`): "SFS 2025"
3. **이벤트 설명**: "스마트 미래사회 컨퍼런스"

---

## 환경변수 설정

### 서버 환경변수 (`.env`)

```bash
# server/.env

# 운영 모드 (반드시 false로 설정)
DEBUG=false

# 프론트엔드 URL (Vercel 배포 URL)
FRONT_URL=https://event-manager-gax2.vercel.app

# 추가 허용 URL (콤마 구분)
FRONT_URLS=https://your-custom-domain.com,https://another-domain.com
```

### 프론트엔드 환경변수 (`.env.local`)

```bash
# front/.env.local

# 백엔드 API URL (Lightsail 배포 URL)
NEXT_PUBLIC_API_BASE=https://your-lightsail-ip:8000

# 프론트엔드 URL (QR 코드 생성용)
NEXT_PUBLIC_FRONTEND_URL=https://event-manager-gax2.vercel.app
```

### Vercel 환경변수 설정

Vercel 대시보드에서 다음 환경변수를 설정합니다:

| 변수명 | 값 | 환경 |
|--------|-----|------|
| `NEXT_PUBLIC_API_BASE` | `https://your-lightsail-ip:8000` | Production |
| `NEXT_PUBLIC_FRONTEND_URL` | `https://your-vercel-url.vercel.app` | Production |

---

## 서버 배포 (Lightsail)

### 1. Lightsail 인스턴스 생성

```bash
# AWS Lightsail 콘솔에서:
# 1. OS: Ubuntu 22.04 LTS
# 2. 인스턴스 플랜: $5/월 (512MB RAM) 이상 권장
# 3. 네트워킹: 포트 8000 열기 (HTTP Custom)
```

### 2. 서버 환경 설정

```bash
# SSH 접속 후
ssh -i ~/.ssh/your-key.pem ubuntu@your-lightsail-ip

# 시스템 업데이트
sudo apt update && sudo apt upgrade -y

# Python 3.9+ 설치
sudo apt install python3 python3-pip python3-venv -y

# Poetry 설치 (권장)
curl -sSL https://install.python-poetry.org | python3 -
export PATH="$HOME/.local/bin:$PATH"
```

### 3. 프로젝트 배포

```bash
# 프로젝트 클론
git clone https://github.com/your-repo/eventManager.git
cd eventManager/server

# Poetry로 의존성 설치
poetry install --only main

# 환경변수 설정
cat > .env << 'EOF'
DEBUG=false
FRONT_URL=https://event-manager-gax2.vercel.app
FRONT_URLS=
EOF

# 서버 실행 테스트
poetry run python main.py
```

### 4. systemd 서비스 설정

```bash
# 서비스 파일 생성
sudo cat > /etc/systemd/system/eventmanager.service << 'EOF'
[Unit]
Description=Event Manager API Server
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/eventManager/server
Environment=PATH=/home/ubuntu/.local/bin:/usr/bin
ExecStart=/home/ubuntu/.local/bin/poetry run python main.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# 서비스 활성화 및 시작
sudo systemctl daemon-reload
sudo systemctl enable eventmanager
sudo systemctl start eventmanager

# 상태 확인
sudo systemctl status eventmanager
```

### 5. Nginx 리버스 프록시 설정 (선택사항)

SSL 인증서 사용 시 Nginx를 통한 리버스 프록시를 권장합니다:

```bash
# Nginx 설치
sudo apt install nginx -y

# 설정 파일 생성
sudo cat > /etc/nginx/sites-available/eventmanager << 'EOF'
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # WebSocket 지원
        proxy_read_timeout 86400;
    }
}
EOF

# 심볼릭 링크 생성 및 활성화
sudo ln -s /etc/nginx/sites-available/eventmanager /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 6. Let's Encrypt SSL 인증서 (선택사항)

```bash
# Certbot 설치
sudo apt install certbot python3-certbot-nginx -y

# SSL 인증서 발급
sudo certbot --nginx -d your-domain.com

# 자동 갱신 테스트
sudo certbot renew --dry-run
```

---

## 프론트엔드 배포 (Vercel)

### 1. Vercel CLI 설치 및 로그인

```bash
npm install -g vercel
vercel login
```

### 2. 프로젝트 연결 및 배포

```bash
cd front
vercel

# 환경변수 설정 (Vercel 대시보드에서도 가능)
vercel env add NEXT_PUBLIC_API_BASE production
vercel env add NEXT_PUBLIC_FRONTEND_URL production
```

### 3. 자동 배포 설정

GitHub 연동 시 main 브랜치 푸시 시 자동 배포됩니다.

---

## 배포 후 테스트

### 1. 서버 API 테스트

```bash
# 헬스 체크
curl https://your-server-url/

# 참가자 등록 테스트
curl -X POST https://your-server-url/api/luckydraw/register \
  -H "Content-Type: application/json" \
  -d '{"event_id": "sfs-2025"}'
```

### 2. WebSocket 연결 테스트

브라우저 콘솔에서:

```javascript
const ws = new WebSocket('wss://your-server-url/api/luckydraw/ws/sfs-2025');
ws.onopen = () => console.log('Connected');
ws.onmessage = (e) => console.log('Message:', JSON.parse(e.data));
ws.send(JSON.stringify({ type: 'ping' }));
```

### 3. 전체 플로우 테스트

1. **QR 페이지**: `https://your-frontend-url/lottery`
2. **대기 페이지**: `https://your-frontend-url/lottery/waiting`
3. **관리자 페이지**: `https://your-frontend-url/lottery/admin`
4. **메인 페이지**: `https://your-frontend-url/lottery/main`

**테스트 체크리스트**:

- [ ] QR 코드 스캔 → waiting 페이지 이동
- [ ] 개인정보 동의 → 정보 입력 → 번호 발급
- [ ] Admin에서 상품 추가 및 추첨 대기
- [ ] 추첨 시작 → 슬롯 애니메이션
- [ ] 결과 발표 → 당첨자 확인
- [ ] 당첨자 정보 수집 → Admin에 표시

---

## 문제 해결

### CORS 오류

서버의 `FRONT_URL` 또는 `FRONT_URLS` 환경변수에 프론트엔드 URL이 올바르게 설정되었는지 확인합니다.

### WebSocket 연결 실패

1. 서버 포트가 열려 있는지 확인
2. HTTPS 사용 시 `wss://` 프로토콜 사용
3. Nginx 사용 시 WebSocket 프록시 설정 확인

### 서버 재시작 후 데이터 손실

현재 메모리 기반 저장소를 사용하므로, 영구 저장이 필요한 경우 PostgreSQL 연동이 필요합니다.

---

## 체크리스트

### 배포 전 확인사항

- [ ] 서버 `DEBUG=false` 설정
- [ ] 프론트엔드 환경변수 설정 완료
- [ ] Vercel 환경변수 설정 완료
- [ ] 서버 포트 8000 방화벽 오픈
- [ ] (선택) SSL 인증서 설정

### 배포 후 확인사항

- [ ] `/` 헬스 체크 응답 확인
- [ ] API 엔드포인트 정상 동작
- [ ] WebSocket 연결 정상
- [ ] 프론트엔드에서 백엔드 연결 정상
- [ ] 전체 추첨 플로우 테스트 완료

---

**문서 버전**: 1.0
**최종 업데이트**: 2025-12-04
**작성자**: 개발팀
