"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { questions } from "@/data/questions";
import { resultData } from "@/data/resultData";

const SurveyContext = createContext();

export function SurveyProvider({ children }) {
  const [answers, setAnswers] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [scores, setScores] = useState(null);
  const [result, setResult] = useState(null);

  // sessionStorage에서 답변 불러오기
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedAnswers = sessionStorage.getItem("surveyAnswers");
      if (savedAnswers) {
        setAnswers(JSON.parse(savedAnswers));
      }
    }
  }, []);

  // 답변 저장
  const setAnswer = (questionOrdinal, answerId) => {
    const newAnswers = {
      ...answers,
      [`q${questionOrdinal}`]: answerId
    };
    setAnswers(newAnswers);

    // sessionStorage에 저장
    if (typeof window !== "undefined") {
      sessionStorage.setItem("surveyAnswers", JSON.stringify(newAnswers));
    }
  };

  // 다음 질문
  const nextQuestion = () => {
    if (currentQuestion < questions.length) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  // 이전 질문
  const prevQuestion = () => {
    if (currentQuestion > 1) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  // 스코어 계산 (질문 인덱스 기반으로 안전 처리)
  const calculateScores = () => {
    const calculatedScores = {
      dry: 0,
      oily: 0,
      sensitive: 0,
      normal: 0,
      indoor: 0,
      outdoor: 0,
      active: 0,
      minimal: 0,
      combination: 0
    };

    Object.entries(answers).forEach(([questionKey, answerId]) => {
      const ordinal = parseInt(questionKey.slice(1), 10); // 1-based
      const idx = ordinal - 1;
      const question = questions[idx];
      if (!question) return;

      const answer = question.options?.find(opt => opt.id === answerId);
      if (!answer || !answer.scores) return; // 성별/연령대 등 점수 없는 문항 무시

      Object.entries(answer.scores).forEach(([key, value]) => {
        calculatedScores[key] += value;
      });
    });

    return calculatedScores;
  };

  // 결과 타입 결정 (8가지 타입)
  const determineResultType = (scores) => {
    // 우선순위: 특징이 가장 뚜렷한 순서대로

    // 1. 마음처럼 여린 피부결형 - sensitive가 압도적으로 높은 경우
    if (scores.sensitive >= 9) {
      return "sensitive_fragile";
    }

    // 2. 열과 속도로 달리는 활력형 - active 매우 높고 oily도 있는 경우
    if (scores.active >= 7 && scores.oily >= 2) {
      return "active_energetic";
    }

    // 3. 땀과 샤워 후의 고요형 - active 높고 oily 있는 경우
    if (scores.active >= 5 && scores.oily >= 1) {
      return "post_workout";
    }

    // 4. 먼지와 마찰 속의 도시 탐험가형 - outdoor 있고 sensitive 높은 경우
    if (scores.outdoor >= 2 && scores.sensitive >= 6) {
      return "urban_explorer";
    }

    // 5. 화면 빛에 지는 오후의 얼굴형 - indoor 높고 sensitive 높은 경우
    if (scores.indoor >= 3 && scores.sensitive >= 4) {
      return "screen_fatigue";
    }

    // 6. 오후 3시 사무실의 갈증형 - dry 높고 indoor 높은 경우
    if (scores.dry >= 5 && scores.indoor >= 2) {
      return "office_thirst";
    }

    // 7. 바람 속을 걷는 도시 루틴러형 - outdoor 환경에서 활동
    if (scores.outdoor >= 2 && (scores.combination >= 1 || scores.dry >= 3)) {
      return "city_routine";
    }

    // 8. 가방 속 작은 루틴 수집가형 (fallback 포함)
    // minimal이 높거나, 특별히 두드러진 특징이 없는 경우
    return "minimal_routine";
  };

  // 결과 계산 및 저장
  const calculateResult = () => {
    const calculatedScores = calculateScores();
    const resultType = determineResultType(calculatedScores);

    setScores(calculatedScores);
    setResult(resultType);

    return {
      scores: calculatedScores,
      resultType,
      resultData: resultData[resultType]
    };
  };

  // 초기화
  const reset = () => {
    setAnswers({});
    setCurrentQuestion(1);
    setScores(null);
    setResult(null);

    if (typeof window !== "undefined") {
      sessionStorage.removeItem("surveyAnswers");
    }
  };

  const value = {
    answers,
    currentQuestion,
    scores,
    result,
    setAnswer,
    nextQuestion,
    prevQuestion,
    calculateResult,
    reset,
    totalQuestions: questions.length
  };

  return (
    <SurveyContext.Provider value={value}>
      {children}
    </SurveyContext.Provider>
  );
}

export function useSurvey() {
  const context = useContext(SurveyContext);
  if (!context) {
    throw new Error("useSurvey must be used within SurveyProvider");
  }
  return context;
}
