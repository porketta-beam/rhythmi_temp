"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { luckydrawSocket } from '../lib/websocket/luckydrawSocket';
import { CONNECTION_STATUS, DEFAULT_EVENT_ID } from '../lib/lottery/constants';

/**
 * 경품 추첨 WebSocket 연결을 관리하는 커스텀 훅
 *
 * @param {Object} options - 설정 옵션
 * @param {string} options.eventId - 이벤트 ID (기본값: DEFAULT_EVENT_ID)
 * @param {Object} options.handlers - 이벤트 핸들러 객체
 * @param {Function} options.handlers.onDrawStandby - 추첨 대기 이벤트
 * @param {Function} options.handlers.onDrawStarted - 추첨 시작 이벤트
 * @param {Function} options.handlers.onWinnerRevealed - 결과 발표 이벤트 (main용)
 * @param {Function} options.handlers.onWinnerAnnounced - 당첨자 공개 이벤트 (waiting/admin용)
 * @param {Function} options.handlers.onEventReset - 이벤트 리셋
 * @param {Function} options.handlers.onParticipantJoined - 참가자 등록
 * @returns {Object} { connectionStatus, send, isConnected }
 */
export function useLotterySocket({ eventId = DEFAULT_EVENT_ID, handlers = {} } = {}) {
  const [connectionStatus, setConnectionStatus] = useState(CONNECTION_STATUS.CONNECTING);
  const handlersRef = useRef(handlers);

  // handlers를 ref로 관리하여 useEffect 의존성 문제 방지
  useEffect(() => {
    handlersRef.current = handlers;
  }, [handlers]);

  useEffect(() => {
    // WebSocket 연결
    luckydrawSocket.connect(eventId)
      .then(() => {
        setConnectionStatus(CONNECTION_STATUS.CONNECTED);
      })
      .catch((err) => {
        console.error('WebSocket 연결 실패:', err);
        setConnectionStatus(CONNECTION_STATUS.ERROR);
      });

    // 연결 상태 리스너
    const unsubscribeConnected = luckydrawSocket.on('connected', () => {
      setConnectionStatus(CONNECTION_STATUS.CONNECTED);
    });

    const unsubscribeDisconnected = luckydrawSocket.on('disconnected', () => {
      setConnectionStatus(CONNECTION_STATUS.DISCONNECTED);
    });

    // 이벤트 리스너 등록 (핸들러가 있는 경우에만)
    const unsubscribers = [];

    const eventMap = {
      draw_standby: 'onDrawStandby',
      draw_started: 'onDrawStarted',
      winner_revealed: 'onWinnerRevealed',
      winner_announced: 'onWinnerAnnounced',
      event_reset: 'onEventReset',
      participant_joined: 'onParticipantJoined',
    };

    Object.entries(eventMap).forEach(([socketEvent, handlerName]) => {
      const unsub = luckydrawSocket.on(socketEvent, (data) => {
        handlersRef.current[handlerName]?.(data);
      });
      unsubscribers.push(unsub);
    });

    // Cleanup
    return () => {
      unsubscribeConnected();
      unsubscribeDisconnected();
      unsubscribers.forEach(unsub => unsub());
      luckydrawSocket.disconnect();
    };
  }, [eventId]);

  // 메시지 전송 함수
  const send = useCallback((type, data = {}) => {
    return luckydrawSocket.send(type, data);
  }, []);

  // 연결 상태 확인
  const isConnected = connectionStatus === CONNECTION_STATUS.CONNECTED;

  return {
    connectionStatus,
    send,
    isConnected,
  };
}

export default useLotterySocket;
