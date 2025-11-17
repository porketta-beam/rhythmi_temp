"use client";

import Link from "next/link";
import { SurveyProvider, useSurvey } from "@/contexts/SurveyContext";
import { resultData } from "@/data/resultData";
import { useEffect } from "react";

function ResultContent() {
  const { result, calculateResult, reset } = useSurvey();

  useEffect(() => {
    if (!result) {
      calculateResult();
    }
  }, [result, calculateResult]);

  if (!result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-3xl text-amber-300 font-light tracking-wide">Loading...</div>
      </div>
    );
  }

  const data = resultData[result];

  const handleReset = () => {
    reset();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-8">
      <div className="w-full max-w-[1080px] min-h-screen bg-gradient-to-b from-slate-900 via-purple-950 to-slate-900 flex flex-col items-center justify-between py-14 md:py-20 lg:py-26 xl:py-32 px-10 md:px-14 lg:px-17 xl:px-20 relative overflow-hidden">
        {/* 배경 장식 */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-400/50 to-transparent"></div>
        <div className="absolute top-1/3 right-0 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/3 left-0 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-3xl"></div>

        {/* 상단 로고 */}
        <div className="flex flex-col items-center gap-8 z-10">
          <div className="relative">
            <div className="w-28 h-28 border-2 border-amber-400/50 rounded-sm rotate-45 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
            <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-amber-600 rounded-sm flex items-center justify-center relative z-10">
              <span className="text-slate-900 text-lg font-bold tracking-wide">LEADME</span>
            </div>
          </div>
          <div className="h-px w-32 bg-gradient-to-r from-transparent via-amber-400 to-transparent"></div>
        </div>

        {/* 결과 영역 */}
        <div className="flex flex-col items-center gap-16 w-full max-w-3xl z-10">
          {/* 결과 타입 */}
          <div className="flex flex-col items-center gap-8 text-center">
            <div className="text-8xl">{data.emoji}</div>
            <h1 className="text-6xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-300 to-amber-200 tracking-wide">
              {data.type}
            </h1>
            <div className="h-px w-32 bg-gradient-to-r from-transparent via-amber-400 to-transparent"></div>
            <p className="text-2xl text-amber-200/80 font-light max-w-2xl leading-relaxed tracking-wide">
              {data.description}
            </p>
          </div>

          {/* 케어 포인트 */}
          <div className="w-full border border-amber-400/30 bg-slate-900/50 backdrop-blur-sm p-12 space-y-8">
            <h2 className="text-3xl text-amber-300 font-light tracking-wide">Care Points</h2>
            <div className="space-y-6">
              {data.carePoints.map((point, index) => (
                <div key={index} className="flex gap-6 items-start">
                  <div className="w-2 h-2 bg-amber-400 rounded-full mt-3 flex-shrink-0"></div>
                  <p className="text-xl text-amber-100/80 font-light leading-relaxed">{point}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 추천 루틴 */}
          <div className="w-full border border-amber-400/20 bg-amber-500/5 p-12 space-y-6">
            <h2 className="text-3xl text-amber-300 font-light tracking-wide">Recommended Routine</h2>
            <p className="text-xl text-amber-100/80 leading-relaxed font-light">
              {data.routine}
            </p>
          </div>
        </div>

        {/* 하단 버튼 */}
        <div className="w-full max-w-3xl z-10">
          <Link
            href="/test/3"
            onClick={handleReset}
            className="group relative block w-full h-28 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 opacity-90 group-hover:opacity-100 transition-opacity"></div>
            <div className="absolute inset-[2px] bg-slate-900 group-hover:bg-slate-800 transition-colors"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-amber-300 text-3xl font-light tracking-[0.2em] group-hover:tracking-[0.3em] transition-all duration-300">
                RESTART
              </span>
            </div>
          </Link>
        </div>

        {/* 하단 장식 */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-400/50 to-transparent"></div>
      </div>
    </div>
  );
}

export default function Result3() {
  return (
    <SurveyProvider>
      <ResultContent />
    </SurveyProvider>
  );
}
