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
        router.push("/test/3/loading");
      } else {
        nextQuestion();
      }
    }, 300);
  };

  const handlePrev = () => {
    prevQuestion();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-8">
      <div className="w-full max-w-[1080px] min-h-screen bg-gradient-to-b from-slate-900 via-purple-950 to-slate-900 flex flex-col items-center justify-between py-14 md:py-20 lg:py-26 xl:py-32 px-10 md:px-14 lg:px-17 xl:px-20 relative overflow-hidden">
        {/* 배경 장식 */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-400/50 to-transparent"></div>
        <div className="absolute top-1/3 right-0 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/3 left-0 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-3xl"></div>

        {/* 상단 버튼 영역 */}
        <div className="absolute top-10 left-10 right-10 flex justify-between items-center z-10">
          <Link
            href="/list"
            className="px-8 py-4 text-sm text-amber-300 hover:text-amber-200 transition-colors border border-amber-300/30 rounded-lg backdrop-blur-sm"
          >
            ← 목록으로
          </Link>
          {currentQuestion > 1 && (
            <button
              onClick={handlePrev}
              className="px-10 py-4 border border-amber-400/50 text-amber-300 text-lg font-light hover:bg-amber-500/10 transition-all duration-200 rounded-lg backdrop-blur-sm tracking-wide"
            >
              ← PREV
            </button>
          )}
        </div>

        {/* 상단 로고 */}
        <div className="flex flex-col items-center gap-8 z-10 mt-12">
          <div className="relative">
            <div className="w-28 h-28 border-2 border-amber-400/50 rounded-sm rotate-45 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
            <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-amber-600 rounded-sm flex items-center justify-center relative z-10">
              <span className="text-slate-900 text-lg font-bold tracking-wide">LEADME</span>
            </div>
          </div>
        </div>

        {/* 진행도 */}
        <div className="w-full max-w-2xl z-10">
          <div className="flex justify-between items-center mb-6">
            <span className="text-amber-200 text-xl font-light tracking-wider">
              Question {currentQuestion} / {totalQuestions}
            </span>
            <span className="text-amber-300/70 text-lg font-light border border-amber-400/30 px-4 py-2 rounded backdrop-blur-sm">
              {Math.round((currentQuestion / totalQuestions) * 100)}%
            </span>
          </div>
          <div className="h-2 bg-slate-800/50 rounded-full overflow-hidden backdrop-blur-sm border border-amber-400/20">
            <div
              className="h-full bg-gradient-to-r from-amber-400 to-amber-600 transition-all duration-300"
              style={{ width: `${(currentQuestion / totalQuestions) * 100}%` }}
            />
          </div>
        </div>

        {/* 질문 영역 */}
        <div className="flex flex-col items-center gap-12 w-full max-w-2xl z-10">
          <h2 className="text-5xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-300 to-amber-200 text-center leading-tight tracking-wide">
            {question.question}
          </h2>

          <div className="w-full space-y-4">
            {question.options.map((option) => (
              <button
                key={option.id}
                onClick={() => handleAnswer(option.id)}
                className={`group relative w-full p-8 text-left text-xl font-light transition-all duration-200 overflow-hidden ${
                  currentAnswer === option.id
                    ? ""
                    : ""
                }`}
              >
                <div className={`absolute inset-0 transition-opacity duration-200 ${
                  currentAnswer === option.id
                    ? "bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 opacity-90"
                    : "border border-amber-400/30 group-hover:border-amber-400/50 opacity-100"
                }`}></div>
                <div className={`absolute inset-[2px] transition-colors duration-200 ${
                  currentAnswer === option.id
                    ? "bg-slate-900"
                    : "bg-slate-900/50 backdrop-blur-sm group-hover:bg-slate-800/50"
                }`}></div>
                <div className="relative z-10">
                  <span className={`tracking-wide transition-all duration-200 ${
                    currentAnswer === option.id
                      ? "text-amber-300"
                      : "text-amber-100/80 group-hover:text-amber-200"
                  }`}>
                    {option.text}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 안내 문구 */}
        <div className="w-full max-w-2xl text-center z-10">
          <div className="flex items-center justify-center gap-4 text-amber-200/60">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-amber-400/30"></div>
            <p className="text-lg tracking-wide font-light">Select to proceed</p>
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-amber-400/30"></div>
          </div>
        </div>

        {/* 하단 장식 */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-400/50 to-transparent"></div>
      </div>
    </div>
  );
}

export default function Questions3() {
  return (
    <SurveyProvider>
      <QuestionContent />
    </SurveyProvider>
  );
}
