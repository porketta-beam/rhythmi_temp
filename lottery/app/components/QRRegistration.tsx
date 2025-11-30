"use client";

import { motion } from 'motion/react';
import { Scan, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';

interface QRRegistrationProps {
  onComplete: () => void;
}

export function QRRegistration({ onComplete }: QRRegistrationProps) {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-120px)] sm:min-h-[calc(100vh-160px)] md:min-h-[calc(100vh-200px)] px-4 sm:px-6 md:px-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="max-w-[95vw] sm:max-w-lg md:max-w-xl lg:max-w-2xl w-full"
      >
        {/* Main Card */}
        <div className="relative">
          {/* Neon Border Effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-2xl sm:rounded-3xl blur-lg sm:blur-xl opacity-50 animate-pulse" />
          
          <div className="relative bg-gradient-to-br from-gray-900/90 to-black/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-cyan-500/30 p-6 sm:p-8 md:p-12 shadow-2xl">
            {/* Icon */}
            <motion.div
              className="flex justify-center mb-4 sm:mb-6 md:mb-8"
              animate={{
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-cyan-500/30 blur-xl sm:blur-2xl rounded-full" />
                <Scan className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 text-cyan-400" strokeWidth={1.5} />
              </div>
            </motion.div>

            {/* Title */}
            <h2 
              className="text-center text-2xl sm:text-3xl md:text-4xl lg:text-5xl mb-2 sm:mb-4 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent" 
              style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 700 }}
            >
              참가자 등록
            </h2>
            <p 
              className="text-center text-base sm:text-lg md:text-xl text-gray-300 mb-6 sm:mb-8 md:mb-12" 
              style={{ fontFamily: 'Pretendard, sans-serif' }}
            >
              QR 코드를 스캔하여 추첨에 참여하세요
            </p>

            {/* QR Code Area */}
            <div className="relative mb-6 sm:mb-8 md:mb-12">
              {/* Scanning Animation */}
              <motion.div
                className="absolute inset-0 z-10"
                initial={{ top: 0 }}
                animate={{ top: ['0%', '100%', '0%'] }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <div className="w-full h-0.5 sm:h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_rgba(0,255,255,0.8)] sm:shadow-[0_0_20px_rgba(0,255,255,0.8)]" />
              </motion.div>

              {/* QR Container */}
              <div className="relative aspect-square max-w-[200px] sm:max-w-[280px] md:max-w-[320px] lg:max-w-md mx-auto bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 border-2 sm:border-4 border-cyan-400/50 shadow-[0_0_20px_rgba(0,255,255,0.3)] sm:shadow-[0_0_40px_rgba(0,255,255,0.3)]">
                <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg sm:rounded-xl flex items-center justify-center">
                  <Scan className="w-16 h-16 sm:w-24 sm:h-24 md:w-32 md:h-32 text-gray-400" />
                </div>

                {/* Corner Accents */}
                {[0, 90, 180, 270].map((rotation, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 border-t-2 sm:border-t-4 border-l-2 sm:border-l-4 border-cyan-400"
                    style={{
                      top: rotation === 0 || rotation === 90 ? -2 : 'auto',
                      bottom: rotation === 180 || rotation === 270 ? -2 : 'auto',
                      left: rotation === 0 || rotation === 270 ? -2 : 'auto',
                      right: rotation === 90 || rotation === 180 ? -2 : 'auto',
                      transform: `rotate(${rotation}deg)`,
                    }}
                    animate={{
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.2,
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Info Text */}
            <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/30 rounded-lg sm:rounded-xl p-4 sm:p-6 mb-4 sm:mb-6 md:mb-8">
              <p className="text-center text-sm sm:text-base text-cyan-300" style={{ fontFamily: 'Pretendard, sans-serif' }}>
                참가 번호: <span className="text-white" style={{ fontWeight: 700 }}>000 ~ 299</span>
              </p>
              <p className="text-center text-gray-400 text-xs sm:text-sm mt-1 sm:mt-2" style={{ fontFamily: 'Pretendard, sans-serif' }}>
                총 300명의 참가자 중 행운의 당첨자를 선정합니다
              </p>
            </div>

            {/* Action Button */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                onClick={onComplete}
                className="w-full h-12 sm:h-14 md:h-16 text-base sm:text-lg md:text-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 border-0 shadow-[0_0_20px_rgba(0,255,255,0.5)] sm:shadow-[0_0_30px_rgba(0,255,255,0.5)] relative overflow-hidden group rounded-xl"
              >
                <span className="relative z-10 flex items-center justify-center gap-2 sm:gap-3">
                  추첨 시작하기
                  <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6" />
                </span>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100"
                  transition={{ duration: 0.3 }}
                />
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

