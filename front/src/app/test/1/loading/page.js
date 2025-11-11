"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Loading1() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/test/1/result");
    }, 1000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 md:p-6 lg:p-8">
      <div className="w-full max-w-[1080px] min-h-screen bg-neutral-50 flex flex-col items-center justify-center gap-8 md:gap-10 lg:gap-12 relative overflow-hidden">
        {/* 로딩 애니메이션 */}
        <div className="flex flex-col items-center gap-6 md:gap-7 lg:gap-8">
          <div className="w-24 h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 border-4 border-neutral-200 border-t-neutral-900 rounded-full animate-spin"></div>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-light text-neutral-900 text-center">
            AI가 결과를<br />분석하는 중입니다
          </h2>
        </div>

        {/* 하단 장식 선 */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-neutral-300 to-transparent"></div>
      </div>
    </div>
  );
}
