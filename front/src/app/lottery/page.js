"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Ticket, Sparkles } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { luckydrawSocket } from "../../lib/websocket/luckydrawSocket";

// QR 코드가 가리키는 경로 (참여자 대기 페이지)
const WAITING_PAGE_PATH = "/lottery/waiting";

// 환경변수에서 프론트엔드 URL 가져오기 (개발: localhost, 배포: vercel URL)
const FRONTEND_URL = process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000";

// 기본 이벤트 ID
const DEFAULT_EVENT_ID = "sfs-2025";

export default function LotteryQRPage() {
  const router = useRouter();

  // QR 코드용 전체 URL (환경변수 기반)
  const qrURL = `${FRONTEND_URL}${WAITING_PAGE_PATH}`;

  const [isMounted, setIsMounted] = useState(false);

  // 추첨 대기 이벤트 처리 - /lottery/main으로 이동
  const handleDrawStandby = useCallback((data) => {
    console.log('[QR Page] draw_standby 수신:', data);
    // 부드러운 전환을 위해 router.push 사용 (layout 유지)
    router.push('/lottery/main');
  }, [router]);

  // 클라이언트 마운트 확인 및 WebSocket 연결
  useEffect(() => {
    setIsMounted(true);

    // WebSocket 연결
    luckydrawSocket.connect(DEFAULT_EVENT_ID)
      .then(() => {
        console.log('[QR Page] WebSocket 연결 성공');
      })
      .catch((err) => {
        console.error('[QR Page] WebSocket 연결 실패:', err);
      });

    // draw_standby 이벤트 리스너 등록
    const unsubscribeStandby = luckydrawSocket.on('draw_standby', handleDrawStandby);

    // Cleanup
    return () => {
      unsubscribeStandby();
      luckydrawSocket.disconnect();
    };
  }, [handleDrawStandby]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-8">
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
            {/* 실제 QR 코드 */}
            <div className="w-48 h-48 sm:w-64 sm:h-64 md:w-72 md:h-72 mx-auto flex items-center justify-center">
              {isMounted && (
                <QRCodeSVG
                  value={qrURL}
                  size={288}
                  level="H"
                  includeMargin={true}
                  className="w-full h-full"
                />
              )}
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
            <span className="text-cyan-300 font-medium">경품 추첨 대기 중!</span>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
