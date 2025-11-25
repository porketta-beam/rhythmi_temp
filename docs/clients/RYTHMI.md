# Rythmi 케이스 스터디

**고객사**: Rythmi (리듬아이)
**도메인**: 피부 진단 및 스킨케어 추천 서비스
**구현 기간**: 2025-11
**상태**: ✅ Phase 1.5 완료 (프론트엔드 + AI 분류)
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

## 🤖 AI 분류 시스템 (Phase 1.5)

### 개요

**구현 일자**: 2025-11-25
**구현 범위**: OpenAI GPT-4o-mini 기반 피부 타입 자동 분류
**Fallback**: 클라이언트 사이드 스코어링 로직

### 아키텍처

#### 분류 흐름

```
사용자 응답 수집
    ↓
프론트엔드 (SurveyContext.js)
    ↓ API 호출 (POST /api/survey/analyze)
서버 (FastAPI)
    ↓
AI Classifier (GPT-4o-mini)
    ├─ 성공 → 결과 반환
    └─ 실패 → Fallback Classifier (rule-based)
         ├─ 성공 → 결과 반환
         └─ 실패 → Client Fallback
```

#### 기술 스택

**백엔드**:
- FastAPI (Python)
- OpenAI API (GPT-4o-mini, temperature=0)
- Supabase (PostgreSQL + PostgREST)

**프론트엔드**:
- Context API 상태 관리
- sessionStorage persistence

### AI 프롬프트 설계

#### SYSTEM_PROMPT

```python
You are a professional skin type classifier for Rythmi.
Analyze survey responses and classify into ONE of these 8 types:

1. office_thirst - 오후 3시 사무실의 갈증형 (건조 + 실내)
2. city_routine - 바람 속을 걷는 도시 루틴러형 (야외 + 복합/건조)
3. post_workout - 땀과 샤워 후의 고요형 (활동 + 지성)
4. minimal_routine - 가방 속 작은 루틴 수집가형 (미니멀 케어)
5. screen_fatigue - 화면 빛에 지는 오후의 얼굴형 (실내 + 민감)
6. sensitive_fragile - 마음처럼 여린 피부결형 (매우 민감)
7. urban_explorer - 먼지와 마찰 속의 도시 탐험가형 (야외 + 민감)
8. active_energetic - 열과 속도로 달리는 활력형 (매우 활동적 + 지성)

CRITICAL RULES:
- You MUST choose the BEST FIT type from the 8 options above
- Return ONLY the English key (e.g., "office_thirst")
- NO explanations, NO Korean text, NO additional words
- Even if patterns are unclear, select the type with the strongest matching characteristics
```

**핵심 개선 포인트**:
- ❌ 제거: `"If uncertain → minimal_routine"` (AI 편향 발생 원인)
- ✅ 추가: `"You MUST choose the BEST FIT"` (강제 선택)
- ✅ 추가: `"Even if patterns unclear, select strongest match"` (escape 방지)

#### USER_PROMPT 구조

```python
다음은 사용자의 피부 진단 설문 응답입니다:

- 성별: [여성/남성]
- 연령대: [20대/30대/...]

Q1. 세안 후 피부가 어떻게 느껴지나요?
답변: [매우 건조하고 당긴다 / 약간 건조하다 / ...]

Q2. 오후가 되면 유분이 어떻게 느껴지나요?
답변: [여전히 건조하다 / 코 주변만 살짝 유분 / ...]

... (10문항 전체)

위 응답을 바탕으로 가장 적합한 피부 타입 하나를 영문 키로만 반환하세요.
```

### API 연동 구현

#### 프론트엔드 (SurveyContext.js)

**답변 키 변환**:
```javascript
// 문제: q1, q2, q3... 형식 (UI 표시용)
// 해결: API 전송 전 실제 질문 ID로 변환
const transformedAnswers = {};
Object.keys(answers).forEach((key) => {
  const ordinal = parseInt(key.substring(1));  // q1 → 1
  const questionId = questions[ordinal - 1]?.id;  // 1 → questions[0].id (100)
  if (questionId !== undefined) {
    transformedAnswers[questionId.toString()] = answers[key];
  }
});

// 결과: { "100": "gender_female", "101": "age_20s", "1": "q1a1", ... }
```

