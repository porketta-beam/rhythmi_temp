"use client";

import { useState, useEffect, forwardRef, useImperativeHandle, useRef } from 'react';
import { motion } from 'motion/react';

export const SlotDigit = forwardRef(function SlotDigit(
  { finalNumber, isSpinning, isWinner, delay = 0, shouldReset, isMobile },
  ref
) {
  const [currentNumber, setCurrentNumber] = useState(0);
  const [isStopping, setIsStopping] = useState(false);
  const [hasStopped, setHasStopped] = useState(false);

  // 이전 shouldReset 값을 추적하여 변경 시에만 리셋
  const prevShouldResetRef = useRef(shouldReset);
  
  useEffect(() => {
    // shouldReset이 false -> true로 변경될 때만 리셋
    if (shouldReset && !prevShouldResetRef.current) {
      // 다음 렌더에서 리셋 수행을 위해 ref만 업데이트
      prevShouldResetRef.current = shouldReset;
    } else if (!shouldReset && prevShouldResetRef.current) {
      prevShouldResetRef.current = shouldReset;
    }
  }, [shouldReset]);

  // 스피닝 effect
  useEffect(() => {
    if (shouldReset) {
      // 리셋 상태에서는 초기값 유지
      return;
    }

    if (!isSpinning) {
      return;
    }

    const interval = setInterval(() => {
      setCurrentNumber((prev) => (prev + 1) % 10);
    }, 50);

    return () => clearInterval(interval);
  }, [isSpinning, shouldReset]);

  // shouldReset 변경 시 상태 초기화 (동기적으로 렌더링 전에 처리)
  if (shouldReset && (currentNumber !== 0 || isStopping || hasStopped)) {
    setCurrentNumber(0);
    setIsStopping(false);
    setHasStopped(false);
  }

  useImperativeHandle(ref, () => ({
    stop: () => {
      setIsStopping(true);
      
      let speed = 50;
      const slowdown = setInterval(() => {
        speed += 20;
        if (speed > 300) {
          clearInterval(slowdown);
          setCurrentNumber(finalNumber);
          setHasStopped(true);
        } else {
          setCurrentNumber((prev) => (prev + 1) % 10);
        }
      }, speed);
    },
  }));

  const displayNumber = hasStopped ? finalNumber : currentNumber;
  const containerSize = isMobile ? 'w-20 h-28 sm:w-28 sm:h-40 md:w-40 md:h-56 lg:w-48 lg:h-64' : 'w-48 h-64';
  const fontSize = isMobile ? 'text-5xl sm:text-6xl md:text-8xl lg:text-[10rem]' : 'text-[10rem]';

  return (
    <div className="relative">
      {/* Outer Neon Glow */}
      <motion.div
        className="absolute -inset-1 sm:-inset-2 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-cyan-500 to-purple-500 blur-lg sm:blur-xl"
        animate={{
          opacity: hasStopped ? [0.5, 1, 0.5] : 0.3,
        }}
        transition={{
          duration: 1,
          repeat: hasStopped ? Infinity : 0,
        }}
      />

      {/* Slot Container */}
      <motion.div
        className={`relative ${containerSize} rounded-2xl sm:rounded-3xl overflow-hidden`}
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
          backdropFilter: 'blur(20px)',
          border: '2px solid rgba(0, 255, 255, 0.3)',
          boxShadow: `
            inset 0 0 40px rgba(0, 255, 255, 0.1),
            0 0 40px rgba(0, 255, 255, 0.2)
          `,
        }}
        animate={{
          borderColor: hasStopped
            ? ['rgba(0, 255, 255, 0.3)', 'rgba(0, 255, 255, 1)', 'rgba(0, 255, 255, 0.3)']
            : 'rgba(0, 255, 255, 0.3)',
        }}
        transition={{
          duration: 0.5,
          repeat: hasStopped ? 3 : 0,
        }}
      >
        {/* Metallic Reflection Effect */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(to bottom, rgba(255,255,255,0.1) 0%, transparent 50%, rgba(0,0,0,0.2) 100%)',
          }}
        />

        {/* Scan Lines */}
        <div
          className="absolute inset-0 pointer-events-none opacity-30"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 255, 255, 0.03) 2px, rgba(0, 255, 255, 0.03) 4px)',
          }}
        />

        {/* Number Display */}
        <div className="relative flex items-center justify-center h-full">
          <motion.div
            key={displayNumber}
            initial={isSpinning && !hasStopped ? { y: -20, opacity: 0 } : false}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.1 }}
            className="relative"
          >
            {/* Number Shadow/Glow */}
            <div
              className={`absolute inset-0 flex items-center justify-center blur-xl sm:blur-2xl ${fontSize}`}
              style={{
                color: hasStopped ? '#00ffff' : '#ffffff',
                opacity: hasStopped ? 0.8 : 0.3,
              }}
            >
              {displayNumber}
            </div>

            {/* Main Number */}
            <motion.div
              className={`relative ${fontSize} leading-none select-none`}
              style={{
                fontFamily: "'Orbitron', 'Courier New', monospace",
                fontWeight: 900,
                backgroundImage: hasStopped
                  ? 'linear-gradient(180deg, #00ffff 0%, #00ccff 50%, #0099ff 100%)'
                  : 'linear-gradient(180deg, #ffffff 0%, #cccccc 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                filter: isSpinning && !isStopping ? 'blur(2px)' : 'blur(0px)',
                textShadow: hasStopped
                  ? '0 0 30px rgba(0, 255, 255, 0.8)'
                  : 'none',
              }}
              animate={
                hasStopped
                  ? {
                      scale: [1, 1.1, 1],
                    }
                  : {}
              }
              transition={{
                duration: 0.5,
                repeat: hasStopped ? 2 : 0,
              }}
            >
              {displayNumber}
            </motion.div>

            {/* Motion Blur Trail (when spinning) */}
            {isSpinning && !hasStopped && (
              <>
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`absolute inset-0 flex items-center justify-center ${fontSize} text-white/20 blur-sm`}
                    style={{
                      transform: `translateY(${i * (isMobile ? 8 : 15)}px)`,
                      fontFamily: "'Orbitron', 'Courier New', monospace",
                      fontWeight: 900,
                    }}
                  >
                    {(currentNumber - i + 10) % 10}
                  </div>
                ))}
              </>
            )}
          </motion.div>
        </div>

        {/* Corner Highlights */}
        {hasStopped && (
          <>
            {[0, 1, 2, 3].map((i) => (
              <motion.div
                key={i}
                className="absolute w-4 h-4 sm:w-6 sm:h-6 border-2 border-cyan-400"
                style={{
                  top: i < 2 ? 4 : 'auto',
                  bottom: i >= 2 ? 4 : 'auto',
                  left: i % 2 === 0 ? 4 : 'auto',
                  right: i % 2 === 1 ? 4 : 'auto',
                  borderRightColor: i % 2 === 0 ? 'transparent' : undefined,
                  borderLeftColor: i % 2 === 1 ? 'transparent' : undefined,
                  borderBottomColor: i < 2 ? 'transparent' : undefined,
                  borderTopColor: i >= 2 ? 'transparent' : undefined,
                }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
              />
            ))}
          </>
        )}
      </motion.div>

      {/* Bottom Glow Bar */}
      {hasStopped && (
        <motion.div
          className="absolute -bottom-2 sm:-bottom-4 left-0 right-0 h-0.5 sm:h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.5 }}
          style={{
            boxShadow: '0 0 20px rgba(0, 255, 255, 0.8)',
          }}
        />
      )}
    </div>
  );
});
