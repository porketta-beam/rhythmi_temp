# Rythmi 케이스 스터디

**고객사**: Rythmi (리듬아이)
**도메인**: 피부 진단 및 스킨케어 추천 서비스
**구현 기간**: 2025-11
**상태**: ✅ Phase 1 완료 (프론트엔드)
**타겟 디바이스**: Surface Pro 13인치 태블릿 (2880×1920, Landscape)

---

## 📋 프로젝트 개요

### 고객사 프로필

**Rythmi**는 피부 타입을 진단하고 맞춤형 스킨케어 루틴을 추천하는 서비스입니다.

**비즈니스 모델**:
- 무료 피부 진단 설문
- 맞춤형 스킨케어 루틴 추천
- (향후) 제품 큐레이션 및 구매 연동

**타겟 사용자**:
- 자신의 피부 타입을 정확히 모르는 사람
- 스킨케어 루틴 개선을 원하는 사람
- 제품 선택에 어려움을 겪는 사람

---

## 🎯 eventManager 활용

### 활용 기능

Rythmi는 eventManager의 **설문 폼 기능**을 핵심으로 활용합니다:

1. **회원 목록 관리**: UUID 기반 사용자 식별
2. **설문 폼**: 10문항 피부 진단 설문
3. **응답 저장**: sessionStorage 기반 오프라인 우선 저장
4. **결과 분류**: 스코어 기반 5가지 피부 타입 분류

### eventManager API 매핑

| Rythmi 기능 | eventManager API | 구현 상태 |
|------------|------------------|---------|
| 사용자 식별 | Members (UUID) | 프론트엔드만 (sessionStorage) |
| 설문 문항 관리 | Forms.fields | 정적 데이터 (`questions.js`) |
| 설문 응답 저장 | FormResponses | sessionStorage (백엔드 미연동) |
| 스코어 계산 | - | 클라이언트 사이드 로직 |
| 결과 분류 | - | 클라이언트 사이드 로직 |

**현재 구현**: 백엔드 없이 완전한 클라이언트 사이드 앱으로 작동
**향후 계획**: eventManager API와 연동하여 응답 저장 및 분석

---

## 🏗 구현 아키텍처

### 기술 스택

- **프레임워크**: Next.js 16 (App Router)
- **UI 라이브러리**: React 19
- **스타일링**: Tailwind CSS 4.0
- **상태 관리**: Context API
- **데이터 저장**: sessionStorage

### 디렉토리 구조

```
front/src/app/test/2/
├── page.js                # 시작 화면
├── consent/               # 개인정보 동의
│   └── page.js
├── questions/             # 설문 진행
│   └── page.js
├── loading/               # 분석 로딩
│   └── page.js
└── result/                # 결과 및 추천
    └── page.js

front/src/contexts/
└── SurveyContext.js       # 설문 상태 관리

front/src/data/
├── questions.js           # 10문항 정의
└── resultData.js          # 5가지 피부 타입 정의
```

---

## 📊 설문 구조

### 10문항 설계

| 번호 | 카테고리 | 질문 내용 | 옵션 수 |
|-----|---------|----------|--------|
| 1 | 피부 | 세안 후 피부 느낌 | 5개 |
| 2 | 피부 | 오후 유분 상태 | 4개 |
| 3 | 피부 | 붉어짐/따가움 빈도 | 4개 |
| 4 | 피부 | 환절기 영향 | 4개 |
| 5 | 환경 | 미세먼지 민감도 | 4개 |
| 6 | 환경 | 신제품 반응 | 4개 |
| 7 | 라이프스타일 | 주요 활동 환경 | 4개 |
| 8 | 라이프스타일 | 공간 환경 특성 | 4개 |
| 9 | 케어 | 일상 관리 루틴 | 4개 |
| 10 | 케어 | 제품 휴대 여부 | 4개 |

### 스코어 차원 (9개)

각 질문의 답변은 다음 9가지 차원에 점수를 부여합니다:

```javascript
{
  dry: 0,          // 건조도
  oily: 0,         // 지성도
  sensitive: 0,    // 민감도
  normal: 0,       // 정상
  indoor: 0,       // 실내 환경
  outdoor: 0,      // 실외 환경
  active: 0,       // 활동성
  minimal: 0,      // 미니멀 케어
  combination: 0   // 복합성
}
```