**AI 분석 호출**:
```javascript
const response = await fetch(`${API_BASE}/api/survey/analyze`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    member_id: memberId,
    share_url: 'test/2',
    responses: transformedAnswers
  })
});

const data = await response.json();
// data.data.result_type: "office_thirst"
// data.data.source: "ai" | "fallback" | "client_fallback"
```

#### 백엔드 (FastAPI)

**파일 구조**:
```
server/
├── main.py                    # 진입점, 로깅 설정
├── api/
│   └── survey_analyzer.py    # POST /api/survey/analyze
├── services/
│   ├── classifier.py          # 통합 분류기 (AI → Fallback)
│   ├── ai_classifier.py       # OpenAI GPT-4o-mini 호출
│   └── fallback_classifier.py # Rule-based 백업
├── config/
│   └── ai_config.py           # SYSTEM_PROMPT, 설정
└── db/
    └── supabase_client.py     # Supabase 연동
```

**분류 로직 (services/classifier.py)**:
```python
async def classify_with_fallback(answers: Dict[str, str]):
    # 1단계: AI 분류 시도
    ai_result, ai_error = await classify_skin_type(answers)
    if ai_result:
        return ai_result, "ai", None

    # 2단계: Fallback 실행
    if AIConfig.ENABLE_FALLBACK:
        fallback_result = fallback_classify(answers)
        return fallback_result, "fallback", ai_error

    # 완전 실패
    return None, "none", ai_error
```

### 정적 모델 이미지 적용

**배경**: 이모지 대신 실제 모델 사진 사용으로 브랜드 강화

**구현 위치**: `/public/model_1.jpg` ~ `/public/model_8.jpg`

#### resultData.js 매핑

```javascript
export const resultData = {
  office_thirst: {
    type: "오후 3시 사무실의 갈증형",
    emoji: "💧",  // 백업용
    modelImage: "/model_1.jpg",  // ← 추가
    description: "...",
    carePoints: ["..."],
    routine: "..."
  },
  // ... 8가지 타입 모두 model_1.jpg ~ model_8.jpg 매핑
};
```

#### Result 페이지 (result/page.js)

```javascript
import Image from "next/image";

<div className="relative w-[300px] h-[300px] rounded-full overflow-hidden shadow-2xl border-4 border-orange-300">
  <Image
    src={data.modelImage}
    alt={data.type}
    fill
    className="object-cover"
    priority
    sizes="300px"
  />
</div>
```

#### Share 페이지 (share/page.js)

```javascript
<div className="relative w-[200px] h-[200px] mx-auto rounded-full overflow-hidden...">
  <Image
    src={result.modelImage}
    alt={result.type}
    fill
    className="object-cover"
    priority
    sizes="200px"
  />
</div>
```

### AI 결과 Persistence

**문제**: 페이지 전환 시 AI 결과 손실 (Context는 메모리에만 존재)

**해결**: sessionStorage 동기화

#### 저장 (analyzeWithAI 성공 시)

```javascript
setResult(data.data.result_type);
setResultSource(source);

if (typeof window !== "undefined") {
  sessionStorage.setItem("aiResult", data.data.result_type);
  sessionStorage.setItem("aiResultSource", source);
}
```

#### 복원 (result 페이지 useEffect)

```javascript
useEffect(() => {
  if (!result) {
    // sessionStorage에서 복원 시도
    const savedResult = sessionStorage.getItem("aiResult");
    const savedSource = sessionStorage.getItem("aiResultSource");

    if (savedResult) {
      setResult(savedResult);
      if (savedSource) setResultSource(savedSource);
      return;
    }

    // 복원 실패 시 리다이렉트 or 재계산
    if (!answers || Object.keys(answers).length === 0) {
      router.replace("/test/2");  // Reset 상태
    } else {
      calculateResult();  // 재계산
    }
  }
}, [result, answers]);
```

### 이미지 Preloading

**문제**: loading → result 전환 시 이미지가 늦게 로드되어 빈 공간 노출

**해결**: Native Image API로 preload 후 navigate

#### Loading 페이지

