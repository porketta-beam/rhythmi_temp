import Link from "next/link";

export default function Design3() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-8">
      <div className="w-full max-w-[1080px] min-h-screen bg-gradient-to-b from-slate-900 via-purple-950 to-slate-900 flex flex-col items-center justify-between py-14 md:py-20 lg:py-26 xl:py-32 px-10 md:px-14 lg:px-17 xl:px-20 relative overflow-hidden">
        {/* 홈 버튼 */}
        <Link
          href="/list"
          className="absolute top-10 left-10 px-8 py-4 text-sm text-amber-300 hover:text-amber-200 transition-colors border border-amber-300/30 rounded-lg backdrop-blur-sm"
        >
          ← 목록으로
        </Link>

        {/* 배경 장식 */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-400/50 to-transparent"></div>
        <div className="absolute top-1/3 right-0 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/3 left-0 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-3xl"></div>

        {/* 상단 영역 */}
        <div className="flex flex-col items-center gap-8 z-10">
          <div className="relative">
            <div className="w-40 h-40 border-2 border-amber-400/50 rounded-sm rotate-45 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
            <div className="w-32 h-32 bg-gradient-to-br from-amber-400 to-amber-600 rounded-sm flex items-center justify-center relative z-10">
              <span className="text-slate-900 text-xl font-bold tracking-wide">LEADME</span>
            </div>
          </div>
          <div className="h-px w-32 bg-gradient-to-r from-transparent via-amber-400 to-transparent"></div>
        </div>

        {/* 중앙 영역 */}
        <div className="flex flex-col items-center gap-16 text-center z-10">
          <div className="flex flex-col gap-8">
            <h1 className="text-7xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-300 to-amber-200 leading-tight tracking-wide">
              Premium<br />
              Skin Care<br />
              Experience
            </h1>
            <div className="h-px w-24 mx-auto bg-gradient-to-r from-transparent via-amber-400 to-transparent"></div>
          </div>

          <p className="text-2xl text-amber-100/80 font-light max-w-2xl leading-relaxed tracking-wide">
            당신만을 위한 특별한 케어<br />
            <span className="text-amber-300 text-xl">세심한 분석으로 완성되는 럭셔리 루틴</span>
          </p>
        </div>

        {/* 하단 CTA */}
        <div className="flex flex-col items-center gap-10 w-full z-10">
          <Link
            href="/test/3/consent"
            className="group relative w-full max-w-lg h-28 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 opacity-90 group-hover:opacity-100 transition-opacity"></div>
            <div className="absolute inset-[2px] bg-slate-900 group-hover:bg-slate-800 transition-colors"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-amber-300 text-3xl font-light tracking-[0.2em] group-hover:tracking-[0.3em] transition-all duration-300">
                START
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-4 text-amber-200/60">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-amber-400/30"></div>
            <p className="text-lg tracking-wide">약 10분의 여유</p>
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-amber-400/30"></div>
          </div>
        </div>

        {/* 하단 장식 */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-400/50 to-transparent"></div>
      </div>
    </div>
  );
}
