"use client";

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Ticket, Gift, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { luckydrawAPI } from '../../../lib/api/luckydraw';
import { luckydrawSocket } from '../../../lib/websocket/luckydrawSocket';
import { DEFAULT_EVENT_ID, CONNECTION_STATUS } from '../../../lib/lottery/constants';
import { padNumber } from '../../../lib/lottery/utils';

export default function WaitingPage() {
  // 서버에서 발급받은 번호를 useState로 관리 (sessionStorage에도 백업)
  // SSR hydration 불일치 방지: 초기값은 null, useEffect에서 로드
  const [ticketNumber, setTicketNumber] = useState(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // Hydration 완료 후 sessionStorage에서 기존 번호 로드
  useEffect(() => {
    // IIFE로 비동기 컨텍스트 분리 (React 19 린트 규칙 준수)
    (() => {
      const storedNumber = sessionStorage.getItem('ticketNumber');
      if (storedNumber) {
        setTicketNumber(storedNumber);
      }
      setIsHydrated(true);
    })();
  }, []);
  const [currentPrize, setCurrentPrize] = useState(null);
  const [isStandby, setIsStandby] = useState(false); // 대기 상태
  const [isDrawing, setIsDrawing] = useState(false);
  const [isWinner, setIsWinner] = useState(false);
  const [wonPrizeName, setWonPrizeName] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('connecting'); // connecting, connected, disconnected, error
  const [error, setError] = useState(null);
  const [totalParticipants, setTotalParticipants] = useState(0);

  // 참가자 등록 Effect (hydration 완료 후 실행)
  useEffect(() => {
    // hydration 완료 전이면 대기
    if (!isHydrated) return;
    // 이미 번호가 있으면 서버 등록 스킵
    if (ticketNumber) return;

    let isMounted = true;

    (async () => {
      try {
        const result = await luckydrawAPI.register(DEFAULT_EVENT_ID);
        if (!isMounted) return; // 언마운트 시 setState 방지

        const newNumber = padNumber(result.drawNumber);
        sessionStorage.setItem('ticketNumber', newNumber);
        setTicketNumber(newNumber);
        setError(null);
      } catch (err) {
        if (!isMounted) return;
        console.error('참가자 등록 실패:', err);
        setError(err.message || '등록에 실패했습니다');
      }
    })();

    return () => { isMounted = false; };
  }, [isHydrated, ticketNumber]);

  // WebSocket 이벤트 핸들러
  const handleParticipantJoined = useCallback((data) => {
    setTotalParticipants(data.total_count);
  }, []);

  // 추첨 대기 이벤트 처리 (신규)
  const handleDrawStandby = useCallback((data) => {
    console.log('[Waiting] draw_standby:', data);
    setCurrentPrize(data.prize_name);
    setIsStandby(true);
    setIsDrawing(false);
    setIsWinner(false);
    setWonPrizeName(null);
  }, []);

  const handleDrawStarted = useCallback((data) => {
    setIsDrawing(true);
    setIsStandby(false);
    setCurrentPrize(data.prize_name);
    setIsWinner(false);
    setWonPrizeName(null);
  }, []);

  const handleWinnerAnnounced = useCallback((data) => {
    setIsDrawing(false);

    // 내 번호가 당첨되었는지 확인
    const myNumber = parseInt(ticketNumber, 10);
    if (data.winners && data.winners.includes(myNumber)) {
      setIsWinner(true);
      setWonPrizeName(data.prize_name);
    }
  }, [ticketNumber]);

  const handleEventReset = useCallback((data) => {
    if (data.reset_participants) {
      // 참가자 목록이 리셋되면 번호 삭제 (useEffect가 자동으로 재등록)
      sessionStorage.removeItem('ticketNumber');
      setTicketNumber(null);
      setIsWinner(false);
      setWonPrizeName(null);
    }
    if (data.reset_draws) {
      setIsDrawing(false);
      setCurrentPrize(null);
      setIsWinner(false);
      setWonPrizeName(null);
    }
  }, []);

  // WebSocket 연결 및 이벤트 리스너 등록
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

    const unsubscribeParticipant = luckydrawSocket.on('participant_joined', handleParticipantJoined);
    const unsubscribeStandby = luckydrawSocket.on('draw_standby', handleDrawStandby);
    const unsubscribeDrawStarted = luckydrawSocket.on('draw_started', handleDrawStarted);
    const unsubscribeWinner = luckydrawSocket.on('winner_announced', handleWinnerAnnounced);
    const unsubscribeReset = luckydrawSocket.on('event_reset', handleEventReset);

    // Cleanup
    return () => {
      unsubscribeConnected();
      unsubscribeDisconnected();
      unsubscribeParticipant();
      unsubscribeStandby();
      unsubscribeDrawStarted();
      unsubscribeWinner();
      unsubscribeReset();
      luckydrawSocket.disconnect();
    };
  }, [handleParticipantJoined, handleDrawStandby, handleDrawStarted, handleWinnerAnnounced, handleEventReset]);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="pt-4 sm:pt-6 md:pt-8 px-4 sm:px-6 md:px-8">
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
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)] px-4 py-8">
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
                {error ? (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center justify-center gap-2 text-red-400"
                  >
                    <AlertCircle className="w-5 h-5" />
                    <span style={{ fontFamily: "Pretendard, sans-serif" }}>
                      {error}
                    </span>
                  </motion.div>
                ) : isDrawing ? (
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
                    className="flex flex-col items-center gap-2"
                  >
                    <div className="flex items-center gap-2 text-green-400">
                      <CheckCircle2 className="w-5 h-5" />
                      <span style={{ fontFamily: "Pretendard, sans-serif", fontWeight: 700 }}>
                        🎉 축하합니다! 당첨되셨습니다!
                      </span>
                    </div>
                    {wonPrizeName && (
                      <span className="text-yellow-300 text-lg font-bold">
                        {wonPrizeName}
                      </span>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="waiting"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center justify-center gap-2 text-gray-400"
                  >
                    <div className={`w-2 h-2 rounded-full ${connectionStatus === 'connected' ? 'bg-green-400' : connectionStatus === 'connecting' ? 'bg-yellow-400 animate-pulse' : 'bg-red-400'}`} />
                    <span style={{ fontFamily: "Pretendard, sans-serif" }}>
                      {connectionStatus === 'connected' ? '추첨 대기 중' : connectionStatus === 'connecting' ? '연결 중...' : '연결 끊김'}
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
                    <p className="text-gray-400 text-sm">
                      {isStandby ? '다음 추첨 상품' : '현재 추첨 상품'}
                    </p>
                    <p className="text-white text-lg font-bold">{currentPrize}</p>
                    {isStandby && (
                      <p className="text-yellow-300/70 text-xs mt-1">추첨 대기 중...</p>
                    )}
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
            {totalParticipants > 0 && (
              <p className="text-center text-cyan-400 text-sm mt-2" style={{ fontFamily: "Pretendard, sans-serif" }}>
                현재 참가자: {totalParticipants}명
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

