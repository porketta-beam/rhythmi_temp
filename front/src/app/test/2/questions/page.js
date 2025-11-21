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
    analyzeWithAI,
    isAnalyzing,
    analysisError,
    totalQuestions
  } = useSurvey();

  const question = questions[currentQuestion - 1];
  const currentAnswer = answers[`q${currentQuestion}`];

  const handleAnswer = (optionId) => {
    setAnswer(currentQuestion, optionId);

    setTimeout(() => {
      if (currentQuestion === totalQuestions) {
        // 마지막 질문: 즉시 로딩 페이지로 이동
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
            className="absolute top-6 right-6 px-6 py-2 bg-white border-2 border-orange-300 text-orange-700 text-base font-semibold rounded-full hover:bg-orange-50 transition-all duration-200 shadow-lg"
          >
            ← 이전
          </button>
        )}

        {/* 좌측: 질문과 선택지 */}
        <div className="flex flex-col justify-center gap-8 z-10">
          {/* 로고
          <div className="w-24 h-24 rounded-2xl flex items-center justify-center">
              <Image
                src="/rhythmi_logo.svg"
                alt="Rhythmi Logo"
                width={96}
                height={96}
                className="w-full h-full rounded-2xl shadow-xl object-contain"
              />
          </div> */}

          {/* 질문 */}
          <h2 className="text-4xl font-bold text-orange-900 leading-tight break-keep">
            {question.question}
          </h2>

          {/* 선택지 */}
          <div className="space-y-3">
            {question.options.map((option) => (
              <button
                key={option.id}
                onClick={() => handleAnswer(option.id)}
                className={`w-full h-16 text-left px-6 text-xl rounded-2xl border-2 transition-all duration-200 font-semibold shadow-xl flex items-center ${
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
        <div className="flex flex-col items-center justify-center gap-10 z-10">
          {/* 진행도 원형 표시 */}
          <div className="relative w-[250px] h-[250px]">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="125"
                cy="125"
                r="110"
                stroke="#fdfdfd"
                strokeWidth="20"
                fill="none"
                className="opacity-30"
              />
              <circle
                cx="125"
                cy="125"
                r="110"
                stroke="url(#gradient)"
                strokeWidth="20"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 110}`}
                strokeDashoffset={`${2 * Math.PI * 110 * (1 - currentQuestion / totalQuestions)}`}
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
              <span className="text-5xl font-bold text-orange-900">
                {currentQuestion}
              </span>
              {/* <span className="text-2xl text-orange-600 font-semibold">
                / {totalQuestions}
              </span> */}
              {/* <span className="text-xl text-orange-700 font-bold mt-2">
                {Math.round((currentQuestion / totalQuestions) * 100)}%
              </span> */}
            </div>
          </div>

          {/* 카테고리 정보 */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-2xl max-w-xl">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">🎯</span>
              <h3 className="text-xl font-bold text-orange-900">
                피부 진단 중
              </h3>
            </div>
            <p className="text-base text-orange-700 leading-relaxed">
              {question.category === "demographic" && "기본 정보를 확인하고 있어요"}
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
