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

    // 답변 선택 시 자동으로 다음으로 이동
    setTimeout(() => {
      if (currentQuestion === totalQuestions) {
        // 마지막 질문 - 결과 계산 후 로딩 페이지로
        calculateResult();
        router.push("/test/1/loading");
      } else {
        nextQuestion();
      }
    }, 300); // 선택 효과를 보여주기 위한 짧은 딜레이
  };

  const handlePrev = () => {
    prevQuestion();
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 md:p-6 lg:p-8">
      <div className="w-full max-w-[1080px] min-h-screen bg-neutral-50 flex flex-col items-center justify-between py-12 md:py-16 lg:py-20 xl:py-24 px-8 md:px-12 lg:px-14 xl:px-16 relative overflow-hidden">
        {/* 상단 버튼 영역 */}
        <div className="absolute top-6 md:top-7 lg:top-8 left-6 md:left-7 lg:left-8 right-6 md:right-7 lg:right-8 flex justify-between items-center">
          <Link
            href="/list"
            className="px-4 md:px-5 lg:px-6 py-2 md:py-2.5 lg:py-3 text-xs md:text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
          >
            ← 목록으로
          </Link>
          {currentQuestion > 1 && (
            <button
              onClick={handlePrev}
              className="px-6 md:px-7 lg:px-8 py-3 md:py-3.5 lg:py-4 border-2 border-neutral-300 text-neutral-600 text-base md:text-lg font-light hover:bg-neutral-100 hover:border-neutral-400 transition-all duration-200"
            >
              ← 이전
            </button>
          )}
        </div>

        {/* 상단 로고 */}
        <div className="flex flex-col items-center gap-3 md:gap-3.5 lg:gap-4 mt-12 md:mt-14 lg:mt-16 xl:mt-20">
          <div className="w-20 h-20 md:w-22 md:h-22 lg:w-24 lg:h-24 bg-neutral-900 rounded-sm flex items-center justify-center">
            <span className="text-white text-lg md:text-lg lg:text-xl font-light tracking-wider">LEADME</span>
          </div>
        </div>

        {/* 진행도 */}
        <div className="w-full max-w-2xl">
          <div className="flex justify-between items-center mb-6 md:mb-7 lg:mb-8">
            <span className="text-neutral-500 text-base md:text-lg">
              {currentQuestion} / {totalQuestions}
            </span>
            <span className="text-neutral-400 text-xs md:text-sm">
              {Math.round((currentQuestion / totalQuestions) * 100)}%
            </span>
          </div>
          <div className="h-1 bg-neutral-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-neutral-900 transition-all duration-300"
              style={{ width: `${(currentQuestion / totalQuestions) * 100}%` }}
            />
          </div>
        </div>

        {/* 질문 영역 */}
        <div className="flex flex-col items-center gap-8 md:gap-10 lg:gap-12 w-full max-w-2xl">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-light text-neutral-900 text-center leading-tight">
            {question.question}
          </h2>

          <div className="w-full space-y-3 md:space-y-3.5 lg:space-y-4">
            {question.options.map((option) => (
              <button
                key={option.id}
                onClick={() => handleAnswer(option.id)}
                className={`w-full p-4 md:p-5 lg:p-6 text-left text-base md:text-lg lg:text-xl border-2 transition-all duration-200 ${
                  currentAnswer === option.id
                    ? "bg-neutral-900 text-white border-neutral-900"
                    : "bg-white text-neutral-700 border-neutral-200 hover:border-neutral-400"
                }`}
              >
                {option.text}
              </button>
            ))}
          </div>
        </div>

        {/* 안내 문구 */}
        <div className="w-full max-w-2xl text-center">
          <p className="text-base md:text-lg text-neutral-500 font-light">
            응답을 선택하시면 자동으로 다음 질문으로 넘어갑니다
          </p>
        </div>

        {/* 하단 장식 선 */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-neutral-300 to-transparent"></div>
      </div>
    </div>
  );
}

export default function Questions1() {
  return (
    <SurveyProvider>
      <QuestionContent />
    </SurveyProvider>
  );
}
