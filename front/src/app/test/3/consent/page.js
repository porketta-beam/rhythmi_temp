import Link from "next/link";

export default function Consent3() {
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
            <div className="w-32 h-32 border-2 border-amber-400/50 rounded-sm rotate-45 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
            <div className="w-24 h-24 bg-gradient-to-br from-amber-400 to-amber-600 rounded-sm flex items-center justify-center relative z-10">
              <span className="text-slate-900 text-lg font-bold tracking-wide">LEADME</span>
            </div>
          </div>
          <div className="h-px w-32 bg-gradient-to-r from-transparent via-amber-400 to-transparent"></div>
        </div>

        {/* 중앙 콘텐츠 */}
        <div className="flex flex-col items-center gap-16 w-full max-w-3xl z-10">
          {/* 제목 */}
          <div className="flex flex-col items-center gap-6 text-center">
            <h1 className="text-6xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-300 to-amber-200 tracking-wide">
              Privacy Notice
            </h1>
            <div className="h-px w-32 bg-gradient-to-r from-transparent via-amber-400 to-transparent"></div>
            <p className="text-2xl text-amber-200/80 font-light tracking-wide">
              귀하의 정보 보호를 위한 안내
            </p>
          </div>

          {/* 동의 내용 */}
          <div className="w-full border border-amber-400/30 bg-slate-900/50 backdrop-blur-sm p-12 space-y-10">
            <div className="space-y-6 text-amber-100/90 text-lg leading-relaxed">
              <p className="text-amber-200 text-xl font-light">
                최상의 서비스 제공을 위해<br />
                다음의 정보를 수집하고 활용합니다.
              </p>

              <div className="space-y-8 mt-8">
                <div className="flex gap-6 items-start">
                  <div className="w-2 h-2 bg-amber-400 rounded-full mt-3 flex-shrink-0"></div>
                  <div className="space-y-2">
                    <p className="text-amber-300 font-light tracking-wide">Collection</p>
                    <p className="text-amber-100/70">
                      피부 상태 분석을 위한 설문 응답 데이터
                    </p>
                  </div>
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-amber-400/20 to-transparent"></div>

                <div className="flex gap-6 items-start">
                  <div className="w-2 h-2 bg-amber-400 rounded-full mt-3 flex-shrink-0"></div>
                  <div className="space-y-2">
                    <p className="text-amber-300 font-light tracking-wide">Purpose</p>
                    <p className="text-amber-100/70">
                      맞춤형 스킨케어 솔루션 제공
                    </p>
                  </div>
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-amber-400/20 to-transparent"></div>

                <div className="flex gap-6 items-start">
                  <div className="w-2 h-2 bg-amber-400 rounded-full mt-3 flex-shrink-0"></div>
                  <div className="space-y-2">
                    <p className="text-amber-300 font-light tracking-wide">Retention</p>
                    <p className="text-amber-100/70">
                      세션 종료 시 즉시 삭제
                    </p>
                  </div>
                </div>
              </div>

              <div className="border border-amber-400/20 bg-amber-500/5 p-6 mt-10">
                <p className="text-base text-amber-200/70 leading-relaxed font-light">
                  귀하께서는 본 동의를 거부하실 수 있으나,<br />
                  이 경우 서비스 이용이 제한될 수 있습니다.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 하단 버튼 */}
        <div className="flex gap-8 w-full max-w-3xl z-10">
          <Link
            href="/test/3"
            className="group relative flex-1 h-28 overflow-hidden"
          >
            <div className="absolute inset-0 border border-amber-400/50 group-hover:border-amber-400 transition-colors"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-amber-300/70 text-2xl font-light tracking-[0.2em] group-hover:text-amber-300 group-hover:tracking-[0.3em] transition-all duration-300">
                DECLINE
              </span>
            </div>
          </Link>

          <Link
            href="/test/3/questions"
            className="group relative flex-1 h-28 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 opacity-90 group-hover:opacity-100 transition-opacity"></div>
            <div className="absolute inset-[2px] bg-slate-900 group-hover:bg-slate-800 transition-colors"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-amber-300 text-2xl font-light tracking-[0.2em] group-hover:tracking-[0.3em] transition-all duration-300">
                ACCEPT
              </span>
            </div>
          </Link>
        </div>

        {/* 하단 장식 */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-400/50 to-transparent"></div>
      </div>
    </div>
  );
}