```javascript
async function runAnalysis() {
  const analysisResult = await analyzeWithAI();

  if (analysisResult.success) {
    const resultType = analysisResult.resultType;
    const modelImagePath = resultData[resultType]?.modelImage;

    if (modelImagePath) {
      // 이미지 preload
      const img = new window.Image();
      img.src = modelImagePath;

      img.onload = () => {
        setTimeout(() => router.push("/test/2/result"), 800);
      };

      img.onerror = () => {
        setTimeout(() => router.push("/test/2/result"), 800);
      };
    }
  }
}
```

#### Share 페이지

```javascript
async function fetchResult(id) {
  const response = await fetch(`/api/share/${id}`);
  const data = await response.json();

  if (resultData[data.resultType]) {
    const modelImagePath = resultData[data.resultType]?.modelImage;

    if (modelImagePath) {
      const img = new window.Image();
      img.src = modelImagePath;

      img.onload = () => {
        setResult(data);
        setLoading(false);  // 이미지 로드 후에만 숨김
      };
    }
  }
}
```

### 테스트 및 검증

#### 테스트 스위트 (test_ai_classifier.py)

**8가지 타입 대표 패턴**:
```python
TEST_PATTERNS = {
    "office_thirst": {
        "name": "오후 3시 사무실의 갈증형",
        "answers": {
            "100": "gender_female",
            "101": "age_20s",
            "1": "q1a1",   # 매우 건조
            "2": "q2a1",   # 여전히 건조
            "7": "q7a1",   # 사무실/실내
            "8": "q8a1",   # 건조한 냉난방
            ...
        }
    },
    # ... 7가지 타입 패턴
}
```

**검증 결과**:
```
[ACCURACY] 7/8 (87.5%)
[DIVERSITY] 7/8 types appeared
[MINIMAL_ROUTINE] Ratio: 1/8 (12.5%)  # 정상 범위
```

**테스트 명령어**:
```bash
cd server
python test_ai_classifier.py
```

### 성과 지표

✅ **AI 분류 정확도**: 87.5% (8개 패턴 중 7개 일치)
✅ **타입 다양성**: 7/8 타입 골고루 분류
✅ **minimal_routine 편향 해소**: 80%+ → 12.5%
✅ **응답 시간**: 평균 2-3초 (OpenAI API 호출)
✅ **Fallback 안정성**: AI 실패 시 자동 대체

---

## 🔧 기술적 이슈 및 해결 과정

### 이슈 1: 답변 키 형식 불일치

**발견 일자**: 2025-11-25
**심각도**: 🔴 Critical (AI 분류 실패 원인)

#### 문제 상황

**증상**:
- AI가 거의 모든 응답에 `minimal_routine` 반환 (80%+)
- 테스트 환경에서는 정상 작동 (87.5% 정확도)

**원인 분석**:

서버 로그 확인 결과, 프론트엔드가 잘못된 키 형식으로 데이터 전송:
```python
# 서버가 받은 데이터
[DEBUG] 입력 answers: {
    'q1': 'gender_male',  # ❌ 성별은 "100" 키여야 함
    'q2': 'age_20s',      # ❌ 연령은 "101" 키여야 함
    'q3': 'q1a1',         # ❌ Q1은 "1" 키여야 함
    ...
}
```

**기대 형식**:
```python
{
    '100': 'gender_female',  # ✅ 성별 질문 ID
    '101': 'age_20s',        # ✅ 연령 질문 ID
    '1': 'q1a1',             # ✅ Q1 ID
    ...
}
```

#### 근본 원인

**UI 표시용 키와 API 키 불일치**:

1. **questions.js 정의**:
```javascript
export const questions = [
  { id: 100, question: "성별을 선택해주세요" },  // 실제 ID: 100
  { id: 101, question: "연령대를 선택해주세요" }, // 실제 ID: 101
  { id: 1, question: "세안 후 피부는?" },        // 실제 ID: 1
  ...
];
```

2. **SurveyContext.js 저장 로직**:
```javascript
const setAnswer = (questionOrdinal, answerId) => {
  const newAnswers = {
    ...answers,
    [`q${questionOrdinal}`]: answerId  // ❌ q1, q2, q3... 형식으로 저장
  };
};
```

