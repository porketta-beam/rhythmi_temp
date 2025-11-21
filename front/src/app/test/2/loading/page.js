"use client";

import { useEffect, useRef, Suspense } from "react";
import { useRouter } from "next/navigation";
import { SurveyProvider, useSurvey } from "@/contexts/SurveyContext";
import Image from "next/image";

function Loading2Content() {
  const router = useRouter();
  const { analyzeWithAI } = useSurvey();
  const analyzedRef = useRef(false);

  useEffect(() => {
    if (analyzedRef.current) return; // React StrictMode 중복 실행 방지
    analyzedRef.current = true;

    async function runAnalysis() {
      try {
        // AI 서버 분석 호출 (응답 저장 + 분류)
        const result = await analyzeWithAI();

        if (result.success || result.source === 'client_fallback') {
          // 성공 또는 클라이언트 Fallback: 결과 페이지로 이동
          setTimeout(() => {
            router.push("/test/2/result");
          }, 800);
        } else {
          // 완전 실패: 에러 표시 후 뒤로 가기
          console.error('분석 실패:', result.error);
          alert('분석 중 문제가 발생했습니다. 다시 시도해 주세요.');
          router.back();
        }
      } catch (error) {
        console.error('분석 중 예외 발생:', error);
        alert('분석 중 예상치 못한 오류가 발생했습니다.');
        router.back();
      }
    }

    runAnalysis();
  }, [router, analyzeWithAI]);

  return (
    <>
        {/* 좌측: 로딩 애니메이션과 메시지 */}
        <div className="col-span-2 flex flex-col justify-center items-center gap-10">

          {/* 로딩 스피너 */}
          <div className="relative">
            <div className="w-40 h-40 border-[10px] border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[60px]">
              <Image
                src="/rhythmi_logo.svg"
                alt="Rhythmi Logo"
                width={96}
                height={96}
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          {/* 메시지 */}
          <div className="flex flex-col items-center gap-4">
            <h2 className="text-4xl font-bold text-orange-900 text-center leading-tight">
              AI가 열심히<br />
              분석하고 있어요! ✨
            </h2>
            <p className="text-xl text-orange-700 font-semibold">
              잠시만 기다려주세요...
            </p>
          </div>
        </div>

        {/* 우측: 피부 타입 미리보기
        <div className="flex flex-col items-center justify-center gap-20 z-10">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-16 shadow-2xl">
            <div className="flex items-center gap-6 mb-12">
              <span className="text-6xl">🔍</span>
              <h3 className="text-5xl font-bold text-orange-900">
                5가지 피부 타입 분석 중
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-8">
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-3xl p-10 shadow-lg">
                <div className="text-7xl mb-4">🌸</div>
                <p className="text-3xl font-bold text-orange-900">건조 민감형</p>
              </div>
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-3xl p-10 shadow-lg">
                <div className="text-7xl mb-4">🏠</div>
                <p className="text-3xl font-bold text-orange-900">건조 실내형</p>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-yellow-100 rounded-3xl p-10 shadow-lg">
                <div className="text-7xl mb-4">🛡️</div>
                <p className="text-3xl font-bold text-orange-900">민감 보호형</p>
              </div>
              <div className="bg-gradient-to-br from-yellow-50 to-orange-100 rounded-3xl p-10 shadow-lg">
                <div className="text-7xl mb-4">⚡</div>
                <p className="text-3xl font-bold text-orange-900">활동 밸런스형</p>
              </div>
            </div>

            <div className="mt-8 bg-gradient-to-br from-orange-100 to-yellow-100 rounded-3xl p-10 shadow-lg">
              <div className="text-7xl mb-4">✨</div>
              <p className="text-3xl font-bold text-orange-900">미니멀 케어형</p>
            </div>
          </div>

          <div className="bg-yellow-100 border-4 border-yellow-300 rounded-3xl p-12 shadow-xl max-w-2xl">
            <p className="text-4xl text-orange-800 leading-relaxed text-center">
              💡 회원님의 응답을 바탕으로<br />
              <span className="font-bold">가장 적합한 피부 타입을 찾고 있어요!</span>
            </p>
          </div>
        </div> */}
    </>
  );
}

export default function Loading2() {
  return (
    <SurveyProvider>
      <Suspense fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="w-24 h-24 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
        </div>
      }>
        <Loading2Content />
      </Suspense>
    </SurveyProvider>
  );
}
