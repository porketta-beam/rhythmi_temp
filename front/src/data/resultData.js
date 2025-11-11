// 결과 유형 데이터 (5가지)
export const resultData = {
  dry_sensitive: {
    type: "건조 민감형",
    emoji: "🌸",
    description: "건조함과 민감함이 동시에 나타나는 피부예요",
    carePoints: [
      "충분한 수분 공급",
      "자극 최소화",
      "장벽 강화 집중"
    ],
    routine: "저자극 토너 → 보습 세럼 → 장벽 크림",
    color: "pink"
  },
  dry_indoor: {
    type: "건조 실내형",
    emoji: "💧",
    description: "실내 환경에서 수분이 부족한 피부예요",
    carePoints: [
      "지속 보습",
      "수분 미스트 수시 사용",
      "세라마이드 케어"
    ],
    routine: "수분 토너 → 세라마이드 세럼 → 보습 크림 + 미스트",
    color: "blue"
  },
  sensitive_protected: {
    type: "민감 보호형",
    emoji: "🛡️",
    description: "외부 자극에 쉽게 반응하는 예민한 피부예요",
    carePoints: [
      "진정 케어",
      "외부 자극 차단",
      "보호막 형성"
    ],
    routine: "진정 토너 → 시카 세럼 → 보호 크림",
    color: "green"
  },
  active_balance: {
    type: "활동 밸런스형",
    emoji: "⚡",
    description: "활동적인 라이프스타일에 맞는 간편한 케어가 필요해요",
    carePoints: [
      "빠른 흡수",
      "쿨링 효과",
      "휴대 간편"
    ],
    routine: "쿨링 토너 → 가벼운 세럼 → 산뜻한 크림 + 휴대용 미스트",
    color: "orange"
  },
  minimal_care: {
    type: "미니멀 케어형",
    emoji: "✨",
    description: "큰 고민 없이 간단한 케어만 필요한 피부예요",
    carePoints: [
      "필수만 간단히",
      "올인원 제품",
      "시간 절약"
    ],
    routine: "올인원 토너 → 가벼운 로션 (필요시 미스트)",
    color: "gray"
  }
};
