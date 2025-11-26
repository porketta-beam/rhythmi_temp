'use client';

import { useState, useEffect, useCallback } from 'react';
import LayeredRNN3D from '@/components/luckydraw/LayeredRNN3D';

/**
 * Draft 4: RNN 스타일
 * AI 신경망처럼 입력 레이어(참여자)에서 출력 레이어(당첨자)로 수렴
 */
export default function Draft4Page() {
  const [participants, setParticipants] = useState([]);
  const [phase, setPhase] = useState('idle'); // idle, processing, complete
  const [activeLayer, setActiveLayer] = useState(-1); // 현재 활성 레이어
  const [winner, setWinner] = useState(null);

  // 목업 참여자 생성 (20×20 = 400명)
  useEffect(() => {
    const mockParticipants = Array.from({ length: 400 }, (_, i) => ({
      id: `p-${i + 1}`,
      luckyNumber: String(i + 1).padStart(3, '0'),
    }));
    setParticipants(mockParticipants);
  }, []);

  // 추첨 시작
  const startDraw = useCallback(() => {
    if (participants.length === 0 || phase !== 'idle') return;

    setPhase('processing');
    setActiveLayer(0);

    // 랜덤 당첨자 선택
    const randomIndex = Math.floor(Math.random() * participants.length);
    const selectedWinner = participants[randomIndex];

    // 레이어별 순차 활성화 (총 5개 레이어: input + hidden*3 + output)
    // 각 레이어에서 충분히 머무르며 카메라가 부드럽게 이동
    const layerDelays = [0, 1600, 3200, 4800, 6400];

    layerDelays.forEach((delay, i) => {
      setTimeout(() => setActiveLayer(i), delay);
    });

    // 최종 결과 표시 (마지막 레이어 후 충분한 시간)
    setTimeout(() => {
      setWinner(selectedWinner);
      setPhase('complete');
    }, 8000);
  }, [participants, phase]);

  // 다시 추첨
  const resetDraw = () => {
    setWinner(null);
    setPhase('idle');
    setActiveLayer(-1);
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

      {/* 3D 레이어 신경망 시각화 */}
      <LayeredRNN3D
        participants={participants}
        activeLayer={activeLayer}
        winner={winner}
        phase={phase}
      />

      {/* UI 오버레이 */}
      <div className="relative z-10 flex flex-col items-center min-h-screen p-8">

        {/* 상단 제목 */}
        <div className="text-center mt-8">
          <h1 className="text-5xl font-extrabold mb-2 tracking-tight">
            🎉 경품 추첨 🎉
          </h1>
          <p className="text-lg text-[#B0B8C8]">
            Draft 4: 3D 레이어 신경망 (2D 레이어 → 3D 깊이감)
          </p>
        </div>

        {/* 레이어 진행 표시 */}
        {phase === 'processing' && (
          <div className="mt-8 flex gap-4 items-center">
            {['Input', 'Hidden 1', 'Hidden 2', 'Hidden 3', 'Output'].map((name, i) => (
              <div
                key={i}
                className={`flex flex-col items-center transition-all duration-500 ${
                  activeLayer >= i ? 'opacity-100' : 'opacity-30'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full mb-1 transition-all duration-300 ${
                    activeLayer === i
                      ? 'bg-[#00D4FF] scale-125 animate-pulse'
                      : activeLayer > i
                        ? 'bg-[#00FFCC]'
                        : 'bg-[#7A8599]'
                  }`}
                  style={{
                    boxShadow: activeLayer >= i
                      ? '0 0 15px rgba(0, 212, 255, 0.5)'
                      : 'none',
                  }}
                />
                <span className="text-xs text-[#7A8599]">{name}</span>
              </div>
            ))}
          </div>
        )}

        {/* 하단 컨트롤 */}
        <div className="mt-auto mb-8 flex flex-col items-center">

          {/* 당첨 결과 */}
          {phase === 'complete' && winner && (
            <div className="animate-fade-in text-center mb-8">
              <p
                className="text-4xl font-bold text-[#FF00FF] mb-2"
                style={{ textShadow: '0 0 30px rgba(255, 0, 255, 0.8)' }}
              >
                🎊 AI가 선택했습니다! 🎊
              </p>
              <p className="text-2xl text-[#B0B8C8]">
                당첨 번호:{' '}
                <span
                  className="text-[#00FFCC] font-bold text-4xl"
                  style={{ textShadow: '0 0 20px rgba(0, 255, 204, 0.6)' }}
                >
                  {winner.luckyNumber}
                </span>
              </p>
            </div>
          )}

          {/* 처리 중 메시지 */}
          {phase === 'processing' && (
            <div className="text-center mb-8">
              <p className="text-xl text-[#00D4FF]">
                🧠 신경망 처리 중...
              </p>
            </div>
          )}

          {/* 버튼 */}
          <div className="flex gap-4">
            {phase === 'idle' && (
              <button
                onClick={startDraw}
                className="px-12 py-4 rounded-full font-bold text-xl bg-gradient-to-r from-[#FF00FF] to-[#FF66B2] text-white shadow-lg hover:scale-105 active:scale-95 transition-all duration-300"
                style={{ boxShadow: '0 0 30px rgba(255, 0, 255, 0.4)' }}
              >
                추첨 시작
              </button>
            )}

            {phase === 'complete' && (
              <button
                onClick={resetDraw}
                className="px-12 py-4 rounded-full font-bold text-xl border-2 border-[#00D4FF] text-[#00D4FF] hover:bg-[#00D4FF]/10 transition-all duration-300"
              >
                다시 추첨
              </button>
            )}
          </div>

          {/* 참여자 수 */}
          <div className="mt-4 text-[#7A8599]">
            참여자: {participants.length}명
          </div>
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
