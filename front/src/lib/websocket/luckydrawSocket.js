/**
 * 경품추첨 WebSocket 매니저
 *
 * 서버와 실시간 통신을 관리합니다.
 *
 * 수신 메시지 타입:
 * - participant_joined: 새 참가자 등록
 * - draw_started: 추첨 애니메이션 시작
 * - winner_announced: 당첨자 발표
 * - event_reset: 이벤트 리셋
 * - connection_count: 연결 수 업데이트
 * - pong: heartbeat 응답
 */

import { API_BASE } from "../apiConfig";

// WebSocket URL 생성 (HTTP → WS 변환)
function getWebSocketUrl() {
  const wsProtocol = API_BASE.startsWith("https") ? "wss" : "ws";
  const baseWithoutProtocol = API_BASE.replace(/^https?:\/\//, "");
  return `${wsProtocol}://${baseWithoutProtocol}`;
}

const WS_BASE = getWebSocketUrl();

// ============================================================
// WebSocket 매니저 클래스
// ============================================================

class LuckyDrawSocket {
  constructor() {
    this.socket = null;
    this.eventId = null;
    this.listeners = {};
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 3000; // 3초
    this.heartbeatInterval = null;
    this.heartbeatTimeout = 30000; // 30초
  }

  /**
   * WebSocket 연결
   *
   * @param {string} eventId - 이벤트 ID
   * @returns {Promise<void>}
   */
  connect(eventId) {
    return new Promise((resolve, reject) => {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        if (this.eventId === eventId) {
          resolve();
          return;
        }
        this.disconnect();
      }

      this.eventId = eventId;
      // WebSocket 경로가 REST API 라우터에 통합됨
      const url = `${WS_BASE}/api/luckydraw/ws/${encodeURIComponent(eventId)}`;

      try {
        this.socket = new WebSocket(url);

        this.socket.onopen = () => {
          console.log("[WS] 연결 성공:", eventId);
          this.reconnectAttempts = 0;
          this._startHeartbeat();
          this._emit("connected", { eventId });
          resolve();
        };

        this.socket.onclose = (event) => {
          console.log("[WS] 연결 종료:", event.code, event.reason);
          this._stopHeartbeat();
          this._emit("disconnected", { code: event.code, reason: event.reason });
          this._attemptReconnect();
        };

        this.socket.onerror = (error) => {
          console.error("[WS] 연결 에러:", error);
          this._emit("error", { error });
          reject(error);
        };

        this.socket.onmessage = (event) => {
          this._handleMessage(event);
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * WebSocket 연결 해제
   */
  disconnect() {
    this._stopHeartbeat();
    if (this.socket) {
      this.socket.close(1000, "Client disconnect");
      this.socket = null;
    }
    this.eventId = null;
    this.reconnectAttempts = this.maxReconnectAttempts; // 재연결 방지
  }

  /**
   * 연결 상태 확인
   * @returns {boolean}
   */
  isConnected() {
    return this.socket && this.socket.readyState === WebSocket.OPEN;
  }

  /**
   * 메시지 수신 핸들러 등록
   *
   * @param {string} type - 메시지 타입
   * @param {Function} callback - 콜백 함수
   * @returns {Function} 해제 함수
   */
  on(type, callback) {
    if (!this.listeners[type]) {
      this.listeners[type] = [];
    }
    this.listeners[type].push(callback);

    // 해제 함수 반환
    return () => {
      this.off(type, callback);
    };
  }

  /**
   * 메시지 수신 핸들러 해제
   *
   * @param {string} type - 메시지 타입
   * @param {Function} callback - 콜백 함수
   */
  off(type, callback) {
    if (this.listeners[type]) {
      this.listeners[type] = this.listeners[type].filter((cb) => cb !== callback);
    }
  }

  /**
   * 모든 리스너 해제
   */
  removeAllListeners() {
    this.listeners = {};
  }

  // ============================================================
  // 내부 메서드
  // ============================================================

  /**
   * 메시지 처리
   * @private
   */
  _handleMessage(event) {
    try {
      const data = JSON.parse(event.data);
      const type = data.type;

      console.log("[WS] 메시지 수신:", type, data);

      // 타입별 핸들러 호출
      this._emit(type, data);

      // 전체 메시지 리스너에도 전달
      this._emit("message", data);
    } catch (error) {
      console.error("[WS] 메시지 파싱 에러:", error);
    }
  }

  /**
   * 이벤트 발생
   * @private
   */
  _emit(type, data) {
    if (this.listeners[type]) {
      this.listeners[type].forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(`[WS] 리스너 에러 (${type}):`, error);
        }
      });
    }
  }

  /**
   * Heartbeat 시작
   * @private
   */
  _startHeartbeat() {
    this._stopHeartbeat();
    this.heartbeatInterval = setInterval(() => {
      if (this.isConnected()) {
        this.socket.send(JSON.stringify({ type: "ping" }));
      }
    }, this.heartbeatTimeout);
  }

  /**
   * Heartbeat 중지
   * @private
   */
  _stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  /**
   * 재연결 시도
   * @private
   */
  _attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log("[WS] 최대 재연결 시도 횟수 초과");
      this._emit("reconnect_failed", {});
      return;
    }

    this.reconnectAttempts++;
    console.log(`[WS] 재연결 시도 ${this.reconnectAttempts}/${this.maxReconnectAttempts}...`);

    setTimeout(() => {
      if (this.eventId) {
        this.connect(this.eventId).catch(() => {
          // 재연결 실패는 onclose에서 다시 시도
        });
      }
    }, this.reconnectDelay);
  }
}

// ============================================================
// React Hook 유틸리티
// ============================================================

/**
 * React에서 사용하기 쉬운 useEffect 패턴용 헬퍼
 *
 * @example
 * useEffect(() => {
 *   const socket = luckydrawSocket;
 *   socket.connect(eventId);
 *
 *   const unsubscribe = socket.on('winner_announced', (data) => {
 *     setWinner(data.winners);
 *   });
 *
 *   return () => {
 *     unsubscribe();
 *     socket.disconnect();
 *   };
 * }, [eventId]);
 */

// 싱글톤 인스턴스 export
export const luckydrawSocket = new LuckyDrawSocket();

// 클래스도 export (테스트용)
export { LuckyDrawSocket };

// 기본 export
export default luckydrawSocket;
