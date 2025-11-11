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
  const setAnswer = (questionId, answerId) => {
    const newAnswers = {
      ...answers,
      [`q${questionId}`]: answerId
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

  // 스코어 계산
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
      const questionId = parseInt(questionKey.slice(1));
      const question = questions.find(q => q.id === questionId);
      if (!question) return;

      const answer = question.options.find(opt => opt.id === answerId);
      if (!answer) return;

      Object.entries(answer.scores).forEach(([key, value]) => {
        calculatedScores[key] += value;
      });
    });

    return calculatedScores;
  };

  // 결과 타입 결정
  const determineResultType = (scores) => {
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

    // 5. 미니멀 케어형 (fallback)
    return "minimal_care";
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
