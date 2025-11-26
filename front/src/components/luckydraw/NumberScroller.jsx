'use client';

import { useState, useEffect, useRef, useMemo } from 'react';

/**
 * NumberScroller - 슬롯 머신 스타일 번호 스크롤러
 *
 * @param {boolean} isSpinning - 스크롤 중 여부
 * @param {string} targetNumber - 목표 번호 (예: "042")
 * @param {Array} participants - 참여자 목록
 */
export default function NumberScroller({
  isSpinning = false,
  targetNumber = '000',
  participants = [],
}) {
  // 3자리 숫자를 각 자릿수로 분리
  const digits = targetNumber.padStart(3, '0').split('');

  return (
    <div className="flex gap-4">
      {digits.map((digit, index) => (
        <SingleDigitScroller
          key={index}
          isSpinning={isSpinning}
          targetDigit={parseInt(digit, 10)}
          delay={index * 300} // 자릿수별 딜레이 (왼쪽부터 순차 정지)
        />
      ))}
    </div>
  );
}

/**
 * SingleDigitScroller - 단일 자릿수 스크롤러
 */
function SingleDigitScroller({ isSpinning, targetDigit, delay = 0 }) {
  const [currentOffset, setCurrentOffset] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const containerRef = useRef(null);

  // 0-9 숫자 배열 (스크롤용으로 여러 번 반복)
  const numbers = useMemo(() => {
    const base = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    // 10번 반복하여 충분한 스크롤 거리 확보
    return [...base, ...base, ...base, ...base, ...base,
            ...base, ...base, ...base, ...base, ...base];
  }, []);

  const itemHeight = 120; // 각 숫자 높이 (px)
  const visibleItems = 3; // 보이는 아이템 수

  useEffect(() => {
    if (isSpinning) {
      setIsAnimating(true);

      // 스크롤 시작 (빠른 속도)
      const spinDuration = 2500 + delay; // 기본 2.5초 + 딜레이
      const totalSpins = 8; // 총 회전 수
      const finalPosition = totalSpins * 10 + targetDigit;

      // 애니메이션 시작
      setTimeout(() => {
        setCurrentOffset(finalPosition * itemHeight);
      }, 50);

      // 애니메이션 완료 후 상태 업데이트
      setTimeout(() => {
        setIsAnimating(false);
      }, spinDuration);
    } else {
      // 초기 상태로 리셋
      setCurrentOffset(targetDigit * itemHeight);
    }
  }, [isSpinning, targetDigit, delay, itemHeight]);

  // easeOutExpo 커브를 위한 CSS transition
  const transitionStyle = isAnimating
    ? `transform ${2.5 + delay / 1000}s cubic-bezier(0.16, 1, 0.3, 1)`
    : 'transform 0.3s ease-out';

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden rounded-xl"
      style={{
        width: '100px',
        height: `${itemHeight * visibleItems}px`,
        background: 'rgba(11, 16, 38, 0.8)',
        border: '2px solid rgba(0, 212, 255, 0.3)',
        boxShadow: isAnimating
          ? '0 0 30px rgba(0, 212, 255, 0.3)'
          : '0 0 20px rgba(0, 212, 255, 0.2)',
      }}
    >
      {/* 상단 페이드 그라데이션 */}
      <div
        className="absolute top-0 left-0 right-0 z-10 pointer-events-none"
        style={{
          height: itemHeight,
          background: 'linear-gradient(to bottom, #0B1026, transparent)',
        }}
      />

      {/* 하단 페이드 그라데이션 */}
      <div
        className="absolute bottom-0 left-0 right-0 z-10 pointer-events-none"
        style={{
          height: itemHeight,
          background: 'linear-gradient(to top, #0B1026, transparent)',
        }}
      />

      {/* 중앙 하이라이트 */}
      <div
        className="absolute z-20 pointer-events-none"
        style={{
          top: itemHeight,
          left: 0,
          right: 0,
          height: itemHeight,
          border: '2px solid',
          borderColor: isAnimating ? '#00D4FF' : '#FF00FF',
          borderRadius: '8px',
          boxShadow: isAnimating
            ? '0 0 20px rgba(0, 212, 255, 0.5), inset 0 0 20px rgba(0, 212, 255, 0.1)'
            : '0 0 30px rgba(255, 0, 255, 0.5), inset 0 0 20px rgba(255, 0, 255, 0.1)',
          transition: 'all 0.3s ease',
        }}
      />

      {/* 숫자 컨테이너 */}
      <div
        className="absolute w-full"
        style={{
          transform: `translateY(${itemHeight - currentOffset}px)`,
          transition: transitionStyle,
        }}
      >
        {numbers.map((num, index) => (
          <div
            key={index}
            className="flex items-center justify-center font-black"
            style={{
              height: itemHeight,
              fontSize: '72px',
              fontFamily: "'Montserrat', 'Inter', sans-serif",
              color: !isAnimating && num === targetDigit ? '#00FFCC' : '#FFFFFF',
              textShadow: !isAnimating && num === targetDigit
                ? '0 0 30px rgba(0, 255, 204, 0.8)'
                : '0 0 10px rgba(255, 255, 255, 0.3)',
              transition: 'color 0.3s ease, text-shadow 0.3s ease',
            }}
          >
            {num}
          </div>
        ))}
      </div>
    </div>
  );
}
