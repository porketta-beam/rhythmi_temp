# docs/CLAUDE.md - 문서 네비게이션 허브

이 파일은 eventManager 프로젝트의 모든 문서를 안내합니다.

---

## 📚 문서 개요

이 디렉토리(`/docs`)는 eventManager 프로젝트의 모든 기획, 디자인, 명세 문서를 포함합니다.

### 문서 구조

```
docs/
├── CLAUDE.md              # 이 파일 (문서 네비게이션)
│
├── product/               # 제품 문서
│   ├── PRD.md            # Product Requirements Document (영문)
│   └── PRD_Korean.md     # 제품 요구사항 문서 (한글)
│
├── design/                # 디자인 문서
│   ├── USER_FLOWS.md     # 사용자 플로우
│   ├── DATA_FLOWS.md     # 데이터 플로우
│   ├── DB_SCHEMA_SPEC.md # DB 스키마 명세
│   ├── FORM_DATA.md      # 폼 데이터 스펙
│   └── DESIGN_SYSTEM.md  # 디자인 시스템 (예정)
│
├── api/                   # API 문서
│   ├── MVP_API_SPEC.md   # MVP API 명세서
│   └── LUCKYDRAW_API_PLAN.md  # 경품 추첨 API 계획 🆕
│
├── features/              # 기능 명세서 🆕
│   └── LUCKYDRAW.md      # 경품 추첨 기능 명세 🆕
│
├── clients/               # 고객사 문서
│   └── Rythmi.md         # Rythmi 케이스 스터디
│
└── screens/               # 화면 정의서
    ├── README.md         # 화면 정의서 인덱스
    ├── 01_ONBOARDING.md
    ├── 02_EVENT_CREATION.md
    └── ... (추가 예정)
```

---

## 🎯 문서 사용 가이드

### 역할별 추천 문서

#### 제품 기획자
1. **시작**: [`product/PRD_Korean.md`](./product/PRD_Korean.md)
2. **사용자 이해**: [`design/USER_FLOWS.md`](./design/USER_FLOWS.md)
3. **화면 명세**: [`screens/README.md`](./screens/README.md)

#### UI/UX 디자이너
1. **사용자 여정**: [`design/USER_FLOWS.md`](./design/USER_FLOWS.md)
2. **화면 정의**: [`screens/README.md`](./screens/README.md)
3. **개별 화면**: `screens/01_ONBOARDING.md`, `02_EVENT_CREATION.md` 등

#### 개발자 (프론트엔드)
1. **프로젝트 컨텍스트**: [`../CLAUDE.md`](../CLAUDE.md) (루트)
2. **화면 명세**: [`screens/README.md`](./screens/README.md)
3. **데이터 구조**: [`design/DATA_FLOWS.md`](./design/DATA_FLOWS.md)

#### 개발자 (백엔드)
1. **프로젝트 컨텍스트**: [`../CLAUDE.md`](../CLAUDE.md) (루트)
2. **API 명세서**: [`api/MVP_API_SPEC.md`](./api/MVP_API_SPEC.md)
3. **데이터 플로우**: [`design/DATA_FLOWS.md`](./design/DATA_FLOWS.md)
4. **제품 요구사항**: [`product/PRD_Korean.md`](./product/PRD_Korean.md)

---

## 📖 문서별 상세 안내

### 1. 제품 문서 (product/)

#### PRD (Product Requirements Document)
- **영문**: [`PRD.md`](./product/PRD.md)
- **한글**: [`PRD_Korean.md`](./product/PRD_Korean.md)

**내용**:
- 제품 비전 및 목표
- 시장 분석 및 경쟁 환경
- 타겟 사용자 페르소나
- 기능 명세 (Phase 1 & 2)
- 비즈니스 모델 및 수익화 전략
- 기술 아키텍처 요구사항
- 성공 지표 (KPI)
- 시장 진출 전략
- 개발 로드맵

**사용 시기**:
- 프로젝트 전체 이해가 필요할 때
- 기능 우선순위 결정 시
- 이해관계자 설명 자료 필요 시

---

### 2. API 문서 (api/)

#### MVP API 명세서
📄 [`api/MVP_API_SPEC.md`](./api/MVP_API_SPEC.md)