3. **API 호출 시 변환 누락**:
```javascript
// ❌ 변환 없이 그대로 전송
body: JSON.stringify({
  responses: answers  // { q1: "...", q2: "...", ... }
})
```

#### 해결 방법

**SurveyContext.js에 변환 로직 추가**:

```javascript
// analyzeWithAI() 함수 내부
const transformedAnswers = {};

Object.keys(answers).forEach((key) => {
  // q1 → 1 (ordinal 추출)
  const ordinal = parseInt(key.substring(1));

  // questions[0].id → 100 (실제 질문 ID)
  const questionId = questions[ordinal - 1]?.id;

  if (questionId !== undefined) {
    transformedAnswers[questionId.toString()] = answers[key];
  }
});

console.log('[DEBUG] 원본 answers:', answers);
console.log('[DEBUG] 변환된 responses:', transformedAnswers);

// ✅ 변환된 데이터로 API 호출
body: JSON.stringify({
  responses: transformedAnswers
})
```

#### 검증

**브라우저 콘솔**:
```javascript
[DEBUG] 원본 answers: {
  q1: "gender_female",
  q2: "age_20s",
  q3: "q1a1",
  ...
}
[DEBUG] 변환된 responses: {
  100: "gender_female",  // ✅
  101: "age_20s",        // ✅
  1: "q1a1",             // ✅
  ...
}
```

**서버 로그**:
```python
INFO: [DEBUG] 입력 answers: {
    '100': 'gender_female',  # ✅
    '101': 'age_20s',        # ✅
    '1': 'q1a1',             # ✅
    ...
}
INFO: [DEBUG] AI raw response: 'office_thirst'  # ✅ 정상 분류
```

---

### 이슈 2: 로깅 레벨 미설정

**발견 일자**: 2025-11-25
**심각도**: 🟡 Medium (디버깅 어려움)

#### 문제 상황

**증상**:
- 서버 로그에 `[DEBUG]` 출력 안 됨
- AI 분류 과정 추적 불가
- 에러 원인 파악 어려움

**원인**:
```python
# main.py에 로깅 설정 없음
# Python 기본 로깅 레벨: WARNING
# → logger.info(), logger.debug() 무시됨
```

#### 해결 방법

**main.py에 로깅 설정 추가**:

```python
import logging

# 로깅 설정
logging.basicConfig(
    level=logging.INFO,
    format='%(levelname)s:     %(name)s - %(message)s'
)
```

#### 결과

```bash
INFO:     services.classifier - === 통합 분류 시작 ===
INFO:     services.ai_classifier - AI 분류 시작 (시도: 1/3)
INFO:     services.ai_classifier - [DEBUG] 입력 answers: {...}
INFO:     services.ai_classifier - [DEBUG] 생성된 user_prompt: ...
INFO:     services.ai_classifier - [DEBUG] AI raw response: 'office_thirst'
INFO:     services.classifier - [SUCCESS] AI 분류 성공: office_thirst
```

---

### 이슈 3: AI minimal_routine 편향

**발견 일자**: 2025-11-25
**심각도**: 🔴 Critical (잘못된 분류 결과)

#### 문제 상황

**증상**:
- 모든 응답이 `minimal_routine`으로 분류됨 (80%+)
- 다양한 응답 패턴에도 동일 결과

**원인**:

**SYSTEM_PROMPT의 escape 조항**:
```python
SYSTEM_PROMPT = """
...
CRITICAL RULES:
- Return ONLY the English key
- If uncertain or missing data, use the fallback type: minimal_routine  # ❌
"""
```

**AI의 해석**:
- "확실하지 않으면 minimal_routine 선택해도 돼"
- → 대부분의 케이스에서 escape 사용
- → 편향 발생

#### 해결 방법

**Prompt 수정 (config/ai_config.py)**:

```python
# ❌ 제거
- If uncertain or missing data, use the fallback type: minimal_routine

# ✅ 추가
CRITICAL RULES:
- You MUST choose the BEST FIT type from the 8 options above
- Return ONLY the English key (e.g., "office_thirst")
- NO explanations, NO Korean text, NO additional words
- Even if patterns are unclear, select the type with the strongest matching characteristics
```

**핵심 변경**:
1. Escape 경로 제거
2. 강제 선택 요구 (`MUST choose`)
3. 불확실한 경우에도 최선 선택 (`strongest matching`)

