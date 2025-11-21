# Rythmi 피부 진단 설문 구현

**고객사**: Rythmi (리듬아이)
**버전**: 1.0
**구현 기간**: 2025-11
**상태**: ✅ Phase 1 완료

---

## 📋 개요

이 디렉토리는 **Rythmi 피부 진단 서비스**의 설문 기능 구현을 포함합니다.

**주요 기능**:
- 10문항 피부 타입 진단 설문
- 9개 차원 스코어 계산 로직
- 5가지 피부 타입 분류 알고리즘
- 맞춤형 스킨케어 루틴 추천
- 개인정보 동의 플로우
- 반응형 디자인 (모든 기기 자동 대응)

**타겟 디바이스**: Surface Pro 13인치 태블릿 (2880×1920, Landscape)

**참고 문서**: [`docs/clients/RYTHMI.md`](../../../../docs/clients/RYTHMI.md)

---

## 🚀 빠른 시작

### 개발 서버 실행

```bash
# 프로젝트 루트에서
cd front
npm run dev
```

### 접속

```
http://localhost:3000/test/2
```

### 페이지 플로우

```
/test/2              시작 화면
  ↓
/test/2/consent      개인정보 동의
  ↓
/test/2/questions    설문 진행 (10문항)
  ↓
/test/2/loading      분석 로딩
  ↓
/test/2/result       결과 및 추천
```

---

## 📂 디렉토리 구조

```
front/src/app/test/2/
├── README.md              # 이 파일
├── layout.js              # 공통 레이아웃 (반응형 디자인)
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
└── SurveyContext.js       # 설문 상태 관리 Context

front/src/data/
├── questions.js           # 10문항 정의
└── resultData.js          # 5가지 피부 타입 정의

front/public/
├── rhythmi_logo_2_white.svg  # 상단 로고
└── rhythmi_logo_1_white.svg  # 하단 로고
```

---

## 🧩 주요 파일 설명

### layout.js

**역할**: 모든 페이지의 공통 레이아웃 (배경, 로고, 장식)

**주요 특징**:
- 반응형 디자인 (vmin/vh 단위)
- 2열 그리드 구조 (`grid-cols-2`)
- 원형 프레임 배경 장식
- 상단/하단 로고 고정 배치

**반응형 코드 예시**:
```javascript
{/* 원형 프레임 - 화면 크기에 자동 비례 */}
<div className="w-[max(128vmin,900px)] h-[max(128vmin,900px)] max-w-[1800px]">

{/* 로고 - 최소/최대값 보장 */}
<div className="w-[clamp(120px,12vmin,180px)] h-[clamp(91px,9vmin,136px)]">
```

### page.js (시작 화면)

**역할**: 사용자 유입 및 동기 부여

**구성**:
- 로고 + 메인 카피
- CTA 버튼 ("시작할게요")
- 소요 시간 표시

### consent/page.js

**역할**: 개인정보 수집 동의 획득

**수집 항목**: 피부 상태, 생활 습관, 환경 정보
**보관 기간**: sessionStorage (브라우저 종료 시 삭제)
**제3자 제공**: 없음

### questions/page.js

**역할**: 10문항 설문 응답 수집

**상태 관리**: `SurveyContext`를 통해 답변 저장

**인터랙션**:
```javascript
답변 선택 → setAnswer() → sessionStorage 저장 → 300ms 지연 후 다음 문항
```

**이전 버튼**: 2번 문항부터 우상단에 표시

### loading/page.js

**역할**: 결과 계산 중 대기 경험 제공

**동작**: 1초 후 자동으로 결과 페이지로 이동

### result/page.js

**역할**: 피부 타입 진단 결과 및 루틴 추천 제공

**구성**:
- 피부 타입 이모지 및 이름
- 핵심 케어 포인트
- 추천 루틴 (토너 → 세럼 → 크림)
- "다시 시작하기" 버튼

---

## 🎨 반응형 디자인 구현

### 문제 상황

배포 환경에서 다른 기기로 접속 시 모든 요소들이 의도보다 작게 표시되는 문제 발생.

**원인**: 고정 픽셀 값 사용 + 고해상도 소형 기기(Surface Pro)의 픽셀 밀도

### 해결 방법

#### 1. 상대 단위 사용

```javascript
// vmin: viewport 짧은 쪽의 백분율
w-[85vmin]

// vh: viewport 높이의 백분율
pt-[20vh]
```

#### 2. 최소값 보장 (max 함수)

```javascript
// 화면 비례 또는 최소값 중 큰 것
w-[max(85vmin, 600px)]
```

#### 3. 최대값 제한

