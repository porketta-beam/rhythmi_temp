import Link from "next/link";

export default function Design1() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 md:p-6 lg:p-8">
      <div className="w-full max-w-[1080px] min-h-screen bg-neutral-50 flex flex-col items-center justify-between py-12 md:py-16 lg:py-20 xl:py-24 px-8 md:px-12 lg:px-14 xl:px-16 relative overflow-hidden">
        {/* 홈 버튼 */}
        <Link
          href="/list"
          className="absolute top-6 md:top-7 lg:top-8 left-6 md:left-7 lg:left-8 px-4 md:px-5 lg:px-6 py-2 md:py-2.5 lg:py-3 text-xs md:text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
        >
          ← 목록으로
        </Link>

        {/* 상단 영역 */}
        <div className="flex flex-col items-center gap-3 md:gap-3.5 lg:gap-4 mt-12 md:mt-14 lg:mt-16 xl:mt-20">
          <div className="w-24 h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 bg-neutral-900 rounded-sm flex items-center justify-center">
            <span className="text-white text-xl md:text-xl lg:text-2xl font-light tracking-wider">LEADME</span>
          </div>
        </div>

        {/* 중앙 영역 */}
        <div className="flex flex-col items-center gap-6 md:gap-8 lg:gap-10 xl:gap-12 text-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-light text-neutral-900 tracking-tight leading-tight">
            당신의 피부를<br />이해합니다
          </h1>
          <p className="text-lg md:text-xl lg:text-2xl text-neutral-600 font-light max-w-2xl leading-relaxed">
            간단한 질문으로 시작하는<br />맞춤형 스킨케어 솔루션
          </p>
        </div>

        {/* 하단 CTA */}
        <div className="flex flex-col items-center gap-4 md:gap-5 lg:gap-6 w-full">
          <Link
            href="/test/1/consent"
            className="w-full max-w-md h-16 md:h-20 lg:h-22 xl:h-24 bg-neutral-900 text-white text-xl md:text-xl lg:text-2xl font-light tracking-wide hover:bg-neutral-800 transition-all duration-200 active:scale-[0.98] flex items-center justify-center"
          >
            시작하기
          </Link>
          <p className="text-neutral-500 text-base md:text-lg">약 10분 소요</p>
        </div>

        {/* 하단 장식 선 */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-neutral-300 to-transparent"></div>
      </div>
    </div>
  );
}
