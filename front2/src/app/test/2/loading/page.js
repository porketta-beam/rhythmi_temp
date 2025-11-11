"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Loading2() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/test/2/result");
    }, 1000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-orange-50 flex items-center justify-center p-4 md:p-6 lg:p-8">
      <div className="w-full max-w-[1080px] min-h-screen bg-gradient-to-b from-orange-50 via-yellow-50 to-orange-50 flex flex-col items-center justify-center gap-8 md:gap-10 lg:gap-12 relative overflow-hidden">
        {/* 배경 장식 */}
        <div className="absolute top-20 md:top-24 lg:top-28 xl:top-32 right-10 md:right-12 lg:right-14 xl:right-16 w-64 h-64 md:w-80 md:h-80 lg:w-88 lg:h-88 xl:w-96 xl:h-96 bg-orange-200/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 md:bottom-24 lg:bottom-28 xl:bottom-32 left-10 md:left-12 lg:left-14 xl:left-16 w-64 h-64 md:w-80 md:h-80 lg:w-88 lg:h-88 xl:w-96 xl:h-96 bg-yellow-200/30 rounded-full blur-3xl"></div>

        {/* 로딩 애니메이션 */}
        <div className="flex flex-col items-center gap-8 md:gap-10 lg:gap-12 z-10">
          <div className="relative">
            <div className="w-32 h-32 md:w-36 md:h-36 lg:w-40 lg:h-40 border-6 md:border-7 lg:border-8 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-3xl md:text-4xl lg:text-5xl">
              🤖
            </div>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-orange-900 text-center leading-tight">
            AI가 열심히<br />
            분석하고 있어요! ✨
          </h2>
          <p className="text-xl md:text-xl lg:text-2xl text-orange-700 font-semibold">
            잠시만 기다려주세요...
          </p>
        </div>
      </div>
    </div>
  );
}
