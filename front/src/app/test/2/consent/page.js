import Link from "next/link";

export default function Consent2() {
  return (
    <div className="min-h-screen bg-orange-50 flex items-center justify-center p-8">
      <div className="w-full max-w-[1080px] min-h-screen bg-gradient-to-b from-orange-50 via-yellow-50 to-orange-50 flex flex-col items-center justify-between py-12 md:py-16 lg:py-20 xl:py-24 px-8 md:px-12 lg:px-14 xl:px-16 relative overflow-hidden">
        {/* 홈 버튼 */}
        <Link
          href="/list"
          className="absolute top-8 left-8 px-6 py-3 text-sm text-orange-700 hover:text-orange-900 transition-colors bg-white/50 rounded-full backdrop-blur-sm"
        >
          ← 목록으로
        </Link>

        {/* 배경 장식 */}
        <div className="absolute top-32 right-16 w-96 h-96 bg-orange-200/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-32 left-16 w-96 h-96 bg-yellow-200/30 rounded-full blur-3xl"></div>

        {/* 상단 영역 */}
        <div className="flex flex-col items-center gap-6 mt-12 z-10">
          <div className="w-28 h-28 bg-gradient-to-br from-orange-400 to-yellow-400 rounded-3xl flex items-center justify-center shadow-xl">
            <span className="text-white text-2xl font-bold">LeadMe</span>
          </div>
        </div>

        {/* 중앙 콘텐츠 */}
        <div className="flex flex-col items-center gap-12 w-full max-w-3xl z-10">
          {/* 제목 */}
          <div className="flex flex-col items-center gap-4 text-center">
            <h1 className="text-6xl font-bold text-orange-900">
              잠깐만요! 📋
            </h1>
            <p className="text-3xl text-orange-700 font-semibold">
              먼저 확인해주세요
            </p>
          </div>

          {/* 동의 내용 */}
          <div className="w-full bg-white/90 backdrop-blur-sm rounded-3xl p-12 shadow-2xl border-2 border-orange-200">
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <span className="text-4xl">🔒</span>
                <h2 className="text-3xl font-bold text-orange-900">
                  개인정보 활용 안내
                </h2>
              </div>

              <div className="space-y-6 text-orange-800 text-xl leading-relaxed">
                <p className="font-semibold">
                  여러분의 피부를 더 잘 알기 위해<br />
                  몇 가지 정보가 필요해요! 💕
                </p>

                <div className="space-y-6 bg-orange-50 rounded-2xl p-8">
                  <div className="flex gap-4">
                    <span className="text-3xl flex-shrink-0">📝</span>
                    <div>
                      <p className="font-bold text-orange-900 text-xl mb-2">무엇을 물어볼까요?</p>
                      <p className="text-orange-700">
                        피부 상태, 생활 습관, 환경 정보 등
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <span className="text-3xl flex-shrink-0">✨</span>
                    <div>
                      <p className="font-bold text-orange-900 text-xl mb-2">왜 필요할까요?</p>
                      <p className="text-orange-700">
                        딱 맞는 스킨케어를 추천하기 위해서예요
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <span className="text-3xl flex-shrink-0">🗑️</span>
                    <div>
                      <p className="font-bold text-orange-900 text-xl mb-2">언제까지 보관할까요?</p>
                      <p className="text-orange-700">
                        지금 이 화면에서만! 종료하면 바로 사라져요
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-100 border-2 border-yellow-300 rounded-2xl p-6 mt-6">
                  <p className="text-lg text-orange-800 leading-relaxed">
                    💡 동의하지 않으셔도 괜찮아요.<br />
                    다만, 서비스를 이용하실 수 없어요.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 하단 버튼 */}
        <div className="flex gap-6 w-full max-w-3xl z-10">
          <Link
            href="/test/2"
            className="flex-1 h-28 bg-white border-4 border-orange-300 text-orange-700 text-3xl font-bold rounded-full hover:bg-orange-50 hover:border-orange-400 transition-all duration-200 active:scale-95 flex items-center justify-center shadow-lg"
          >
            <span>거부할게요</span>
          </Link>
          <Link
            href="/test/2/questions"
            className="flex-1 h-28 bg-gradient-to-r from-orange-500 to-yellow-500 text-white text-3xl font-bold rounded-full shadow-2xl hover:shadow-orange-300 hover:scale-105 transition-all duration-300 active:scale-95 flex items-center justify-center gap-3"
          >
            <span>동의해요</span>
            <span className="text-4xl">👍</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