**예시**: Q1-A1 (세안 후 매우 건조) → `{ dry: 3 }`

### 5가지 피부 타입 분류

결과는 스코어 조합에 따라 5가지 타입으로 분류됩니다:

#### 1. 건조 민감형 (dry_sensitive)
```javascript
조건: dry >= 6 && sensitive >= 4
이모지: 🌸
설명: 건조함과 민감함이 동시에 나타나는 피부
케어: 충분한 수분 공급, 자극 최소화, 장벽 강화 집중
루틴: 저자극 토너 → 보습 세럼 → 장벽 크림
```

#### 2. 건조 실내형 (dry_indoor)
```javascript
조건: dry >= 6 && indoor >= 2
이모지: 💧
설명: 실내 환경에서 수분이 부족한 피부
케어: 지속 보습, 수분 미스트 수시 사용, 세라마이드 케어
루틴: 수분 토너 → 세라마이드 세럼 → 보습 크림 + 미스트
```

#### 3. 민감 보호형 (sensitive_protected)
```javascript
조건: sensitive >= 6 && (outdoor >= 2 || active >= 2)
이모지: 🛡️
설명: 외부 자극에 쉽게 반응하는 예민한 피부
케어: 진정 케어, 외부 자극 차단, 보호막 형성
루틴: 진정 토너 → 시카 세럼 → 보호 크림
```

#### 4. 활동 밸런스형 (active_balance)
```javascript
조건: active >= 4 && (dry >= 2 || sensitive >= 2)
이모지: ⚡
설명: 활동적인 라이프스타일에 맞는 간편한 케어 필요
케어: 빠른 흡수, 쿨링 효과, 휴대 간편
루틴: 쿨링 토너 → 가벼운 세럼 → 산뜻한 크림 + 휴대용 미스트
```

#### 5. 미니멀 케어형 (minimal_care)
```javascript
조건: 위 조건 모두 해당 안 됨 (fallback)
이모지: ✨
설명: 큰 고민 없이 간단한 케어만 필요한 피부
케어: 필수만 간단히, 올인원 제품, 시간 절약
루틴: 올인원 토너 → 가벼운 로션 (필요시 미스트)
```

---

## 🎨 디자인 시스템

### 컬러 팔레트

```javascript
브랜드 컬러:
- 메인: Orange (오렌지)
- 서브: Yellow (노란색)
- 그라데이션: from-orange-500 to-yellow-500

배경:
- 기본: orange-50
- 그라데이션: from-orange-50 via-yellow-50 to-orange-50

장식:
- 블러 원: orange-200/30, yellow-200/30

텍스트:
- 주요: orange-900
- 서브: orange-700, orange-600
- 라벨: orange-800
```

### 태블릿 가로형 레이아웃

**타겟 해상도**: 2880×1920px (Surface Pro 13인치)
**레이아웃 방식**: Landscape (가로형)
**컨테이너 너비**: max-w-[2560px] (중앙 정렬)

**디자인 원칙**:
- 2열 레이아웃 활용 (콘텐츠 + 시각 정보)
- 가로 공간 최대 활용
- 큰 폰트 크기 (태블릿 가독성)
- 넉넉한 터치 타겟 (최소 120px)
- 넓은 여백 (양쪽 200px+)

### 타이포그래피 (태블릿 최적화)

```javascript
제목 (h1): text-7xl ~ text-9xl, font-bold (84px ~ 128px)
부제 (p): text-4xl ~ text-5xl, font-semibold (36px ~ 48px)
본문: text-3xl ~ text-4xl (30px ~ 36px)
라벨: text-2xl ~ text-3xl (24px ~ 30px)

한글 폰트: 시스템 기본 (font-sans)
행간: leading-tight ~ leading-normal
```

### 컴포넌트 스타일

