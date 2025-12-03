'use client';

import { useState, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import CardFlip from '../luckydraw/CardFlip.jsx';
import { padNumber } from '../../lib/lottery/utils';

/**
 * CardFlipDraw - 카드 뒤집기 추첨 컴포넌트
 *
 * Main 페이지에서 SlotMachine과 동일한 ref API로 사용 가능
 * - startSpinning(): 카드 셔플 애니메이션 시작
 * - stopAt(numbers): 당첨 번호로 카드 뒤집기
 * - reset(): 초기 상태로 리셋
 * - getState(): 현재 상태 반환
 *
 * @param {string} currentPrize - 현재 상품명
 * @param {string} currentPrizeImage - 상품 이미지 URL
 * @param {number} winnerCount - 당첨자 수 (1-5)
 * @param {Function} onDrawComplete - 추첨 완료 콜백 (winners 배열 전달)
 */
const CardFlipDraw = forwardRef(function CardFlipDraw({
  currentPrize,
  currentPrizeImage,
  winnerCount = 3,
  onDrawComplete,
}, ref) {
  const [state, setState] = useState('idle'); // idle, spinning, stopping, winner
  const [winners, setWinners] = useState([]); // 당첨 번호 배열
  const [flippedCards, setFlippedCards] = useState([]); // 각 카드 뒤집힘 상태
  const [shuffleAnimation, setShuffleAnimation] = useState(false);

  // winnerCount에 맞게 초기화
  useEffect(() => {
    setFlippedCards(new Array(winnerCount).fill(false));
  }, [winnerCount]);

  // ref를 통해 부모 컴포넌트에서 제어 가능하도록 메서드 노출
  useImperativeHandle(ref, () => ({
    startSpinning: () => {
      if (state !== 'idle') return;
      setState('spinning');
      setShuffleAnimation(true);
      setFlippedCards(new Array(winnerCount).fill(false));
      setWinners([]);
    },

    stopAt: (numberOrNumbers) => {
      if (state !== 'spinning') return;
      setState('stopping');
      setShuffleAnimation(false);

      // 단일 번호 또는 배열 처리
      const numbersArray = Array.isArray(numberOrNumbers)
        ? numberOrNumbers
        : [numberOrNumbers];

      // winnerCount만큼만 사용
      const winnerNumbers = numbersArray.slice(0, winnerCount);
      setWinners(winnerNumbers);

      // 순차적으로 카드 뒤집기
      winnerNumbers.forEach((_, index) => {
        setTimeout(() => {
          setFlippedCards(prev => {
            const newFlipped = [...prev];
            newFlipped[index] = true;
            return newFlipped;
          });
        }, 500 + (index * 1000)); // 0.5초 후 시작, 1초 간격
      });

      // 모든 카드 뒤집힌 후 완료 처리
      const totalTime = 500 + (winnerNumbers.length * 1000) + 500;
      setTimeout(() => {
        setState('winner');
        if (onDrawComplete) {
          // SlotMachine과 호환되는 형식으로 전달
          // SlotMachine은 ['0', '2', '4'] 형태로 전달하지만
          // CardFlip은 여러 당첨자이므로 번호 배열 전달
          onDrawComplete(winnerNumbers);
        }
      }, totalTime);
    },

    reset: () => {
      setState('idle');
      setWinners([]);
      setFlippedCards(new Array(winnerCount).fill(false));
      setShuffleAnimation(false);
    },

    getState: () => state,
  }), [state, winnerCount, onDrawComplete]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] py-8">
      {/* 카드 영역 */}
      <div
        className={`flex flex-wrap justify-center gap-4 sm:gap-6 md:gap-8 ${
          shuffleAnimation ? 'animate-pulse' : ''
        }`}
        style={{ perspective: '1500px' }}
      >
        {Array.from({ length: winnerCount }).map((_, index) => (
          <div
            key={index}
            className={`transition-transform duration-300 ${
              shuffleAnimation ? 'animate-bounce' : ''
            }`}
            style={{
              animationDelay: `${index * 0.1}s`,
            }}
          >
            <CardFlip
              isFlipped={flippedCards[index]}
              number={winners[index] !== undefined ? padNumber(winners[index]) : '???'}
              rank={index + 1}
            />
          </div>
        ))}
      </div>

      {/* 상태 표시 */}
      {state === 'spinning' && (
        <div className="mt-8 text-center animate-pulse">
          <p className="text-2xl text-cyan-400 font-bold">🔀 셔플 중...</p>
        </div>
      )}

      {state === 'stopping' && (
        <div className="mt-8 text-center">
          <p className="text-2xl text-purple-400 font-bold">✨ 당첨자 공개 중...</p>
        </div>
      )}

      {state === 'winner' && winners.length > 0 && (
        <div className="mt-8 text-center animate-fade-in">
          <p
            className="text-3xl font-bold text-pink-500 mb-4"
            style={{ textShadow: '0 0 20px rgba(255, 0, 255, 0.6)' }}
          >
            🎊 축하합니다! 🎊
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {winners.map((winner, idx) => (
              <div key={idx} className="text-center">
                <span className="text-sm text-gray-400">{idx + 1}등</span>
                <p className="text-xl text-cyan-400 font-bold">{padNumber(winner)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

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

export default CardFlipDraw;
