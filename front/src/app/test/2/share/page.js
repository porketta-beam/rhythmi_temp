"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import { useEffect, useState, Suspense } from "react";
import Link from "next/link";

function ShareContent() {
  const params = useSearchParams();
  const router = useRouter();
  const [memberId, setMemberId] = useState(null);
  const [shareUrl, setShareUrl] = useState("");

  useEffect(() => {
    // URL 쿼리 파라미터에서 memberID 가져오기
    const idFromUrl = params.get("memberId");
    
    // sessionStorage에서 memberID 가져오기 시도
    let id = idFromUrl;
    if (!id && typeof window !== "undefined") {
      const storedId = sessionStorage.getItem("memberId");
      if (storedId) {
        id = storedId;
      } else {
        // 없으면 새로 생성
        id = (typeof crypto !== "undefined" && crypto.randomUUID) 
          ? crypto.randomUUID() 
          : `member_${Date.now()}`;
        sessionStorage.setItem("memberId", id);
      }
    }

    if (id) {
      setMemberId(id);
      // 공유 URL 생성 (환경 변수 사용)
      const frontendUrl = process.env.NEXT_PUBLIC_FRONTEND_URL
        || (typeof window !== "undefined" ? window.location.origin : "");
      const url = `${frontendUrl}/share?memberId=${encodeURIComponent(id)}`;
      setShareUrl(url);
    }
  }, [params]);

  const handleReset = () => {
    // sessionStorage 정리
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("surveyAnswers");
      sessionStorage.removeItem("memberId");
    }
    router.push("/test/2");
  };

  if (!memberId || !shareUrl) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <div className="text-2xl text-orange-700 font-bold">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="col-span-2 flex flex-col items-center justify-center gap-8 z-10">
      {/* QR 코드 */}
      <div className="bg-white rounded-3xl p-8 shadow-2xl">
        <div className="flex flex-col items-center gap-6">
          <h2 className="text-3xl font-bold text-orange-900 text-center break-keep">
            QR 코드를 스캔하여<br />결과를 공유하세요
          </h2>
          <div className="bg-white p-4 rounded-2xl border-4 border-orange-200">
            <QRCodeSVG
              value={shareUrl}
              size={280}
              level="H"
              includeMargin={true}
              fgColor="#9a3412"
            />
          </div>
          <p className="text-lg text-orange-700 text-center break-keep max-w-md">
            위 QR 코드를 스캔하면<br />피부 진단 결과를 확인할 수 있습니다
          </p>
        </div>
      </div>

      {/* 다시 시작하기 버튼 */}
      <Link
        href="/test/2"
        onClick={handleReset}
        className="w-full max-w-md px-12 py-4 bg-gradient-to-r from-orange-500 to-yellow-500 text-white text-xl font-bold rounded-full shadow-2xl hover:shadow-orange-300 hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 break-keep"
      >
        <span>다시 시작하기</span>
        <span className="text-2xl">🔄</span>
      </Link>
    </div>
  );
}

export default function SharePage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center w-full h-full">
        <div className="text-2xl text-orange-700 font-bold">로딩 중...</div>
      </div>
    }>
      <ShareContent />
    </Suspense>
  );
}