**내용**:
- 데이터 모델 (Events, Members, Forms, FormResponses)
- RESTful API 엔드포인트
  - 이벤트 생성 및 관리
  - 회원 목록 작성 (단일/일괄)
  - 설문 폼 작성 및 관리
  - 설문 링크 생성 및 공유
  - 설문 응답 제출 및 통계
- 보안 정책 (데이터 격리, 암호화)
- 에러 처리 및 HTTP 상태 코드
- 접근 권한 제어 (시간 기반)

**사용 시기**:
- 백엔드 API 개발 시
- 프론트엔드 API 연동 시
- 데이터베이스 스키마 설계 시
- 보안 정책 구현 시

---

### 3. 고객사 문서 (clients/)

#### Rythmi 케이스 스터디
📄 [`clients/Rythmi.md`](./clients/Rythmi.md)

**내용**:
- 고객사 프로필 (Rythmi - 피부 진단 서비스)
- 활용 기능 (설문 폼 + 스코어링)
- 구현 상세
  - 10문항 피부 진단 설문
  - 9개 차원 스코어 계산 로직
  - 5가지 피부 타입 분류 알고리즘
  - sessionStorage 기반 응답 저장
- 디자인 시스템 (오렌지/노란색 그라데이션)
- 페이지 플로우 (시작 → 동의 → 설문 → 로딩 → 결과)
- eventManager API 활용 매핑
- 성과 지표

**사용 시기**:
- 유사한 설문 기능 구현 시
- 스코어링 로직 참고 시
- 고객사 온보딩 가이드 작성 시
- 플랫폼 활용 사례 제시 시

---

### 4. 기능 문서 (features/) 🆕

#### 경품 추첨 (Lucky Draw)
📄 [`features/LUCKYDRAW.md`](./features/LUCKYDRAW.md)

**내용**:
- 시스템 개요 및 핵심 가치
- 사용자 플로우 (QR 등록 → 추첨 → 당첨 알림)
- 파일 구조 및 컴포넌트 설명
- API 엔드포인트 상세 (참가자/관리자)
- 현재 구현 상태 및 제한사항
- 보안 및 성능 고려사항
- 개발 가이드 및 테스트 예시

**사용 시기**:
- 경품 추첨 기능 개발/수정 시
- 실시간 추첨 시스템 이해 시
- 슬롯머신 UI 구현 참고 시
- WebSocket 통신 구현 시

---

### 5. 디자인 문서 (design/)

#### 사용자 플로우 (USER_FLOWS.md)
📄 [`design/USER_FLOWS.md`](./design/USER_FLOWS.md)

**내용**:
- 주최자 플로우
  - 첫 이벤트 생성 (3단계)
  - 이벤트 당일 출석 체크
  - 경품 추첨
- 참여자 플로우
  - 참여자 등록 (앱 설치 불필요)
- 프리미엄 전환 플로우
- 화면별 데이터 요구사항
- 모바일 최적화 체크리스트
- 에러 상태 및 엣지 케이스

**사용 시기**:
- UI 설계 시작 전
- 사용자 경험 검토 시
- 화면 전환 로직 구현 시

#### 데이터 플로우 (DATA_FLOWS.md)
📄 [`design/DATA_FLOWS.md`](./design/DATA_FLOWS.md)

**내용**:
- 데이터 아키텍처 (7개 레이어)
- 핵심 데이터 엔티티
  - Users, Events, Participants, CheckInLogs
- 실시간 동기화 패턴
  - 오프라인 우선 아키텍처
  - 충돌 해결 전략
  - WebSocket 프로토콜
- 데이터 라이프사이클
- 통합 포인트
  - 토스페이먼츠, 이메일, 프린터, 캘린더
- 성능 최적화 (캐싱, DB 인덱스)

**사용 시기**:
- 데이터베이스 스키마 설계 시
- API 설계 시
- 동기화 로직 구현 시
- 성능 최적화 시

#### 폼 데이터 스펙 (FORM_DATA.md)
📄 [`design/FORM_DATA.md`](./design/FORM_DATA.md)

**내용**:
- 폼 기본 구조 및 필드 타입 정의
- 응답 데이터 구조 (field_id 기반)
- 폼 수정 및 버전 관리
  - 기존 응답과의 호환성 보장
  - 삭제/추가/수정 필드 추적
