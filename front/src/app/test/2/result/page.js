"use client";

import Link from "next/link";
import Image from "next/image";
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
      <div className="flex items-center justify-center w-full h-full">
        <div className="text-3xl text-orange-700 font-bold">결과를 불러오는 중...</div>
      </div>
    );
  }

  const data = resultData[result];

  const handleReset = () => {
    reset();
  };

  return (
    <>
        {/* 좌측: 결과 타입과 이모지 */}
        <div className="flex flex-col justify-center items-center gap-20 z-10">
          {/* 로고 */}
          <div className="w-48 h-48 rounded-3xl flex items-center justify-center">
            <Image 
              src="/rhythmi_logo.svg" 
              alt="Rhythmi Logo" 
              width={192} 
              height={192}
              className="w-full h-full rounded-4xl object-contain shadow-xl"
            />
          </div>

          {/* 결과 타입 */}
          <div className="flex flex-col items-center gap-10 text-center">
            <p className="text-6xl text-orange-800 font-bold mb-4">
              AI 분석결과 당신은...
            </p>
            <div className="text-[200px] animate-bounce">{data.emoji}</div>
            <h1 className="text-9xl font-bold text-orange-900 leading-tight">
              {data.type}
            </h1>
            <p className="text-5xl text-orange-700 font-semibold bg-white/70 px-16 py-8 rounded-3xl backdrop-blur-sm leading-relaxed">
              {data.description}
            </p>
          </div>

          {/* 다시 시작 버튼 */}
          <Link
            href="/test/2"
            onClick={handleReset}
            className="w-full max-w-2xl h-40 bg-gradient-to-r from-orange-500 to-yellow-500 text-white text-5xl font-bold rounded-full shadow-2xl hover:shadow-orange-300 hover:scale-105 transition-all duration-300 flex items-center justify-center gap-6"
          >
            <span>다시 시작하기</span>
            <span className="text-6xl">🔄</span> 
          </Link>
        </div>

        {/* 우측: 케어 포인트와 루틴 */}
        <div className="flex flex-col justify-center gap-16 z-10 max-h-screen overflow-y-auto pr-8">
          {/* 케어 포인트 */}
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-16 shadow-2xl border-4 border-orange-200">
            <h2 className="text-5xl font-bold text-orange-900 mb-12 flex items-center gap-6">
              <span className="text-6xl">🎯</span> 핵심 케어 포인트
            </h2>
            <div className="space-y-8">
              {data.carePoints.map((point, index) => (
                <div key={index} className="flex items-start gap-8 bg-orange-50 p-8 rounded-3xl">
                  <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-yellow-400 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 text-4xl">
                    {index + 1}
                  </div>
                  <p className="text-4xl text-orange-800 font-semibold leading-relaxed">{point}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 추천 루틴 */}
          <div className="bg-gradient-to-br from-orange-100 to-yellow-100 rounded-3xl p-16 shadow-2xl border-4 border-orange-300">
            <h2 className="text-5xl font-bold text-orange-900 mb-12 flex items-center gap-6">
              <span className="text-6xl">💝</span> 추천 루틴
            </h2>
            <p className="text-4xl text-orange-800 leading-relaxed font-semibold whitespace-pre-line">
              {data.routine}
            </p>
          </div>

          {/* 추가 정보 */}
          <div className="bg-yellow-100 border-4 border-yellow-300 rounded-3xl p-12 shadow-xl">
            <p className="text-4xl text-orange-800 leading-relaxed text-center">
              💡 이 결과는 회원님의 응답을 바탕으로<br />
              <span className="font-bold">맞춤 제작된 추천입니다!</span>
            </p>
          </div>
        </div>
    </>
  );
}

export default function Result2() {
  return (
    <SurveyProvider>
      <ResultContent />
    </SurveyProvider>
  );
}
