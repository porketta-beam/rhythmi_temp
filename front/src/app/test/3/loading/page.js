"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Loading3() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/test/3/result");
    }, 1000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-8">
      <div className="w-full max-w-[1080px] min-h-screen bg-gradient-to-b from-slate-900 via-purple-950 to-slate-900 flex flex-col items-center justify-center gap-10 md:gap-12 lg:gap-14 xl:gap-16 relative overflow-hidden">
        {/* 배경 장식 */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-400/50 to-transparent"></div>
        <div className="absolute top-1/3 right-0 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/3 left-0 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-3xl"></div>

        {/* 로딩 애니메이션 */}
        <div className="flex flex-col items-center gap-16 z-10">
          <div className="relative">
            {/* 회전하는 테두리들 */}
            <div className="w-48 h-48 border-2 border-amber-400/30 rounded-sm absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-spin" style={{ animationDuration: '3s' }}></div>
            <div className="w-40 h-40 border-2 border-amber-400/50 rounded-sm absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }}></div>
            {/* 중앙 박스 */}
            <div className="w-32 h-32 bg-gradient-to-br from-amber-400 to-amber-600 rounded-sm flex items-center justify-center relative z-10">
              <span className="text-slate-900 text-4xl font-bold">AI</span>
            </div>
          </div>

          <div className="flex flex-col items-center gap-6 text-center">
            <h2 className="text-5xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-300 to-amber-200 tracking-wide">
              Analyzing
            </h2>
            <div className="h-px w-32 bg-gradient-to-r from-transparent via-amber-400 to-transparent"></div>
            <p className="text-2xl text-amber-200/80 font-light tracking-wide">
              결과를 분석하고 있습니다
            </p>
          </div>
        </div>

        {/* 하단 장식 */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-400/50 to-transparent"></div>
      </div>
    </div>
  );
}
