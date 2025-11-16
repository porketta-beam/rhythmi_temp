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

### 고객사 사례

#### 🎨 Rythmi (리듬아이)
**도메인**: 피부 진단 및 스킨케어 추천 서비스
**활용 기능**: 설문 폼 + 회원 목록 관리
**구현 상태**: ✅ 완료 (`front/src/app/test/2/`)
**타겟 디바이스**: 태블릿 가로형 (Surface Pro 13인치, 2880×1920)

**주요 기능**:
- 10문항 피부 타입 진단 설문
- 5가지 피부 타입 분류 (건조 민감형, 건조 실내형, 민감 보호형, 활동 밸런스형, 미니멀 케어형)
- 맞춤형 스킨케어 루틴 추천
- 개인정보 동의 플로우
- sessionStorage 기반 응답 저장

**eventManager 활용**:
- **설문 폼 기능**: 10문항 다중 선택 설문
- **스코어링 시스템**: 9개 차원 스코어 계산 (건조, 지성, 민감, 실내, 실외, 활동, 미니멀 등)
- **결과 타입 분류**: 조건 기반 피부 타입 결정 로직
- **오프라인 우선**: sessionStorage를 통한 로컬 저장

**디자인 특성**:
- 가로형 레이아웃 (Landscape)
- 2열 구조 활용 (설문 + 정보)
- 큰 터치 타겟 (태블릿 최적화)
- 오렌지/노란색 그라데이션

**참고 문서**: [`docs/clients/RYTHMI.md`](./docs/clients/RYTHMI.md)

---

## 🏗 아키텍처

### 기술 스택

#### 프론트엔드 ✅
- **프레임워크**: Next.js 16 + React 19
- **언어**: JavaScript (ES6+)
- **스타일링**: Tailwind CSS 4.0 ✅
- **상태 관리**: Context API ✅
- **오프라인**: sessionStorage (구현 완료)
- **라우팅**: Next.js App Router ✅
- **폼 관리**: Context API ✅

#### 백엔드
- **런타임**: Python 3.9+
- **프레임워크**: FastAPI
- **언어**: Python
- **데이터베이스**: PostgreSQL (예정)
- **ORM**: SQLAlchemy (예정)
- **실시간**: WebSocket (예정)

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
├── server/                # ✅ 백엔드 서버
│   ├── CLAUDE.md          # 폼 데이터 관리 가이드
│   ├── main.py            # FastAPI 진입점
│   ├── db/                # 데이터베이스 연동
│   │   ├── __init__.py
│   │   └── connection.py
│   └── service/           # (예정) 비즈니스 로직
│
└── front/                 # ✅ 프론트엔드 애플리케이션 (Next.js 16)
    ├── package.json       # 의존성 및 스크립트
    ├── eslint.config.js   # ESLint 설정
    │
    ├── src/               # 소스 코드
    │   ├── app/           # Next.js App Router
    │   │   ├── test/      # 고객사 구현 사례
    │   │   │   └── 2/     # ✅ Rythmi (피부 진단 설문)
    │   │   │       ├── page.js          # 시작 화면
    │   │   │       ├── consent/         # 개인정보 동의
    │   │   │       ├── questions/       # 설문 진행 (10문항)
    │   │   │       ├── loading/         # 분석 로딩
    │   │   │       └── result/          # 결과 및 추천
    │   │   └── list/      # (예정) 메인 페이지
    │   │
    │   ├── contexts/      # ✅ React Context (상태 관리)
    │   │   └── SurveyContext.js
    │   │
    │   ├── data/          # ✅ 정적 데이터
    │   │   ├── questions.js      # 설문 문항 (10개)
    │   │   └── resultData.js     # 결과 타입 (5개)
    │   │
    │   ├── components/    # (예정) UI 컴포넌트
    │   ├── hooks/         # (예정) 커스텀 훅
    │   ├── utils/         # (예정) 유틸리티 함수
    │   ├── api/           # (예정) API 클라이언트
    │   └── db/            # (예정) IndexedDB (Dexie)
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

### 백엔드 (server/)

```bash
# server 디렉토리로 이동
cd server

# 개발 서버 실행 (http://localhost:8000)
python main.py

# 의존성 설치 (처음 한 번)
poetry install

# 가상환경 활성화
poetry shell
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
- [x] 기술 스택 결정 (Next.js + React + JavaScript)
- [x] 프론트엔드 프로젝트 초기 설정 (front/)
- [x] Next.js 16 + Tailwind CSS 4.0 설정 완료 ✅
- [x] MVP API 설계 (Events, Members, Forms, FormResponses)
- [x] **Rythmi 고객사 설문 기능 구현 완료** ✅
  - Context API 기반 상태 관리
  - 10문항 설문 + 5가지 결과 타입
  - sessionStorage 응답 저장
  - 개인정보 동의 플로우

### 🔄 진행 중
- [ ] Rythmi 케이스 스터디 문서 작성
- [ ] API 명세서 업데이트 (Rythmi 활용 사례 추가)
- [ ] 디렉토리 구조 세팅 (범용 components, pages)
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
- [폼 데이터 스펙](./docs/design/FORM_DATA.md)

### API 문서
- [MVP API 명세서](./docs/api/MVP_API_SPEC.md)

### 고객사 문서
- [Rythmi 케이스 스터디](./docs/clients/RYTHMI.md) (예정)

### 백엔드 가이드
- [폼 데이터 관리 가이드](./server/CLAUDE.md)

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
- `next`: 16.0.1 ✅ (프레임워크)
- `react`: 19.2.0 ✅
- `react-dom`: 19.2.0 ✅
- `tailwindcss`: ^4.0 ✅ (개발 의존성)
- `@tailwindcss/postcss`: ^4.0 ✅ (개발 의존성)
- `eslint`: ^9 ✅ (개발 의존성)
- `eslint-config-next`: 16.0.1 ✅ (개발 의존성)

### 구현 완료
- **라우팅**: Next.js App Router ✅
- **상태 관리**: Context API ✅
- **오프라인 저장**: sessionStorage ✅

### 다음 설치 고려 중
- 오프라인 DB: `dexie`, `idb-keyval` (IndexedDB 래퍼)
- HTTP 클라이언트: `axios`, fetch API
- 폼 관리: `react-hook-form`, `zod` (유효성 검사)
- 유틸리티: `clsx`, `tailwind-merge`, `date-fns`
- 실시간 동기화: WebSocket 클라이언트

---

**문서 버전**: 1.6
**최종 업데이트**: 2025-11-15
**작성자**: Product & Development Team
**변경 사항**:
- **Rythmi 고객사 사례 추가** (피부 진단 설문 서비스)
- 기술 스택 업데이트: Vite → Next.js 16
- 프론트엔드 구조 업데이트 (App Router, Context API)
- Rythmi 구현 완료 (front/src/app/test/2/)
- 고객사 문서 섹션 추가
- 현재 단계 업데이트 (Rythmi 완료 항목 추가)
