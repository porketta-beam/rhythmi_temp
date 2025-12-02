/**
 * 경품추첨 API 클라이언트
 *
 * 서버의 /api/luckydraw/* 엔드포인트와 통신합니다.
 */

import { API_BASE } from "../apiConfig";

// ============================================================
// 세션 토큰 관리
// ============================================================

const SESSION_TOKEN_KEY = "luckydraw_session_token";

/**
 * 세션 토큰 저장
 * @param {string} eventId - 이벤트 ID
 * @param {string} token - 세션 토큰
 */
export function saveSessionToken(eventId, token) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(`${SESSION_TOKEN_KEY}_${eventId}`, token);
}

/**
 * 세션 토큰 조회
 * @param {string} eventId - 이벤트 ID
 * @returns {string|null} 세션 토큰
 */
export function getSessionToken(eventId) {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(`${SESSION_TOKEN_KEY}_${eventId}`);
}

/**
 * 세션 토큰 삭제
 * @param {string} eventId - 이벤트 ID
 */
export function clearSessionToken(eventId) {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(`${SESSION_TOKEN_KEY}_${eventId}`);
}

// ============================================================
// API 클라이언트 클래스
// ============================================================

class LuckyDrawAPI {
  constructor() {
    this.baseUrl = `${API_BASE}/api/luckydraw`;
  }

  /**
   * API 요청 헬퍼
   * @private
   */
  async _request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;

    const config = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw {
          status: response.status,
          code: data.detail?.code || "UNKNOWN_ERROR",
          message: data.detail?.message || "알 수 없는 에러가 발생했습니다",
        };
      }

      return data;
    } catch (error) {
      if (error.status) {
        throw error;
      }
      throw {
        status: 0,
        code: "NETWORK_ERROR",
        message: "네트워크 연결에 실패했습니다",
      };
    }
  }

  // ============================================================
  // 참가자 API
  // ============================================================

  /**
   * 참가자 등록 및 추첨번호 할당
   *
   * @param {string} eventId - 이벤트 ID
   * @returns {Promise<{drawNumber: number, sessionToken: string, isExisting: boolean}>}
   */
  async register(eventId) {
    const existingToken = getSessionToken(eventId);

    const result = await this._request("/register", {
      method: "POST",
      body: JSON.stringify({
        event_id: eventId,
        session_token: existingToken,
      }),
    });

    // 세션 토큰 저장
    if (result.data?.session_token) {
      saveSessionToken(eventId, result.data.session_token);
    }

    return {
      drawNumber: result.data.draw_number,
      sessionToken: result.data.session_token,
      eventId: result.data.event_id,
      isExisting: result.data.is_existing,
    };
  }

  /**
   * 내 추첨번호 조회
   *
   * @param {string} eventId - 이벤트 ID
   * @returns {Promise<{drawNumber: number, createdAt: string}|null>}
   */
  async getMyNumber(eventId) {
    const token = getSessionToken(eventId);

    if (!token) {
      return null;
    }

    try {
      const result = await this._request(
        `/my-number?event_id=${encodeURIComponent(eventId)}&session_token=${encodeURIComponent(token)}`
      );

      return {
        drawNumber: result.data.draw_number,
        eventId: result.data.event_id,
        createdAt: result.data.created_at,
      };
    } catch (error) {
      if (error.code === "PARTICIPANT_NOT_FOUND") {
        clearSessionToken(eventId);
        return null;
      }
      throw error;
    }
  }

  // ============================================================
  // 관리자 API
  // ============================================================

  /**
   * 참가자 목록 조회
   *
   * @param {string} eventId - 이벤트 ID
   * @returns {Promise<{totalCount: number, participants: Array}>}
   */
  async getParticipants(eventId) {
    const result = await this._request(`/admin/${encodeURIComponent(eventId)}/participants`);

    return {
      totalCount: result.data.total_count,
      participants: result.data.participants.map((p) => ({
        drawNumber: p.draw_number,
        createdAt: p.created_at,
      })),
    };
  }

  /**
   * 추첨 애니메이션 시작 (WebSocket 브로드캐스트)
   *
   * @param {string} eventId - 이벤트 ID
   * @param {string} prizeName - 상품 이름
   * @param {number} prizeRank - 상품 등급
   * @param {string|null} prizeImage - 상품 이미지 URL (선택)
   */
  async startDrawAnimation(eventId, prizeName, prizeRank, prizeImage = null) {
    return await this._request(`/admin/${encodeURIComponent(eventId)}/draw/start-animation`, {
      method: "POST",
      body: JSON.stringify({
        prize_name: prizeName,
        prize_rank: prizeRank,
        prize_image: prizeImage,
      }),
    });
  }

  /**
   * 추첨 실행
   *
   * @param {string} eventId - 이벤트 ID
   * @param {string} prizeName - 상품 이름
   * @param {number} prizeRank - 상품 등급
   * @param {number} count - 당첨자 수 (기본값: 1)
   * @returns {Promise<{prizeName: string, prizeRank: number, winners: Array, drawnAt: string}>}
   */
  async draw(eventId, prizeName, prizeRank, count = 1) {
    const result = await this._request(`/admin/${encodeURIComponent(eventId)}/draw`, {
      method: "POST",
      body: JSON.stringify({
        prize_name: prizeName,
        prize_rank: prizeRank,
        count,
      }),
    });

    return {
      prizeName: result.data.prize_name,
      prizeRank: result.data.prize_rank,
      winners: result.data.winners.map((w) => w.draw_number),
      drawnAt: result.data.drawn_at,
    };
  }

  /**
   * 추첨 이력 조회
   *
   * @param {string} eventId - 이벤트 ID
   * @returns {Promise<{draws: Array, totalCount: number}>}
   */
  async getDrawHistory(eventId) {
    const result = await this._request(`/admin/${encodeURIComponent(eventId)}/draws`);

    return {
      totalCount: result.data.total_count,
      draws: result.data.draws.map((d) => ({
        prizeName: d.prize_name,
        prizeRank: d.prize_rank,
        drawNumber: d.draw_number,
        drawnAt: d.drawn_at,
      })),
    };
  }

  /**
   * 이벤트 리셋
   *
   * @param {string} eventId - 이벤트 ID
   * @param {boolean} resetParticipants - 참가자 목록도 삭제 (기본값: false)
   * @param {boolean} resetDraws - 추첨 이력 삭제 (기본값: true)
   * @returns {Promise<{message: string}>}
   */
  async reset(eventId, resetParticipants = false, resetDraws = true) {
    const result = await this._request(`/admin/${encodeURIComponent(eventId)}/reset`, {
      method: "POST",
      body: JSON.stringify({
        reset_participants: resetParticipants,
        reset_draws: resetDraws,
      }),
    });

    return {
      message: result.message,
    };
  }
}

// 싱글톤 인스턴스 export
export const luckydrawAPI = new LuckyDrawAPI();

// 기본 export
export default luckydrawAPI;