#### 버튼 (CTA)
```javascript
크기: h-32 ~ h-40 (128~160px 높이) - 태블릿 터치 최적화
너비: min-w-[400px] (최소 너비)
모양: rounded-full (완전한 원형)
배경: gradient (from-orange-500 to-yellow-500)
폰트: text-4xl ~ text-5xl (36~48px)
효과:
  - hover:scale-105 (확대)
  - active:scale-95 (축소)
  - shadow-2xl → hover:shadow-orange-300
```

#### 설문 옵션 버튼
```javascript
크기: h-28 ~ h-32 (112~128px 높이)
기본: bg-white/90, border-4 border-orange-200
선택됨: bg-gradient (orange→yellow), scale-105
폰트: text-3xl ~ text-4xl (30~36px)
효과: hover:scale-102, backdrop-blur-sm
```

#### 배경 장식
```javascript
위치: absolute
크기: w-64 ~ w-96 (256~384px)
효과: blur-3xl (강한 블러)
투명도: /30 (30% opacity)
```

---

## 📐 반응형 디자인 구현

### 문제 상황

**발견**: 배포 환경에서 다른 기기로 접속 시 모든 요소들이 의도보다 작게 표시되는 문제 발생

**증상**:
- Surface Pro 13인치에서 125% 확대 시에만 정상 크기로 보임
- 고정 배율(125%)을 적용하면 다른 기기에서 적응하지 못함
- 원형 프레임, 로고, 버튼 등 모든 UI 요소가 작게 표시

**근본 원인**:
```javascript
// 문제가 있던 기존 코드
<div className="w-[84vw] h-[84vw] max-w-[1080px]">  // 고정 픽셀 최대값
<div className="top-[100px] w-[160px] h-[121px]">    // 고정 픽셀 크기
```

- **고정 픽셀 값 사용**: 모든 크기를 px 단위로 지정
- **고해상도 소형 기기 문제**: Surface Pro는 2880×1920 해상도이지만 13인치 → 픽셀 밀도가 높아 같은 px 값이 물리적으로 더 작게 보임
- **기기 다양성 미고려**: 태블릿, 모바일, 데스크탑 각각에 적절한 크기 제공 못함

---

### 해결 방법

#### 1. 상대 단위로 전환

**vmin 단위 사용**: viewport의 너비와 높이 중 작은 값의 백분율
```javascript
// vmin: 화면 크기에 비례하여 자동 조정
// 85vmin = viewport 짧은 쪽의 85%
w-[85vmin]  // 화면이 커지면 요소도 커짐
```

**vh 단위 사용**: viewport 높이의 백분율
```javascript
// vh: 세로 화면 높이에 비례
pt-[20vh]  // 화면 높이의 20% 패딩
```

#### 2. 최소값 보장

**max() 함수 사용**: 두 값 중 큰 값 선택
```javascript
// max(85vmin, 600px): 화면 비례 또는 최소 600px 중 큰 것
w-[max(85vmin, 600px)]

// 작은 화면: 600px 보장 (가독성 유지)
// 큰 화면: 85vmin 사용 (화면에 맞게 커짐)
```

#### 3. 최대값 제한

**max-w-[] 사용**: 과도한 확대 방지
```javascript
// 대형 모니터에서 너무 커지지 않도록
max-w-[1200px]
```

#### 4. 범위 제한

**clamp() 함수 사용**: 최소/이상/최대 범위 자동 조정
```javascript
// clamp(min, ideal, max)
w-[clamp(120px, 12vmin, 180px)]

// 작은 화면: 120px (최소값)
// 중간 화면: 12vmin (화면 비례)
// 큰 화면: 180px (최대값)
```

---

### 구현 상세

#### layout.js 반응형 코드

**파일 위치**: `front/src/app/test/2/layout.js`

##### 원형 프레임 (1.5배 확대 적용)

```javascript
{/* 중앙 원형 프레임 (배경 장식) - 1.5배 확대 */}
<div className="absolute top-[max(2vh,20px)] left-1/2 -translate-x-1/2
                w-[max(128vmin,900px)] h-[max(128vmin,900px)]
                max-w-[1800px] max-h-[1800px]
                rounded-full border-[3px] border-white/40 z-5">
</div>
```