#### 검증 결과

**Before**:
```
minimal_routine: 80%+
기타 타입: 20%-
```

**After** (test_ai_classifier.py):
```
[ACCURACY] 7/8 (87.5%)
[DIVERSITY] 7/8 types appeared
[MINIMAL_ROUTINE] Ratio: 1/8 (12.5%)  # ✅ 정상 범위
```

---

### 이슈 4: 이미지 늦은 로딩

**발견 일자**: 2025-11-25
**심각도**: 🟡 Medium (사용자 경험 저하)

#### 문제 상황

**증상**:
- loading → result 전환 시 이미지 부분이 빈 공간으로 표시
- 1-2초 후 이미지 나타남
- 사용자에게 불완전한 화면 노출

**원인**:
- `router.push("/test/2/result")` 즉시 실행
- result 페이지 렌더링 시작
- 이미지 다운로드 시작 (늦음)

#### 해결 방법

**Native Image API로 preload**:

```javascript
// loading/page.js
async function runAnalysis() {
  const analysisResult = await analyzeWithAI();

  if (analysisResult.success) {
    const modelImagePath = resultData[resultType]?.modelImage;

    if (modelImagePath) {
      // ✅ 이미지 미리 로드
      const img = new window.Image();
      img.src = modelImagePath;

      img.onload = () => {
        // 이미지 로드 완료 후 navigate
        setTimeout(() => router.push("/test/2/result"), 800);
      };

      img.onerror = () => {
        // 이미지 실패해도 계속 진행
        setTimeout(() => router.push("/test/2/result"), 800);
      };
    }
  }
}
```

**동일 로직 share 페이지에도 적용**:

```javascript
// share/page.js
async function fetchResult(id) {
  // ... API 호출 ...

  const modelImagePath = resultData[resultType]?.modelImage;

  if (modelImagePath) {
    const img = new window.Image();
    img.src = modelImagePath;

    img.onload = () => {
      setResult(resultInfo);
      setLoading(false);  // ✅ 이미지 로드 후에만 숨김
    };
  }
}
```

#### 결과

- ✅ 이미지가 캐시에 로드된 상태로 result 페이지 진입
- ✅ 빈 공간 노출 시간 제거
- ✅ 부드러운 전환 경험 제공

---

### 교훈 및 베스트 프랙티스

#### 1. 키 형식 일관성

**문제**: UI 표시용 키와 API 전송용 키 불일치

**교훈**:
- 데이터 레이어 분리 명확히 (UI ↔ API)
- 변환 로직을 한 곳에 집중 (SurveyContext)
- 디버그 로그로 변환 전후 비교

**적용**:
```javascript
// ✅ Good: 단일 변환 포인트
const transformedAnswers = transformKeysForAPI(answers);

// ❌ Bad: 여러 곳에서 변환 시도
```

#### 2. AI Prompt Engineering

**문제**: Escape 조항으로 인한 편향

**교훈**:
- AI에게 "불확실하면 X" 주지 말것
- "MUST choose" 같은 강제 언어 사용
- Temperature 0으로 결정론적 응답 보장

**적용**:
```python
# ✅ Good: 강제 선택
"You MUST choose the BEST FIT type"

# ❌ Bad: Escape 제공
"If uncertain, use fallback type"
```

#### 3. 로깅 전략

**문제**: 기본 로깅 레벨로 디버깅 불가

**교훈**:
- 프로젝트 시작 시 로깅 설정 필수
- DEBUG 로그를 개발 환경에서 활성화
- 프로덕션에서는 INFO 레벨 사용

**적용**:
```python
# ✅ Good: 명시적 설정
logging.basicConfig(level=logging.INFO)

# ❌ Bad: 기본값 의존
```

#### 4. 이미지 최적화

**문제**: 늦은 이미지 로딩으로 빈 공간 노출

**교훈**:
- 중요 이미지는 preload
- 페이지 전환 전에 로드 완료 확인
- 로딩 상태와 이미지 로드 상태 분리

**적용**:
```javascript
// ✅ Good: Preload 후 navigate
img.onload = () => router.push(...);

// ❌ Bad: 즉시 navigate
router.push(...);
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