```javascript
// 대형 모니터에서 과도하게 커지지 않도록
max-w-[1200px]
```

#### 4. 범위 제한 (clamp 함수)

```javascript
// 최소/이상/최대 범위 자동 조정
w-[clamp(120px, 12vmin, 180px)]
```

### 기기별 동작

**Surface Pro 13인치 (2880×1920)**:
- 원형 프레임: 1800px (최대값 제한)
- 로고: 180px (최대값 사용)

**iPad (1024×768)**:
- 원형 프레임: 983px (화면 비례)
- 로고: 120px (최소값 보장)

**모바일 (375×667)**:
- 원형 프레임: 900px (최소값 사용, overflow로 잘림)
- 로고: 120px (최소값 보장)

**결과**: 모든 기기에서 가독성과 사용성 유지 ✅

---

## 🔄 상태 관리 (SurveyContext)

### Context 구조

**파일 위치**: `front/src/contexts/SurveyContext.js`

**상태**:
```javascript
{
  answers: { q1: "q1a2", q2: "q2a3", ... },  // 설문 응답
  currentQuestion: 1,                         // 현재 문항 (1~10)
  scores: { dry: 12, oily: 2, ... },         // 9개 차원 스코어
  result: "dry_sensitive"                     // 결과 타입
}
```

### 주요 함수

#### setAnswer(questionId, answerId)

답변 저장 및 sessionStorage 동기화

```javascript
const setAnswer = (questionId, answerId) => {
  const newAnswers = { ...answers, [`q${questionId}`]: answerId };
  setAnswers(newAnswers);
  sessionStorage.setItem("surveyAnswers", JSON.stringify(newAnswers));
};
```

#### calculateResult()

스코어 계산 및 결과 타입 결정

```javascript
const calculateResult = () => {
  const scores = calculateScores();          // 9개 차원 스코어 계산
  const resultType = determineResultType(scores);  // 5가지 타입 분류

  setScores(scores);
  setResult(resultType);

  return { scores, resultType, resultData: resultData[resultType] };
};
```

#### reset()

모든 상태 초기화 ("다시 시작하기" 버튼)

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

## 📊 스코어링 시스템

### 9개 차원 스코어

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

### 스코어 계산 로직

**파일 위치**: `front/src/contexts/SurveyContext.js:59`

```javascript
const calculateScores = () => {
  let totalScores = { dry: 0, oily: 0, sensitive: 0, ... };

  Object.entries(answers).forEach(([questionKey, answerId]) => {
    const question = questions.find(q => `q${q.id}` === questionKey);
    const option = question.options.find(opt => opt.id === answerId);

    // 각 답변의 scores를 누적
    if (option && option.scores) {
      Object.entries(option.scores).forEach(([dimension, value]) => {
        totalScores[dimension] += value;
      });
    }
  });

  return totalScores;
};
```

### 결과 타입 분류

**파일 위치**: `front/src/contexts/SurveyContext.js:84`

```javascript
const determineResultType = (scores) => {
  // 우선순위 순서대로 조건 체크
  if (scores.dry >= 6 && scores.sensitive >= 4)
    return "dry_sensitive";      // 건조 민감형

  if (scores.dry >= 6 && scores.indoor >= 2)
    return "dry_indoor";          // 건조 실내형

  if (scores.sensitive >= 6 && (scores.outdoor >= 2 || scores.active >= 2))
    return "sensitive_protected"; // 민감 보호형

  if (scores.active >= 4 && (scores.dry >= 2 || scores.sensitive >= 2))
    return "active_balance";      // 활동 밸런스형

  return "minimal_care";          // 미니멀 케어형 (fallback)
};
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

텍스트:
- 주요: orange-900
- 서브: orange-700, orange-600
```

### 타이포그래피 (태블릿 최적화)

```javascript
제목: text-7xl ~ text-9xl (84px ~ 128px)
부제: text-4xl ~ text-5xl (36px ~ 48px)
본문: text-3xl ~ text-4xl (30px ~ 36px)
라벨: text-2xl ~ text-3xl (24px ~ 30px)
```

### 버튼 스타일

**CTA 버튼**:
```javascript
크기: h-32 ~ h-40 (128~160px 높이)
너비: min-w-[400px]
모양: rounded-full
배경: gradient (from-orange-500 to-yellow-500)
효과: hover:scale-105, active:scale-95
```

**설문 옵션 버튼**:
```javascript
크기: h-28 ~ h-32 (112~128px 높이)
기본: bg-white/90, border-4 border-orange-200
선택됨: gradient + scale-105
```

---

## 🔧 커스터마이징 가이드

### 질문 수정