**변경 과정**:
1. 초기: `w-[84vw] h-[84vw] max-w-[1080px]` (고정 픽셀)
2. 반응형 적용: `w-[max(85vmin,600px)] max-w-[1200px]`
3. 1.5배 확대: `w-[max(128vmin,900px)] max-w-[1800px]`
   - `85vmin × 1.5 = 127.5vmin ≈ 128vmin`
   - `600px × 1.5 = 900px`
   - `1200px × 1.5 = 1800px`

##### 상단 로고

```javascript
{/* 상단 로고 (가로 중앙) - 반응형 */}
<div className="absolute top-[max(8vh,80px)] left-1/2 -translate-x-1/2
                w-[clamp(120px,12vmin,180px)] h-[clamp(91px,9vmin,136px)] z-10">
  <Image src="/rhythmi_logo_2_white.svg" alt="Rhythmi Logo"
         width={160} height={121}
         className="w-full h-full object-contain" />
</div>
```

**변경 과정**:
- 초기: `top-[100px] w-[160px] h-[121px]` (고정)
- 최종: `top-[max(8vh,80px)] w-[clamp(120px,12vmin,180px)]`

##### 하단 로고

```javascript
{/* 하단 작은 로고 (가로 중앙) - 반응형 */}
<div className="absolute bottom-[max(6vh,50px)] left-1/2 -translate-x-1/2
                w-[clamp(70px,8vmin,100px)] h-[clamp(70px,8vmin,100px)] z-10">
  <Image src="/rhythmi_logo_1_white.svg" alt="Rhythmi Icon"
         width={80} height={80}
         className="w-full h-full object-contain" />
</div>
```

**변경 과정**:
- 초기: `bottom-[60px] w-[80px] h-[80px]` (고정)
- 최종: `bottom-[max(6vh,50px)] w-[clamp(70px,8vmin,100px)]`

##### 콘텐츠 패딩

```javascript
<div className="w-full h-full grid grid-cols-2 gap-8 px-8
                pt-[max(20vh,200px)] pb-[max(15vh,140px)]
                relative z-20 overflow-hidden max-w-4xl mx-auto">
  {children}
</div>
```

**변경 과정**:
- 초기: `pt-[240px] pb-[160px]` (고정)
- 최종: `pt-[max(20vh,200px)] pb-[max(15vh,140px)]`

---

### 기기별 동작 원리

#### Surface Pro 13인치 (2880×1920)

**원형 프레임**:
```javascript
128vmin = 128% × min(2880px, 1920px) = 128% × 1920px = 2457px
하지만 max-w-[1800px]로 제한 → 최종 1800px 사용
```
→ 화면을 거의 가득 채우는 큰 원 (의도된 배경 장식 효과)

**상단 로고**:
```javascript
clamp(120px, 12vmin, 180px)
12vmin = 12% × 1920px = 230px → 최대값 180px로 제한
→ 최종 180px 사용
```
→ 큰 화면에서 과도하게 커지지 않음

#### iPad (1024×768)

**원형 프레임**:
```javascript
128vmin = 128% × 768px = 983px
max(128vmin, 900px) = max(983px, 900px) = 983px
```
→ 최소값보다 크므로 화면 비례 값 사용

**상단 로고**:
```javascript
12vmin = 12% × 768px = 92px
clamp(120px, 92px, 180px) → 최소값 120px 사용
```
→ 작은 화면에서도 읽기 가능한 크기 보장

#### 모바일 (375×667)

**원형 프레임**:
```javascript
128vmin = 128% × 375px = 480px
max(128vmin, 900px) = max(480px, 900px) = 900px
```
→ 화면보다 큰 원이지만 `overflow-hidden`으로 잘림 (의도된 디자인)

**상단 로고**:
```javascript
12vmin = 12% × 375px = 45px
clamp(120px, 45px, 180px) → 최소값 120px 사용
```
→ 모바일에서도 명확하게 보이는 크기 유지

---

### 결과 및 성과

✅ **해결된 문제**:
- 모든 기기에서 일관된 시각적 비율 유지
- 고해상도 소형 기기(Surface Pro)에서도 적절한 크기로 표시
- 작은 화면에서도 가독성과 사용성 유지
- 대형 모니터에서 과도하게 커지지 않음

