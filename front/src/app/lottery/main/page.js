"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Gift } from "lucide-react";
import Image from "next/image";
import { SlotMachine } from "../../../components/lottery/SlotMachine";
import CardFlipDraw from "../../../components/lottery/CardFlipDraw";
import NetworkDraw from "../../../components/lottery/NetworkDraw";
import { PrizeAnnouncementOverlay } from "../../../components/lottery/PrizeAnnouncementOverlay";
import { ConnectionStatusIndicator } from "../../../components/lottery/ConnectionStatusIndicator";
import { luckydrawSocket } from "../../../lib/websocket/luckydrawSocket";
import { luckydrawAPI } from "../../../lib/api/luckydraw";
import { DEFAULT_EVENT_ID } from "../../../lib/lottery/constants";
import { padNumber } from "../../../lib/lottery/utils";

export default function LotteryMainPage() {
  const router = useRouter();
  const [currentPrize, setCurrentPrize] = useState(null);
  const [currentPrizeImage, setCurrentPrizeImage] = useState(null);
  const [showPrizeAnnouncement, setShowPrizeAnnouncement] = useState(false);
  const [isOverlayCollapsed, setIsOverlayCollapsed] = useState(false); // 오버레이 축소 상태
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [pendingWinners, setPendingWinners] = useState(null); // 다중 당첨자 지원
  const [isStandby, setIsStandby] = useState(false); // 대기 상태 추가
  const [drawMode, setDrawMode] = useState('slot'); // slot, card, network
  const [winnerCount, setWinnerCount] = useState(1); // 당첨자 수
  const [participants, setParticipants] = useState([]); // 실제 참가자 목록 (network용)

  // 각 모드별 ref
  const slotMachineRef = useRef(null);
  const cardFlipRef = useRef(null);
  const networkRef = useRef(null);

  // 현재 모드의 ref 반환
  const getCurrentRef = useCallback(() => {
    switch (drawMode) {
      case 'card': return cardFlipRef;
      case 'network': return networkRef;
      default: return slotMachineRef;
    }
  }, [drawMode]);

  // 추첨 대기 이벤트 처리 (신규)
  const handleDrawStandby = useCallback((data) => {
    console.log('[Presentation] draw_standby:', data);
    setCurrentPrize(data.prize_name);
    setCurrentPrizeImage(data.prize_image || null);
    setDrawMode(data.draw_mode || 'slot');
    setWinnerCount(data.winner_count || 1);
    setIsStandby(true);
    setShowPrizeAnnouncement(true);
    setIsOverlayCollapsed(false); // 오버레이 전체화면으로 표시

    // 2초 후 오버레이를 헤더로 축소
    setTimeout(() => {
      setIsOverlayCollapsed(true);
      setShowPrizeAnnouncement(false); // 전체화면 오버레이 숨김
    }, 2000);
  }, []);

  // 추첨 시작 이벤트 처리
  const handleDrawStarted = useCallback((data) => {
    console.log('[Presentation] draw_started:', data);
    setCurrentPrize(data.prize_name);
    setCurrentPrizeImage(data.prize_image || null);
    setDrawMode(data.draw_mode || 'slot');
    setWinnerCount(data.winner_count || 1);
    setIsStandby(false);
    setIsOverlayCollapsed(false); // 헤더 모드 해제

    // 현재 모드의 ref 가져오기
    const currentRef = (() => {
      switch (data.draw_mode || 'slot') {
        case 'card': return cardFlipRef;
        case 'network': return networkRef;
        default: return slotMachineRef;
      }
    })();

    // 이미 상품 안내가 표시 중이면 바로 애니메이션 시작
    if (showPrizeAnnouncement) {
      setShowPrizeAnnouncement(false);
      // 모드 전환 후 ref 접근을 위해 약간의 지연
      setTimeout(() => {
        currentRef.current?.startSpinning();
      }, 100);
    } else {
      // 상품 안내 표시 후 애니메이션 시작
      setShowPrizeAnnouncement(true);
      setTimeout(() => {
        setShowPrizeAnnouncement(false);
        setTimeout(() => {
          currentRef.current?.startSpinning();
        }, 100);
      }, 3000);
    }
  }, [showPrizeAnnouncement]);

  // 결과 발표 이벤트 처리 (main 전용 - 서버에서 당첨번호 수신)
  // winner_revealed: admin이 "결과 발표" 버튼 클릭 시 main에만 전송
  const handleWinnerRevealed = useCallback((data) => {
    console.log('[Presentation] winner_revealed:', data);

    // 당첨 번호가 있으면 해당 번호로 정지
    if (data.winners && data.winners.length > 0) {
      // 모든 당첨자 (slot은 첫 번째만, card/network는 전체)
      const winners = data.winners;

      // 현재 모드의 ref 가져오기
      const currentRef = getCurrentRef();

      // 현재 컴포넌트가 스피닝 상태인지 확인
      const state = currentRef.current?.getState();
      if (state === 'spinning') {
        // 스피닝 중이면 바로 정지
        // slot 모드는 첫 번째 번호만, 나머지는 전체 배열 전달
        if (drawMode === 'slot') {
          currentRef.current?.stopAt(winners[0]);
        } else {
          currentRef.current?.stopAt(winners);
        }
      } else {
        // 아직 스피닝 시작 전이면 대기
        setPendingWinners(winners);
      }
    }
  }, [getCurrentRef, drawMode]);

  // 당첨자 공개 이벤트 처리 (waiting/admin용 - main은 무시)
  // winner_announced: main의 애니메이션 완료 후 서버가 broadcast
  const handleWinnerAnnounced = useCallback((data) => {
    console.log('[Presentation] winner_announced (ignored in main):', data);
    // main 페이지에서는 이미 winner_revealed로 처리했으므로 무시
  }, []);

  // 참가자 등록 이벤트 처리 (실시간 동기화)
  const handleParticipantJoined = useCallback((data) => {
    console.log('[Presentation] participant_joined:', data);
    setParticipants(prev => {
      // 중복 체크
      const exists = prev.some(p => p.drawNumber === data.draw_number);
      if (exists) return prev;
      return [...prev, {
        id: `p-${data.draw_number}`,
        luckyNumber: padNumber(data.draw_number),
        name: null,
      }];
    });
  }, []);

  // 이벤트 리셋 처리
  const handleEventReset = useCallback((data) => {
    console.log('[Presentation] event_reset:', data);
    if (data.reset_draws) {
      setCurrentPrize(null);
      setCurrentPrizeImage(null);
      setShowPrizeAnnouncement(false);
      setIsOverlayCollapsed(false);
      setPendingWinners(null);
      setIsStandby(false);
      setDrawMode('slot');
      setWinnerCount(1);
      // 모든 컴포넌트 리셋
      slotMachineRef.current?.reset();
      cardFlipRef.current?.reset();
      networkRef.current?.reset();
    }
    if (data.reset_participants) {
      setParticipants([]);
    }

    // 리셋 시 QR 코드 화면(/lottery)으로 이동
    router.push('/lottery');
  }, [router]);

  // 대기 중인 당첨자가 있고 애니메이션이 스피닝 시작되면 처리
  useEffect(() => {
    if (pendingWinners !== null && pendingWinners.length > 0) {
      const currentRef = getCurrentRef();

      const checkAndStop = setInterval(() => {
        const state = currentRef.current?.getState();
        if (state === 'spinning') {
          // slot 모드는 첫 번째 번호만, 나머지는 전체 배열 전달
          if (drawMode === 'slot') {
            currentRef.current?.stopAt(pendingWinners[0]);
          } else {
            currentRef.current?.stopAt(pendingWinners);
          }
          setPendingWinners(null);
          clearInterval(checkAndStop);
        }
      }, 100);

      return () => clearInterval(checkAndStop);
    }
  }, [pendingWinners, getCurrentRef, drawMode]);

  // 초기 참가자 목록 로드
  useEffect(() => {
    const loadParticipants = async () => {
      try {
        const result = await luckydrawAPI.getParticipants(DEFAULT_EVENT_ID);
        const formattedParticipants = result.participants.map(p => ({
          id: `p-${p.drawNumber}`,
          luckyNumber: padNumber(p.drawNumber),
          name: null,
        }));
        setParticipants(formattedParticipants);
        console.log('[Presentation] Loaded participants:', formattedParticipants.length);
      } catch (err) {
        console.error('[Presentation] Failed to load participants:', err);
      }
    };
    loadParticipants();
  }, []);

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
    const unsubscribeParticipantJoined = luckydrawSocket.on('participant_joined', handleParticipantJoined);

    // Cleanup
    return () => {
      unsubscribeConnected();
      unsubscribeDisconnected();
      unsubscribeStandby();
      unsubscribeDrawStarted();
      unsubscribeWinnerRevealed();
      unsubscribeWinnerAnnounced();
      unsubscribeReset();
      unsubscribeParticipantJoined();
      luckydrawSocket.disconnect();
    };
  }, [handleDrawStandby, handleDrawStarted, handleWinnerRevealed, handleWinnerAnnounced, handleEventReset, handleParticipantJoined]);

  // 추첨 완료 콜백 (각 모드 컴포넌트에서 호출)
  // 애니메이션 완료 후 서버에 draw_complete 전송
  // → 서버가 winner_announced를 waiting/admin에 브로드캐스트
  const handleDrawComplete = useCallback((winningData) => {
    let winners;

    if (drawMode === 'slot') {
      // SlotMachine: ['0', '2', '4'] 형태 → 단일 숫자로 변환
      const winnerNum = winningData.join('');
      winners = [parseInt(winnerNum, 10)];
      console.log('[Presentation] Draw complete (slot):', winnerNum);
    } else {
      // CardFlipDraw/NetworkDraw: [24, 156, 89] 형태 → 그대로 사용
      winners = Array.isArray(winningData) ? winningData : [winningData];
      console.log('[Presentation] Draw complete (multi):', winners);
    }

    // 서버에 애니메이션 완료 알림 (다중 당첨자 지원)
    luckydrawSocket.send('draw_complete', {
      event_id: DEFAULT_EVENT_ID,
      winning_number: winners[0], // 호환성을 위해 첫 번째 당첨자
      winners: winners, // 모든 당첨자 배열
    });
  }, [drawMode]);

  return (
    <div className="min-h-screen">
      {/* Prize Announcement Overlay */}
      <PrizeAnnouncementOverlay
        show={showPrizeAnnouncement}
        prizeName={currentPrize}
        prizeImage={currentPrizeImage}
        isStandby={isStandby}
        isCollapsed={isOverlayCollapsed}
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

      {/* Main Content - 모드별 컴포넌트 렌더링 */}
      {/* slot/card는 조건부 렌더, network는 항상 마운트 (Three.js CSR) */}
      <div>
        {drawMode === 'slot' && (
          <SlotMachine
            ref={slotMachineRef}
            onBack={() => {}}
            currentPrize={currentPrize}
            currentPrizeImage={currentPrizeImage}
            onDrawComplete={handleDrawComplete}
            hideControls={true}
          />
        )}

        {drawMode === 'card' && (
          <CardFlipDraw
            ref={cardFlipRef}
            currentPrize={currentPrize}
            currentPrizeImage={currentPrizeImage}
            winnerCount={winnerCount}
            onDrawComplete={handleDrawComplete}
          />
        )}

        {/* NetworkDraw는 항상 마운트하여 Three.js 초기화 보장 */}
        <div style={{ display: drawMode === 'network' ? 'block' : 'none' }}>
          <NetworkDraw
            ref={networkRef}
            currentPrize={currentPrize}
            currentPrizeImage={currentPrizeImage}
            winnerCount={winnerCount}
            participants={participants}
            onDrawComplete={handleDrawComplete}
          />
        </div>
      </div>
    </div>
  );
}
