# CLAUDE.md

이 파일은 이 저장소의 코드 작업 시 Claude Code(claude.ai/code)에 대한 지침을 제공합니다.

---

## 📋 프로젝트 개요

**eventManager**는 소규모 커뮤니티를 위한 모바일 우선 이벤트 관리 플랫폼입니다.

### 핵심 가치
- 🎯 **간편함**: 3분 만에 이벤트 생성
- 📱 **모바일 우선**: 스마트폰 한 대로 모든 관리 가능
- ⚡ **오프라인 지원**: 네트워크 없이도 출석 체크
- 🎲 **공정한 추첨**: 투명한 경품 추첨 시스템

### 타겟 사용자
- 동아리 회장, 소규모 사업주, 커뮤니티 리더
- 이벤트 규모: 10-500명
- 빈도: 연간 4-12회

---

## 🏗 아키텍처

### 기술 스택

#### 프론트엔드 ✅
- **프레임워크**: React 19 + Vite
- **언어**: JavaScript (ES6+)
- **스타일링**: Tailwind CSS (예정)
- **상태 관리**: Zustand (예정)
- **오프라인**: IndexedDB (Dexie) + Service Worker (예정)
- **라우팅**: React Router (예정)
- **폼 관리**: React Hook Form (예정)

#### 백엔드 (예정)
- **런타임**: Node.js
- **프레임워크**: Express / Nest.js
- **언어**: JavaScript / TypeScript
- **데이터베이스**: PostgreSQL
- **캐시**: Redis
- **실시간**: WebSocket (Socket.io)

#### 인프라 (예정)
- **호스팅**: Vercel (프론트) + AWS/GCP (백엔드)
- **스토리지**: S3/Cloud Storage
- **CDN**: CloudFlare
- **모니터링**: Sentry

### 핵심 아키텍처 원칙

1. **오프라인 우선 (Offline-First)**
   - 로컬에 즉시 저장 → 백그라운드 동기화
   - 출석 체크가 네트워크 없이 작동해야 함

2. **실시간 동기화**
   - 여러 기기에서 동시 관리 가능
   - WebSocket으로 실시간 업데이트
   - 충돌 해결: Last-Write-Wins + 특수 규칙

3. **모바일 최적화**
   - 한 손 조작 가능한 UI
   - 터치 타겟 최소 44×44px
   - 3탭 규칙: 모든 기능이 3탭 이내

4. **점진적 기능 추가**
   - Phase 1: 무료 티어 (MVP)
   - Phase 2: 프리미엄 기능
   - Phase 3: 엔터프라이즈

---

## 📂 프로젝트 구조

```
eventManager/
├── CLAUDE.md              # 이 파일 (개발 컨텍스트)
├── README.md              # 프로젝트 소개 (외부 공개용)
├── LICENSE                # MIT 라이선스
│
├── docs/                  # 📚 모든 문서
│   ├── CLAUDE.md          # 문서 네비게이션 허브
│   ├── product/           # 제품 문서 (PRD)
│   ├── design/            # 디자인 문서 (플로우)
│   └── screens/           # 화면 정의서
│
└── front/                 # ✅ 프론트엔드 애플리케이션
    ├── package.json       # 의존성 및 스크립트
    ├── vite.config.js     # Vite 설정
    ├── eslint.config.js   # ESLint 설정
    ├── index.html         # 진입점 HTML
    │
    ├── src/               # 소스 코드
    │   ├── main.jsx       # 앱 진입점
    │   ├── App.jsx        # 루트 컴포넌트
    │   ├── components/    # (예정) UI 컴포넌트
    │   ├── pages/         # (예정) 페이지 컴포넌트
    │   ├── stores/        # (예정) Zustand 스토어
    │   ├── hooks/         # (예정) 커스텀 훅
    │   ├── utils/         # (예정) 유틸리티 함수
    │   ├── api/           # (예정) API 클라이언트
    │   ├── db/            # (예정) IndexedDB (Dexie)
    │   └── assets/        # 정적 자산
    │
    └── public/            # 공개 자산
```

### 문서 구조
자세한 문서는 [`docs/CLAUDE.md`](./docs/CLAUDE.md)를 참조하세요.

---

## 🚀 개발 명령어

### 프론트엔드 (front/)

```bash
# front 디렉토리로 이동
cd front

# 개발 서버 실행 (http://localhost:5173)
npm run dev

# 프로덕션 빌드
npm run build

# 빌드 미리보기
npm run preview

# 린트 검사
npm run lint

# 의존성 설치 (처음 한 번)
npm install
```

### 테스트 (예정)
```bash
# 테스트 실행
npm test

# 테스트 커버리지
npm run test:coverage
```