- 검증 규칙 (클라이언트/서버)
- 프론트엔드 렌더링 예시
- 백엔드 저장 로직 예시

**사용 시기**:
- 설문 폼 기능 개발 시
- 폼 JSON 구조 설계 시
- 버전 관리 전략 구현 시
- 프론트엔드 폼 렌더러 개발 시
- 응답 검증 로직 구현 시

---

### 6. 화면 정의서 (screens/)

#### 화면 정의서 인덱스
📄 [`screens/README.md`](./screens/README.md)

전체 화면 목록, 우선순위, 디자인 시스템 참조

#### 개별 화면 정의서

##### 온보딩 및 인증
📄 [`screens/01_ONBOARDING.md`](./screens/01_ONBOARDING.md)

**포함 화면**:
- SCR-001: 스플래시 스크린
- SCR-002: 온보딩 슬라이드 (3개)
- SCR-003: 회원가입
- SCR-004: 로그인

**각 화면 구성**:
- 기본 정보 (화면 ID, 경로, 권한)
- 화면 목적
- 레이아웃 (ASCII 다이어그램)
- UI 컴포넌트 상세 스펙
- 인터랙션 (코드 예시)
- 데이터 (API 엔드포인트)
- 상태 관리
- 에러 처리

##### 이벤트 생성
📄 [`screens/02_EVENT_CREATION.md`](./screens/02_EVENT_CREATION.md)

**포함 화면**:
- SCR-010: 이벤트 생성 1단계 (기본 정보)
- SCR-011: 이벤트 생성 2단계 (참여자 설정)
- SCR-012: 이벤트 생성 3단계 (등록 폼)
- SCR-013: 이벤트 미리보기
- SCR-014: 이벤트 생성 완료

##### 추가 예정 화면
- `03_EVENT_DASHBOARD.md`: 홈, 이벤트 목록, 상세
- `04_CHECKIN.md`: 출석 체크
- `05_PRIZE_DRAWING.md`: 경품 추첨
- `06_PARTICIPANT.md`: 참여자 등록/확인
- `07_PREMIUM.md`: 요금제 및 결제
- `08_ANALYTICS.md`: 분석 대시보드
- `09_SETTINGS.md`: 설정
- `10_COMPONENTS.md`: 공통 컴포넌트

---

## 🔄 문서 업데이트 워크플로우

### 문서 수정 시 체크리스트

1. **변경 범위 확인**
   - [ ] 다른 문서에 영향을 주는가?
   - [ ] 링크 업데이트가 필요한가?

2. **내용 작성**
   - [ ] 명확하고 간결한가?
   - [ ] 예시가 충분한가?
   - [ ] 코드 스니펫이 정확한가?

3. **버전 관리**
   - [ ] 문서 하단에 버전 정보 업데이트
   - [ ] 최종 업데이트 날짜 수정

4. **리뷰**
   - [ ] 관련 팀원에게 리뷰 요청
   - [ ] 피드백 반영

### 문서 간 링크 규칙

```markdown
# 같은 디렉토리
[화면 정의서](./README.md)

# 상위 디렉토리
[프로젝트 컨텍스트](../CLAUDE.md)

# 하위 디렉토리
[PRD 한글](./product/PRD_Korean.md)

# 다른 섹션
[사용자 플로우](./design/USER_FLOWS.md)
[데이터 플로우](./design/DATA_FLOWS.md)
```

---

## 📋 문서 작성 템플릿

### 새 화면 정의서 작성 시

```markdown
# [카테고리] 화면

## 목차
- [SCR-XXX 화면 이름](#scr-xxx-화면-이름)

---

## SCR-XXX 화면 이름

### 기본 정보
- **화면 ID**: SCR-XXX
- **화면 경로**: `/path`
- **접근 권한**: 주최자/참여자/게스트
- **이전 화면**: [화면 이름]
- **다음 화면**: [화면 이름]

### 화면 목적
이 화면이 해결하는 문제와 사용자 목표

### 레이아웃
```
ASCII 다이어그램
```

### UI 컴포넌트
컴포넌트별 상세 정의

### 인터랙션
사용자 액션과 시스템 반응

### 데이터
API 엔드포인트 및 데이터 구조

### 상태 관리
화면 상태 정의

### 에러 처리
오류 시나리오 및 처리

---

**문서 버전**: 1.0
**최종 업데이트**: YYYY-MM-DD
```