✅ **반응형 원칙 준수**:
- **비례 조정**: vmin/vh로 화면 크기에 맞게 자동 조정
- **최소값 보장**: max()로 작은 화면에서도 읽기 가능
- **최대값 제한**: clamp()와 max-w로 큰 화면에서 제어
- **유연한 확대**: 1.5배 확대도 반응형 비율 유지

✅ **성능 개선**:
- CSS 네이티브 함수 사용 (JavaScript 계산 불필요)
- 미디어 쿼리 없이 단일 코드로 모든 기기 대응
- 유지보수 용이 (하나의 값만 수정하면 자동 비례 조정)

**개선 전후 비교**:
| 항목 | 개선 전 | 개선 후 |
|-----|--------|--------|
| 원형 프레임 | `w-[84vw] max-w-[1080px]` | `w-[max(128vmin,900px)] max-w-[1800px]` |
| 로고 크기 | `w-[160px]` 고정 | `w-[clamp(120px,12vmin,180px)]` 반응형 |
| 패딩 | `pt-[240px]` 고정 | `pt-[max(20vh,200px)]` 반응형 |
| 기기 대응 | Surface Pro만 최적화 | 모든 기기 자동 대응 |

---

## 🔄 페이지 플로우

### 1. 시작 화면 (`/test/2`)

**목적**: 사용자 유입 및 동기 부여

**구성**:
- LeadMe 로고 (w-28~36, 그라데이션 박스)
- 이모지 장식 (✨🌟💫)
- 메인 카피: "반가워요! 당신의 피부를 알아가볼까요?"
- 부제: "10분이면 충분해요 / 맞춤 케어를 찾아드려요"
- CTA 버튼: "시작할게요 →"
- 소요 시간 표시: "⏱️ 약 10분 소요"

**네비게이션**:
- "목록으로" → `/list`
- "시작할게요" → `/test/2/consent`

---

### 2. 개인정보 동의 (`/test/2/consent`)

**목적**: 개인정보 수집 동의 획득

**구성**:
- 제목: "잠깐만요! 📋 먼저 확인해주세요"
- 동의 내용 카드:
  - 🔒 개인정보 활용 안내
  - 📝 무엇을 물어볼까요? (피부 상태, 생활 습관 등)
  - ✨ 왜 필요할까요? (맞춤 추천 위해)
  - 🗑️ 언제까지 보관? (화면 종료 시 삭제)
- 주의 문구: "동의하지 않으셔도 괜찮아요. 다만, 서비스를 이용하실 수 없어요."

**버튼**:
- "거부할게요" (왼쪽, white border) → `/test/2`
- "동의해요 👍" (오른쪽, gradient) → `/test/2/questions`

**데이터 정책**:
```javascript
수집 항목: 피부 상태, 생활 습관, 환경 정보
수집 목적: 스킨케어 추천
보관 기간: sessionStorage (브라우저 종료 시 삭제)
제3자 제공: 없음
```

---

### 3. 설문 진행 (`/test/2/questions`)

**목적**: 10문항 설문 응답 수집

**구성**:
- 상단 네비게이션:
  - "목록으로" (좌상단)
  - "← 이전" 버튼 (우상단, 2번 문항부터 표시)
- 진행도 표시:
  - "1 / 10 🎯" (현재/전체)
  - "10%" 퍼센트 표시
  - 프로그레스 바 (그라데이션)
- 질문 카드:
  - 질문 텍스트 (text-5xl)
  - 4~5개 선택지 (큰 버튼)
- 안내 문구: "💡 답변을 선택하면 자동으로 넘어가요!"

**인터랙션**:
```javascript
답변 선택:
1. setAnswer(questionId, optionId)
2. sessionStorage에 저장
3. 300ms 지연 후:
   - 마지막 문항이면 → calculateResult() → /test/2/loading
   - 아니면 → nextQuestion()

이전 버튼:
- prevQuestion() (currentQuestion - 1)
- 이전 답변 유지됨 (sessionStorage)
```

**상태 관리** (SurveyContext):
```javascript
{
  answers: { q1: "q1a2", q2: "q2a3", ... },
  currentQuestion: 1~10,
  scores: null,
  result: null
}
```

