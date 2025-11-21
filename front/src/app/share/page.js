"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { resultData } from "@/data/resultData";
import { API_BASE } from "@/lib/apiConfig";
import Script from "next/script";
import Image from "next/image";

function ShareContent() {
  const params = useSearchParams();
  const memberId = params.get("memberId");

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 아코디언 상태 관리 (Hook은 항상 최상단에!)
  const [openSections, setOpenSections] = useState({
    overview: true,
    analysis: false,
    care: false,
    routines: false,
    ingredients: false
  });

  const toggleSection = (section) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  useEffect(() => {
    if (memberId) {
      fetchResult(memberId);
    } else {
      setError("회원 ID가 없습니다");
      setLoading(false);
    }
  }, [memberId]);

  // Kakao SDK 초기화
  useEffect(() => {
    if (typeof window !== 'undefined' && window.Kakao && !window.Kakao.isInitialized()) {
      const kakaoKey = process.env.NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY;
      if (kakaoKey && kakaoKey !== 'YOUR_KAKAO_JAVASCRIPT_KEY_HERE') {
        window.Kakao.init(kakaoKey);
        console.log('✅ Kakao SDK 초기화 완료');
      }
    }
  }, []);

  async function fetchResult(id) {
    try {
      setLoading(true);

      console.log("🔍 [DEBUG] API Base:", API_BASE);
      console.log("🔍 [DEBUG] Member ID:", id);

      const apiUrl = `${API_BASE}/api/result?member_id=${id}&share_url=test/2`;
      console.log("🔍 [DEBUG] API URL:", apiUrl);

      const response = await fetch(apiUrl);

      console.log("🔍 [DEBUG] Response Status:", response.status);
      console.log("🔍 [DEBUG] Response OK:", response.ok);

      if (!response.ok) {
        const errorData = await response.json();
        console.log("❌ [DEBUG] Error Response:", errorData);
        throw new Error(errorData.error?.message || "결과를 불러올 수 없습니다");
      }

      const data = await response.json();
      console.log("✅ [DEBUG] API Success Response:", data);

      const resultType = data.data.result_type;
      console.log("✅ [DEBUG] Result Type:", resultType);

      // resultData에서 해당 타입의 데이터 가져오기
      if (resultData[resultType]) {
        setResult({
          ...resultData[resultType],
          resultType,
          source: data.data.source,
          classifiedAt: data.data.classified_at
        });
      } else {
        throw new Error(`결과 타입을 찾을 수 없습니다: ${resultType}`);
      }
    } catch (err) {
      console.error("결과 조회 에러:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // 카카오톡 공유 함수
  const handleKakaoShare = () => {
    if (typeof window === 'undefined' || !window.Kakao) {
      alert('카카오톡 공유 기능을 불러올 수 없습니다.');
      return;
    }

    if (!window.Kakao.isInitialized()) {
      alert('카카오톡 SDK가 초기화되지 않았습니다. JavaScript 키를 확인해주세요.');
      return;
    }

    const currentUrl = `${process.env.NEXT_PUBLIC_FRONTEND_URL}/share?memberId=${memberId}`;
    const imageUrl = `${process.env.NEXT_PUBLIC_FRONTEND_URL}${result.modelImage}`;

    window.Kakao.Share.sendDefault({
      objectType: 'feed',
      content: {
        title: result.type,
        description: result.description,
        imageUrl: imageUrl, // 모델 이미지 사용
        link: {
          mobileWebUrl: currentUrl,
          webUrl: currentUrl,
        },
      },
      buttons: [
        {
          title: '내 진단 결과 보기',
          link: {
            mobileWebUrl: currentUrl,
            webUrl: currentUrl,
          },
        },
      ],
    });
  };

  // 로딩 상태
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-pulse">💧</div>
          <div className="text-xl text-orange-900 font-bold">
            결과를 불러오는 중...
          </div>
        </div>
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 shadow-2xl max-w-md text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-orange-900 mb-4">
            결과를 불러올 수 없습니다
          </h2>
          <p className="text-orange-700 mb-6">{error}</p>
          <a
            href="/test/2"
            className="inline-block px-8 py-3 bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-bold rounded-full hover:scale-105 transition-all duration-300"
          >
            다시 진단하기
          </a>
        </div>
      </div>
    );
  }

  // 결과 없음
  if (!result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 flex items-center justify-center p-4">
        <div className="text-center text-xl text-orange-900">
          결과를 찾을 수 없습니다
        </div>
      </div>
    );
  }

  // 결과 표시 - 모바일 아코디언 UI
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* 헤더 */}
        <div className="bg-white rounded-3xl p-10 shadow-2xl text-center">
          {/* 모델 이미지 */}
          <div className="relative w-[200px] h-[200px] mx-auto rounded-full overflow-hidden shadow-2xl border-4 border-orange-300 mb-4">
            <Image
              src={result.modelImage}
              alt={result.type}
              fill
              className="object-cover"
              priority
              sizes="200px"
            />
          </div>
          <h1 className="text-3xl font-bold text-orange-900 mb-4 break-keep">
            {result.type}
          </h1>
          <p className="text-lg text-orange-700 leading-relaxed break-keep">
            {result.description}
          </p>
        </div>

        {/* 아코디언 섹션 1: 개요 */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <button
            onClick={() => toggleSection('overview')}
            className="w-full p-6 flex items-center justify-between hover:bg-orange-50 transition-all duration-200"
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl">📋</span>
              <h2 className="text-2xl font-bold text-orange-900 break-keep">피부 타입 개요</h2>
            </div>
            <span className={`text-2xl transition-transform duration-200 ${openSections.overview ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </button>
          {openSections.overview && (
            <div className="px-8 pt-4 pb-8 space-y-4">
              <div className="bg-gradient-to-br from-orange-100 to-yellow-100 p-5 rounded-xl border-2 border-orange-300">
                <h3 className="text-xl font-bold text-orange-900 mb-2 flex items-center gap-2 break-keep">
                  <span className="text-2xl">🎯</span> 핵심 케어 목표
                </h3>
                <p className="text-lg text-orange-900 font-bold leading-relaxed break-keep">
                  &quot;{result.careGoal}&quot;
                </p>
              </div>
            </div>
          )}
        </div>

        {/* 아코디언 섹션 2: 피부 분석 */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <button
            onClick={() => toggleSection('analysis')}
            className="w-full p-6 flex items-center justify-between hover:bg-orange-50 transition-all duration-200"
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl">🔬</span>
              <h2 className="text-2xl font-bold text-orange-900 break-keep">상세 피부 분석</h2>
            </div>
            <span className={`text-2xl transition-transform duration-200 ${openSections.analysis ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </button>
          {openSections.analysis && (
            <div className="px-8 pt-4 pb-8 space-y-4">
              <div className="bg-blue-50 p-4 rounded-xl border-2 border-blue-200">
                <h3 className="text-base font-bold text-blue-900 mb-2 flex items-center gap-1.5 break-keep">
                  <span className="text-lg">💧</span> 수분/유분 밸런스
                </h3>
                <p className="text-sm text-blue-800 leading-relaxed break-keep">{result.balance}</p>
              </div>

              <div className="bg-yellow-50 p-4 rounded-xl border-2 border-yellow-200">
                <h3 className="text-base font-bold text-yellow-900 mb-2 flex items-center gap-1.5 break-keep">
                  <span className="text-lg">✨</span> 피지 분비량
                </h3>
                <p className="text-sm text-yellow-800 leading-relaxed break-keep">{result.sebum}</p>
              </div>

              <div className="bg-green-50 p-4 rounded-xl border-2 border-green-200">
                <h3 className="text-base font-bold text-green-900 mb-2 flex items-center gap-1.5 break-keep">
                  <span className="text-lg">🔍</span> 모공 상태
                </h3>
                <p className="text-sm text-green-800 leading-relaxed break-keep">{result.pore}</p>
              </div>

              <div className="bg-purple-50 p-4 rounded-xl border-2 border-purple-200">
                <h3 className="text-base font-bold text-purple-900 mb-2 flex items-center gap-1.5 break-keep">
                  <span className="text-lg">🛡️</span> 장벽 강도
                </h3>
                <p className="text-sm text-purple-800 leading-relaxed break-keep">{result.barrier}</p>
              </div>

              <div className="bg-red-50 p-4 rounded-xl border-2 border-red-200">
                <h3 className="text-base font-bold text-red-900 mb-2 flex items-center gap-1.5 break-keep">
                  <span className="text-lg">🌡️</span> 온도 반응성
                </h3>
                <p className="text-sm text-red-800 leading-relaxed break-keep">{result.temperature}</p>
              </div>
            </div>
          )}
        </div>

        {/* 아코디언 섹션 3: 원인 & 케어 */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <button
            onClick={() => toggleSection('care')}
            className="w-full p-6 flex items-center justify-between hover:bg-orange-50 transition-all duration-200"
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl">💡</span>
              <h2 className="text-2xl font-bold text-orange-900 break-keep">문제 원인 & 케어</h2>
            </div>
            <span className={`text-2xl transition-transform duration-200 ${openSections.care ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </button>
          {openSections.care && (
            <div className="px-8 pt-4 pb-8 space-y-5">
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-orange-800 mb-3 break-keep">❗ 문제 원인 분석</h3>

                <div className="bg-red-50 p-4 rounded-xl border-2 border-red-200">
                  <h4 className="text-base font-bold text-red-900 mb-1.5 break-keep">🌍 외부 요인</h4>
                  <p className="text-sm text-red-800 leading-relaxed break-keep">{result.causes.external}</p>
                </div>

                <div className="bg-orange-50 p-4 rounded-xl border-2 border-orange-200">
                  <h4 className="text-base font-bold text-orange-900 mb-1.5 break-keep">🧠 내부 요인</h4>
                  <p className="text-sm text-orange-800 leading-relaxed break-keep">{result.causes.internal}</p>
                </div>

                <div className="bg-pink-50 p-4 rounded-xl border-2 border-pink-200">
                  <h4 className="text-base font-bold text-pink-900 mb-1.5 break-keep">⚠️ 결과</h4>
                  <p className="text-sm text-pink-800 leading-relaxed break-keep">{result.causes.result}</p>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-orange-800 mb-4 break-keep">🚫 피해야 할 습관</h3>
                <div className="space-y-3">
                  {result.avoidHabits.map((habit, index) => (
                    <div key={index} className="flex items-start gap-3 bg-red-50 p-4 rounded-xl border-2 border-red-200">
                      <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 text-sm">
                        ✕
                      </div>
                      <p className="text-sm text-red-900 font-semibold leading-relaxed break-keep">{habit}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 아코디언 섹션 4: 추천 루틴 */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <button
            onClick={() => toggleSection('routines')}
            className="w-full p-6 flex items-center justify-between hover:bg-orange-50 transition-all duration-200"
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl">⏰</span>
              <h2 className="text-2xl font-bold text-orange-900 break-keep">시간대별 추천 루틴</h2>
            </div>
            <span className={`text-2xl transition-transform duration-200 ${openSections.routines ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </button>
          {openSections.routines && (
            <div className="px-8 pt-4 pb-8 space-y-4">
              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-5 rounded-xl border-2 border-yellow-300">
                <h3 className="text-lg font-bold text-orange-900 mb-2 flex items-center gap-1.5 break-keep">
                  <span className="text-2xl">🌅</span> 아침 루틴
                </h3>
                <p className="text-base text-orange-800 font-bold leading-relaxed break-keep">
                  {result.routines.morning}
                </p>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-5 rounded-xl border-2 border-blue-300">
                <h3 className="text-lg font-bold text-blue-900 mb-2 flex items-center gap-1.5 break-keep">
                  <span className="text-2xl">☀️</span> 낮 루틴 (외출 중)
                </h3>
                <p className="text-base text-blue-800 font-bold leading-relaxed break-keep">
                  {result.routines.daytime}
                </p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-5 rounded-xl border-2 border-purple-300">
                <h3 className="text-lg font-bold text-purple-900 mb-2 flex items-center gap-1.5 break-keep">
                  <span className="text-2xl">🌙</span> 저녁 루틴
                </h3>
                <p className="text-base text-purple-800 font-bold leading-relaxed break-keep">
                  {result.routines.evening}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* 아코디언 섹션 5: 성분 가이드 */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <button
            onClick={() => toggleSection('ingredients')}
            className="w-full p-6 flex items-center justify-between hover:bg-orange-50 transition-all duration-200"
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl">🧪</span>
              <h2 className="text-2xl font-bold text-orange-900 break-keep">성분 가이드</h2>
            </div>
            <span className={`text-2xl transition-transform duration-200 ${openSections.ingredients ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </button>
          {openSections.ingredients && (
            <div className="px-8 pt-4 pb-8 space-y-5">
              <div>
                <h3 className="text-xl font-bold text-green-900 mb-4 flex items-center gap-1.5 break-keep">
                  <span className="text-2xl">✅</span> 추천 성분
                </h3>
                <div className="space-y-3">
                  {result.ingredients.recommended.map((ingredient, index) => (
                    <div key={index} className="bg-green-50 p-4 rounded-xl border-2 border-green-200">
                      <h4 className="text-base font-bold text-green-900 mb-1.5 break-keep">
                        {ingredient.name}
                      </h4>
                      <p className="text-sm text-green-800 leading-relaxed break-keep">
                        💚 {ingredient.effect}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-red-900 mb-4 flex items-center gap-1.5 break-keep">
                  <span className="text-2xl">⚠️</span> 피해야 할 성분
                </h3>
                <div className="bg-red-50 p-5 rounded-xl border-2 border-red-300">
                  <p className="text-base text-red-900 font-bold leading-relaxed break-keep">
                    {result.ingredients.avoid}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 카카오톡 공유하기 버튼 */}
        <div className="text-center pt-6 pb-4">
          <button
            onClick={handleKakaoShare}
            className="inline-block px-12 py-4 bg-gradient-to-r from-orange-500 to-yellow-500 text-white text-xl font-bold rounded-full shadow-2xl hover:shadow-orange-300 hover:scale-105 transition-all duration-300 cursor-pointer"
          >
            카카오톡 공유하기 💬
          </button>
        </div>

        {/* 디버그 정보 (개발 모드에서만) */}
        {process.env.NODE_ENV === "development" && (
          <div className="mt-6 p-4 bg-gray-100 rounded-lg text-sm text-gray-600">
            <p><strong>Member ID:</strong> {memberId}</p>
            <p><strong>Result Type:</strong> {result.resultType}</p>
            <p><strong>Source:</strong> {result.source}</p>
            <p><strong>Classified At:</strong> {result.classifiedAt}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SharePage() {
  return (
    <>
      {/* Kakao JavaScript SDK 로드 */}
      <Script
        src="https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js"
        integrity="sha384-TiCUE00h649CAMonG018J2ujOgDKW/kVWlChEuu4jK2vxfAAD0eZxzCKakxg55G4"
        crossOrigin="anonymous"
        strategy="afterInteractive"
      />

      <Suspense
        fallback={
          <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 flex items-center justify-center">
            <div className="text-2xl text-orange-700 font-bold">로딩 중...</div>
          </div>
        }
      >
        <ShareContent />
      </Suspense>
    </>
  );
}
