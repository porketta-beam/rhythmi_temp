import Link from "next/link";
import Image from "next/image";

export default function Design2() {
  return (
    <>
        {/* 좌측: 메인 콘텐츠 */}
        <div className="flex flex-col justify-center gap-16 z-10">
          {/* 로고 영역 */}
          <div className="flex flex-col gap-8">
            <div className="w-48 h-48 rounded-3xl flex items-center justify-center shadow-xl overflow-hidden">
              <Image 
                src="/rhythmi_logo.svg" 
                alt="Rhythmi Logo" 
                width={192} 
                height={192}
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          {/* 메인 카피 */}
          <div className="flex flex-col gap-10">
            <h1 className="text-9xl font-bold text-orange-900 leading-tight">
              반가워요!<br />
              <span className="text-orange-600">당신의 피부리듬</span>을<br />
              알아가볼까요?
            </h1>
            <p className="text-5xl text-orange-700 font-semibold leading-relaxed bg-white/60 px-12 py-8 rounded-3xl backdrop-blur-sm inline-block">
              3분이면 충분해요<br />
              <span className="text-4xl text-orange-600">맞춤 케어를 찾아드려요</span>
            </p>
          </div>

          {/* CTA 버튼 */}
          <div className="flex flex-col gap-8">
            <Link
              href="/test/2/consent"
              className="w-full max-w-2xl h-40 bg-gradient-to-r from-orange-500 to-yellow-500 text-white text-5xl font-bold rounded-full shadow-2xl hover:shadow-orange-300 hover:scale-105 transition-all duration-300 active:scale-95 flex items-center justify-center gap-6"
            >
              <span>시작할게요</span>
              <span className="text-6xl">→</span>
            </Link>
          </div>
        </div>

        {/* 우측: 시각적 요소 */}
        <div className="flex flex-col items-center justify-center gap-20 z-10">
          {/* 피부 케어 아이콘 영역 */}
          <div className="grid grid-cols-2 gap-12">
            <div className="w-64 h-64 bg-white/80 rounded-3xl flex items-center justify-center shadow-2xl backdrop-blur-sm">
              <span className="text-9xl">🌸</span>
            </div>
            <div className="w-64 h-64 bg-white/80 rounded-3xl flex items-center justify-center shadow-2xl backdrop-blur-sm">
              <span className="text-9xl">💧</span>
            </div>
            <div className="w-64 h-64 bg-white/80 rounded-3xl flex items-center justify-center shadow-2xl backdrop-blur-sm">
              <span className="text-9xl">🛡️</span>
            </div>
            <div className="w-64 h-64 bg-white/80 rounded-3xl flex items-center justify-center shadow-2xl backdrop-blur-sm">
              <span className="text-9xl">⚡</span>
            </div>
          </div>

          {/* 설명 텍스트 */}
          <div className="text-center">
            <p className="text-4xl text-orange-800 font-semibold">
              5가지 피부 타입 진단
            </p>
            <p className="text-3xl text-orange-600 mt-4">
              나에게 딱 맞는 케어를 찾아보세요
            </p>
          </div>
        </div>
    </>
  );
}