---

### 4. 분석 로딩 (`/test/2/loading`)

**목적**: 결과 계산 중 대기 경험 제공

**구성**:
- 로딩 애니메이션:
  - 회전하는 원형 테두리 (border-t-orange-500)
  - 중앙 이모지: 🤖
- 메시지:
  - "AI가 열심히 분석하고 있어요! ✨"
  - "잠시만 기다려주세요..."

**로직**:
```javascript
useEffect(() => {
  const timer = setTimeout(() => {
    router.push("/test/2/result");
  }, 1000);

  return () => clearTimeout(timer);
}, [router]);
```

**실제 처리**: 1초 후 자동으로 결과 페이지로 이동

---

### 5. 결과 및 추천 (`/test/2/result`)

**목적**: 피부 타입 진단 결과 및 루틴 추천 제공

**구성**:
- 결과 타입 표시:
  - 이모지 (text-9xl, animate-bounce)
  - 타입명 (text-6xl, "건조 민감형")
  - 장식 이모지 (✨💖✨)
  - 설명 (text-3xl)
- 핵심 케어 포인트 카드:
  - 제목: "🎯 핵심 케어 포인트"
  - 3가지 포인트 (번호 매겨짐)
- 추천 루틴 카드:
  - 제목: "💝 추천 루틴"
  - 단계별 루틴 (토너 → 세럼 → 크림)
- CTA: "다시 시작하기 🔄" → `/test/2` + reset()

**결과 계산 로직** (`SurveyContext.js:84`):
```javascript
const determineResultType = (scores) => {
  // 우선순위 순서대로 조건 체크
  if (scores.dry >= 6 && scores.sensitive >= 4)
    return "dry_sensitive";

  if (scores.dry >= 6 && scores.indoor >= 2)
    return "dry_indoor";

  if (scores.sensitive >= 6 && (scores.outdoor >= 2 || scores.active >= 2))
    return "sensitive_protected";

  if (scores.active >= 4 && (scores.dry >= 2 || scores.sensitive >= 2))
    return "active_balance";

  return "minimal_care"; // fallback
};
```

**상태 초기화**:
```javascript
const reset = () => {
  setAnswers({});
  setCurrentQuestion(1);
  setScores(null);
  setResult(null);
  sessionStorage.removeItem("surveyAnswers");
};
```

---

## 📈 성과 및 개선사항

### 현재 구현 성과

✅ **완료된 기능**:
- 10문항 설문 시스템
- 9개 차원 스코어링
- 5가지 피부 타입 분류
- 개인정보 동의 플로우
- sessionStorage 응답 저장
- 반응형 모바일 우선 UI
- 애니메이션 및 인터랙션

### 향후 개선 계획

#### Phase 2: 백엔드 연동
- [ ] eventManager API와 연동
- [ ] Members 테이블에 UUID 저장
- [ ] Forms 테이블에 설문 구조 저장
- [ ] FormResponses 테이블에 응답 저장
- [ ] 응답 통계 및 분석 대시보드

#### Phase 3: 고급 기능
- [ ] 이메일로 결과 전송
- [ ] 제품 큐레이션 연동
- [ ] 피부 타입별 커뮤니티
- [ ] 주기적 재진단 알림
- [ ] A/B 테스트 (질문 순서, 문구)

#### Phase 4: 분석 및 최적화
- [ ] 사용자 이탈 지점 분석
- [ ] 피부 타입 분포 분석
- [ ] 스코어링 알고리즘 개선
- [ ] 추천 루틴 개인화 강화

---

## 🔧 eventManager 통합 가이드

### API 연동 계획

#### 1. 설문 생성 (Form)

**POST** `/api/events/{eventId}/forms`

