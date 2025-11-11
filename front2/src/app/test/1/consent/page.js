import Link from "next/link";

export default function Consent1() {
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
          <div className="w-20 h-20 md:w-22 md:h-22 lg:w-24 lg:h-24 bg-neutral-900 rounded-sm flex items-center justify-center">
            <span className="text-white text-lg md:text-lg lg:text-xl font-light tracking-wider">LEADME</span>
          </div>
        </div>

        {/* 중앙 콘텐츠 */}
        <div className="flex flex-col items-center gap-10 md:gap-12 lg:gap-14 xl:gap-16 w-full max-w-3xl">
          {/* 제목 */}
          <div className="flex flex-col items-center gap-4 md:gap-5 lg:gap-6 text-center">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-light text-neutral-900 tracking-tight">
              정보 활용 동의
            </h1>
            <div className="h-px w-16 md:w-20 lg:w-24 bg-neutral-300"></div>
          </div>

          {/* 동의 내용 */}
          <div className="w-full bg-white border border-neutral-200 p-6 md:p-8 lg:p-10 xl:p-12 space-y-4 md:space-y-5 lg:space-y-6">
            <div className="space-y-3 md:space-y-3.5 lg:space-y-4">
              <h2 className="text-xl md:text-xl lg:text-2xl font-light text-neutral-900">
                개인정보 수집 및 이용 안내
              </h2>
              <div className="h-px bg-neutral-200"></div>
            </div>

            <div className="space-y-4 md:space-y-5 lg:space-y-6 text-neutral-700 text-base md:text-lg leading-relaxed">
              <p>
                LeadMe는 피부 타입 분석 및 맞춤형 스킨케어 추천 서비스 제공을 위해
                다음과 같이 정보를 수집하고 활용합니다.
              </p>

              <div className="space-y-3 md:space-y-3.5 lg:space-y-4 pl-4 md:pl-5 lg:pl-6">
                <div>
                  <span className="font-light text-neutral-900">수집 항목</span>
                  <p className="text-neutral-600 mt-1.5 md:mt-2 text-sm md:text-base">
                    피부 상태, 생활 습관, 환경 정보 등 설문 응답 데이터
                  </p>
                </div>

                <div>
                  <span className="font-light text-neutral-900">이용 목적</span>
                  <p className="text-neutral-600 mt-1.5 md:mt-2 text-sm md:text-base">
                    피부 타입 분석 및 맞춤형 제품 추천
                  </p>
                </div>

                <div>
                  <span className="font-light text-neutral-900">보유 기간</span>
                  <p className="text-neutral-600 mt-1.5 md:mt-2 text-sm md:text-base">
                    현재 세션 종료 시 즉시 삭제 (저장되지 않음)
                  </p>
                </div>
              </div>

              <div className="bg-neutral-100 p-4 md:p-5 lg:p-6 mt-6 md:mt-7 lg:mt-8">
                <p className="text-sm md:text-base text-neutral-600 leading-relaxed">
                  귀하는 위 개인정보 수집 및 이용에 대한 동의를 거부할 권리가 있습니다.
                  다만, 동의를 거부할 경우 서비스 이용이 제한될 수 있습니다.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 하단 버튼 */}
        <div className="flex gap-4 md:gap-5 lg:gap-6 w-full max-w-3xl">
          <Link
            href="/test/1"
            className="flex-1 h-16 md:h-20 lg:h-22 xl:h-24 border-2 border-neutral-300 text-neutral-600 text-xl md:text-xl lg:text-2xl font-light tracking-wide hover:bg-neutral-100 hover:border-neutral-400 transition-all duration-200 active:scale-[0.98] flex items-center justify-center"
          >
            거부
          </Link>
          <Link
            href="/test/1/questions"
            className="flex-1 h-16 md:h-20 lg:h-22 xl:h-24 bg-neutral-900 text-white text-xl md:text-xl lg:text-2xl font-light tracking-wide hover:bg-neutral-800 transition-all duration-200 active:scale-[0.98] flex items-center justify-center"
          >
            동의
          </Link>
        </div>

        {/* 하단 장식 선 */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-neutral-300 to-transparent"></div>
      </div>
    </div>
  );
}
