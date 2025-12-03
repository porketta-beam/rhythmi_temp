"use client";

import { memo } from 'react';

/**
 * 장식 요소 컴포넌트 (배경 블러 효과)
 * React.memo로 감싸서 부모 리렌더링 시에도 다시 렌더링되지 않음
 */
export const DecorativeElements = memo(function DecorativeElements() {
  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
      <div className="absolute top-1/4 left-2 sm:left-10 w-48 sm:w-72 md:w-96 h-48 sm:h-72 md:h-96 bg-cyan-500/10 rounded-full blur-[80px] sm:blur-[100px] md:blur-[120px] animate-pulse" />
      <div
        className="absolute bottom-1/4 right-2 sm:right-10 w-48 sm:w-72 md:w-96 h-48 sm:h-72 md:h-96 bg-purple-500/10 rounded-full blur-[80px] sm:blur-[100px] md:blur-[120px] animate-pulse"
        style={{ animationDelay: "1s" }}
      />
    </div>
  );
});