```json
{
  "title": "Rythmi 피부 타입 진단",
  "description": "10분 만에 나의 피부 타입을 알아보세요",
  "fields": [
    {
      "id": "q1",
      "type": "single_choice",
      "label": "세안 후 피부가 어떻게 느껴지나요?",
      "required": true,
      "options": [
        {
          "id": "q1a1",
          "text": "매우 건조하고 당긴다",
          "metadata": { "scores": { "dry": 3 } }
        },
        // ... 나머지 옵션
      ],
      "order": 1
    },
    // ... 나머지 9개 질문
  ],
  "active": true,
  "metadata": {
    "categories": ["피부", "환경", "라이프스타일", "케어"],
    "scoreDimensions": ["dry", "oily", "sensitive", "normal", "indoor", "outdoor", "active", "minimal", "combination"],
    "resultTypes": ["dry_sensitive", "dry_indoor", "sensitive_protected", "active_balance", "minimal_care"]
  }
}
```

#### 2. 응답 제출 (FormResponse)

**POST** `/api/forms/{formId}/responses`

```json
{
  "member_id": "mbr_abc123xyz", // UUID
  "responses": {
    "q1": { "answer": "q1a1", "scores": { "dry": 3 } },
    "q2": { "answer": "q2a2", "scores": { "normal": 2 } },
    // ... 나머지 응답
  },
  "metadata": {
    "totalScores": {
      "dry": 12,
      "oily": 2,
      "sensitive": 8,
      // ...
    },
    "resultType": "dry_sensitive",
    "completionTime": 583 // 초
  }
}
```

#### 3. 결과 조회

**GET** `/api/forms/{formId}/responses/{responseId}`

```json
{
  "id": "rsp_xyz789abc",
  "form_id": "frm_5g7j9l2m",
  "member_id": "mbr_abc123xyz",
  "responses": { /* ... */ },
  "result": {
    "type": "dry_sensitive",
    "emoji": "🌸",
    "description": "건조함과 민감함이 동시에 나타나는 피부예요",
    "carePoints": [/* ... */],
    "routine": "저자극 토너 → 보습 세럼 → 장벽 크림"
  },
  "submitted_at": "2025-11-15T14:23:45+09:00"
}
```

### 프론트엔드 수정사항

#### SurveyContext 업데이트

```javascript
// 현재: sessionStorage만 사용
const setAnswer = (questionId, answerId) => {
  const newAnswers = { ...answers, [`q${questionId}`]: answerId };
  setAnswers(newAnswers);
  sessionStorage.setItem("surveyAnswers", JSON.stringify(newAnswers));
};

// 변경 후: API 호출 추가
const setAnswer = async (questionId, answerId) => {
  const newAnswers = { ...answers, [`q${questionId}`]: answerId };
  setAnswers(newAnswers);

  // 로컬 저장 (오프라인 우선)
  sessionStorage.setItem("surveyAnswers", JSON.stringify(newAnswers));

  // 백그라운드 동기화
  try {
    await syncAnswersToServer(newAnswers);
  } catch (error) {
    console.error("동기화 실패:", error);
    // 사용자에게 영향 없음 (오프라인 우선)
  }
};
```

#### 결과 제출

```javascript
const calculateResult = async () => {
  const calculatedScores = calculateScores();
  const resultType = determineResultType(calculatedScores);

  setScores(calculatedScores);
  setResult(resultType);

  // API에 결과 제출
  try {
    const response = await fetch(`/api/forms/${formId}/responses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        member_id: memberId,
        responses: formatResponsesForAPI(answers),
        metadata: {
          totalScores: calculatedScores,
          resultType,
          completionTime: getElapsedTime()
        }
      })
    });

    const data = await response.json();
    console.log("응답 저장 완료:", data.id);
  } catch (error) {
    console.error("응답 저장 실패:", error);
    // 로컬에만 저장된 상태로 계속 진행
  }

  return { scores: calculatedScores, resultType, resultData: resultData[resultType] };
};
```

---

## 📊 데이터 분석

### 수집 가능한 지표

#### 사용자 행동
- 설문 완료율 (시작 → 완료)
- 이탈 지점 분석 (어느 질문에서 이탈)
- 평균 소요 시간
- 질문별 응답 시간

#### 피부 타입 분포
```javascript
{
  "dry_sensitive": 35%,
  "dry_indoor": 25%,
  "sensitive_protected": 20%,
  "active_balance": 15%,
  "minimal_care": 5%
}
```

#### 스코어 분포
```javascript
{
  "dry": { mean: 4.2, median: 4, std: 2.1 },
  "sensitive": { mean: 3.8, median: 3, std: 2.3 },
  // ...
}
```

### 개선 인사이트

**질문 최적화**:
- 응답 시간이 긴 질문 → 문구 단순화
- 특정 답변에 편중 → 옵션 재조정
- 낮은 변별력 → 질문 교체 검토

**알고리즘 개선**:
- 타입 분류 경계값 조정
- 새로운 피부 타입 추가
- 스코어 가중치 재조정

---

## 🔐 보안 및 개인정보

### 현재 구현 (Phase 1)

**데이터 저장**: sessionStorage (브라우저 로컬)
**보관 기간**: 브라우저 세션 (탭 닫으면 삭제)
**개인정보 수집**: 없음 (익명 설문)

### 백엔드 연동 시 (Phase 2)

#### 개인정보 보호

**수집 최소화**:
- 회원 가입 불필요 (익명 UUID 발급)
- 이름/전화번호 수집 안 함
- 이메일은 결과 전송 시 선택 수집

**데이터 격리**:
```javascript
// Members DB (격리된 보안 DB)
{
  id: "mbr_abc123xyz", // UUID (공개)
  email: "user@example.com", // 암호화
  created_at: "2025-11-15T10:00:00+09:00"
}

