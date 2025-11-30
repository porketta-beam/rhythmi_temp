"use client";

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, RotateCcw, Sparkles, Gift } from 'lucide-react';
import Image from 'next/image';
import { Button } from './ui/button';
import { SlotDigit } from './SlotDigit';
import { CelebrationEffect } from './CelebrationEffect';
import { useIsMobile } from './ui/use-mobile';

interface SlotMachineProps {
  onBack: () => void;
  currentPrize?: string | null;
  currentPrizeImage?: string | null;
  onDrawComplete?: (winningNumber: number[]) => void;
}

type SlotState = 'idle' | 'spinning' | 'stopping' | 'winner';

export function SlotMachine({ onBack, currentPrize, currentPrizeImage, onDrawComplete }: SlotMachineProps) {
  const [slotState, setSlotState] = useState<SlotState>('idle');
  const [winningNumber, setWinningNumber] = useState<number[]>([0, 0, 0]);
  const [showCelebration, setShowCelebration] = useState(false);
  const slotRefs = useRef<Array<{ stop: () => void }>>([]);
  const isMobile = useIsMobile();
  const hasCalledComplete = useRef(false);

  // 상태가 winner로 변경되면 onDrawComplete 호출
  useEffect(() => {
    if (slotState === 'winner' && !hasCalledComplete.current) {
      hasCalledComplete.current = true;
      onDrawComplete?.(winningNumber);
    }
  }, [slotState, winningNumber, onDrawComplete]);

  const startLottery = () => {
    setSlotState('spinning');
    setShowCelebration(false);
    hasCalledComplete.current = false;
    
    // Generate random winning number (0-299)
    const number = Math.floor(Math.random() * 300);
    const digits = [
      Math.floor(number / 100),
      Math.floor((number % 100) / 10),
      number % 10,
    ];
    setWinningNumber(digits);

    // Stop slots sequentially with delay
    setTimeout(() => {
      setSlotState('stopping');
      digits.forEach((_, index) => {
        setTimeout(() => {
          slotRefs.current[index]?.stop();
        }, index * 500);
      });

      // Show winner state after all slots stop
      setTimeout(() => {
        setSlotState('winner');
        setShowCelebration(true);
      }, 500 * 3 + 1500);
    }, 3000);
  };

  const reset = () => {
    setSlotState('idle');
    setWinningNumber([0, 0, 0]);
    setShowCelebration(false);
    hasCalledComplete.current = false;
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-120px)] sm:min-h-[calc(100vh-160px)] md:min-h-[calc(100vh-200px)] px-4 sm:px-6 md:px-8 py-6 sm:py-8 md:py-12">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-[95vw] sm:max-w-2xl md:max-w-4xl lg:max-w-6xl w-full"
      >
        {/* Title */}
        <motion.div
          className="text-center mb-6 sm:mb-8 md:mb-12"
          animate={slotState === 'winner' ? {
            scale: [1, 1.05, 1],
          } : {}}
          transition={{
            duration: 1,
            repeat: slotState === 'winner' ? Infinity : 0,
          }}
        >
          {/* Prize Badge - 상품 정보 표시 */}
          {currentPrize && slotState !== 'winner' && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 sm:mb-6"
            >
              <div className="inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 sm:py-3 rounded-full bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/40">
                {currentPrizeImage ? (
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden ring-2 ring-yellow-400/50">
                    <Image
                      src={currentPrizeImage}
                      alt={currentPrize}
                      width={40}
                      height={40}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <Gift className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" />
                )}
                <span className="text-yellow-400 font-bold text-base sm:text-lg" style={{ fontFamily: 'Pretendard, sans-serif' }}>
                  {currentPrize}
                </span>
              </div>
            </motion.div>
          )}

          <h2 
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-2 sm:mb-4 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent" 
            style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 700 }}
          >
            {slotState === 'winner' ? '🎉 당첨 번호 🎉' : '행운의 추첨'}
          </h2>
          <p 
            className="text-lg sm:text-xl md:text-2xl text-gray-300" 
            style={{ fontFamily: 'Pretendard, sans-serif' }}
          >
            {slotState === 'idle' && '버튼을 눌러 추첨을 시작하세요'}
            {slotState === 'spinning' && '추첨 중...'}
            {slotState === 'stopping' && '번호 확정 중...'}
            {slotState === 'winner' && '축하합니다!'}
          </p>
          
          {/* Display Winning Number with Prize */}
          {slotState === 'winner' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="mt-4 sm:mt-6"
            >
              {/* Prize Info on Winner */}
              {currentPrize && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="mb-4 flex flex-col items-center gap-3"
                >
                  {currentPrizeImage && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.6, type: "spring" }}
                      className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 rounded-xl overflow-hidden ring-4 ring-yellow-400 shadow-[0_0_40px_rgba(234,179,8,0.5)]"
                    >
                      <Image
                        src={currentPrizeImage}
                        alt={currentPrize}
                        width={128}
                        height={128}
                        className="w-full h-full object-cover"
                      />
                    </motion.div>
                  )}
                  <span className="text-xl sm:text-2xl md:text-3xl text-yellow-400 font-bold" style={{ fontFamily: 'Pretendard, sans-serif' }}>
                    🎁 {currentPrize} 당첨!
                  </span>
                </motion.div>
              )}
              
              <div className="inline-flex items-center gap-2 sm:gap-4 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border-2 border-cyan-400 rounded-2xl sm:rounded-3xl px-6 sm:px-8 md:px-12 py-3 sm:py-4 md:py-6 shadow-[0_0_20px_rgba(0,255,255,0.4)] sm:shadow-[0_0_40px_rgba(0,255,255,0.4)]">
                <span 
                  className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent" 
                  style={{ fontFamily: 'Pretendard, sans-serif' }}
                >
                  {winningNumber.join('')}
                </span>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Slot Machine Container */}
        <div className="relative mb-6 sm:mb-8 md:mb-12">
          {/* Outer Glow */}
          <motion.div
            className="absolute -inset-2 sm:-inset-4 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-[2rem] sm:rounded-[3rem] blur-xl sm:blur-2xl"
            animate={{
              opacity: slotState === 'spinning' || slotState === 'winner' ? [0.3, 0.6, 0.3] : 0.2,
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
          />

          {/* Main Container */}
          <div className="relative bg-gradient-to-br from-gray-900/95 to-black/95 backdrop-blur-xl rounded-[1.5rem] sm:rounded-[2rem] md:rounded-[2.5rem] border-2 border-cyan-500/40 p-4 sm:p-8 md:p-12 shadow-2xl">
            {/* Decorative Corner Elements */}
            {[0, 1, 2, 3].map((i) => (
              <motion.div
                key={i}
                className="absolute w-8 h-8 sm:w-12 sm:h-12 md:w-16 md:h-16 hidden sm:block"
                style={{
                  top: i < 2 ? -2 : 'auto',
                  bottom: i >= 2 ? -2 : 'auto',
                  left: i % 2 === 0 ? -2 : 'auto',
                  right: i % 2 === 1 ? -2 : 'auto',
                }}
                animate={{
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              >
                <div className="w-full h-full border-2 sm:border-4 border-cyan-400 rounded-lg"
                  style={{
                    borderRightColor: i % 2 === 0 ? 'transparent' : undefined,
                    borderLeftColor: i % 2 === 1 ? 'transparent' : undefined,
                    borderBottomColor: i < 2 ? 'transparent' : undefined,
                    borderTopColor: i >= 2 ? 'transparent' : undefined,
                  }}
                />
              </motion.div>
            ))}

            {/* Slots Container */}
            <div className="flex justify-center gap-2 sm:gap-4 md:gap-6 lg:gap-8 mb-6 sm:mb-8 md:mb-12">
              {[0, 1, 2].map((index) => (
                <SlotDigit
                  key={index}
                  ref={(ref) => {
                    if (ref) slotRefs.current[index] = ref;
                  }}
                  finalNumber={winningNumber[index]}
                  isSpinning={slotState === 'spinning' || slotState === 'stopping'}
                  isWinner={slotState === 'winner'}
                  delay={index * 100}
                  shouldReset={slotState === 'idle'}
                  isMobile={isMobile}
                />
              ))}
            </div>

            {/* Control Buttons */}
            <div className="flex justify-center gap-3 sm:gap-4 md:gap-6">
              <AnimatePresence mode="wait">
                {slotState === 'idle' && (
                  <motion.div
                    key="start"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      onClick={startLottery}
                      className="h-12 sm:h-16 md:h-20 px-6 sm:px-10 md:px-16 text-base sm:text-xl md:text-2xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 border-0 shadow-[0_0_20px_rgba(0,255,255,0.6)] sm:shadow-[0_0_40px_rgba(0,255,255,0.6)] relative overflow-hidden group rounded-xl sm:rounded-2xl"
                    >
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600"
                        initial={{ x: '-100%' }}
                        whileHover={{ x: '100%' }}
                        transition={{ duration: 0.6 }}
                      />
                      <span className="relative z-10 flex items-center gap-2 sm:gap-3">
                        <Play className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8" fill="currentColor" />
                        추첨 시작
                      </span>
                    </Button>
                  </motion.div>
                )}

                {slotState === 'winner' && (
                  <motion.div
                    key="reset"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="flex gap-3 sm:gap-4 md:gap-6"
                  >
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        onClick={reset}
                        className="h-12 sm:h-16 md:h-20 px-6 sm:px-8 md:px-12 text-base sm:text-xl md:text-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 border-0 shadow-[0_0_20px_rgba(168,85,247,0.6)] sm:shadow-[0_0_40px_rgba(168,85,247,0.6)] rounded-xl sm:rounded-2xl"
                      >
                        <span className="flex items-center gap-2 sm:gap-3">
                          <RotateCcw className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" />
                          다시 추첨
                        </span>
                      </Button>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Status Indicator */}
            {(slotState === 'spinning' || slotState === 'stopping') && (
              <motion.div
                className="absolute bottom-0 left-0 right-0 h-0.5 sm:h-1 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 6 }}
              />
            )}
          </div>
        </div>

        {/* Info Panel */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="inline-flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/30 rounded-full px-4 sm:px-6 md:px-8 py-2 sm:py-3 md:py-4">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-cyan-400" />
            <span 
              className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-300" 
              style={{ fontFamily: 'Pretendard, sans-serif' }}
            >
              참가 번호 범위: <span className="text-white" style={{ fontWeight: 700 }}>000 ~ 299</span>
            </span>
          </div>
        </motion.div>
      </motion.div>

      {/* Celebration Effect */}
      <AnimatePresence>
        {showCelebration && <CelebrationEffect />}
      </AnimatePresence>
    </div>
  );
}
