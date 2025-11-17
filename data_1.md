# 질문/응답/결과 설계 문서

## 1. 개요

키오스크 피부 진단 시스템의 질문, 응답, 결과 출력 설계

- **질문 수**: 10문항 (10분 이내 완료 목표)
- **결과 유형**: 5가지 (간소화)
- **데이터 저장**: 프론트엔드 세션 스토리지 (임시)
- **결과 계산**: 가중치 기반 스코어링

---

## 2. 선별된 질문 목록 (10문항)

### Part A. 피부 본질 (4문항)

**Q1. 세안 후 피부 느낌**
- 매우 건조하고 당긴다 (dry: +3)
- 약간 건조하다 (dry: +2)
- 편안하다 (normal: +2)
- 살짝 유분이 있다 (oily: +1)
- 유분이 많다 (oily: +2)cd

**Q2. 오후 유분 상태**
- 여전히 건조 (dry: +3)
- 코 주변만 유분 (normal: +2)
- T존 유분 (combination: +2)
- 전체 유분 (oily: +2)

**Q3. 피부 민감도**
- 매우 자주 붉어진다 (sensitive: +3)
- 자주 붉어진다 (sensitive: +2)
- 가끔 있다 (sensitive: +1)
- 거의 없다 (normal: +2)

**Q4. 환절기 피부 변화**
- 항상 크게 영향 (sensitive: +3)
- 자주 영향 (sensitive: +2)
- 가끔 변화 (sensitive: +1)
- 거의 없다 (normal: +2)

### Part B. 환경 민감도 (2문항)

**Q5. 미세먼지 반응**
- 바로 반응 (sensitive: +3)
- 자주 민감 (sensitive: +2)
- 가끔 민감 (sensitive: +1)
- 거의 없다 (normal: +2)

**Q6. 새 제품 반응**
- 거의 항상 반응 (sensitive: +3)
- 종종 반응 (sensitive: +2)
- 가끔 반응 (sensitive: +1)
- 거의 없다 (normal: +2)

### Part C. 생활 환경 (2문항)

**Q7. 주요 활동 환경**
- 실내 정적 공간 (indoor: +2)
- 다양한 공간 이동 (active: +2)
- 외근/야외 많음 (outdoor: +2)
- 운동 시설 (active: +3)

**Q8. 공기 환경**
- 건조한 냉난방 (dry: +2)
- 밀폐 공간 (indoor: +2)
- 온도 변화 큼 (outdoor: +2)
- 다양한 공간 이동 (active: +2)

### Part D. 케어 습관 (2문항)

**Q9. 관리 루틴**
- 거의 안함 (minimal: +3)
- 기본만 (minimal: +2)
- 여러 단계 (active: +2)
- 매우 적극적 (active: +3)

**Q10. 이동 시 휴대**
- 거의 안 가져감 (minimal: +2)
- 가끔 (minimal: +1)
- 미스트 필수 (active: +2)
- 세트로 휴대 (active: +3)

---

## 3. 간소화된 결과 유형 (5가지)

### 1. 건조 민감형 (Dry Sensitive)
**특징**: 건조 + 민감도 높음
- 건조 스코어 ≥ 6 AND 민감 스코어 ≥ 4
- 키워드: 수분, 진정, 장벽 강화

**결과 출력**:
```
타입: "건조 민감형"
설명: "건조함과 민감함이 동시에 나타나는 피부예요"
케어 포인트:
- 충분한 수분 공급
- 자극 최소화
- 장벽 강화 집중
추천 루틴: 저자극 토너 → 보습 세럼 → 장벽 크림
```

### 2. 건조 실내형 (Dry Indoor)
**특징**: 건조 + 실내 환경
- 건조 스코어 ≥ 6 AND 실내 스코어 ≥ 2
- 키워드: 수분, 보습, 미스트

**결과 출력**:
```
타입: "건조 실내형"
설명: "실내 환경에서 수분이 부족한 피부예요"
케어 포인트:
- 지속 보습
- 수분 미스트 수시 사용
- 세라마이드 케어
추천 루틴: 수분 토너 → 세라마이드 세럼 → 보습 크림 + 미스트
```

### 3. 민감 보호형 (Sensitive Protected)
**특징**: 높은 민감도 + 외부 환경
- 민감 스코어 ≥ 6 AND (야외 스코어 ≥ 2 OR 이동 스코어 ≥ 2)
- 키워드: 진정, 보호, 항산화

**결과 출력**:
```
타입: "민감 보호형"
설명: "외부 자극에 쉽게 반응하는 예민한 피부예요"
케어 포인트:
- 진정 케어
- 외부 자극 차단
- 보호막 형성
추천 루틴: 진정 토너 → 시카 세럼 → 보호 크림
```

### 4. 활동 밸런스형 (Active Balance)
**특징**: 활동량 많음 + 밸런스 필요
- 활동 스코어 ≥ 4 AND 관리 스코어 ≥ 2
- 키워드: 쿨링, 밸런스, 간편