---

## 🎯 현재 단계

### ✅ 완료
- [x] PRD 작성 (영문/한글)
- [x] 사용자 플로우 정의
- [x] 데이터 플로우 설계
- [x] 화면 정의서 (온보딩, 이벤트 생성)
- [x] 기술 스택 결정 (React + Vite + JavaScript)
- [x] 프론트엔드 프로젝트 초기 설정 (front/)

### 🔄 진행 중
- [ ] 추가 라이브러리 설치 (Tailwind, Zustand, React Router 등)
- [ ] 디렉토리 구조 세팅 (components, pages, stores 등)
- [ ] 화면 정의서 (출석 체크, 경품 추첨)

### 📝 예정
- [ ] 디자인 시스템 구축
- [ ] 공통 컴포넌트 개발
- [ ] 온보딩 화면 구현
- [ ] 이벤트 생성 화면 구현
- [ ] 오프라인 DB 설정 (Dexie)
- [ ] API 설계 및 백엔드 개발
- [ ] 실시간 동기화 구현

---

## 🛠 개발 가이드라인

### 코드 스타일
- **언어**: JavaScript (ES6+)
- **타입 체크**: PropTypes 사용
- **포맷팅**: Prettier (예정)
- **린팅**: ESLint (설정 완료)
- **컨벤션**: Airbnb Style Guide 기반
- **파일 확장자**: `.jsx` (React 컴포넌트), `.js` (유틸/로직)

### Git 워크플로우
```bash
# 기능 브랜치 생성
git checkout -b feature/event-creation

# 커밋 메시지 규칙
feat: 이벤트 생성 UI 구현
fix: 출석 체크 동기화 버그 수정
docs: API 문서 업데이트
style: 코드 포맷팅
refactor: 상태 관리 로직 리팩토링
test: 경품 추첨 테스트 추가
chore: 빌드 설정 변경
```

### 브랜치 전략
- `main`: 프로덕션 배포 브랜치
- `develop`: 개발 통합 브랜치
- `feature/*`: 기능 개발
- `bugfix/*`: 버그 수정
- `hotfix/*`: 긴급 수정

---

## 📚 주요 문서

### 제품 문서
- [PRD (영문)](./docs/product/PRD.md)
- [PRD (한글)](./docs/product/PRD_Korean.md)

### 디자인 문서
- [사용자 플로우](./docs/design/USER_FLOWS.md)
- [데이터 플로우](./docs/design/DATA_FLOWS.md)

### 화면 정의서
- [화면 정의서 인덱스](./docs/screens/README.md)
- [온보딩 화면](./docs/screens/01_ONBOARDING.md)
- [이벤트 생성 화면](./docs/screens/02_EVENT_CREATION.md)

---

## 🔐 보안 및 개인정보

### 데이터 보호
- **전송 중**: TLS 1.3 암호화
- **저장 시**: AES-256 암호화 (민감 정보)
- **개인정보**: GDPR/개인정보보호법 준수

### 익명 모드
참여자가 닉네임으로 등록할 수 있는 익명 모드 지원 (개인정보 최소 수집)

---

## 📞 팀 커뮤니케이션

### 문서 업데이트 시
1. 관련 문서 읽기
2. 변경 사항 반영
3. 링크 일관성 확인
4. 버전 정보 업데이트

### 질문 및 논의
- 기술 결정: 팀 회의
- 문서 수정: Pull Request
- 버그 리포트: Issue Tracker

---

## 📝 규칙

### 출력 언어
- **문서**: 한국어
- **코드 주석**: 한국어
- **커밋 메시지**: 한국어
- **변수/함수명**: 영어

### AI 어시스턴트 사용 시
- PRD와 화면 정의서를 항상 참조
- 기존 패턴과 일관성 유지
- 문서 업데이트와 코드를 함께 작성

---

## 📦 설치된 패키지

### 현재 설치됨
- `react`: ^19.1.1
- `react-dom`: ^19.1.1
- `vite`: ^7.1.7
- `eslint`: ^9.36.0

### 다음 설치 예정
- `react-router-dom`: 라우팅
- `zustand`: 상태 관리
- `tailwindcss`: 스타일링
- `dexie`: 오프라인 DB
- `axios`: HTTP 클라이언트
- `react-hook-form`: 폼 관리
- `prop-types`: 타입 검증
- 기타 UI 라이브러리들

---

**문서 버전**: 1.2
**최종 업데이트**: 2025-10-20
**작성자**: Product & Development Team
**변경 사항**: 프론트엔드 프로젝트 초기 설정 완료 (React + Vite + JavaScript)
