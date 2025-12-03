'use client';

import { useState, forwardRef, useImperativeHandle } from 'react';
import dynamic from 'next/dynamic';
import { padNumber } from '../../lib/lottery/utils';

// Three.js는 SSR을 지원하지 않으므로 dynamic import 사용
const NetworkGraph3D = dynamic(
  () => import('../luckydraw/NetworkGraph3D.jsx'),
  { ssr: false, loading: () => <NetworkLoadingPlaceholder /> }
);

/**
 * 로딩 플레이스홀더
 */
function NetworkLoadingPlaceholder() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-cyan-400 text-lg">3D 네트워크 로딩 중...</p>
      </div>
    </div>
  );
}

/**
 * NetworkDraw - 3D 네트워크 추첨 컴포넌트
 *
 * Main 페이지에서 SlotMachine과 동일한 ref API로 사용 가능
 * - startSpinning(): 탐색 애니메이션 시작
 * - stopAt(numbers): 당첨자 하이라이트
 * - reset(): 초기 상태로 리셋
 * - getState(): 현재 상태 반환
 *
 * @param {string} currentPrize - 현재 상품명
 * @param {string} currentPrizeImage - 상품 이미지 URL
 * @param {number} winnerCount - 당첨자 수 (1-10)
 * @param {Array} participants - 실제 참가자 목록 [{id, luckyNumber, name}]
 * @param {Function} onDrawComplete - 추첨 완료 콜백 (winners 배열 전달)
 */
const NetworkDraw = forwardRef(function NetworkDraw({
  currentPrize,
  currentPrizeImage,
  winnerCount = 1,
  participants = [],
  onDrawComplete,
}, ref) {
  const [state, setState] = useState('idle'); // idle, spinning, stopping, winner
  const [phase, setPhase] = useState('idle'); // NetworkGraph3D용 phase
  const [winners, setWinners] = useState([]); // 당첨 번호 배열
  const [winnerIds, setWinnerIds] = useState([]); // NetworkGraph3D용 winner IDs

  // ref를 통해 부모 컴포넌트에서 제어 가능하도록 메서드 노출
  useImperativeHandle(ref, () => ({
    startSpinning: () => {
      if (state !== 'idle') return;
      setState('spinning');
      setPhase('searching');
      setWinners([]);
      setWinnerIds([]);
    },

    stopAt: (numberOrNumbers) => {
      if (state !== 'spinning') return;
      setState('stopping');

      // 단일 번호 또는 배열 처리
      const numbersArray = Array.isArray(numberOrNumbers)
        ? numberOrNumbers
        : [numberOrNumbers];

      // winnerCount만큼만 사용
      const winnerNumbers = numbersArray.slice(0, winnerCount);
      setWinners(winnerNumbers);

      // winner ID로 변환 (NetworkGraph3D용)
      const ids = winnerNumbers.map(num => `p-${num}`);
      setWinnerIds(ids);

      // 2초 탐색 애니메이션 후 당첨자 표시
      setTimeout(() => {
        setPhase('found');
        setState('winner');

        if (onDrawComplete) {
          onDrawComplete(winnerNumbers);
        }
      }, 2000);
    },

    reset: () => {
      setState('idle');
      setPhase('idle');
      setWinners([]);
      setWinnerIds([]);
    },

    getState: () => state,
  }), [state, winnerCount, onDrawComplete]);

  return (
    <div className="relative min-h-[60vh]">
      {/* 3D 네트워크 그래프 */}
      <div className="absolute inset-0">
        <NetworkGraph3D
          participants={participants}
          phase={phase}
          winnerIds={winnerIds}
          bgRotation={true}
          nodeRotation={phase === 'searching'}
        />
      </div>

      {/* 상태 오버레이 */}
      <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-end pb-8">
        {state === 'spinning' && (
          <div className="text-center animate-pulse mb-8">
            <p className="text-2xl text-cyan-400 font-bold">🔍 당첨자를 찾고 있습니다...</p>
          </div>
        )}

        {state === 'winner' && winners.length > 0 && (
          <div className="text-center animate-fade-in bg-black/50 backdrop-blur-sm rounded-2xl px-8 py-6 mb-8">
            <p
              className="text-3xl font-bold text-pink-500 mb-4"
              style={{ textShadow: '0 0 20px rgba(255, 0, 255, 0.6)' }}
            >
              🎊 축하합니다! 🎊
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              {winners.map((winner, idx) => (
                <div key={idx} className="text-center">
                  <span className="text-sm text-gray-400">
                    {winners.length > 1 ? `${idx + 1}등` : '당첨'}
                  </span>
                  <p
                    className="text-2xl text-cyan-400 font-bold"
                    style={{ textShadow: '0 0 15px rgba(0, 255, 204, 0.6)' }}
                  >
                    {padNumber(winner)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
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
});

export default NetworkDraw;
