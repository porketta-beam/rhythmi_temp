import Link from "next/link";
import Image from "next/image";

export default function Consent2() {
  return (
    <>
        {/* 좌측: 동의 내용 */}
        <div className="flex flex-col justify-center gap-12 z-10">
          {/* 로고 */}
          {/* <div className="w-48 h-48 rounded-3xl flex items-center justify-center shadow-xl overflow-hidden">
              <Image 
                src="/rhythmi_logo.svg" 
                alt="Rhythmi Logo" 
                width={192} 
                height={192}
                className="w-full h-full object-contain"
              />
          </div> */}

          {/* 제목 */}
          <div className="flex flex-col gap-6">
            <h1 className="text-8xl font-bold text-orange-900">
              최적의 피부진단을 위해
            </h1>
            <p className="text-5xl text-orange-700 font-semibold">
              개인정보 활용동의가 필요해요!
            </p>
          </div>

          {/* 동의 설명 */}
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-12 shadow-2xl border-2 border-orange-200 space-y-8">
            <div className="flex items-center gap-6">
              <span className="text-6xl">🔒</span>
              <h2 className="text-5xl font-bold text-orange-900">
                개인정보 활용 동의 안내
              </h2>
            </div>

            <p className="text-4xl text-orange-800 font-semibold leading-relaxed">
              여러분의 피부를 더 잘 알기 위해<br />
              몇 가지 정보가 필요해요! 💕
            </p>

            <div className="space-y-6 bg-orange-50 rounded-2xl p-10">
              <div className="flex gap-6">
                <span className="text-5xl flex-shrink-0">📝</span>
                <div>
                  <p className="font-bold text-orange-900 text-4xl mb-3">무엇을 수집하나요?</p>
                  <p className="text-orange-700 text-3xl">
                  성별, 연령 등 기본 설문항목과 피부 분석을 위한 사진
                  </p>
                </div>
              </div>

              <div className="flex gap-6">
                <span className="text-5xl flex-shrink-0">✨</span>
                <div>
                  <p className="font-bold text-orange-900 text-4xl mb-3">수집 목적은 무엇인가요?</p>
                  <p className="text-orange-700 text-3xl">
                  AI 피부 분석을 통해 개인 맞춤 진단 제공 <br />
                  서비스 개선을 위한 통계 및 표본 분석
                  </p>
                </div>
              </div>

              <div className="flex gap-6">
                <span className="text-5xl flex-shrink-0">🗑️</span>
                <div>
                  <p className="font-bold text-orange-900 text-4xl mb-3">언제까지 보관하나요?</p>
                  <p className="text-orange-700 text-3xl">
                  사진: 분석결과 산출 후 즉시 자동 삭제 <br />
                  설문 응답 : 익명화 후 최대 6개월 보관 (통계 처리 후 삭제)
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 버튼 */}
          <div className="flex gap-8">
            <Link
              href="/test/2"
              className="flex-1 h-36 bg-white border-4 border-orange-300 text-orange-700 text-4xl font-bold rounded-full hover:bg-orange-50 hover:border-orange-400 transition-all duration-200 active:scale-95 flex items-center justify-center shadow-lg"
            >
              거부할게요
            </Link>
            <Link
              href="/test/2/camera"
              className="flex-1 h-36 bg-gradient-to-r from-orange-500 to-yellow-500 text-white text-4xl font-bold rounded-full shadow-2xl hover:shadow-orange-300 hover:scale-105 transition-all duration-300 active:scale-95 flex items-center justify-center gap-4"
            >
              <span>동의해요</span>
              <span className="text-5xl">👍</span>
            </Link>
          </div>
        </div>

        {/* 우측: 시각적 강조 */}
        <div className="flex flex-col items-center justify-center gap-16 z-10">
          {/* 보안 강조 아이콘 */}
          <div className="w-96 h-96 bg-white/80 rounded-full flex items-center justify-center shadow-2xl backdrop-blur-sm">
            <span className="text-[200px]">🔐</span>
          </div>

          {/* 주의 문구 */}
          <div className="bg-yellow-100 border-4 border-yellow-300 rounded-3xl p-12 shadow-xl max-w-2xl">
            <p className="text-4xl text-orange-800 leading-relaxed text-left">
              💡 동의하지 않아도 괜찮아요<br />
              <span className="font-bold">{'\u00A0'}단, 서비스 이용이 제한될 수 있어요.</span>
            </p>
          </div>
        </div>
    </>
  );
}