// FormResponses (메인 DB)
{
  id: "rsp_xyz789abc",
  form_id: "frm_5g7j9l2m",
  member_id: "mbr_abc123xyz", // UUID만 저장 (외래키 아님)
  responses: { /* ... */ },
  metadata: { /* ... */ }
}
```

**접근 제어**:
- 본인 결과만 조회 가능 (UUID 토큰 필요)
- 관리자는 통계만 조회 (개별 응답 익명화)

#### GDPR/개인정보보호법 준수

- **동의 획득**: 설문 시작 전 명시적 동의
- **목적 명시**: "피부 타입 진단 및 추천"
- **보관 기간**: 동의 철회 시 즉시 삭제
- **제3자 제공**: 없음
- **열람/수정/삭제**: 사용자 요청 시 처리

---

## 💡 교훈 및 베스트 프랙티스

### eventManager 활용 성공 요인

1. **오프라인 우선 아키텍처 활용**
   - sessionStorage로 응답 즉시 저장
   - 네트워크 없이도 설문 진행 가능
   - 백그라운드 동기화로 사용자 경험 향상

2. **유연한 스코어링 시스템**
   - Forms.fields의 metadata에 스코어 저장
   - 클라이언트/서버 양쪽에서 계산 가능
   - 알고리즘 변경 시 데이터 재처리 가능

3. **UUID 기반 익명화**
   - 회원 가입 없이 서비스 이용
   - 개인정보 최소 수집
   - 외래키 없는 느슨한 결합

### 개선할 점

1. **스코어 로직 서버 이관**
   - 현재: 클라이언트 사이드에만 존재
   - 문제: 로직 노출, 조작 가능성
   - 개선: 서버에서 계산 후 결과만 반환

2. **응답 검증 강화**
   - 현재: 프론트엔드 검증만
   - 개선: 백엔드 검증 추가 (필수 질문, 유효한 옵션)

3. **진행 상태 저장**
   - 현재: 새로고침 시 진행 유지됨 (sessionStorage)
   - 개선: 서버에도 저장하여 다른 기기에서 이어하기

---

## 📞 연락처 및 협업

### 프로젝트 담당자

- **기획**: Product Team
- **디자인**: Design Team
- **프론트엔드**: Development Team
- **백엔드 연동**: (예정)

### 관련 문서

- [프로젝트 CLAUDE.md](../../CLAUDE.md)
- [MVP API 명세서](../api/MVP_API_SPEC.md)
- [폼 데이터 스펙](../design/FORM_DATA.md)
- [사용자 플로우](../design/USER_FLOWS.md)

### 구현 위치

**소스 코드**: `front/src/app/test/2/`
**데이터 파일**: `front/src/data/`, `front/src/contexts/`

---

**문서 버전**: 1.0
**최종 업데이트**: 2025-11-15
**작성자**: Documentation Team
**상태**: Phase 1 완료 (프론트엔드)