**결과 출력**:
```
타입: "활동 밸런스형"
설명: "활동적인 라이프스타일에 맞는 간편한 케어가 필요해요"
케어 포인트:
- 빠른 흡수
- 쿨링 효과
- 휴대 간편
추천 루틴: 쿨링 토너 → 가벼운 세럼 → 산뜻한 크림 + 휴대용 미스트
```

### 5. 미니멀 케어형 (Minimal Care)
**특징**: 기본 케어 + 낮은 고민
- 민감 스코어 ≤ 3 AND 건조 스코어 ≤ 4 AND 미니멀 스코어 ≥ 3
- 키워드: 심플, 필수, 올인원

**결과 출력**:
```
타입: "미니멀 케어형"
설명: "큰 고민 없이 간단한 케어만 필요한 피부예요"
케어 포인트:
- 필수만 간단히
- 올인원 제품
- 시간 절약
추천 루틴: 올인원 토너 → 가벼운 로션 (필요시 미스트)
```

---

## 4. 데이터 구조

### 4.1 질문 데이터 구조

```javascript
const questions = [
  {
    id: 1,
    category: "skin",
    question: "세안 후 피부가 어떻게 느껴지나요?",
    options: [
      {
        id: "q1a1",
        text: "매우 건조하고 당긴다",
        scores: { dry: 3 }
      },
      {
        id: "q1a2",
        text: "약간 건조하다",
        scores: { dry: 2 }
      },
      {
        id: "q1a3",
        text: "편안하다",
        scores: { normal: 2 }
      },
      {
        id: "q1a4",
        text: "살짝 유분이 있다",
        scores: { oily: 1 }
      },
      {
        id: "q1a5",
        text: "유분이 많다",
        scores: { oily: 2 }
      }
    ]
  },
  // ... 나머지 질문들
];
```

### 4.2 응답 저장 구조

```javascript
// sessionStorage에 저장
const userAnswers = {
  q1: "q1a1",  // 선택한 옵션 ID
  q2: "q2a3",
  q3: "q3a2",
  // ... 10개 질문의 답변
  timestamp: "2025-01-09T10:30:00Z"
};
```

### 4.3 스코어 집계 구조

```javascript
const scores = {
  dry: 0,        // 건조도
  oily: 0,       // 유분도
  sensitive: 0,  // 민감도
  normal: 0,     // 정상
  indoor: 0,     // 실내
  outdoor: 0,    // 야외
  active: 0,     // 활동
  minimal: 0     // 미니멀
};
```

---

## 5. 결과 계산 로직

### 5.1 스코어 계산

```javascript
function calculateScores(userAnswers) {
  const scores = {
    dry: 0,
    oily: 0,
    sensitive: 0,
    normal: 0,
    indoor: 0,
    outdoor: 0,
    active: 0,
    minimal: 0
  };

  // 각 답변의 스코어 집계
  Object.entries(userAnswers).forEach(([questionId, answerId]) => {
    const question = questions.find(q => q.id === parseInt(questionId.slice(1)));
    const answer = question.options.find(opt => opt.id === answerId);

    // 스코어 합산
    Object.entries(answer.scores).forEach(([key, value]) => {
      scores[key] += value;
    });
  });

  return scores;
}
```

### 5.2 결과 타입 결정

```javascript
function determineResultType(scores) {
  // 우선순위 기반 결정

  // 1. 건조 민감형
  if (scores.dry >= 6 && scores.sensitive >= 4) {
    return "dry_sensitive";
  }

  // 2. 건조 실내형
  if (scores.dry >= 6 && scores.indoor >= 2) {
    return "dry_indoor";
  }

  // 3. 민감 보호형
  if (scores.sensitive >= 6 && (scores.outdoor >= 2 || scores.active >= 2)) {
    return "sensitive_protected";
  }

  // 4. 활동 밸런스형
  if (scores.active >= 4 && (scores.dry >= 2 || scores.sensitive >= 2)) {
    return "active_balance";
  }

  // 5. 미니멀 케어형 (기본값)
  return "minimal_care";
}
```

### 5.3 동점 처리

우선순위:
1. 건조 민감형 (가장 세심한 케어 필요)
2. 민감 보호형
3. 건조 실내형
4. 활동 밸런스형
5. 미니멀 케어형 (fallback)

---

## 6. 데이터 흐름

```
[시작 화면]
    ↓
[정보 동의]
    ↓
[질문 1] → sessionStorage 저장
    ↓
[질문 2] → sessionStorage 업데이트
    ↓
  ... (10문항)
    ↓
[질문 10] → 최종 답변 완료
    ↓
[AI 분석 중] (1초 로딩)
    ↓
[스코어 계산] → calculateScores()
    ↓
[결과 결정] → determineResultType()
    ↓
[결과 페이지 표시]
    ↓
[다시 시작] → sessionStorage 삭제 → 시작 화면
```

