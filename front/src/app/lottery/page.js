"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Gift, Wifi, WifiOff } from "lucide-react";
import Image from "next/image";
import { SlotMachine } from "../../components/lottery/SlotMachine";
import { AnimatedBackground } from "../../components/lottery/AnimatedBackground";
import { luckydrawSocket } from "../../lib/websocket/luckydrawSocket";

// 기본 이벤트 ID (관리자 페이지와 동일)
const DEFAULT_EVENT_ID = "sfs-2025";

export default function LotteryPage() {
  const [currentPrize, setCurrentPrize] = useState(null);
  const [currentPrizeImage, setCurrentPrizeImage] = useState(null);
  const [showPrizeAnnouncement, setShowPrizeAnnouncement] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [pendingWinner, setPendingWinner] = useState(null);
  const slotMachineRef = useRef(null);

  // 추첨 시작 이벤트 처리
  const handleDrawStarted = useCallback((data) => {
    console.log('[Presentation] draw_started:', data);
    setCurrentPrize(data.prize_name);
    setCurrentPrizeImage(data.prize_image || null);
    setShowPrizeAnnouncement(true);

    // 3초 후 상품 안내 숨기고 슬롯 스피닝 시작
    setTimeout(() => {
      setShowPrizeAnnouncement(false);
      // 슬롯머신 스피닝 시작 (당첨번호 대기)
      slotMachineRef.current?.startSpinning();
    }, 3000);
  }, []);

  // 당첨자 발표 이벤트 처리
  const handleWinnerAnnounced = useCallback((data) => {
    console.log('[Presentation] winner_announced:', data);

    // 당첨 번호가 있으면 SlotMachine에서 해당 번호로 정지
    if (data.winners && data.winners.length > 0) {
      const winningNumber = data.winners[0]; // 첫 번째 당첨자

      // 슬롯머신이 스피닝 상태인지 확인
      const state = slotMachineRef.current?.getState();
      if (state === 'spinning') {
        // 스피닝 중이면 바로 정지
        slotMachineRef.current?.stopAt(winningNumber);
      } else {
        // 아직 스피닝 시작 전이면 대기
        setPendingWinner(winningNumber);
      }
    }
  }, []);

  // 이벤트 리셋 처리
  const handleEventReset = useCallback((data) => {
    console.log('[Presentation] event_reset:', data);
    if (data.reset_draws) {
      setCurrentPrize(null);
      setCurrentPrizeImage(null);
      setShowPrizeAnnouncement(false);
      setPendingWinner(null);
      slotMachineRef.current?.reset();
    }
  }, []);

  // 대기 중인 당첨자가 있고 슬롯이 스피닝 시작되면 처리
  useEffect(() => {
    if (pendingWinner !== null) {
      const checkAndStop = setInterval(() => {
        const state = slotMachineRef.current?.getState();
        if (state === 'spinning') {
          slotMachineRef.current?.stopAt(pendingWinner);
          setPendingWinner(null);
          clearInterval(checkAndStop);
        }
      }, 100);

      return () => clearInterval(checkAndStop);
    }
  }, [pendingWinner]);

  // WebSocket 연결 및 이벤트 리스너 설정
  useEffect(() => {
    // WebSocket 연결
    luckydrawSocket.connect(DEFAULT_EVENT_ID)
      .then(() => {
        setConnectionStatus('connected');
      })
      .catch((err) => {
        console.error('WebSocket 연결 실패:', err);
        setConnectionStatus('error');
      });

    // 이벤트 리스너 등록
    const unsubscribeConnected = luckydrawSocket.on('connected', () => {
      setConnectionStatus('connected');
    });

    const unsubscribeDisconnected = luckydrawSocket.on('disconnected', () => {
      setConnectionStatus('disconnected');
    });

    const unsubscribeDrawStarted = luckydrawSocket.on('draw_started', handleDrawStarted);
    const unsubscribeWinner = luckydrawSocket.on('winner_announced', handleWinnerAnnounced);
    const unsubscribeReset = luckydrawSocket.on('event_reset', handleEventReset);

    // Cleanup
    return () => {
      unsubscribeConnected();
      unsubscribeDisconnected();
      unsubscribeDrawStarted();
      unsubscribeWinner();
      unsubscribeReset();
      luckydrawSocket.disconnect();
    };
  }, [handleDrawStarted, handleWinnerAnnounced, handleEventReset]);

  // 추첨 완료 콜백 (SlotMachine에서 호출)
  const handleDrawComplete = useCallback((winningNumber) => {
    console.log('[Presentation] Draw complete:', winningNumber.join(''));
    // 서버에서 이미 결과를 관리하므로 여기서는 로깅만
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#10062D] via-[#341f97] to-[#c9208a]">
      <AnimatedBackground />

      {/* Prize Announcement Overlay */}
      <AnimatePresence>
        {showPrizeAnnouncement && currentPrize && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ type: "spring", damping: 15 }}
              className="text-center px-4"
            >
              <motion.div
                animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.05, 1] }}
                transition={{ duration: 0.8, repeat: 3 }}
                className="mb-6"
              >
                {currentPrizeImage ? (
                  <div className="w-32 h-32 sm:w-48 sm:h-48 md:w-56 md:h-56 mx-auto rounded-2xl overflow-hidden ring-4 ring-yellow-400 shadow-[0_0_60px_rgba(234,179,8,0.5)]">
                    <Image
                      src={currentPrizeImage}
                      alt={currentPrize}
                      width={224}
                      height={224}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <Gift className="w-24 h-24 sm:w-32 sm:h-32 text-yellow-400 mx-auto" />
                )}
              </motion.div>
              <p className="text-gray-300 text-lg sm:text-xl mb-2">지금 추첨하는 상품은</p>
              <h2 
                className="text-4xl sm:text-5xl md:text-6xl font-bold bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-400 bg-clip-text text-transparent mb-4"
                style={{ fontFamily: 'Pretendard, sans-serif' }}
              >
                {currentPrize}
              </h2>
              <p className="text-gray-400 text-sm">잠시 후 추첨이 시작됩니다...</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="relative z-10 pt-4 sm:pt-6 md:pt-8 px-4 sm:px-6 md:px-8">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div>
            <h1
              className="text-white text-xl sm:text-2xl md:text-3xl lg:text-4xl mb-1 sm:mb-2"
              style={{ fontFamily: "Pretendard, sans-serif", fontWeight: 700 }}
            >
              SFS 2025
            </h1>
            <p
              className="text-cyan-300 text-sm sm:text-base md:text-lg lg:text-xl"
              style={{ fontFamily: "Pretendard, sans-serif" }}
            >
              스마트 미래사회 컨퍼런스
            </p>
          </div>
          
          {currentPrize && !showPrizeAnnouncement && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 rounded-full bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30"
            >
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
                <Gift className="w-5 h-5 text-yellow-400" />
              )}
              <span className="text-yellow-400 font-medium text-sm sm:text-base">
                {currentPrize}
              </span>
            </motion.div>
          )}
        </div>
      </div>

      {/* Connection Status Indicator */}
      <div className="absolute top-4 right-4 z-20">
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${
          connectionStatus === 'connected'
            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
            : connectionStatus === 'connecting'
            ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
            : 'bg-red-500/20 text-red-400 border border-red-500/30'
        }`}>
          {connectionStatus === 'connected' ? (
            <Wifi className="w-4 h-4" />
          ) : (
            <WifiOff className="w-4 h-4" />
          )}
          <span>
            {connectionStatus === 'connected' ? '연결됨' : connectionStatus === 'connecting' ? '연결 중...' : '연결 끊김'}
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        <SlotMachine
          ref={slotMachineRef}
          onBack={() => {}}
          currentPrize={currentPrize}
          currentPrizeImage={currentPrizeImage}
          onDrawComplete={handleDrawComplete}
          hideControls={true}
        />
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

