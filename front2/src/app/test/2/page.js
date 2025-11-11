import Link from "next/link";

export default function Design2() {
  return (
    <div className="min-h-screen bg-orange-50 flex items-center justify-center p-4 md:p-6 lg:p-8">
      <div className="w-full max-w-[1080px] min-h-screen bg-gradient-to-b from-orange-50 via-yellow-50 to-orange-50 flex flex-col items-center justify-between py-12 md:py-16 lg:py-20 xl:py-24 px-8 md:px-12 lg:px-14 xl:px-16 relative overflow-hidden">
        {/* 홈 버튼 */}
        <Link
          href="/list"
          className="absolute top-6 md:top-7 lg:top-8 left-6 md:left-7 lg:left-8 px-4 md:px-5 lg:px-6 py-2 md:py-2.5 lg:py-3 text-xs md:text-sm text-orange-700 hover:text-orange-900 transition-colors bg-white/50 rounded-full backdrop-blur-sm"
        >
          ← 목록으로
        </Link>

        {/* 배경 장식 */}
        <div className="absolute top-20 md:top-24 lg:top-28 xl:top-32 right-10 md:right-12 lg:right-14 xl:right-16 w-64 h-64 md:w-80 md:h-80 lg:w-88 lg:h-88 xl:w-96 xl:h-96 bg-orange-200/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 md:bottom-24 lg:bottom-28 xl:bottom-32 left-10 md:left-12 lg:left-14 xl:left-16 w-64 h-64 md:w-80 md:h-80 lg:w-88 lg:h-88 xl:w-96 xl:h-96 bg-yellow-200/30 rounded-full blur-3xl"></div>

        {/* 상단 영역 */}
        <div className="flex flex-col items-center gap-4 md:gap-5 lg:gap-6 mt-8 md:mt-9 lg:mt-10 xl:mt-12 z-10">
          <div className="w-28 h-28 md:w-32 md:h-32 lg:w-34 lg:h-34 xl:w-36 xl:h-36 bg-gradient-to-br from-orange-400 to-yellow-400 rounded-3xl flex items-center justify-center shadow-xl">
            <span className="text-white text-2xl md:text-2xl lg:text-3xl font-bold">LeadMe</span>
          </div>
          <div className="flex gap-1.5 md:gap-2">
            <span className="text-2xl md:text-3xl lg:text-4xl">✨</span>
            <span className="text-2xl md:text-3xl lg:text-4xl">🌟</span>
            <span className="text-2xl md:text-3xl lg:text-4xl">💫</span>
          </div>
        </div>

        {/* 중앙 영역 */}
        <div className="flex flex-col items-center gap-6 md:gap-8 lg:gap-10 text-center z-10">
          <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-orange-900 leading-tight">
            반가워요!<br />
            <span className="text-orange-600">당신의 피부</span>를<br />
            알아가볼까요?
          </h1>
          <p className="text-xl md:text-2xl lg:text-3xl text-orange-700 font-semibold max-w-2xl leading-relaxed bg-white/60 px-6 md:px-7 lg:px-8 py-4 md:py-5 lg:py-6 rounded-3xl backdrop-blur-sm">
            10분이면 충분해요<br />
            <span className="text-lg md:text-xl lg:text-2xl text-orange-600">맞춤 케어를 찾아드려요</span>
          </p>
        </div>

        {/* 하단 CTA */}
        <div className="flex flex-col items-center gap-6 md:gap-7 lg:gap-8 w-full z-10">
          <Link
            href="/test/2/consent"
            className="w-full max-w-lg h-20 md:h-24 lg:h-26 xl:h-28 bg-gradient-to-r from-orange-500 to-yellow-500 text-white text-2xl md:text-2xl lg:text-3xl font-bold rounded-full shadow-2xl hover:shadow-orange-300 hover:scale-105 transition-all duration-300 active:scale-95 flex items-center justify-center gap-3 md:gap-3.5 lg:gap-4"
          >
            <span>시작할게요</span>
            <span className="text-3xl md:text-3xl lg:text-4xl">→</span>
          </Link>
          <div className="flex items-center gap-3 md:gap-3.5 lg:gap-4 bg-white/70 px-6 md:px-7 lg:px-8 py-3 md:py-3.5 lg:py-4 rounded-full backdrop-blur-sm">
            <span className="text-xl md:text-xl lg:text-2xl">⏱️</span>
            <p className="text-orange-700 text-lg md:text-lg lg:text-xl font-semibold">약 10분 소요</p>
          </div>
        </div>
      </div>
    </div>
  );
}