---

## 🔍 빠른 검색

### 키워드로 찾기

| 찾고 싶은 내용 | 문서 |
|--------------|------|
| 프로젝트 개요 | [PRD_Korean.md](./product/PRD_Korean.md) |
| 사용자 페르소나 | [PRD_Korean.md](./product/PRD_Korean.md) - 목표 사용자 |
| 기능 명세 | [PRD_Korean.md](./product/PRD_Korean.md) - 제품 기능 |
| 회원가입 화면 | [01_ONBOARDING.md](./screens/01_ONBOARDING.md) - SCR-003 |
| 로그인 플로우 | [01_ONBOARDING.md](./screens/01_ONBOARDING.md) - SCR-004 |
| 이벤트 생성 | [02_EVENT_CREATION.md](./screens/02_EVENT_CREATION.md) |
| 출석 체크 | [USER_FLOWS.md](./design/USER_FLOWS.md) - 플로우 2 |
| 경품 추첨 | [LUCKYDRAW.md](./features/LUCKYDRAW.md) 🆕 |
| 경품 추첨 API | [LUCKYDRAW_API_PLAN.md](./api/LUCKYDRAW_API_PLAN.md) 🆕 |
| 경품 추첨 플로우 | [USER_FLOWS.md](./design/USER_FLOWS.md) - 플로우 3 |
| 슬롯머신 UI | [LUCKYDRAW.md](./features/LUCKYDRAW.md) - 프레젠테이션 페이지 🆕 |
| 당첨자 알림 | [LUCKYDRAW.md](./features/LUCKYDRAW.md) - WebSocket 예정 🆕 |
| 데이터베이스 스키마 | [DATA_FLOWS.md](./design/DATA_FLOWS.md) - 핵심 엔티티 |
| API 명세서 | [MVP_API_SPEC.md](./api/MVP_API_SPEC.md) |
| API 엔드포인트 | [MVP_API_SPEC.md](./api/MVP_API_SPEC.md) - 전체 API 목록 |
| 실시간 동기화 | [DATA_FLOWS.md](./design/DATA_FLOWS.md) - 동기화 패턴 |
| 오프라인 모드 | [DATA_FLOWS.md](./design/DATA_FLOWS.md) - 오프라인 우선 |
| 설문 폼 구조 | [FORM_DATA.md](./design/FORM_DATA.md) |
| 폼 응답 데이터 | [FORM_DATA.md](./design/FORM_DATA.md) - 응답 데이터 구조 |
| 폼 버전 관리 | [FORM_DATA.md](./design/FORM_DATA.md) - 호환성 관리 |
| Rythmi 구현 | [Rythmi.md](./clients/Rythmi.md) |
| 설문 스코어링 | [Rythmi.md](./clients/Rythmi.md) - 스코어 계산 |
| 고객사 활용 사례 | [Rythmi.md](./clients/Rythmi.md) |

---

## 💡 문서 활용 팁

### Figma 디자인 시
1. [`screens/README.md`](./screens/README.md)에서 전체 화면 구조 파악
2. 개별 화면 정의서의 레이아웃 다이어그램 참조
3. UI 컴포넌트 섹션의 스펙 확인 (크기, 색상, 간격)
4. 인터랙션 섹션의 동작 정의 반영

### API 개발 시
1. [`api/MVP_API_SPEC.md`](./api/MVP_API_SPEC.md)에서 전체 API 구조 확인
2. [`design/DATA_FLOWS.md`](./design/DATA_FLOWS.md)에서 데이터 흐름 파악
3. 보안 정책 및 접근 권한 제어 구현
4. 에러 처리 및 검증 로직 구현

### 테스트 작성 시
1. 화면 정의서의 "인터랙션" 섹션 참조
2. "에러 처리" 섹션의 시나리오를 테스트 케이스로 변환
3. [`design/USER_FLOWS.md`](./design/USER_FLOWS.md)의 엣지 케이스 확인

---

