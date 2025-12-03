"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { QrCode, Ticket, Sparkles } from "lucide-react";
import { AnimatedBackground } from "../../components/lottery/AnimatedBackground";

// QR 코드가 가리키는 URL (참여자 대기 페이지)
const WAITING_PAGE_URL = "/lottery/waiting";

export default function LotteryQRPage() {
  // 서버/클라이언트 동일한 초기값으로 hydration mismatch 방지
  const [displayURL, setDisplayURL] = useState(WAITING_PAGE_URL);

  // 클라이언트 마운트 후 전체 URL로 업데이트
  useEffect(() => {
    setDisplayURL(`${window.location.origin}${WAITING_PAGE_URL}`);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#10062D] via-[#341f97] to-[#c9208a]">
      <AnimatedBackground />

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-2xl mx-auto"
        >
          {/* Header */}
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="mb-8"
          >
            <h1
              className="text-white text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-3"
              style={{ fontFamily: "Pretendard, sans-serif", fontWeight: 700 }}
            >
              SFS 2025
            </h1>
            <p
              className="text-cyan-300 text-lg sm:text-xl md:text-2xl"
              style={{ fontFamily: "Pretendard, sans-serif" }}
            >
              스마트 미래사회 컨퍼런스
            </p>
          </motion.div>

          {/* QR Code Section */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="relative mb-8"
          >
            {/* Glow Effect */}
            <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-3xl blur-xl opacity-40" />

            {/* QR Container */}
            <div className="relative bg-white rounded-2xl p-6 sm:p-8 shadow-2xl">
              {/* QR Code Placeholder - 실제 QR 코드 라이브러리로 대체 가능 */}
              <div className="w-48 h-48 sm:w-64 sm:h-64 md:w-72 md:h-72 mx-auto bg-gray-100 rounded-xl flex items-center justify-center border-4 border-gray-200">
                <div className="text-center">
                  <QrCode className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 text-gray-800 mx-auto" strokeWidth={1} />
                </div>
              </div>

              {/* URL Display */}
              <div className="mt-4 px-4 py-2 bg-gray-100 rounded-lg">
                <p className="text-gray-600 text-xs sm:text-sm font-mono break-all">
                  {displayURL}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Instructions */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-center gap-3 text-white">
              <Ticket className="w-6 h-6 text-cyan-400" />
              <p
                className="text-xl sm:text-2xl"
                style={{ fontFamily: "Pretendard, sans-serif", fontWeight: 600 }}
              >
                QR 코드를 스캔하여 참여하세요!
              </p>
            </div>

            <p className="text-gray-300 text-sm sm:text-base">
              스캔 후 행운의 추첨 번호가 발급됩니다
            </p>

            {/* Animated Badge */}
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="inline-flex items-center gap-2 mt-4 px-6 py-3 rounded-full bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-400/40"
            >
              <Sparkles className="w-5 h-5 text-yellow-400" />
              <span className="text-cyan-300 font-medium">경품 추첨 진행 중!</span>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-2 sm:left-10 w-48 sm:w-72 md:w-96 h-48 sm:h-72 md:h-96 bg-cyan-500/10 rounded-full blur-[80px] sm:blur-[100px] md:blur-[120px] animate-pulse" />
        <div
          className="absolute bottom-1/4 right-2 sm:right-10 w-48 sm:w-72 md:w-96 h-48 sm:h-72 md:h-96 bg-purple-500/10 rounded-full blur-[80px] sm:blur-[100px] md:blur-[120px] animate-pulse"
          style={{ animationDelay: "1s" }}
        />
      </div>
    </div>
  );
}
