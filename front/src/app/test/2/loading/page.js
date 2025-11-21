"use client";

import { useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { questions } from "@/data/questions";
import Image from "next/image";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

function Loading2Content() {
  const router = useRouter();
  const params = useSearchParams();
  const postedRef = useRef(false);

  useEffect(() => {
    if (postedRef.current) return; // React StrictMode 중복 실행 방지
    postedRef.current = true;

    const answersStr = sessionStorage.getItem("surveyAnswers");
    const answers = answersStr ? JSON.parse(answersStr) : {};

    // 제출마다 새로운 member_id 생성
    const memberId = (typeof crypto !== "undefined" && crypto.randomUUID) ? crypto.randomUUID() : null;

    // option id -> label 매핑 테이블 (프론트 질문 정의용)
    const optionIdToLabel = (() => {
      const map = {};
      questions.forEach((q) => {
        (q.options || []).forEach((opt) => {
          if (opt?.id) map[opt.id] = opt.text || opt.label || String(opt);
        });
      });
      return map;
    })();

    async function resolveFormId() {
      const urlParam = params.get("formId");
      if (urlParam) return urlParam;

      // share_url=test/2 로 조회 (없으면 에러 처리)
      const byShare = await fetch(`${API_BASE}/api/forms?share_url=test/2`);
      if (byShare.ok) {
        const arr = await byShare.json();
        if (Array.isArray(arr) && arr.length > 0) return arr[0].id;
      }
      return null;
    }

    async function postResponses() {
      try {
        const formId = await resolveFormId();
        if (!formId) throw new Error("formId를 찾을 수 없습니다. URL에 ?formId=UUID 추가하거나 share_url=test/2 폼을 생성하세요.");

        // 폼 정의 조회해서 field 순서/ID 확보
        const formRes = await fetch(`${API_BASE}/api/forms/${formId}`);
        if (!formRes.ok) throw new Error("폼 정보를 불러오지 못했습니다");
        const form = await formRes.json();

        // fields 정규화: 배열 또는 객체({ fields: [...] }) 모두 지원
        let fieldsRaw = form.fields;
        let fieldsArray = [];
        if (Array.isArray(fieldsRaw)) {
          fieldsArray = fieldsRaw;
        } else if (fieldsRaw && Array.isArray(fieldsRaw.fields)) {
          fieldsArray = fieldsRaw.fields;
        } else {
          fieldsArray = [];
        }
        const fieldsOrdered = [...fieldsArray].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

        // q1, q2 ... → 해당 field.id 로 매핑하여 저장
        const responsesMapped = {};
        fieldsOrdered.forEach((field, index) => {
          const ordinalKey = `q${index + 1}`;
          const selectedId = answers[ordinalKey];
          // 폼 정의의 옵션에서 index/label 계산 (옵션이 문자열 배열이라고 가정)
          const opts = Array.isArray(field.options) ? field.options : [];
          let text = null;
          if (selectedId !== undefined) {
            const labelFromClient = optionIdToLabel[selectedId];
            const matched = opts.find((t) => String(t) === String(labelFromClient));
            text = matched ?? labelFromClient ?? null; // 폼 옵션과 일치 못 찾으면 프론트 라벨로 저장
          }
          if (text !== null) {
            responsesMapped[field.id] = {
              value: text,
              id: selectedId ?? null
            };
          }
        });

        const payload = {
          form_id: formId,
          member_id: memberId,
          responses: responsesMapped,
          form_version: 1
        };
        await fetch(`${API_BASE}/api/forms/${formId}/responses`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        const timer = setTimeout(() => {
          router.push("/test/2/result");
        }, 800);
        return () => clearTimeout(timer);
      } catch (e) {
        console.error("응답 저장 실패", e);
        alert(e.message || "응답 저장 중 오류가 발생했습니다");
        router.back();
      }
    }

    postResponses();
  }, [router, params]);

  return (
    <>
        {/* 좌측: 로딩 애니메이션과 메시지 */}
        <div className="col-span-2 flex flex-col justify-center items-center gap-20">

          {/* 로딩 스피너 */}
          <div className="relative">
            <div className="w-80 h-80 border-[20px] border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[120px]">
              <Image 
                src="/rhythmi_logo.svg" 
                alt="Rhythmi Logo" 
                width={192} 
                height={192}
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          {/* 메시지 */}
          <div className="flex flex-col items-center gap-8">
            <h2 className="text-8xl font-bold text-orange-900 text-center leading-tight">
              AI가 열심히<br />
              분석하고 있어요! ✨
            </h2>
            <p className="text-4xl text-orange-700 font-semibold">
              잠시만 기다려주세요...
            </p>
          </div>
        </div>

        {/* 우측: 피부 타입 미리보기
        <div className="flex flex-col items-center justify-center gap-20 z-10">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-16 shadow-2xl">
            <div className="flex items-center gap-6 mb-12">
              <span className="text-6xl">🔍</span>
              <h3 className="text-5xl font-bold text-orange-900">
                5가지 피부 타입 분석 중
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-8">
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-3xl p-10 shadow-lg">
                <div className="text-7xl mb-4">🌸</div>
                <p className="text-3xl font-bold text-orange-900">건조 민감형</p>
              </div>
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-3xl p-10 shadow-lg">
                <div className="text-7xl mb-4">🏠</div>
                <p className="text-3xl font-bold text-orange-900">건조 실내형</p>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-yellow-100 rounded-3xl p-10 shadow-lg">
                <div className="text-7xl mb-4">🛡️</div>
                <p className="text-3xl font-bold text-orange-900">민감 보호형</p>
              </div>
              <div className="bg-gradient-to-br from-yellow-50 to-orange-100 rounded-3xl p-10 shadow-lg">
                <div className="text-7xl mb-4">⚡</div>
                <p className="text-3xl font-bold text-orange-900">활동 밸런스형</p>
              </div>
            </div>

            <div className="mt-8 bg-gradient-to-br from-orange-100 to-yellow-100 rounded-3xl p-10 shadow-lg">
              <div className="text-7xl mb-4">✨</div>
              <p className="text-3xl font-bold text-orange-900">미니멀 케어형</p>
            </div>
          </div>

          <div className="bg-yellow-100 border-4 border-yellow-300 rounded-3xl p-12 shadow-xl max-w-2xl">
            <p className="text-4xl text-orange-800 leading-relaxed text-center">
              💡 회원님의 응답을 바탕으로<br />
              <span className="font-bold">가장 적합한 피부 타입을 찾고 있어요!</span>
            </p>
          </div>
        </div> */}
    </>
  );
}

export default function Loading2() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-24 h-24 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
      </div>
    }>
      <Loading2Content />
    </Suspense>
  );
}