---

## 7. 상태 관리

### 7.1 React Context 구조

```javascript
// contexts/SurveyContext.js
const SurveyContext = createContext({
  answers: {},           // 사용자 답변
  currentQuestion: 1,    // 현재 질문 번호
  scores: null,          // 계산된 스코어
  result: null,          // 결과 타입
  setAnswer: () => {},   // 답변 저장
  nextQuestion: () => {},
  prevQuestion: () => {},
  calculateResult: () => {},
  reset: () => {}        // 초기화
});
```

### 7.2 Hook 사용 예시

```javascript
function QuestionPage() {
  const {
    currentQuestion,
    setAnswer,
    nextQuestion
  } = useSurvey();

  const handleAnswer = (optionId) => {
    setAnswer(currentQuestion, optionId);
    nextQuestion();
  };

  return (
    // UI 렌더링
  );
}
```

---

## 8. 결과 페이지 데이터 맵

```javascript
const resultData = {
  dry_sensitive: {
    type: "건조 민감형",
    emoji: "🌸",
    description: "건조함과 민감함이 동시에 나타나는 피부예요",
    carePoints: [
      "충분한 수분 공급",
      "자극 최소화",
      "장벽 강화 집중"
    ],
    routine: "저자극 토너 → 보습 세럼 → 장벽 크림",
    color: "pink" // UI 색상 테마
  },
  dry_indoor: {
    type: "건조 실내형",
    emoji: "💧",
    description: "실내 환경에서 수분이 부족한 피부예요",
    carePoints: [
      "지속 보습",
      "수분 미스트 수시 사용",
      "세라마이드 케어"
    ],
    routine: "수분 토너 → 세라마이드 세럼 → 보습 크림 + 미스트",
    color: "blue"
  },
  sensitive_protected: {
    type: "민감 보호형",
    emoji: "🛡️",
    description: "외부 자극에 쉽게 반응하는 예민한 피부예요",
    carePoints: [
      "진정 케어",
      "외부 자극 차단",
      "보호막 형성"
    ],
    routine: "진정 토너 → 시카 세럼 → 보호 크림",
    color: "green"
  },
  active_balance: {
    type: "활동 밸런스형",
    emoji: "⚡",
    description: "활동적인 라이프스타일에 맞는 간편한 케어가 필요해요",
    carePoints: [
      "빠른 흡수",
      "쿨링 효과",
      "휴대 간편"
    ],
    routine: "쿨링 토너 → 가벼운 세럼 → 산뜻한 크림 + 휴대용 미스트",
    color: "orange"
  },
  minimal_care: {
    type: "미니멀 케어형",
    emoji: "✨",
    description: "큰 고민 없이 간단한 케어만 필요한 피부예요",
    carePoints: [
      "필수만 간단히",
      "올인원 제품",
      "시간 절약"
    ],
    routine: "올인원 토너 → 가벼운 로션 (필요시 미스트)",
    color: "gray"
  }
};
```

---

## 9. 구현 우선순위

### Phase 1: 데이터 구조 구현
- [ ] questions.js - 질문 데이터
- [ ] resultData.js - 결과 데이터
- [ ] SurveyContext.js - 상태 관리

### Phase 2: 로직 구현
- [ ] calculateScores() - 스코어 계산
- [ ] determineResultType() - 결과 결정
- [ ] sessionStorage 관리

### Phase 3: UI 구현
- [ ] QuestionPage 컴포넌트
- [ ] ProgressBar 컴포넌트
- [ ] ResultPage 컴포넌트

### Phase 4: 시안별 적용
- [ ] 시안 1 스타일
- [ ] 시안 2 스타일
- [ ] 시안 3 스타일

---

## 10. 테스트 시나리오

### 시나리오 1: 건조 민감형
- Q1: a1 (dry+3)
- Q2: a1 (dry+3)
- Q3: a1 (sensitive+3)
- Q4: a1 (sensitive+3)
- Q5: a1 (sensitive+3)
- 예상 결과: dry_sensitive

### 시나리오 2: 미니멀 케어형
- 대부분 "거의 없다" / "편안하다" 선택
- 예상 결과: minimal_care

### 시나리오 3: 활동 밸런스형
- Q7: a4 (active+3)
- Q9: a4 (active+3)
- Q10: a4 (active+3)
- 예상 결과: active_balance

---

## 11. 향후 확장 고려사항

### 백엔드 연동 시
- API 엔드포인트: POST /api/survey/submit
- 응답 저장: DB에 타임스탬프와 함께 저장
- 분석 기능: 사용자 피부 타입 통계

### AI 추천 고려 시
- 외부 AI API 호출 레이어
- 더 정교한 결과 분석
- 개인화된 제품 추천

### 다국어 지원 시
- i18n 리소스 분리
- 질문/결과 다국어 데이터
