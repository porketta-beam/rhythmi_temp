"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Consent2() {
  // memberId 초기 생성 및 저장 (설문 시작 시점)
  useEffect(() => {
    if (typeof window !== "undefined") {
      let memberId = sessionStorage.getItem("memberId");
      if (!memberId) {
        memberId = (typeof crypto !== "undefined" && crypto.randomUUID)
          ? crypto.randomUUID()
          : `member_${Date.now()}`;
        sessionStorage.setItem("memberId", memberId);
        console.log("✅ [Consent] memberId 생성:", memberId);
      } else {
        console.log("✅ [Consent] 기존 memberId 사용:", memberId);
      }
    }
  }, []);

  return (
    <div className="col-span-2 flex flex-col items-center justify-center z-10">
      {/* 동의 설명 */}
      <div className="w-full bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-2xl">
        {/* 제목 */}
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          개인정보 수집 및 이용 안내
        </h1>

        {/* 수평선 */}
        <hr className="border-t-2 border-gray-300 mb-6" />

        <div className="grid grid-cols-2 gap-x-16 gap-y-5 mb-5">
          {/* 왼쪽 열 */}
          <div className="space-y-4">
            <div>
              <h2 className="text-base font-bold text-gray-900 mb-2">1. 수집 항목</h2>
              <ul className="space-y-0.5 text-sm text-gray-700">
                <li>• 나이 및 직업군</li>
                <li>• 텍스트 문항에 대한 응답</li>
                <li>• AI 분석 결과</li>
              </ul>
            </div>

            <div>
              <h2 className="text-base font-bold text-gray-900 mb-2">2. 이용 목적</h2>
              <ul className="space-y-0.5 text-sm text-gray-700">
                <li>• 사용자 맞춤형 피부 리듬 진단 및 분석 제공</li>
                <li>• 피부 상태별 추천 솔루션 안내</li>
                <li>• 서비스 품질 향상을 위한 내부 분석</li>
              </ul>
            </div>
          </div>

          {/* 오른쪽 열 */}
          <div className="space-y-4">
            <div>
              <h2 className="text-base font-bold text-gray-900 mb-2">3. 보유 및 이용 기간</h2>
              <ul className="space-y-0.5 text-sm text-gray-700">
                <li>• 수집된 정보는 서비스 운영 및 품질 향상을 위한 내부 목적이 유지되는 동안 안전하게 보관 및 이용됩니다.</li>
              </ul>
              <p className="text-sm text-red-600 font-semibold mt-1.5">
                • 단, 카메라 촬영 이미지는 분석을 위한 일시적 처리 후 곧바로 즉시 측각 식제됩니다.
              </p>
            </div>

            <div>
              <h2 className="text-base font-bold text-gray-900 mb-2">4. 동의 거부 권리 및 불이익</h2>
              <ul className="space-y-0.5 text-sm text-gray-700">
                <li>• 사용자는 개인정보 수집 및 이용에 대해 동의를 거부할 권리가 있습니다.</li>
                <li>• 동의하지 않을 경우.</li>
                <li className="ml-4">본 AI 리듬 테스트 서비스 이용이 제한될 수 있습니다.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 동의 문구 */}
        <p className="text-sm text-gray-700 text-center mb-4">
          위 내용을 확인하였으며, 개인정보 수집 및 이용에 동의합니다.
        </p>

        {/* 버튼 */}
        <div className="flex justify-center">
          <Link
            href="/test/2/camera"
            className="px-28 py-3 bg-[#FFB88C] hover:bg-[#FFA366] text-white text-lg font-bold rounded-full shadow-lg transition-all duration-300 hover:scale-105 active:scale-95"
          >
            동의합니다.
          </Link>
        </div>
      </div>
    </div>
  );
}
