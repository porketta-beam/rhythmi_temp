'use client';

import { useState, useEffect, useCallback } from 'react';
import NumberScroller from '@/components/luckydraw/NumberScroller';

/**
 * Draft 1: 번호 스크롤 스타일
 * 슬롯 머신처럼 숫자가 빠르게 스크롤되다가 감속하며 당첨 번호에서 멈춤
 */
export default function Draft1Page() {
  // 참여자 데이터 (목업)
  const [participants, setParticipants] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [winner, setWinner] = useState(null);
  const [showResult, setShowResult] = useState(false);

  // 목업 참여자 생성
  useEffect(() => {
    const mockParticipants = Array.from({ length: 50 }, (_, i) => ({
      id: `p-${i + 1}`,
      luckyNumber: String(i + 1).padStart(3, '0'),
    }));
    setParticipants(mockParticipants);
  }, []);

  // 추첨 시작
  const startDraw = useCallback(() => {
    if (participants.length === 0 || isDrawing) return;

    setIsDrawing(true);
    setShowResult(false);
    setWinner(null);

    // 랜덤 당첨자 선택
    const randomIndex = Math.floor(Math.random() * participants.length);
    const selectedWinner = participants[randomIndex];

    // 애니메이션 완료 후 결과 표시 (3.5초 후)
    setTimeout(() => {
      setWinner(selectedWinner);
      setShowResult(true);
      setIsDrawing(false);
    }, 3500);
  }, [participants, isDrawing]);

  // 다시 추첨
  const resetDraw = () => {
    setWinner(null);
    setShowResult(false);
    setIsDrawing(false);
  };

  return (
    <div className="min-h-screen bg-[#0B1026] text-white overflow-hidden relative">
      {/* 배경 그라데이션 */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(180deg, #1E2A4A 0%, #141B33 30%, #0B1026 100%)',
        }}
      />

      {/* 파티클 배경 */}
      <ParticleBackground />

      {/* 메인 콘텐츠 */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-8">

        {/* 제목 */}
        <h1 className="text-6xl font-extrabold mb-4 tracking-tight">
          🎉 경품 추첨 🎉
        </h1>
        <p className="text-xl text-[#B0B8C8] mb-12">
          Draft 1: 번호 스크롤 스타일
        </p>

        {/* 스크롤러 영역 */}
        <div className="flex gap-4 mb-12">
          <NumberScroller
            isSpinning={isDrawing}
            targetNumber={winner?.luckyNumber || '000'}
            participants={participants}
          />
        </div>

        {/* 당첨 결과 */}
        {showResult && winner && (
          <div className="animate-fade-in text-center mb-8">
            <p className="text-3xl font-bold text-[#FF00FF] mb-2"
               style={{ textShadow: '0 0 20px rgba(255, 0, 255, 0.6)' }}>
              🎊 축하합니다! 🎊
            </p>
            <p className="text-xl text-[#B0B8C8]">
              당첨 번호: <span className="text-[#00D4FF] font-bold">{winner.luckyNumber}</span>
            </p>
          </div>
        )}

        {/* 버튼 영역 */}
        <div className="flex gap-4">
          {!isDrawing && !showResult && (
            <button
              onClick={startDraw}
              className="px-12 py-4 rounded-full font-bold text-xl bg-gradient-to-r from-[#FF00FF] to-[#FF66B2] text-white shadow-lg hover:scale-105 active:scale-95 transition-all duration-300"
              style={{ boxShadow: '0 0 30px rgba(255, 0, 255, 0.4)' }}
            >
              추첨 시작
            </button>
          )}

          {showResult && (
            <button
              onClick={resetDraw}
              className="px-12 py-4 rounded-full font-bold text-xl border-2 border-[#00D4FF] text-[#00D4FF] hover:bg-[#00D4FF]/10 transition-all duration-300"
            >
              다시 추첨
            </button>
          )}

          {isDrawing && (
            <div className="px-12 py-4 text-xl text-[#00D4FF] animate-pulse">
              추첨 중...
            </div>
          )}
        </div>

        {/* 참여자 수 표시 */}
        <div className="mt-8 text-[#7A8599]">
          참여자: {participants.length}명
        </div>
      </div>
    </div>
  );
}

/**
 * 파티클 배경 컴포넌트
 */
function ParticleBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 50 }).map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-white rounded-full opacity-30"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animation: `twinkle ${2 + Math.random() * 3}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 2}s`,
          }}
        />
      ))}
      <style jsx>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
