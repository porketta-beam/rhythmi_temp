"use client";

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Ticket, Gift, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import ConsentForm from '../../../components/lottery/ConsentForm';
import PersonalInfoForm from '../../../components/lottery/PersonalInfoForm';
import { luckydrawAPI } from '../../../lib/api/luckydraw';
import { luckydrawSocket } from '../../../lib/websocket/luckydrawSocket';
import { DEFAULT_EVENT_ID } from '../../../lib/lottery/constants';
import { padNumber } from '../../../lib/lottery/utils';

// localStorage 키 상수
const STORAGE_KEYS = {
  TICKET_NUMBER: 'lottery_ticketNumber',
  PERSONAL_INFO: 'lottery_personalInfo',
  WAITING_STEP: 'lottery_waitingStep',
  EVENT_SESSION_ID: 'lottery_eventSessionId',
};

/**
 * WaitingPage - 참가자 대기 페이지
 *
 * 3단계 플로우:
 * 1. consent - 개인정보 수집 동의
 * 2. personal - 이름/연락처 입력
 * 3. waiting - 추첨 대기 및 결과 확인
 *
 * 세션 관리:
 * - 서버에서 이벤트 리셋 시 새로운 event_session_id 발급
 * - 클라이언트는 저장된 ID와 서버 ID 비교하여 불일치 시 초기화
 */
