'use client';

import { useState, useEffect } from 'react';

/**
 * CardFlip - 3D 카드 뒤집기 컴포넌트
 *
 * @param {boolean} isFlipped - 뒤집힌 상태
 * @param {string} number - 당첨 번호
 * @param {number} rank - 순위 (1, 2, 3)
 */
export default function CardFlip({ isFlipped = false, number = '???', rank = 1 }) {
  const [isHovered, setIsHovered] = useState(false);

  // 순위별 색상
  const rankColors = {
    1: { border: '#FFD700', glow: 'rgba(255, 215, 0, 0.5)', label: '1등' },
    2: { border: '#C0C0C0', glow: 'rgba(192, 192, 192, 0.5)', label: '2등' },
    3: { border: '#CD7F32', glow: 'rgba(205, 127, 50, 0.5)', label: '3등' },
  };

  const rankStyle = rankColors[rank] || rankColors[1];

  return (
    <div
      className="relative cursor-pointer"
      style={{
        width: '200px',
        height: '280px',
        perspective: '1000px',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 카드 컨테이너 (3D 변환) */}
      <div
        className="relative w-full h-full transition-transform duration-700"
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* 카드 앞면 (물음표) */}
        <div
          className="absolute w-full h-full rounded-2xl flex flex-col items-center justify-center"
          style={{
            backfaceVisibility: 'hidden',
            background: 'linear-gradient(135deg, #141B33 0%, #0B1026 100%)',
            border: '3px solid #00D4FF',
            boxShadow: isHovered && !isFlipped
              ? '0 0 40px rgba(0, 212, 255, 0.6), inset 0 0 30px rgba(0, 212, 255, 0.1)'
              : '0 0 20px rgba(0, 212, 255, 0.3), inset 0 0 20px rgba(0, 212, 255, 0.05)',
            transition: 'box-shadow 0.3s ease',
          }}
        >
          {/* 순위 라벨 */}
          <span
            className="absolute top-4 text-sm font-bold px-3 py-1 rounded-full"
            style={{
              background: 'rgba(0, 212, 255, 0.2)',
              border: '1px solid #00D4FF',
              color: '#00D4FF',
            }}
          >
            {rankStyle.label}
          </span>

          {/* 물음표 */}
          <span
            className="text-8xl font-black"
            style={{
              color: '#00D4FF',
              textShadow: '0 0 30px rgba(0, 212, 255, 0.8)',
              animation: 'pulse-cyan 2s ease-in-out infinite',
            }}
          >
            ?
          </span>

          {/* 안내 텍스트 */}
          <span className="text-sm text-[#7A8599] mt-4">
            클릭하여 공개
          </span>
        </div>

        {/* 카드 뒷면 (당첨 번호) */}
        <div
          className="absolute w-full h-full rounded-2xl flex flex-col items-center justify-center"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            background: 'linear-gradient(135deg, #1E2A4A 0%, #141B33 100%)',
            border: `3px solid ${rankStyle.border}`,
            boxShadow: `0 0 40px ${rankStyle.glow}, inset 0 0 30px rgba(255, 0, 255, 0.1)`,
          }}
        >
          {/* 순위 라벨 */}
          <span
            className="absolute top-4 text-sm font-bold px-3 py-1 rounded-full"
            style={{
              background: `${rankStyle.border}20`,
              border: `1px solid ${rankStyle.border}`,
              color: rankStyle.border,
            }}
          >
            {rankStyle.label}
          </span>

          {/* 당첨 번호 */}
          <span
            className="text-6xl font-black"
            style={{
              fontFamily: "'Montserrat', 'Inter', sans-serif",
              color: '#FF00FF',
              textShadow: '0 0 40px rgba(255, 0, 255, 0.8), 0 0 80px rgba(255, 0, 255, 0.4)',
              animation: 'pulse-magenta 1.5s ease-in-out infinite',
            }}
          >
            {number}
          </span>

          {/* 축하 이모지 */}
          <div className="flex gap-2 mt-4">
            <span className="text-2xl animate-bounce" style={{ animationDelay: '0s' }}>🎉</span>
            <span className="text-2xl animate-bounce" style={{ animationDelay: '0.1s' }}>🎊</span>
            <span className="text-2xl animate-bounce" style={{ animationDelay: '0.2s' }}>🎉</span>
          </div>
        </div>
      </div>

      {/* 애니메이션 키프레임 */}
      <style jsx>{`
        @keyframes pulse-cyan {
          0%, 100% {
            text-shadow: 0 0 30px rgba(0, 212, 255, 0.8);
          }
          50% {
            text-shadow: 0 0 50px rgba(0, 212, 255, 1), 0 0 80px rgba(0, 212, 255, 0.5);
          }
        }
        @keyframes pulse-magenta {
          0%, 100% {
            text-shadow: 0 0 40px rgba(255, 0, 255, 0.8), 0 0 80px rgba(255, 0, 255, 0.4);
          }
          50% {
            text-shadow: 0 0 60px rgba(255, 0, 255, 1), 0 0 120px rgba(255, 0, 255, 0.6);
          }
        }
      `}</style>
    </div>
  );
}
