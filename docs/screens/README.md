# eventManager 화면 정의서

## 📖 문서 구조

화면 정의서는 기능별로 분할되어 있습니다. 각 문서는 독립적으로 참조 가능하며, Figma 디자인 시 해당 섹션만 참고할 수 있습니다.

---

## 📁 파일 목록

### 1. 온보딩 및 인증
- **[01_ONBOARDING.md](./01_ONBOARDING.md)** - 스플래시, 온보딩, 회원가입/로그인

### 2. 이벤트 관리 (주최자)
- **[02_EVENT_CREATION.md](./02_EVENT_CREATION.md)** - 이벤트 생성, 수정, 복제
- **[03_EVENT_DASHBOARD.md](./03_EVENT_DASHBOARD.md)** - 홈 대시보드, 이벤트 목록, 상세
- **[04_CHECKIN.md](./04_CHECKIN.md)** - 출석 체크 화면
- **[05_PRIZE_DRAWING.md](./05_PRIZE_DRAWING.md)** - 경품 추첨 화면

### 3. 참여자 경험
- **[06_PARTICIPANT.md](./06_PARTICIPANT.md)** - 참여자 등록, 확인, 수정

### 4. 프리미엄 기능
- **[07_PREMIUM.md](./07_PREMIUM.md)** - 요금제, 결제, 구독 관리
- **[08_ANALYTICS.md](./08_ANALYTICS.md)** - 분석 및 리포트

### 5. 공통 및 설정
- **[09_SETTINGS.md](./09_SETTINGS.md)** - 설정, 프로필, 알림
- **[10_COMPONENTS.md](./10_COMPONENTS.md)** - 공통 컴포넌트 라이브러리

---

## 📐 화면 정의서 템플릿 구조

각 화면은 다음 형식으로 정의됩니다:

```markdown
## [화면 ID] 화면 이름

### 기본 정보
- 화면 ID: SCR-XXX
- 화면 경로: /path/to/screen
- 접근 권한: 주최자 / 참여자 / 게스트
- 이전 화면: [화면 이름]
- 다음 화면: [화면 이름]

### 화면 목적
이 화면이 해결하는 문제와 사용자 목표

### 레이아웃
```
┌─────────────────┐
│   [헤더]        │
├─────────────────┤
│                 │
│   [콘텐츠]      │
│                 │
├─────────────────┤
│   [하단 버튼]   │
└─────────────────┘
```

### UI 컴포넌트
컴포넌트별 상세 정의

### 인터랙션
사용자 액션과 시스템 반응

### 데이터
필요한 데이터와 API 엔드포인트

### 상태 관리
화면 상태 및 조건부 렌더링

### 에러 처리
오류 시나리오 및 처리 방법
```

---

## 🎨 디자인 시스템 참조

모든 화면은 다음 디자인 원칙을 따릅니다:

### 모바일 우선 (Mobile First)
- 기준 해상도: 375×812px (iPhone 13 mini)
- 반응형: 최대 428px (iPhone 14 Pro Max)
- 태블릿: 768px 이상

### 터치 영역
- 최소: 44×44px
- 권장: 48×48px
- 주요 CTA: 56px 높이

### 색상 시스템
```
Primary: #6366F1 (인디고)
Secondary: #8B5CF6 (보라)
Success: #10B981 (초록)
Warning: #F59E0B (주황)
Error: #EF4444 (빨강)
Neutral: #64748B (회색)
```

### 타이포그래피
```
Heading 1: 28px / Bold / -0.5px
Heading 2: 24px / Bold / -0.3px
Heading 3: 20px / Semibold / -0.2px
Body Large: 18px / Regular / 0px
Body: 16px / Regular / 0px
Body Small: 14px / Regular / 0px
Caption: 12px / Regular / 0.2px
```

### 간격 시스템 (8pt Grid)
```
XXS: 4px
XS: 8px
SM: 12px
MD: 16px
LG: 24px
XL: 32px
XXL: 48px
```

---

## 🔄 화면 전환 맵

```
[스플래시]
    ↓
[온보딩] ─→ [회원가입] ─→ [홈 대시보드]
    ↓            ↑
[로그인] ────────┘
    ↓
[홈 대시보드]
    ├─→ [이벤트 생성] ─→ [이벤트 상세]
    ├─→ [이벤트 목록] ─→ [이벤트 상세]
    └─→ [설정]

[이벤트 상세]
    ├─→ [참여자 관리]
    ├─→ [출석 체크]
    ├─→ [경품 추첨]
    └─→ [분석]

[참여자 플로우]
[등록 링크] ─→ [이벤트 정보] ─→ [등록 폼] ─→ [등록 완료]
```

---

## 📱 화면 우선순위 (MVP)

### Phase 1 (필수)
1. ✅ 온보딩 및 인증
2. ✅ 이벤트 생성
3. ✅ 이벤트 대시보드
4. ✅ 출석 체크
5. ✅ 경품 추첨
6. ✅ 참여자 등록

### Phase 2 (프리미엄)
7. 요금제 및 결제
8. 분석 대시보드
9. 명찰 출력 설정
10. 브랜딩 커스터마이징

### Phase 3 (최적화)
11. 고급 설정
12. 알림 센터
13. 도움말 및 지원

---

## 🔗 관련 문서

- [USER_FLOWS.md](../design/USER_FLOWS.md) - 사용자 플로우
- [DATA_FLOWS.md](../design/DATA_FLOWS.md) - 데이터 플로우
- [PRD.md](../product/PRD.md) - 제품 요구사항 문서
- [PRD_Korean.md](../product/PRD_Korean.md) - 제품 요구사항 문서 (한글)
- [문서 허브](../CLAUDE.md) - 전체 문서 네비게이션

---

## 📋 화면 목록 요약

| 화면 ID | 화면 이름 | 파일 | 사용자 | 우선순위 |
|---------|----------|------|--------|----------|
| SCR-001 | 스플래시 | 01_ONBOARDING.md | 전체 | P1 |
| SCR-002 | 온보딩 | 01_ONBOARDING.md | 신규 | P1 |
| SCR-003 | 회원가입 | 01_ONBOARDING.md | 신규 | P1 |
| SCR-004 | 로그인 | 01_ONBOARDING.md | 기존 | P1 |
| SCR-010 | 이벤트 생성 | 02_EVENT_CREATION.md | 주최자 | P1 |
| SCR-011 | 이벤트 수정 | 02_EVENT_CREATION.md | 주최자 | P1 |
| SCR-020 | 홈 대시보드 | 03_EVENT_DASHBOARD.md | 주최자 | P1 |
| SCR-021 | 이벤트 목록 | 03_EVENT_DASHBOARD.md | 주최자 | P1 |
| SCR-022 | 이벤트 상세 | 03_EVENT_DASHBOARD.md | 주최자 | P1 |
| SCR-030 | 출석 체크 | 04_CHECKIN.md | 주최자 | P1 |
| SCR-040 | 경품 추첨 | 05_PRIZE_DRAWING.md | 주최자 | P1 |
| SCR-050 | 참여자 등록 | 06_PARTICIPANT.md | 참여자 | P1 |
| SCR-060 | 요금제 선택 | 07_PREMIUM.md | 주최자 | P2 |
| SCR-070 | 분석 대시보드 | 08_ANALYTICS.md | 주최자 | P2 |
| SCR-080 | 설정 | 09_SETTINGS.md | 전체 | P2 |

---

**문서 버전:** 1.0
**최종 업데이트:** 2025-10-12
**작성자:** Product Design Team
