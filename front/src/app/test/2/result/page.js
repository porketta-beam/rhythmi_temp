"use client";

import { SurveyProvider, useSurvey } from "@/contexts/SurveyContext";
import { resultData } from "@/data/resultData";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

function ResultContent() {
  const { result, calculateResult, reset } = useSurvey();
  const [activeTab, setActiveTab] = useState("overview");
  const router = useRouter();

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
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #ffffff;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #fb923c;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #f97316;
        }
        .custom-scrollbar::-webkit-scrollbar-button {
          width: 0;
          height: 0;
          background: transparent;
          display: none;
        }
        .custom-scrollbar::-webkit-scrollbar-button:single-button {
          width: 0;
          height: 0;
          background: transparent;
          display: none;
        }
        .custom-scrollbar::-webkit-scrollbar-button:vertical:decrement {
          width: 0;
          height: 0;
          background: transparent;
          display: none;
        }
        .custom-scrollbar::-webkit-scrollbar-button:vertical:increment {
          width: 0;
          height: 0;
          background: transparent;
          display: none;
        }
      `}} />
      {/* 좌측: 결과 타입과 모델 이미지 */}
      <div className="flex flex-col justify-center items-center gap-6 z-10">
        {/* 결과 타입 */}
        <div className="flex flex-col items-center gap-3 text-center">
          <p className="text-xl text-orange-800 font-bold break-keep">
            당신의 피부 타입은
          </p>
          {/* 모델 이미지 */}
          <div className="relative w-[300px] h-[300px] rounded-full overflow-hidden shadow-2xl border-4 border-orange-300">
            <Image
              src={data.modelImage}
              alt={data.type}
              fill
              className="object-cover"
              priority
              sizes="300px"
            />
          </div>
          <h1 className="text-4xl font-bold text-orange-900 leading-tight break-keep">
            {data.type}
          </h1>
        </div>

        {/* 공유하기 버튼 */}
        <button
          onClick={() => {
            // memberId 가져오기 (sessionStorage에서 또는 새로 생성)
            let memberId = null;
            if (typeof window !== "undefined") {
              memberId = sessionStorage.getItem("memberId");
              if (!memberId) {
                // 없으면 새로 생성
                memberId = (typeof crypto !== "undefined" && crypto.randomUUID) 
                  ? crypto.randomUUID() 
                  : `member_${Date.now()}`;
                sessionStorage.setItem("memberId", memberId);
              }
            }
            
            // share 페이지로 이동
            if (memberId) {
              router.push(`/test/2/share?memberId=${encodeURIComponent(memberId)}`);
            } else {
              router.push("/test/2/share");
            }
          }}
          className="w-full max-w-md px-12 py-3 bg-gradient-to-r from-orange-500 to-yellow-500 text-white text-xl font-bold rounded-full shadow-2xl hover:shadow-orange-300 hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 break-keep"
        >
          <span>공유하기</span>
          <span className="text-2xl">📤</span>
        </button>
      </div>

      {/* 우측: 탭 네비게이션 + 컨텐츠 */}
      <div className="flex flex-col h-full min-h-0 pb-3 gap-4 z-10">
        {/* 탭 네비게이션 */}
        <div className="flex gap-1.5 bg-white/90 backdrop-blur-sm rounded-xl p-2 shadow-2xl border-2 border-orange-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 h-12 rounded-lg font-bold text-sm transition-all duration-200 flex flex-col items-center justify-center gap-0.5 break-keep ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-orange-500 to-yellow-500 text-white shadow-lg scale-105"
                  : "bg-orange-50 text-orange-800 hover:bg-orange-100"
              }`}
            >
              <span className="text-lg">{tab.icon}</span>
              <span className="text-xs">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* 탭 컨텐츠 영역 */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl p-5 shadow-2xl border-2 border-orange-200 flex-1 overflow-y-auto custom-scrollbar" style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#fb923c #ffffff'
        }}>
          {/* 개요 탭 */}
          {activeTab === "overview" && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-orange-900 mb-3 flex items-center gap-2 break-keep">
                <span className="text-3xl">📋</span> 피부 타입 개요
              </h2>
              <div className="bg-orange-50 p-4 rounded-xl">
                <p className="text-lg text-orange-800 leading-relaxed font-semibold break-keep">
                  {data.description}
                </p>
              </div>

              <div className="mt-6">
                <h3 className="text-xl font-bold text-orange-900 mb-3 flex items-center gap-2 break-keep">
                  <span className="text-2xl">🎯</span> 핵심 케어 목표
                </h3>
                <div className="bg-gradient-to-br from-orange-100 to-yellow-100 p-4 rounded-xl border-2 border-orange-300">
                  <p className="text-lg text-orange-900 font-bold leading-relaxed break-keep">
                    &quot;{data.careGoal}&quot;
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 피부 분석 탭 */}
          {activeTab === "analysis" && (
            <div className="space-y-3">
              <h2 className="text-2xl font-bold text-orange-900 mb-3 flex items-center gap-2 break-keep">
                <span className="text-3xl">🔬</span> 상세 피부 분석
              </h2>

              {/* 수분/유분 밸런스 */}
              <div className="bg-blue-50 p-3 rounded-xl border-2 border-blue-200">
                <h3 className="text-base font-bold text-blue-900 mb-2 flex items-center gap-1.5 break-keep">
                  <span className="text-lg">💧</span> 수분/유분 밸런스
                </h3>
                <p className="text-sm text-blue-800 leading-relaxed break-keep">{data.balance}</p>
              </div>

              {/* 피지 분비량 */}
              <div className="bg-yellow-50 p-3 rounded-xl border-2 border-yellow-200">
                <h3 className="text-base font-bold text-yellow-900 mb-2 flex items-center gap-1.5 break-keep">
                  <span className="text-lg">✨</span> 피지 분비량
                </h3>
                <p className="text-sm text-yellow-800 leading-relaxed break-keep">{data.sebum}</p>
              </div>

              {/* 모공 상태 */}
              <div className="bg-green-50 p-3 rounded-xl border-2 border-green-200">
                <h3 className="text-base font-bold text-green-900 mb-2 flex items-center gap-1.5 break-keep">
                  <span className="text-lg">🔍</span> 모공 상태
                </h3>
                <p className="text-sm text-green-800 leading-relaxed break-keep">{data.pore}</p>
              </div>

              {/* 장벽 강도 */}
              <div className="bg-purple-50 p-3 rounded-xl border-2 border-purple-200">
                <h3 className="text-base font-bold text-purple-900 mb-2 flex items-center gap-1.5 break-keep">
                  <span className="text-lg">🛡️</span> 장벽 강도
                </h3>
                <p className="text-sm text-purple-800 leading-relaxed break-keep">{data.barrier}</p>
              </div>

              {/* 온도 반응성 */}
              <div className="bg-red-50 p-3 rounded-xl border-2 border-red-200">
                <h3 className="text-base font-bold text-red-900 mb-2 flex items-center gap-1.5 break-keep">
                  <span className="text-lg">🌡️</span> 온도 반응성
                </h3>
                <p className="text-sm text-red-800 leading-relaxed break-keep">{data.temperature}</p>
              </div>
            </div>
          )}

          {/* 원인 & 케어 탭 */}
          {activeTab === "care" && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-orange-900 mb-3 flex items-center gap-2 break-keep">
                <span className="text-3xl">💡</span> 문제 원인 & 케어 방향
              </h2>

              {/* 문제 원인 분석 */}
              <div className="space-y-3">
                <h3 className="text-xl font-bold text-orange-800 mb-2 break-keep">❗ 문제 원인 분석</h3>

                <div className="bg-red-50 p-3 rounded-xl border-2 border-red-200">
                  <h4 className="text-base font-bold text-red-900 mb-1.5 break-keep">🌍 외부 요인</h4>
                  <p className="text-sm text-red-800 leading-relaxed break-keep">{data.causes.external}</p>
                </div>

                <div className="bg-orange-50 p-3 rounded-xl border-2 border-orange-200">
                  <h4 className="text-base font-bold text-orange-900 mb-1.5 break-keep">🧠 내부 요인</h4>
                  <p className="text-sm text-orange-800 leading-relaxed break-keep">{data.causes.internal}</p>
                </div>

                <div className="bg-pink-50 p-3 rounded-xl border-2 border-pink-200">
                  <h4 className="text-base font-bold text-pink-900 mb-1.5 break-keep">⚠️ 결과</h4>
                  <p className="text-sm text-pink-800 leading-relaxed break-keep">{data.causes.result}</p>
                </div>
              </div>

              {/* 피해야 할 습관 */}
              <div className="mt-6">
                <h3 className="text-xl font-bold text-orange-800 mb-3 break-keep">🚫 피해야 할 습관</h3>
                <div className="space-y-2">
                  {data.avoidHabits.map((habit, index) => (
                    <div key={index} className="flex items-start gap-2 bg-red-50 p-3 rounded-xl border-2 border-red-200">
                      <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 text-sm">
                        ✕
                      </div>
                      <p className="text-sm text-red-900 font-semibold leading-relaxed break-keep">{habit}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 추천 루틴 탭 */}
          {activeTab === "routines" && (
            <div className="space-y-3">
              <h2 className="text-2xl font-bold text-orange-900 mb-3 flex items-center gap-2 break-keep">
                <span className="text-3xl">⏰</span> 시간대별 추천 루틴
              </h2>

              {/* 아침 루틴 */}
              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-4 rounded-xl border-2 border-yellow-300">
                <h3 className="text-lg font-bold text-orange-900 mb-2 flex items-center gap-1.5 break-keep">
                  <span className="text-2xl">🌅</span> 아침 루틴
                </h3>
                <p className="text-base text-orange-800 font-bold leading-relaxed break-keep">
                  {data.routines.morning}
                </p>
              </div>

              {/* 낮 루틴 */}
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-xl border-2 border-blue-300">
                <h3 className="text-lg font-bold text-blue-900 mb-2 flex items-center gap-1.5 break-keep">
                  <span className="text-2xl">☀️</span> 낮 루틴 (외출 중)
                </h3>
                <p className="text-base text-blue-800 font-bold leading-relaxed break-keep">
                  {data.routines.daytime}
                </p>
              </div>

              {/* 저녁 루틴 */}
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-4 rounded-xl border-2 border-purple-300">
                <h3 className="text-lg font-bold text-purple-900 mb-2 flex items-center gap-1.5 break-keep">
                  <span className="text-2xl">🌙</span> 저녁 루틴
                </h3>
                <p className="text-base text-purple-800 font-bold leading-relaxed break-keep">
                  {data.routines.evening}
                </p>
              </div>
            </div>
          )}

          {/* 성분 가이드 탭 */}
          {activeTab === "ingredients" && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-orange-900 mb-3 flex items-center gap-2 break-keep">
                <span className="text-3xl">🧪</span> 성분 가이드
              </h2>

              {/* 추천 성분 */}
              <div>
                <h3 className="text-xl font-bold text-green-900 mb-3 flex items-center gap-1.5 break-keep">
                  <span className="text-2xl">✅</span> 추천 성분
                </h3>
                <div className="space-y-2">
                  {data.ingredients.recommended.map((ingredient, index) => (
                    <div key={index} className="bg-green-50 p-3 rounded-xl border-2 border-green-200">
                      <h4 className="text-base font-bold text-green-900 mb-1.5 break-keep">
                        {ingredient.name}
                      </h4>
                      <p className="text-sm text-green-800 leading-relaxed break-keep">
                        💚 {ingredient.effect}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 피해야 할 성분 */}
              <div className="mt-6">
                <h3 className="text-xl font-bold text-red-900 mb-3 flex items-center gap-1.5 break-keep">
                  <span className="text-2xl">⚠️</span> 피해야 할 성분
                </h3>
                <div className="bg-red-50 p-4 rounded-xl border-2 border-red-300">
                  <p className="text-base text-red-900 font-bold leading-relaxed break-keep">
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
