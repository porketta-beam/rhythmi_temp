"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { SurveyProvider, useSurvey } from "@/contexts/SurveyContext";
import { questions } from "@/data/questions";

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
    <div className="min-h-screen bg-orange-50 flex items-center justify-center p-8">
      <div className="w-full max-w-[1080px] min-h-screen bg-gradient-to-b from-orange-50 via-yellow-50 to-orange-50 flex flex-col items-center justify-between py-12 md:py-16 lg:py-20 xl:py-24 px-8 md:px-12 lg:px-14 xl:px-16 relative overflow-hidden">
        {/* 배경 장식 */}
        <div className="absolute top-32 right-16 w-96 h-96 bg-orange-200/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-32 left-16 w-96 h-96 bg-yellow-200/30 rounded-full blur-3xl"></div>

        {/* 상단 버튼 영역 */}
        <div className="absolute top-8 left-8 right-8 flex justify-between items-center z-10">
          <Link
            href="/list"
            className="px-6 py-3 text-sm text-orange-700 hover:text-orange-900 transition-colors bg-white/50 rounded-full backdrop-blur-sm"
          >
            ← 목록으로
          </Link>
          {currentQuestion > 1 && (
            <button
              onClick={handlePrev}
              className="px-8 py-4 bg-white border-2 border-orange-300 text-orange-700 text-lg font-semibold rounded-full hover:bg-orange-50 transition-all duration-200"
            >
              ← 이전
            </button>
          )}
        </div>

        {/* 상단 로고 */}
        <div className="flex flex-col items-center gap-4 mt-12 z-10">
          <div className="w-28 h-28 bg-gradient-to-br from-orange-400 to-yellow-400 rounded-3xl flex items-center justify-center shadow-xl">
            <span className="text-white text-2xl font-bold">LeadMe</span>
          </div>
        </div>

        {/* 진행도 */}
        <div className="w-full max-w-2xl z-10">
          <div className="flex justify-between items-center mb-6">
            <span className="text-orange-700 text-2xl font-bold">
              {currentQuestion} / {totalQuestions} 🎯
            </span>
            <span className="text-orange-600 text-lg font-semibold bg-white/60 px-4 py-2 rounded-full backdrop-blur-sm">
              {Math.round((currentQuestion / totalQuestions) * 100)}%
            </span>
          </div>
          <div className="h-3 bg-white/60 rounded-full overflow-hidden backdrop-blur-sm">
            <div
              className="h-full bg-gradient-to-r from-orange-500 to-yellow-500 transition-all duration-300"
              style={{ width: `${(currentQuestion / totalQuestions) * 100}%` }}
            />
          </div>
        </div>

        {/* 질문 영역 */}
        <div className="flex flex-col items-center gap-10 w-full max-w-2xl z-10">
          <h2 className="text-5xl font-bold text-orange-900 text-center leading-tight">
            {question.question}
          </h2>

          <div className="w-full space-y-4">
            {question.options.map((option) => (
              <button
                key={option.id}
                onClick={() => handleAnswer(option.id)}
                className={`w-full p-8 text-left text-2xl rounded-3xl border-4 transition-all duration-200 font-semibold shadow-lg ${
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

        {/* 안내 문구 */}
        <div className="w-full max-w-2xl text-center z-10">
          <p className="text-xl text-orange-700 font-semibold bg-white/60 px-6 py-4 rounded-full backdrop-blur-sm inline-block">
            💡 답변을 선택하면 자동으로 넘어가요!
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Questions2() {
  return (
    <SurveyProvider>
      <QuestionContent />
    </SurveyProvider>
  );
}