## 📞 문의 및 피드백

### 문서 관련 질문
- 제품/기획: Product Team
- 디자인: Design Team
- 기술: Development Team

### 문서 개선 제안
1. 이슈 생성 또는 Pull Request
2. 변경 사항과 이유 명시
3. 관련 팀 리뷰 요청

---

## 📊 문서 현황

### 완료된 문서 ✅
- [x] PRD (영문/한글)
- [x] 사용자 플로우
- [x] 데이터 플로우
- [x] DB 스키마 명세
- [x] 폼 데이터 스펙 (FORM_DATA.md)
- [x] MVP API 명세서
- [x] 화면 정의서: 온보딩 (4개 화면)
- [x] 화면 정의서: 이벤트 생성 (5개 화면)

### 진행 중 문서 🔄
- [x] **Rythmi 케이스 스터디** (clients/Rythmi.md) - ✅ Phase 1.5 완료
- [x] **경품 추첨 기능 명세** (features/LUCKYDRAW.md) - ✅ 기본 문서 완료 🆕
- [ ] 화면 정의서: 대시보드
- [ ] 화면 정의서: 출석 체크
- [ ] 화면 정의서: 경품 추첨

### 예정된 문서 📝
- [ ] 디자인 시스템
- [ ] 데이터베이스 스키마 상세 (마이그레이션 스크립트)
- [ ] 테스트 계획
- [ ] 배포 가이드
- [ ] API 인증 가이드
- [ ] 추가 고객사 케이스 스터디

---

## 💻 개발 진행 현황

### 완료된 개발 ✅
- [x] 기술 스택 결정 (Next.js + React + JavaScript)
- [x] 프론트엔드 프로젝트 초기화 (`front/` 디렉토리)
- [x] Next.js 16 + React 19 설정
- [x] ESLint 설정
- [x] Tailwind CSS v4 설치 및 설정 완료
- [x] Next.js App Router 구조 세팅
- [x] Context API 상태 관리 구현
- [x] **Rythmi 고객사 설문 기능 구현 완료** ✅
  - 10문항 피부 진단 설문
  - 9개 차원 스코어 계산
  - 5가지 피부 타입 분류
  - 개인정보 동의 플로우
  - sessionStorage 응답 저장
  - 오렌지/노란색 그라데이션 디자인

### 진행 중 개발 🔄
- [ ] Rythmi 케이스 스터디 문서 작성
- [ ] Rythmi 백엔드 API 연동 (선택)
- [x] **경품 추첨 백엔드 API 구현** (server/api/luckydraw.py) 🆕
- [x] **경품 추첨 서비스 레이어 구현** (server/services/luckydraw_service.py) 🆕
- [x] **경품 추첨 UI 구현** (front/src/app/lottery/) 🆕
  - 프레젠테이션 페이지 (슬롯머신 애니메이션)
  - 관리자 페이지 (상품 등록, 추첨 시작)
  - 참여자 대기 페이지 (행운번호 표시)
- [ ] **경품 추첨 프론트-백엔드 연동** 🆕
- [ ] **경품 추첨 WebSocket 실시간 통신** 🆕
- [ ] 범용 컴포넌트 라이브러리 개발
- [ ] 디자인 시스템 구축

### 예정된 개발 📝
- [ ] 공통 컴포넌트 개발
- [ ] 온보딩 화면 구현
- [ ] 이벤트 생성 화면 구현
- [ ] 오프라인 DB 설정
- [ ] 백엔드 API 개발

---

**문서 버전**: 1.7
**최종 업데이트**: 2025-11-30
**관리자**: Documentation Team
**변경 사항**:
- **features/ 디렉토리 추가** - 기능 명세서 🆕
- **경품 추첨 (Lucky Draw) 문서 추가** 🆕
  - features/LUCKYDRAW.md - 기능 명세서
  - api/LUCKYDRAW_API_PLAN.md - API 계획
- 문서 구조에 features/ 섹션 추가
- 빠른 검색에 경품 추첨 관련 항목 추가
- 개발 진행 현황에 경품 추첨 구현 항목 추가
- 이전 변경: clients/, Rythmi 고객사 섹션

**관련 문서**: [프로젝트 CLAUDE.md](../CLAUDE.md)
