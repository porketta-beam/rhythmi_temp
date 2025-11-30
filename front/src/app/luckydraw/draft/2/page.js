'use client';

import { useState, useEffect, useCallback } from 'react';
import CardFlip from '@/components/luckydraw/CardFlip';

/**
 * Draft 2: 카드 뒤집기 스타일
 * 3장의 카드가 순차적으로 뒤집히며 당첨 번호 공개
 */
export default function Draft2Page() {
  const [participants, setParticipants] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [winners, setWinners] = useState([null, null, null]);
  const [flippedCards, setFlippedCards] = useState([false, false, false]);
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
    setFlippedCards([false, false, false]);

    // 3명의 당첨자 선택 (중복 없이)
    const shuffled = [...participants].sort(() => Math.random() - 0.5);
    const selectedWinners = shuffled.slice(0, 3);
    setWinners(selectedWinners);

    // 순차적으로 카드 뒤집기
    setTimeout(() => setFlippedCards([true, false, false]), 500);
    setTimeout(() => setFlippedCards([true, true, false]), 1500);
    setTimeout(() => setFlippedCards([true, true, true]), 2500);

    // 모든 카드 뒤집힌 후 결과 표시
    setTimeout(() => {
      setShowResult(true);
      setIsDrawing(false);
    }, 3500);
  }, [participants, isDrawing]);

  // 다시 추첨
  const resetDraw = () => {
    setWinners([null, null, null]);
    setFlippedCards([false, false, false]);
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
          Draft 2: 카드 뒤집기 스타일
        </p>

        {/* 카드 영역 */}
        <div className="flex gap-8 mb-12" style={{ perspective: '1500px' }}>
          {[0, 1, 2].map((index) => (
            <CardFlip
              key={index}
              isFlipped={flippedCards[index]}
              number={winners[index]?.luckyNumber || '???'}
              rank={index + 1}
            />
          ))}
        </div>

        {/* 당첨 결과 */}
        {showResult && (
          <div className="animate-fade-in text-center mb-8">
            <p
              className="text-3xl font-bold text-[#FF00FF] mb-4"
              style={{ textShadow: '0 0 20px rgba(255, 0, 255, 0.6)' }}
            >
              🎊 축하합니다! 🎊
            </p>
            <div className="flex gap-6 justify-center">
              {winners.map((winner, i) => winner && (
                <div key={i} className="text-center">
                  <span className="text-sm text-[#7A8599]">{i + 1}등</span>
                  <p className="text-lg text-[#00D4FF] font-bold">{winner.luckyNumber}</p>
                </div>
              ))}
            </div>
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

      <style jsx>{`
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
      `}</style>
    </div>
  );
}
