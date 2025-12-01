"use client";

import { useState, useSyncExternalStore } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Ticket, Gift, Clock, CheckCircle2 } from 'lucide-react';
import { AnimatedBackground } from '../../../components/lottery/AnimatedBackground';

// 티켓 번호 생성 함수 (컴포넌트 외부)
const generateTicketNumber = () => {
  return String(Math.floor(Math.random() * 300)).padStart(3, '0');
};

// sessionStorage를 외부 스토어로 사용
const subscribeToTicket = (callback) => {
  window.addEventListener('storage', callback);
  return () => window.removeEventListener('storage', callback);
};

const getTicketSnapshot = () => {
  const stored = sessionStorage.getItem('ticketNumber');
  if (stored) return stored;
  const newTicket = generateTicketNumber();
  sessionStorage.setItem('ticketNumber', newTicket);
  return newTicket;
};

const getServerSnapshot = () => null;

export default function WaitingPage() {
  const ticketNumber = useSyncExternalStore(
    subscribeToTicket,
    getTicketSnapshot,
    getServerSnapshot
  );
  const [currentPrize, setCurrentPrize] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isWinner, setIsWinner] = useState(false);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#10062D] via-[#341f97] to-[#c9208a]">
      <AnimatedBackground />

      {/* Header */}
      <div className="relative z-10 pt-4 sm:pt-6 md:pt-8 px-4 sm:px-6 md:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1
            className="text-white text-xl sm:text-2xl md:text-3xl mb-1"
            style={{ fontFamily: "Pretendard, sans-serif", fontWeight: 700 }}
          >
            SFS 2025
          </h1>
          <p
            className="text-cyan-300 text-sm sm:text-base"
            style={{ fontFamily: "Pretendard, sans-serif" }}
          >
            스마트 미래사회 컨퍼런스
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-120px)] px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          {/* Ticket Card */}
          <div className="relative mb-8">
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-3xl blur-lg opacity-50" />
            <div className="relative bg-gradient-to-br from-gray-900/95 to-black/95 backdrop-blur-xl rounded-3xl border border-cyan-500/30 p-6 sm:p-8">
              {/* Ticket Icon */}
              <div className="flex justify-center mb-6">
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="relative"
                >
                  <div className="absolute inset-0 bg-cyan-500/30 blur-xl rounded-full" />
                  <Ticket className="relative w-16 h-16 sm:w-20 sm:h-20 text-cyan-400" strokeWidth={1.5} />
                </motion.div>
              </div>

              {/* Title */}
              <h2 
                className="text-center text-xl sm:text-2xl text-white mb-2"
                style={{ fontFamily: "Pretendard, sans-serif", fontWeight: 700 }}
              >
                나의 추첨 번호
              </h2>
              <p className="text-center text-gray-400 text-sm mb-6">
                추첨이 시작되면 결과를 확인하세요!
              </p>

              {/* Ticket Number Display */}
              <motion.div
                className="relative py-6 px-4 rounded-2xl bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border-2 border-cyan-400/50 mb-6"
                animate={{
                  borderColor: isDrawing ? ['rgba(0,255,255,0.5)', 'rgba(168,85,247,0.5)', 'rgba(0,255,255,0.5)'] : 'rgba(0,255,255,0.5)',
                }}
                transition={{ duration: 1, repeat: isDrawing ? Infinity : 0 }}
              >
                <div className="flex justify-center gap-3 sm:gap-4">
                  {ticketNumber?.split('').map((digit, index) => (
                    <motion.div
                      key={index}
                      className="w-14 h-20 sm:w-18 sm:h-24 rounded-xl bg-gray-900/80 border-2 border-cyan-400/30 flex items-center justify-center"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <span 
                        className="text-4xl sm:text-5xl bg-gradient-to-b from-cyan-400 to-purple-400 bg-clip-text text-transparent"
                        style={{ fontFamily: "'Orbitron', monospace", fontWeight: 900 }}
                      >
                        {digit}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Status */}
              <AnimatePresence mode="wait">
                {isDrawing ? (
                  <motion.div
                    key="drawing"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center justify-center gap-2 text-yellow-400"
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Clock className="w-5 h-5" />
                    </motion.div>
                    <span style={{ fontFamily: "Pretendard, sans-serif" }}>
                      추첨 진행 중...
                    </span>
                  </motion.div>
                ) : isWinner ? (
                  <motion.div
                    key="winner"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center justify-center gap-2 text-green-400"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    <span style={{ fontFamily: "Pretendard, sans-serif", fontWeight: 700 }}>
                      🎉 축하합니다! 당첨되셨습니다!
                    </span>
                  </motion.div>
                ) : (
                  <motion.div
                    key="waiting"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center justify-center gap-2 text-gray-400"
                  >
                    <Clock className="w-5 h-5" />
                    <span style={{ fontFamily: "Pretendard, sans-serif" }}>
                      추첨 대기 중
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Current Prize Info */}
          {currentPrize && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl blur opacity-30" />
              <div className="relative bg-gray-900/90 rounded-2xl border border-yellow-500/30 p-4 sm:p-6">
                <div className="flex items-center gap-3">
                  <Gift className="w-8 h-8 text-yellow-400" />
                  <div>
                    <p className="text-gray-400 text-sm">현재 추첨 상품</p>
                    <p className="text-white text-lg font-bold">{currentPrize}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Info Box */}
          <div className="mt-8 bg-gray-900/50 rounded-xl border border-gray-700/50 p-4">
            <p className="text-center text-gray-400 text-sm" style={{ fontFamily: "Pretendard, sans-serif" }}>
              💡 이 페이지를 유지해주세요.<br />
              추첨 결과가 실시간으로 표시됩니다.
            </p>
          </div>
        </motion.div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-2 sm:left-10 w-48 sm:w-72 h-48 sm:h-72 bg-cyan-500/10 rounded-full blur-[80px] sm:blur-[100px] animate-pulse" />
        <div className="absolute bottom-1/4 right-2 sm:right-10 w-48 sm:w-72 h-48 sm:h-72 bg-purple-500/10 rounded-full blur-[80px] sm:blur-[100px] animate-pulse" style={{ animationDelay: "1s" }} />
      </div>
    </div>
  );
}

