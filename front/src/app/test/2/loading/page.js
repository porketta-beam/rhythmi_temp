"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function Loading2() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/test/2/result");
    }, 1000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <>
        {/* 좌측: 로딩 애니메이션과 메시지 */}
        <div className="flex flex-col justify-center items-center gap-20 z-10">
          {/* 로고 */}
          <div className="w-48 h-48 rounded-3xl flex items-center justify-center shadow-xl overflow-hidden">
            <Image 
              src="/rhythmi_logo.svg" 
              alt="Rhythmi Logo" 
              width={192} 
              height={192}
              className="w-full h-full object-contain"
            />
          </div>

          {/* 로딩 스피너 */}
          <div className="relative">
            <div className="w-80 h-80 border-[20px] border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[120px]">
              🤖
            </div>
          </div>

          {/* 메시지 */}
          <div className="flex flex-col items-center gap-8">
            <h2 className="text-8xl font-bold text-orange-900 text-center leading-tight">
              AI가 열심히<br />
              분석하고 있어요! ✨
            </h2>
            <p className="text-4xl text-orange-700 font-semibold">
              잠시만 기다려주세요...
            </p>
          </div>
        </div>

        {/* 우측: 피부 타입 미리보기 */}
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
        </div>
    </>
  );
}