**파일**: `front/src/data/questions.js`

```javascript
{
  id: 1,
  question: "세안 후 피부가 어떻게 느껴지나요?",
  options: [
    {
      id: "q1a1",
      text: "매우 건조하고 당긴다",
      scores: { dry: 3 }  // 스코어 조정
    },
    // ... 옵션 추가/수정
  ],
  category: "피부"
}
```

### 결과 타입 수정

**파일**: `front/src/data/resultData.js`

```javascript
dry_sensitive: {
  emoji: "🌸",
  type: "건조 민감형",
  description: "건조함과 민감함이 동시에 나타나는 피부예요",
  carePoints: [
    "충분한 수분 공급이 최우선이에요",
    // ... 케어 포인트 수정
  ],
  routine: "저자극 토너 → 보습 세럼 → 장벽 크림"
}
```

### 스코어 기준 조정

**파일**: `front/src/contexts/SurveyContext.js:84`

```javascript
// 분류 기준 조정
if (scores.dry >= 6 && scores.sensitive >= 4)  // 임계값 변경
  return "dry_sensitive";
```

### 디자인 커스터마이징

#### 브랜드 컬러 변경

**파일**: 각 페이지의 `className` 수정

```javascript
// 오렌지 → 블루로 변경 예시
from-orange-500 to-yellow-500  →  from-blue-500 to-cyan-500
bg-orange-50  →  bg-blue-50
text-orange-900  →  text-blue-900
```

#### 반응형 크기 조정

**파일**: `front/src/app/test/2/layout.js`

```javascript
// 원 크기 변경
w-[max(128vmin,900px)]  →  w-[max(100vmin,700px)]

// 로고 크기 변경
w-[clamp(120px,12vmin,180px)]  →  w-[clamp(100px,10vmin,150px)]
```

---

## 🐛 트러블슈팅

### 문제: 다른 기기에서 요소들이 너무 작게 보임

**원인**: 반응형 디자인이 적용되지 않음

**해결**:
1. `layout.js`에서 고정 픽셀 값이 남아있는지 확인
2. `vmin`, `vh`, `max()`, `clamp()` 사용 확인
3. 브라우저 캐시 초기화 후 재테스트

### 문제: 설문 진행 중 새로고침하면 답변이 사라짐

**원인**: sessionStorage 로드 로직 누락

**해결**: `SurveyContext.js`에서 초기화 시 sessionStorage 확인

```javascript
useEffect(() => {
  const saved = sessionStorage.getItem("surveyAnswers");
  if (saved) {
    setAnswers(JSON.parse(saved));
  }
}, []);
```

### 문제: 결과 페이지에서 "결과를 불러오는 중..." 무한 표시

**원인**: `calculateResult()`가 호출되지 않음

**해결**:
1. `questions/page.js`에서 마지막 문항 응답 시 `calculateResult()` 호출 확인
2. `result/page.js`의 `useEffect`에서 조건 확인

```javascript
useEffect(() => {
  if (!result) {
    calculateResult();
  }
}, [result, calculateResult]);
```

### 문제: 로고 이미지가 표시되지 않음

**원인**: SVG 파일 경로 오류

**해결**:
1. `front/public/` 디렉토리에 파일 존재 확인
2. 파일명 정확히 확인 (`rhythmi_logo_2_white.svg`)
3. Next.js 개발 서버 재시작

---

## 📈 성능 최적화

### 현재 구현

- ✅ sessionStorage 사용 (서버 요청 없음)
- ✅ CSS 네이티브 함수 사용 (JS 계산 불필요)
- ✅ 이미지 최적화 (Next.js Image 컴포넌트)
- ✅ 미디어 쿼리 없음 (단일 코드로 모든 기기 대응)

### 향후 개선 계획

- [ ] 이미지 WebP 포맷 전환
- [ ] 코드 스플리팅 (페이지별 번들 분리)
- [ ] 스코어 계산 Web Worker 이동
- [ ] 백엔드 연동 시 응답 캐싱

---

## 🔗 관련 문서

- [Rythmi 케이스 스터디](../../../../docs/clients/RYTHMI.md) - 전체 프로젝트 문서
- [프로젝트 CLAUDE.md](../../../../CLAUDE.md) - 프로젝트 개요
- [MVP API 명세서](../../../../docs/api/MVP_API_SPEC.md) - API 연동 계획

---

## 📞 연락처

**문의사항이나 개선 제안**:
- 기획: Product Team
- 디자인: Design Team
- 개발: Development Team

---

**문서 버전**: 1.0
**최종 업데이트**: 2025-11-21
**작성자**: Development Team
