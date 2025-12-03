/**
 * 경품 추첨 시스템 공통 상수
 */

// 이벤트 설정
export const DEFAULT_EVENT_ID = "sfs-2025";

// 슬롯머신 타이밍 (밀리초)
export const SLOT_TIMING = {
  SPIN_DURATION: 3000,        // 스피닝 지속 시간
  STOP_INTERVAL: 500,         // 각 슬롯 정지 간격
  STOP_ANIMATION: 1500,       // 정지 애니메이션 완료 대기
  DIGIT_SPIN_SPEED: 50,       // 숫자 회전 속도
  SLOWDOWN_INCREMENT: 20,     // 감속 증가량
  SLOWDOWN_THRESHOLD: 300,    // 감속 완료 임계값
};

// 참가번호 범위
export const NUMBER_RANGE = {
  MIN: 0,
  MAX: 299,
  DIGITS: 3,
};

// 연결 상태
export const CONNECTION_STATUS = {
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  DISCONNECTED: 'disconnected',
  ERROR: 'error',
};

// 슬롯 상태
export const SLOT_STATE = {
  IDLE: 'idle',
  SPINNING: 'spinning',
  STOPPING: 'stopping',
  WINNER: 'winner',
};
