"use client";

import Link from "next/link";
import Image from "next/image";
import { SurveyProvider, useSurvey } from "@/contexts/SurveyContext";
import { resultData } from "@/data/resultData";
import { useEffect, useState } from "react";

function ResultContent() {
  const { result, calculateResult, reset } = useSurvey();
  const [activeTab, setActiveTab] = useState("overview");

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

  // 탭 목록
  const tabs = [
    { id: "overview", label: "개요", icon: "📋" },
    { id: "analysis", label: "피부 분석", icon: "🔬" },
    { id: "care", label: "원인 & 케어", icon: "💡" },
    { id: "routines", label: "추천 루틴", icon: "⏰" },
    { id: "ingredients", label: "성분 가이드", icon: "🧪" }
  ];

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

      {/* 우측: 탭 네비게이션 + 컨텐츠 */}
      <div className="flex flex-col gap-12 z-10">
        {/* 탭 네비게이션 */}
        <div className="flex gap-4 bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-2xl border-4 border-orange-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 h-28 rounded-2xl font-bold text-3xl transition-all duration-200 flex flex-col items-center justify-center gap-2 ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-orange-500 to-yellow-500 text-white shadow-lg scale-105"
                  : "bg-orange-50 text-orange-800 hover:bg-orange-100"
              }`}
            >
              <span className="text-4xl">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* 탭 컨텐츠 영역 */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-16 shadow-2xl border-4 border-orange-200 max-h-[1400px] overflow-y-auto">
          {/* 개요 탭 */}
          {activeTab === "overview" && (
            <div className="space-y-12">
              <h2 className="text-6xl font-bold text-orange-900 mb-8 flex items-center gap-6">
                <span className="text-7xl">📋</span> 피부 타입 개요
              </h2>
              <div className="bg-orange-50 p-12 rounded-3xl">
                <p className="text-5xl text-orange-800 leading-relaxed font-semibold">
                  {data.description}
                </p>
              </div>

              <div className="mt-16">
                <h3 className="text-5xl font-bold text-orange-900 mb-8 flex items-center gap-4">
                  <span className="text-6xl">🎯</span> 핵심 케어 목표
                </h3>
                <div className="bg-gradient-to-br from-orange-100 to-yellow-100 p-12 rounded-3xl border-4 border-orange-300">
                  <p className="text-5xl text-orange-900 font-bold leading-relaxed">
                    &quot;{data.careGoal}&quot;
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 피부 분석 탭 */}
          {activeTab === "analysis" && (
            <div className="space-y-10">
              <h2 className="text-6xl font-bold text-orange-900 mb-8 flex items-center gap-6">
                <span className="text-7xl">🔬</span> 상세 피부 분석
              </h2>

              {/* 수분/유분 밸런스 */}
              <div className="bg-blue-50 p-10 rounded-3xl border-4 border-blue-200">
                <h3 className="text-4xl font-bold text-blue-900 mb-6 flex items-center gap-3">
                  <span className="text-5xl">💧</span> 수분/유분 밸런스
                </h3>
                <p className="text-4xl text-blue-800 leading-relaxed">{data.balance}</p>
              </div>

              {/* 피지 분비량 */}
              <div className="bg-yellow-50 p-10 rounded-3xl border-4 border-yellow-200">
                <h3 className="text-4xl font-bold text-yellow-900 mb-6 flex items-center gap-3">
                  <span className="text-5xl">✨</span> 피지 분비량
                </h3>
                <p className="text-4xl text-yellow-800 leading-relaxed">{data.sebum}</p>
              </div>

              {/* 모공 상태 */}
              <div className="bg-green-50 p-10 rounded-3xl border-4 border-green-200">
                <h3 className="text-4xl font-bold text-green-900 mb-6 flex items-center gap-3">
                  <span className="text-5xl">🔍</span> 모공 상태
                </h3>
                <p className="text-4xl text-green-800 leading-relaxed">{data.pore}</p>
              </div>

              {/* 장벽 강도 */}
              <div className="bg-purple-50 p-10 rounded-3xl border-4 border-purple-200">
                <h3 className="text-4xl font-bold text-purple-900 mb-6 flex items-center gap-3">
                  <span className="text-5xl">🛡️</span> 장벽 강도
                </h3>
                <p className="text-4xl text-purple-800 leading-relaxed">{data.barrier}</p>
              </div>

              {/* 온도 반응성 */}
              <div className="bg-red-50 p-10 rounded-3xl border-4 border-red-200">
                <h3 className="text-4xl font-bold text-red-900 mb-6 flex items-center gap-3">
                  <span className="text-5xl">🌡️</span> 온도 반응성
                </h3>
                <p className="text-4xl text-red-800 leading-relaxed">{data.temperature}</p>
              </div>
            </div>
          )}

          {/* 원인 & 케어 탭 */}
          {activeTab === "care" && (
            <div className="space-y-12">
              <h2 className="text-6xl font-bold text-orange-900 mb-8 flex items-center gap-6">
                <span className="text-7xl">💡</span> 문제 원인 & 케어 방향
              </h2>

              {/* 문제 원인 분석 */}
              <div className="space-y-8">
                <h3 className="text-5xl font-bold text-orange-800 mb-6">❗ 문제 원인 분석</h3>

                <div className="bg-red-50 p-10 rounded-3xl border-4 border-red-200">
                  <h4 className="text-4xl font-bold text-red-900 mb-4">🌍 외부 요인</h4>
                  <p className="text-4xl text-red-800 leading-relaxed">{data.causes.external}</p>
                </div>

                <div className="bg-orange-50 p-10 rounded-3xl border-4 border-orange-200">
                  <h4 className="text-4xl font-bold text-orange-900 mb-4">🧠 내부 요인</h4>
                  <p className="text-4xl text-orange-800 leading-relaxed">{data.causes.internal}</p>
                </div>

                <div className="bg-pink-50 p-10 rounded-3xl border-4 border-pink-200">
                  <h4 className="text-4xl font-bold text-pink-900 mb-4">⚠️ 결과</h4>
                  <p className="text-4xl text-pink-800 leading-relaxed">{data.causes.result}</p>
                </div>
              </div>

              {/* 피해야 할 습관 */}
              <div className="mt-16">
                <h3 className="text-5xl font-bold text-orange-800 mb-8">🚫 피해야 할 습관</h3>
                <div className="space-y-6">
                  {data.avoidHabits.map((habit, index) => (
                    <div key={index} className="flex items-start gap-6 bg-red-50 p-8 rounded-3xl border-4 border-red-200">
                      <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 text-4xl">
                        ✕
                      </div>
                      <p className="text-4xl text-red-900 font-semibold leading-relaxed">{habit}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 추천 루틴 탭 */}
          {activeTab === "routines" && (
            <div className="space-y-10">
              <h2 className="text-6xl font-bold text-orange-900 mb-8 flex items-center gap-6">
                <span className="text-7xl">⏰</span> 시간대별 추천 루틴
              </h2>

              {/* 아침 루틴 */}
              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-12 rounded-3xl border-4 border-yellow-300">
                <h3 className="text-5xl font-bold text-orange-900 mb-8 flex items-center gap-4">
                  <span className="text-6xl">🌅</span> 아침 루틴
                </h3>
                <p className="text-5xl text-orange-800 font-bold leading-relaxed">
                  {data.routines.morning}
                </p>
              </div>

              {/* 낮 루틴 */}
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-12 rounded-3xl border-4 border-blue-300">
                <h3 className="text-5xl font-bold text-blue-900 mb-8 flex items-center gap-4">
                  <span className="text-6xl">☀️</span> 낮 루틴 (외출 중)
                </h3>
                <p className="text-5xl text-blue-800 font-bold leading-relaxed">
                  {data.routines.daytime}
                </p>
              </div>

              {/* 저녁 루틴 */}
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-12 rounded-3xl border-4 border-purple-300">
                <h3 className="text-5xl font-bold text-purple-900 mb-8 flex items-center gap-4">
                  <span className="text-6xl">🌙</span> 저녁 루틴
                </h3>
                <p className="text-5xl text-purple-800 font-bold leading-relaxed">
                  {data.routines.evening}
                </p>
              </div>
            </div>
          )}

          {/* 성분 가이드 탭 */}
          {activeTab === "ingredients" && (
            <div className="space-y-12">
              <h2 className="text-6xl font-bold text-orange-900 mb-8 flex items-center gap-6">
                <span className="text-7xl">🧪</span> 성분 가이드
              </h2>

              {/* 추천 성분 */}
              <div>
                <h3 className="text-5xl font-bold text-green-900 mb-8 flex items-center gap-4">
                  <span className="text-6xl">✅</span> 추천 성분
                </h3>
                <div className="space-y-6">
                  {data.ingredients.recommended.map((ingredient, index) => (
                    <div key={index} className="bg-green-50 p-10 rounded-3xl border-4 border-green-200">
                      <h4 className="text-5xl font-bold text-green-900 mb-4">
                        {ingredient.name}
                      </h4>
                      <p className="text-4xl text-green-800 leading-relaxed">
                        💚 {ingredient.effect}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 피해야 할 성분 */}
              <div className="mt-16">
                <h3 className="text-5xl font-bold text-red-900 mb-8 flex items-center gap-4">
                  <span className="text-6xl">⚠️</span> 피해야 할 성분
                </h3>
                <div className="bg-red-50 p-12 rounded-3xl border-4 border-red-300">
                  <p className="text-5xl text-red-900 font-bold leading-relaxed">
                    {data.ingredients.avoid}
                  </p>
                </div>
              </div>
            </div>
          )}
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
