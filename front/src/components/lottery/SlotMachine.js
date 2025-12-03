"use client";

import { useState, useRef, useEffect, useImperativeHandle, forwardRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, RotateCcw, Sparkles, Gift } from 'lucide-react';
import Image from 'next/image';
import { Button } from '../ui/button';
import { SlotDigit } from './SlotDigit';
import { CelebrationEffect } from './CelebrationEffect';
import { useIsMobile } from '../ui/use-mobile';
import { SLOT_TIMING, SLOT_STATE, NUMBER_RANGE } from '../../lib/lottery/constants';
import { numberToDigits, generateRandomNumber } from '../../lib/lottery/utils';

export const SlotMachine = forwardRef(function SlotMachine({ onBack, currentPrize, currentPrizeImage, onDrawComplete, hideControls = false }, ref) {
  const [slotState, setSlotState] = useState(SLOT_STATE.IDLE);
  const [winningNumber, setWinningNumber] = useState([0, 0, 0]);
  const [showCelebration, setShowCelebration] = useState(false);
  const slotRefs = useRef([]);
  const isMobile = useIsMobile();
  const hasCalledComplete = useRef(false);

  // 슬롯 리셋 헬퍼 함수
  const resetSlots = useCallback(() => {
    slotRefs.current.forEach((slotRef) => {
      slotRef?.resetForNewSpin();
    });
    setShowCelebration(false);
    hasCalledComplete.current = false;
  }, []);

  // 슬롯 정지 애니메이션 실행
  const executeStopSequence = useCallback((digits) => {
    setSlotState(SLOT_STATE.STOPPING);

    // 각 슬롯을 순차적으로 정지
    digits.forEach((_, index) => {
      setTimeout(() => {
        slotRefs.current[index]?.stop();
      }, index * SLOT_TIMING.STOP_INTERVAL);
    });

    // 모든 슬롯 정지 후 당첨 상태로 전환
    const totalStopTime = SLOT_TIMING.STOP_INTERVAL * NUMBER_RANGE.DIGITS + SLOT_TIMING.STOP_ANIMATION;
    setTimeout(() => {
      setSlotState(SLOT_STATE.WINNER);
      setShowCelebration(true);
    }, totalStopTime);
  }, []);

  useEffect(() => {
    if (slotState === SLOT_STATE.WINNER && !hasCalledComplete.current) {
      hasCalledComplete.current = true;
      onDrawComplete?.(winningNumber);
    }
  }, [slotState, winningNumber, onDrawComplete]);

  // 외부에서 호출 가능한 메서드 노출
  useImperativeHandle(ref, () => ({
    // 서버에서 받은 당첨번호로 추첨 시작
    triggerDraw: (targetNumber) => {
      const digits = numberToDigits(targetNumber);
      resetSlots();
      setWinningNumber(digits);

      requestAnimationFrame(() => {
        setSlotState(SLOT_STATE.SPINNING);
        setTimeout(() => executeStopSequence(digits), SLOT_TIMING.SPIN_DURATION);
      });
    },
    // 스피닝만 시작 (당첨번호 대기 상태)
    startSpinning: () => {
      resetSlots();
      requestAnimationFrame(() => {
        setSlotState(SLOT_STATE.SPINNING);
      });
    },
    // 특정 번호로 정지
    stopAt: (targetNumber) => {
      const digits = numberToDigits(targetNumber);
      setWinningNumber(digits);
      executeStopSequence(digits);
    },
    reset: () => {
      setSlotState(SLOT_STATE.IDLE);
      setWinningNumber([0, 0, 0]);
      setShowCelebration(false);
      hasCalledComplete.current = false;
    },
    getState: () => slotState,
  }), [resetSlots, executeStopSequence, slotState]);

  // 로컬 추첨 시작 (hideControls=false일 때 사용)
  const startLottery = useCallback(() => {
    const number = generateRandomNumber();
    const digits = numberToDigits(number);

    resetSlots();
    setWinningNumber(digits);
    setSlotState(SLOT_STATE.SPINNING);

    setTimeout(() => executeStopSequence(digits), SLOT_TIMING.SPIN_DURATION);
  }, [resetSlots, executeStopSequence]);

  // 리셋 핸들러
  const handleReset = useCallback(() => {
    setSlotState(SLOT_STATE.IDLE);
    setWinningNumber([0, 0, 0]);
    setShowCelebration(false);
    hasCalledComplete.current = false;
  }, []);

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
          animate={slotState === SLOT_STATE.WINNER ? { scale: [1, 1.05, 1] } : {}}
          transition={{ duration: 1, repeat: slotState === SLOT_STATE.WINNER ? Infinity : 0 }}
        >
          {/* Prize Badge */}
          {currentPrize && slotState !== SLOT_STATE.WINNER && (
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
            {slotState === SLOT_STATE.WINNER ? '🎉 당첨 번호 🎉' : '행운의 추첨'}
          </h2>
          <p className="text-lg sm:text-xl md:text-2xl text-gray-300" style={{ fontFamily: 'Pretendard, sans-serif' }}>
            {slotState === SLOT_STATE.IDLE && '버튼을 눌러 추첨을 시작하세요'}
            {slotState === SLOT_STATE.SPINNING && '추첨 중...'}
            {slotState === SLOT_STATE.STOPPING && '번호 확정 중...'}
            {slotState === SLOT_STATE.WINNER && '축하합니다!'}
          </p>
          
          {/* Winner Display */}
          {slotState === SLOT_STATE.WINNER && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="mt-4 sm:mt-6"
            >
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
          <motion.div
            className="absolute -inset-2 sm:-inset-4 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-[2rem] sm:rounded-[3rem] blur-xl sm:blur-2xl"
            animate={{ opacity: slotState === SLOT_STATE.SPINNING || slotState === SLOT_STATE.WINNER ? [0.3, 0.6, 0.3] : 0.2 }}
            transition={{ duration: 2, repeat: Infinity }}
          />

          <div className="relative bg-gradient-to-br from-gray-900/95 to-black/95 backdrop-blur-xl rounded-[1.5rem] sm:rounded-[2rem] md:rounded-[2.5rem] border-2 border-cyan-500/40 p-4 sm:p-8 md:p-12 shadow-2xl">
            {/* Corner Elements */}
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
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
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

            {/* Slots */}
            <div className="flex justify-center gap-2 sm:gap-4 md:gap-6 lg:gap-8 mb-6 sm:mb-8 md:mb-12">
              {[0, 1, 2].map((index) => (
                <SlotDigit
                  key={index}
                  ref={(ref) => { if (ref) slotRefs.current[index] = ref; }}
                  finalNumber={winningNumber[index]}
                  isSpinning={slotState === SLOT_STATE.SPINNING || slotState === SLOT_STATE.STOPPING}
                  isWinner={slotState === SLOT_STATE.WINNER}
                  delay={index * 100}
                  shouldReset={slotState === SLOT_STATE.IDLE}
                  isMobile={isMobile}
                />
              ))}
            </div>

            {/* Buttons - hideControls가 true면 숨김 (WebSocket 모드에서 사용) */}
            {!hideControls && (
              <div className="flex justify-center gap-3 sm:gap-4 md:gap-6">
                <AnimatePresence mode="wait">
                  {slotState === SLOT_STATE.IDLE && (
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

                  {slotState === SLOT_STATE.WINNER && (
                    <motion.div
                      key="reset"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="flex gap-3 sm:gap-4 md:gap-6"
                    >
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          onClick={handleReset}
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
            )}

            {/* Progress */}
            {(slotState === SLOT_STATE.SPINNING || slotState === SLOT_STATE.STOPPING) && (
              <motion.div
                className="absolute bottom-0 left-0 right-0 h-0.5 sm:h-1 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 6 }}
              />
            )}
          </div>
        </div>

        {/* Info */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="inline-flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/30 rounded-full px-4 sm:px-6 md:px-8 py-2 sm:py-3 md:py-4">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-cyan-400" />
            <span className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-300" style={{ fontFamily: 'Pretendard, sans-serif' }}>
              참가 번호 범위: <span className="text-white" style={{ fontWeight: 700 }}>000 ~ 299</span>
            </span>
          </div>
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {showCelebration && <CelebrationEffect />}
      </AnimatePresence>
    </div>
  );
});