export default function WaitingPage() {
  // 단계 상태: consent → personal → waiting
  const [step, setStep] = useState('consent');

  // 개인정보 상태 (메모리 + localStorage 백업)
  const [personalInfo, setPersonalInfo] = useState(null);

  // 서버에서 발급받은 번호
  const [ticketNumber, setTicketNumber] = useState(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // 추첨 상태
  const [currentPrize, setCurrentPrize] = useState(null);
  const [isStandby, setIsStandby] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isWinner, setIsWinner] = useState(false);
  const [wonPrizeName, setWonPrizeName] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [error, setError] = useState(null);

  // Hydration 완료 후 localStorage에서 기존 데이터 로드
  useEffect(() => {
    (() => {
      const storedNumber = localStorage.getItem(STORAGE_KEYS.TICKET_NUMBER);
      const storedInfo = localStorage.getItem(STORAGE_KEYS.PERSONAL_INFO);
      const storedStep = localStorage.getItem(STORAGE_KEYS.WAITING_STEP);

      if (storedNumber) {
        setTicketNumber(storedNumber);
      }
      if (storedInfo) {
        try {
          setPersonalInfo(JSON.parse(storedInfo));
        } catch (e) {
          console.error('personalInfo 파싱 실패:', e);
        }
      }
      if (storedStep && ['consent', 'personal', 'waiting'].includes(storedStep)) {
        setStep(storedStep);
      }

      setIsHydrated(true);
    })();
  }, []);

  // 동의 완료 핸들러
  const handleConsent = useCallback(() => {
    setStep('personal');
    localStorage.setItem(STORAGE_KEYS.WAITING_STEP, 'personal');
  }, []);

  // 개인정보 입력 완료 핸들러
  const handlePersonalInfoSubmit = useCallback(async (info) => {
    setPersonalInfo(info);
    localStorage.setItem(STORAGE_KEYS.PERSONAL_INFO, JSON.stringify(info));

    // 서버에 참가자 등록
    try {
      const result = await luckydrawAPI.register(DEFAULT_EVENT_ID);
      const newNumber = padNumber(result.drawNumber);

      // 서버 응답 저장 (번호 + 이벤트 세션 ID)
      localStorage.setItem(STORAGE_KEYS.TICKET_NUMBER, newNumber);
      if (result.eventSessionId) {
        localStorage.setItem(STORAGE_KEYS.EVENT_SESSION_ID, result.eventSessionId);
      }

      setTicketNumber(newNumber);
      setError(null);

      // waiting 단계로 이동
      setStep('waiting');
      localStorage.setItem(STORAGE_KEYS.WAITING_STEP, 'waiting');
    } catch (err) {
      console.error('참가자 등록 실패:', err);
      setError(err.message || '등록에 실패했습니다');
    }
  }, []);

  // 뒤로가기 핸들러
  const handleBack = useCallback(() => {
    setStep('consent');
    localStorage.setItem(STORAGE_KEYS.WAITING_STEP, 'consent');
  }, []);

  // WebSocket 이벤트 핸들러
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

  // 당첨자 발표 핸들러 (당첨 시 개인정보 서버 전송)
  const handleWinnerAnnounced = useCallback((data) => {
    setIsDrawing(false);

    // 내 번호가 당첨되었는지 확인
    const myNumber = parseInt(ticketNumber, 10);
    if (data.winners && data.winners.includes(myNumber)) {
      setIsWinner(true);
      setWonPrizeName(data.prize_name);

      // 당첨 시 개인정보 서버로 전송
      if (personalInfo) {
        luckydrawSocket.send('submit_winner_info', {
          event_id: DEFAULT_EVENT_ID,
          draw_number: myNumber,
          prize_name: data.prize_name,
          name: personalInfo.name,
          phone: personalInfo.phone,
        });
        console.log('[Waiting] 당첨자 정보 전송:', {
          draw_number: myNumber,
          prize_name: data.prize_name,
          name: personalInfo.name,
        });
      }
    }
  }, [ticketNumber, personalInfo]);

  // localStorage 초기화 헬퍼 함수
  const clearAllStorageData = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.TICKET_NUMBER);
    localStorage.removeItem(STORAGE_KEYS.PERSONAL_INFO);
    localStorage.removeItem(STORAGE_KEYS.WAITING_STEP);
    localStorage.removeItem(STORAGE_KEYS.EVENT_SESSION_ID);
    setTicketNumber(null);
    setPersonalInfo(null);
    setStep('consent');
    setIsWinner(false);
    setWonPrizeName(null);
    setIsStandby(false);
    setIsDrawing(false);
    setCurrentPrize(null);
    console.log('[Waiting] 모든 데이터 초기화 완료');
  }, []);

  const handleEventReset = useCallback((data) => {
    console.log('[Waiting] event_reset:', data);

    // 서버에서 새 session_id가 오면 저장된 ID와 비교
    if (data.event_session_id) {
      const storedSessionId = localStorage.getItem(STORAGE_KEYS.EVENT_SESSION_ID);
      if (storedSessionId && storedSessionId !== data.event_session_id) {
        // 세션 ID가 다르면 무조건 초기화 (다른 이벤트 세션)
        console.log('[Waiting] 세션 ID 불일치 - 초기화');
        console.log(`  저장된 ID: ${storedSessionId}`);
        console.log(`  새 ID: ${data.event_session_id}`);
        clearAllStorageData();
        return;
      }
    }

    if (data.reset_participants) {
      // 참가자 목록이 리셋되면 처음으로
      clearAllStorageData();
    }
    if (data.reset_draws) {
      setIsDrawing(false);
      setIsStandby(false);
      setCurrentPrize(null);
      setIsWinner(false);
      setWonPrizeName(null);
    }
  }, [clearAllStorageData]);

  // WebSocket already_won 이벤트 핸들러 (재접속 시 당첨 여부 확인)
  const handleAlreadyWon = useCallback((data) => {
    console.log('[Waiting] already_won:', data);
    if (data.won && data.prizes && data.prizes.length > 0) {
      setIsWinner(true);
      // 가장 최근 당첨 상품명 표시
      setWonPrizeName(data.prizes[0].prize_name);
    }
  }, []);

  // WebSocket 연결 및 이벤트 리스너 등록
  useEffect(() => {
    luckydrawSocket.connect(DEFAULT_EVENT_ID)
      .then(() => {
        setConnectionStatus('connected');
      })
      .catch((err) => {
        console.error('WebSocket 연결 실패:', err);
        setConnectionStatus('error');
      });

    const unsubscribeConnected = luckydrawSocket.on('connected', () => {
      setConnectionStatus('connected');
      // 연결 성공 후 identify 메시지 전송 (당첨 여부 확인)
      const storedNumber = localStorage.getItem(STORAGE_KEYS.TICKET_NUMBER);
      if (storedNumber) {
        const drawNumber = parseInt(storedNumber, 10);
        console.log('[Waiting] identify 전송:', drawNumber);
        luckydrawSocket.send('identify', { draw_number: drawNumber });
      }
    });

    const unsubscribeDisconnected = luckydrawSocket.on('disconnected', () => {
      setConnectionStatus('disconnected');
    });

    const unsubscribeStandby = luckydrawSocket.on('draw_standby', handleDrawStandby);
    const unsubscribeDrawStarted = luckydrawSocket.on('draw_started', handleDrawStarted);
    const unsubscribeWinner = luckydrawSocket.on('winner_announced', handleWinnerAnnounced);
    const unsubscribeReset = luckydrawSocket.on('event_reset', handleEventReset);
    const unsubscribeAlreadyWon = luckydrawSocket.on('already_won', handleAlreadyWon);

    return () => {
      unsubscribeConnected();
      unsubscribeDisconnected();
      unsubscribeStandby();
      unsubscribeDrawStarted();
      unsubscribeWinner();
      unsubscribeReset();
      unsubscribeAlreadyWon();
      luckydrawSocket.disconnect();
    };
  }, [handleDrawStandby, handleDrawStarted, handleWinnerAnnounced, handleEventReset, handleAlreadyWon]);

  // 페이지 로드 시 API로 당첨 여부 확인 (WebSocket 백업)
  useEffect(() => {
    if (!isHydrated || !ticketNumber) return;

    const checkWinnerStatus = async () => {
      try {
        const drawNumber = parseInt(ticketNumber, 10);
        const result = await luckydrawAPI.checkWinner(DEFAULT_EVENT_ID, drawNumber);
        console.log('[Waiting] API 당첨 확인:', result);
        if (result.won && result.prizes.length > 0) {
          setIsWinner(true);
          setWonPrizeName(result.prizes[0].prizeName);
        }
      } catch (err) {
        console.error('[Waiting] 당첨 확인 API 실패:', err);
        // API 실패해도 WebSocket으로 확인 가능하므로 무시
      }
    };

    checkWinnerStatus();
  }, [isHydrated, ticketNumber]);

  // Hydration 대기 중
  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // 단계별 렌더링
  if (step === 'consent') {
    return <ConsentForm onConsent={handleConsent} />;
  }

  if (step === 'personal') {
    return <PersonalInfoForm onSubmit={handlePersonalInfoSubmit} onBack={handleBack} />;
  }

  // step === 'waiting'
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
                {personalInfo?.name}님, 추첨이 시작되면 결과를 확인하세요!
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
          </div>
        </motion.div>
      </div>
    </div>
  );
}
