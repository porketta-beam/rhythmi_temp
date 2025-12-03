"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion } from "motion/react";
import { Gift } from "lucide-react";
import Image from "next/image";
import { SlotMachine } from "../../../components/lottery/SlotMachine";
import { PrizeAnnouncementOverlay } from "../../../components/lottery/PrizeAnnouncementOverlay";
import { ConnectionStatusIndicator } from "../../../components/lottery/ConnectionStatusIndicator";
import { useLotterySocket } from "../../../hooks/useLotterySocket";
import { luckydrawSocket } from "../../../lib/websocket/luckydrawSocket";
import { DEFAULT_EVENT_ID } from "../../../lib/lottery/constants";

export default function LotteryMainPage() {
  const [currentPrize, setCurrentPrize] = useState(null);
  const [currentPrizeImage, setCurrentPrizeImage] = useState(null);
  const [showPrizeAnnouncement, setShowPrizeAnnouncement] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [pendingWinner, setPendingWinner] = useState(null);
  const [isStandby, setIsStandby] = useState(false); // 대기 상태 추가
  const slotMachineRef = useRef(null);

  // 추첨 대기 이벤트 처리 (신규)
  const handleDrawStandby = useCallback((data) => {
    console.log('[Presentation] draw_standby:', data);
    setCurrentPrize(data.prize_name);
    setCurrentPrizeImage(data.prize_image || null);
    setIsStandby(true);
    setShowPrizeAnnouncement(true);

    // 대기 상태에서는 상품 안내만 표시 (슬롯 시작 안 함)
    // draw_started 이벤트가 오면 슬롯이 시작됨
  }, []);

  // 추첨 시작 이벤트 처리
  const handleDrawStarted = useCallback((data) => {
    console.log('[Presentation] draw_started:', data);
    setCurrentPrize(data.prize_name);
    setCurrentPrizeImage(data.prize_image || null);
    setIsStandby(false);

    // 이미 상품 안내가 표시 중이면 바로 슬롯 시작
    if (showPrizeAnnouncement) {
      setShowPrizeAnnouncement(false);
      slotMachineRef.current?.startSpinning();
    } else {
      // 상품 안내 표시 후 슬롯 시작
      setShowPrizeAnnouncement(true);
      setTimeout(() => {
        setShowPrizeAnnouncement(false);
        slotMachineRef.current?.startSpinning();
      }, 3000);
    }
  }, [showPrizeAnnouncement]);

  // 결과 발표 이벤트 처리 (main 전용 - 서버에서 당첨번호 수신)
  // winner_revealed: admin이 "결과 발표" 버튼 클릭 시 main에만 전송
  const handleWinnerRevealed = useCallback((data) => {
    console.log('[Presentation] winner_revealed:', data);

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

  // 당첨자 공개 이벤트 처리 (waiting/admin용 - main은 무시)
  // winner_announced: main의 애니메이션 완료 후 서버가 broadcast
  const handleWinnerAnnounced = useCallback((data) => {
    console.log('[Presentation] winner_announced (ignored in main):', data);
    // main 페이지에서는 이미 winner_revealed로 처리했으므로 무시
  }, []);

  // 이벤트 리셋 처리
  const handleEventReset = useCallback((data) => {
    console.log('[Presentation] event_reset:', data);
    if (data.reset_draws) {
      setCurrentPrize(null);
      setCurrentPrizeImage(null);
      setShowPrizeAnnouncement(false);
      setPendingWinner(null);
      setIsStandby(false);
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

    const unsubscribeStandby = luckydrawSocket.on('draw_standby', handleDrawStandby);
    const unsubscribeDrawStarted = luckydrawSocket.on('draw_started', handleDrawStarted);
    const unsubscribeWinnerRevealed = luckydrawSocket.on('winner_revealed', handleWinnerRevealed);
    const unsubscribeWinnerAnnounced = luckydrawSocket.on('winner_announced', handleWinnerAnnounced);
    const unsubscribeReset = luckydrawSocket.on('event_reset', handleEventReset);

    // Cleanup
    return () => {
      unsubscribeConnected();
      unsubscribeDisconnected();
      unsubscribeStandby();
      unsubscribeDrawStarted();
      unsubscribeWinnerRevealed();
      unsubscribeWinnerAnnounced();
      unsubscribeReset();
      luckydrawSocket.disconnect();
    };
  }, [handleDrawStandby, handleDrawStarted, handleWinnerRevealed, handleWinnerAnnounced, handleEventReset]);

  // 추첨 완료 콜백 (SlotMachine에서 호출)
  // 슬롯 애니메이션 완료 후 서버에 draw_complete 전송
  // → 서버가 winner_announced를 waiting/admin에 브로드캐스트
  const handleDrawComplete = useCallback((winningNumber) => {
    const winnerNum = winningNumber.join('');
    console.log('[Presentation] Draw complete:', winnerNum);

    // 서버에 애니메이션 완료 알림
    luckydrawSocket.send('draw_complete', {
      event_id: DEFAULT_EVENT_ID,
      winning_number: parseInt(winnerNum, 10),
    });
  }, []);

  return (
    <div className="min-h-screen">
      {/* Prize Announcement Overlay */}
      <PrizeAnnouncementOverlay
        show={showPrizeAnnouncement}
        prizeName={currentPrize}
        prizeImage={currentPrizeImage}
        isStandby={isStandby}
      />

      {/* Header */}
      <div className="pt-4 sm:pt-6 md:pt-8 px-4 sm:px-6 md:px-8">
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
              {isStandby && (
                <span className="text-xs text-yellow-300/70 ml-1">(대기중)</span>
              )}
            </motion.div>
          )}
        </div>
      </div>

      {/* Connection Status Indicator */}
      <ConnectionStatusIndicator status={connectionStatus} />

      {/* Main Content */}
      <div>
        <SlotMachine
          ref={slotMachineRef}
          onBack={() => {}}
          currentPrize={currentPrize}
          currentPrizeImage={currentPrizeImage}
          onDrawComplete={handleDrawComplete}
          hideControls={true}
        />
      </div>
    </div>
  );
}
