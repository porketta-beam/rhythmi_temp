"use client";

import { useRouter } from "next/navigation";
import { SurveyProvider, useSurvey } from "@/contexts/SurveyContext";
import { questions } from "@/data/questions";
import Image from "next/image";

function QuestionContent() {
  const router = useRouter();
  const {
    answers,
    currentQuestion,
    setAnswer,
    nextQuestion,
    prevQuestion,
    calculateResult,
    totalQuestions
  } = useSurvey();

  const question = questions[currentQuestion - 1];
  const currentAnswer = answers[`q${currentQuestion}`];

  const handleAnswer = (optionId) => {
    setAnswer(currentQuestion, optionId);

    setTimeout(() => {
      if (currentQuestion === totalQuestions) {
        calculateResult();
        router.push("/test/2/loading");
      } else {
        nextQuestion();
      }
    }, 300);
  };

  const handlePrev = () => {
    prevQuestion();
  };

  return (
    <>
        {/* 이전 버튼 */}
        {currentQuestion > 1 && (
          <button
            onClick={handlePrev}
            className="absolute top-12 right-12 px-12 py-5 bg-white border-4 border-orange-300 text-orange-700 text-3xl font-semibold rounded-full hover:bg-orange-50 transition-all duration-200 shadow-lg"
          >
            ← 이전
          </button>
        )}

        {/* 좌측: 질문과 선택지 */}
        <div className="flex flex-col justify-center gap-16 z-10">
          {/* 로고 */}
          <div className="w-48 h-48 rounded-3xl flex items-center justify-center">
              <Image 
                src="/rhythmi_logo.svg" 
                alt="Rhythmi Logo" 
                width={192} 
                height={192}
                className="w-full h-full rounded-4xl shadow-xl object-contain"
              />
          </div>

          {/* 질문 */}
          <h2 className="text-8xl font-bold text-orange-900 leading-tight">
            {question.question}
          </h2>

          {/* 선택지 */}
          <div className="space-y-6">
            {question.options.map((option) => (
              <button
                key={option.id}
                onClick={() => handleAnswer(option.id)}
                className={`w-full h-32 text-left px-12 text-4xl rounded-3xl border-4 transition-all duration-200 font-semibold shadow-xl flex items-center ${
                  currentAnswer === option.id
                    ? "bg-gradient-to-r from-orange-500 to-yellow-500 text-white border-orange-400 scale-105"
                    : "bg-white/90 text-orange-800 border-orange-200 hover:border-orange-400 hover:scale-102 backdrop-blur-sm"
                }`}
              >
                {option.text}
              </button>
            ))}
          </div>
        </div>

        {/* 우측: 진행도와 카테고리 정보 */}
        <div className="flex flex-col items-center justify-center gap-20 z-10">
          {/* 진행도 원형 표시 */}
          <div className="relative w-[500px] h-[500px]">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="250"
                cy="250"
                r="220"
                stroke="#fdfdfd"
                strokeWidth="40"
                fill="none"
                className="opacity-30"
              />
              <circle
                cx="250"
                cy="250"
                r="220"
                stroke="url(#gradient)"
                strokeWidth="40"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 220}`}
                strokeDashoffset={`${2 * Math.PI * 220 * (1 - currentQuestion / totalQuestions)}`}
                strokeLinecap="round"
                className="transition-all duration-300"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#f97316" />
                  <stop offset="100%" stopColor="#eab308" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-9xl font-bold text-orange-900">
                {currentQuestion}
              </span>
              {/* <span className="text-5xl text-orange-600 font-semibold">
                / {totalQuestions}
              </span> */}
              {/* <span className="text-4xl text-orange-700 font-bold mt-4">
                {Math.round((currentQuestion / totalQuestions) * 100)}%
              </span> */}
            </div>
          </div>

          {/* 카테고리 정보 */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-12 shadow-2xl max-w-xl">
            <div className="flex items-center gap-6 mb-6">
              <span className="text-6xl">🎯</span>
              <h3 className="text-4xl font-bold text-orange-900">
                피부 진단 중
              </h3>
            </div>
            <p className="text-3xl text-orange-700 leading-relaxed">
              {question.category === "skin" && "피부의 상태와 특성을 확인하고 있어요"}
              {question.category === "environment" && "환경에 대한 피부 반응을 확인하고 있어요"}
              {question.category === "lifestyle" && "생활 패턴과 활동 환경을 확인하고 있어요"}
              {question.category === "care" && "선호하는 케어 방식을 확인하고 있어요"}
            </p>
          </div>
        </div>
    </>
  );
}

export default function Questions2() {
  return (
    <SurveyProvider>
      <QuestionContent />
    </SurveyProvider>
  );
}
