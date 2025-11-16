"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { questions } from "@/data/questions";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

export default function Loading2() {
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
    <div className="min-h-screen bg-orange-50 flex items-center justify-center p-4 md:p-6 lg:p-8">
      <div className="w-full max-w-[1080px] min-h-screen bg-gradient-to-b from-orange-50 via-yellow-50 to-orange-50 flex flex-col items-center justify-center gap-8 md:gap-10 lg:gap-12 relative overflow-hidden">
        {/* 배경 장식 */}
        <div className="absolute top-20 md:top-24 lg:top-28 xl:top-32 right-10 md:right-12 lg:right-14 xl:right-16 w-64 h-64 md:w-80 md:h-80 lg:w-88 lg:h-88 xl:w-96 xl:h-96 bg-orange-200/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 md:bottom-24 lg:bottom-28 xl:bottom-32 left-10 md:left-12 lg:left-14 xl:left-16 w-64 h-64 md:w-80 md:h-80 lg:w-88 lg:h-88 xl:w-96 xl:h-96 bg-yellow-200/30 rounded-full blur-3xl"></div>

        {/* 로딩 애니메이션 */}
        <div className="flex flex-col items-center gap-8 md:gap-10 lg:gap-12 z-10">
          <div className="relative">
            <div className="w-32 h-32 md:w-36 md:h-36 lg:w-40 lg:h-40 border-6 md:border-7 lg:border-8 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-3xl md:text-4xl lg:text-5xl">
              🤖
            </div>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-orange-900 text-center leading-tight">
            AI가 열심히<br />
            분석하고 있어요! ✨
          </h2>
          <p className="text-xl md:text-xl lg:text-2xl text-orange-700 font-semibold">
            잠시만 기다려주세요...
          </p>
        </div>
      </div>
    </div>
  );
}
