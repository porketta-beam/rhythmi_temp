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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-2xl text-neutral-600">결과를 불러오는 중...</div>
      </div>
    );
  }

  const data = resultData[result];

  const handleReset = () => {
    reset();
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 md:p-6 lg:p-8">
      <div className="w-full max-w-[1080px] min-h-screen bg-neutral-50 flex flex-col items-center justify-between py-12 md:py-16 lg:py-20 xl:py-24 px-8 md:px-12 lg:px-14 xl:px-16 relative overflow-hidden">
        {/* 상단 로고 */}
        <div className="flex flex-col items-center gap-3 md:gap-3.5 lg:gap-4">
          <div className="w-20 h-20 md:w-22 md:h-22 lg:w-24 lg:h-24 bg-neutral-900 rounded-sm flex items-center justify-center">
            <span className="text-white text-lg md:text-lg lg:text-xl font-light tracking-wider">LEADME</span>
          </div>
        </div>

        {/* 결과 영역 */}
        <div className="flex flex-col items-center gap-10 md:gap-12 lg:gap-14 xl:gap-16 w-full max-w-3xl">
          {/* 결과 타입 */}
          <div className="flex flex-col items-center gap-4 md:gap-5 lg:gap-6 text-center">
            <div className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl">{data.emoji}</div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-light text-neutral-900 tracking-tight">
              {data.type}
            </h1>
            <div className="h-px w-16 md:w-20 lg:w-24 bg-neutral-300"></div>
            <p className="text-lg md:text-xl lg:text-2xl text-neutral-600 font-light">
              {data.description}
            </p>
          </div>

          {/* 케어 포인트 */}
          <div className="w-full bg-white border border-neutral-200 p-6 md:p-8 lg:p-10 space-y-4 md:space-y-5 lg:space-y-6">
            <h2 className="text-xl md:text-xl lg:text-2xl font-light text-neutral-900">
              핵심 케어 포인트
            </h2>
            <div className="space-y-3 md:space-y-3.5 lg:space-y-4">
              {data.carePoints.map((point, index) => (
                <div key={index} className="flex items-start gap-3 md:gap-3.5 lg:gap-4">
                  <div className="w-2 h-2 bg-neutral-900 rounded-full mt-2 md:mt-2.5 lg:mt-3 flex-shrink-0"></div>
                  <p className="text-base md:text-lg lg:text-xl text-neutral-700">{point}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 추천 루틴 */}
          <div className="w-full bg-neutral-100 p-6 md:p-8 lg:p-10 space-y-4 md:space-y-5 lg:space-y-6">
            <h2 className="text-xl md:text-xl lg:text-2xl font-light text-neutral-900">
              추천 루틴
            </h2>
            <p className="text-base md:text-lg lg:text-xl text-neutral-700 leading-relaxed">
              {data.routine}
            </p>
          </div>
        </div>

        {/* 하단 버튼 */}
        <div className="w-full max-w-3xl">
          <Link
            href="/test/1"
            onClick={handleReset}
            className="block w-full h-16 md:h-20 lg:h-22 xl:h-24 bg-neutral-900 text-white text-xl md:text-xl lg:text-2xl font-light tracking-wide hover:bg-neutral-800 transition-all duration-200 flex items-center justify-center"
          >
            다시 시작하기
          </Link>
        </div>

        {/* 하단 장식 선 */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-neutral-300 to-transparent"></div>
      </div>
    </div>
  );
}

export default function Result1() {
  return (
    <SurveyProvider>
      <ResultContent />
    </SurveyProvider>
  );
}
