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
      <div className="min-h-screen bg-orange-50 flex items-center justify-center">
        <div className="text-3xl text-orange-700 font-bold">결과를 불러오는 중...</div>
      </div>
    );
  }

  const data = resultData[result];

  const handleReset = () => {
    reset();
  };

  return (
    <div className="min-h-screen bg-orange-50 flex items-center justify-center p-8">
      <div className="w-full max-w-[1080px] min-h-screen bg-gradient-to-b from-orange-50 via-yellow-50 to-orange-50 flex flex-col items-center justify-between py-12 md:py-16 lg:py-20 xl:py-24 px-8 md:px-12 lg:px-14 xl:px-16 relative overflow-hidden">
        {/* 배경 장식 */}
        <div className="absolute top-32 right-16 w-96 h-96 bg-orange-200/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-32 left-16 w-96 h-96 bg-yellow-200/30 rounded-full blur-3xl"></div>

        {/* 상단 로고 */}
        <div className="flex flex-col items-center gap-4 z-10">
          <div className="w-28 h-28 bg-gradient-to-br from-orange-400 to-yellow-400 rounded-3xl flex items-center justify-center shadow-xl">
            <span className="text-white text-2xl font-bold">LeadMe</span>
          </div>
        </div>

        {/* 결과 영역 */}
        <div className="flex flex-col items-center gap-12 w-full max-w-3xl z-10">
          {/* 결과 타입 */}
          <div className="flex flex-col items-center gap-6 text-center">
            <div className="text-9xl animate-bounce">{data.emoji}</div>
            <h1 className="text-6xl font-bold text-orange-900">
              {data.type}
            </h1>
            <div className="flex gap-2">
              <span className="text-4xl">✨</span>
              <span className="text-4xl">💖</span>
              <span className="text-4xl">✨</span>
            </div>
            <p className="text-3xl text-orange-700 font-semibold bg-white/60 px-8 py-4 rounded-3xl backdrop-blur-sm">
              {data.description}
            </p>
          </div>

          {/* 케어 포인트 */}
          <div className="w-full bg-white/90 backdrop-blur-sm rounded-3xl p-10 shadow-2xl border-2 border-orange-200">
            <h2 className="text-3xl font-bold text-orange-900 mb-6 flex items-center gap-3">
              <span>🎯</span> 핵심 케어 포인트
            </h2>
            <div className="space-y-4">
              {data.carePoints.map((point, index) => (
                <div key={index} className="flex items-start gap-4 bg-orange-50 p-4 rounded-2xl">
                  <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-yellow-400 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                    {index + 1}
                  </div>
                  <p className="text-2xl text-orange-800 font-semibold">{point}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 추천 루틴 */}
          <div className="w-full bg-gradient-to-br from-orange-100 to-yellow-100 rounded-3xl p-10 shadow-xl border-2 border-orange-300">
            <h2 className="text-3xl font-bold text-orange-900 mb-6 flex items-center gap-3">
              <span>💝</span> 추천 루틴
            </h2>
            <p className="text-2xl text-orange-800 leading-relaxed font-semibold">
              {data.routine}
            </p>
          </div>
        </div>

        {/* 하단 버튼 */}
        <div className="w-full max-w-3xl z-10">
          <Link
            href="/test/2"
            onClick={handleReset}
            className="block w-full h-28 bg-gradient-to-r from-orange-500 to-yellow-500 text-white text-3xl font-bold rounded-full shadow-2xl hover:shadow-orange-300 hover:scale-105 transition-all duration-300 flex items-center justify-center gap-4"
          >
            <span>다시 시작하기</span>
            <span className="text-4xl">🔄</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function Result2() {
  return (
    <SurveyProvider>
      <ResultContent />
    </SurveyProvider>
  );
}
