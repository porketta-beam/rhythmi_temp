"use client";

import { AnimatedBackground } from "../../components/lottery/AnimatedBackground";
import { DecorativeElements } from "../../components/lottery/DecorativeElements";

/**
 * 경품 추첨 공통 레이아웃
 *
 * /lottery, /lottery/main, /lottery/waiting 페이지에서 공유됩니다.
 * 페이지 전환 시 배경이 유지되어 부드러운 전환 효과를 제공합니다.
 *
 * 참고: /lottery/admin은 별도의 layout.js를 가지므로 이 레이아웃을 사용하지 않습니다.
 */
export default function LotteryLayout({ children }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#10062D] via-[#341f97] to-[#c9208a]">
      {/* 공통 배경 요소 - 페이지 전환 시에도 유지됨 */}
      <AnimatedBackground />
      <DecorativeElements />

      {/* 페이지 콘텐츠 */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
