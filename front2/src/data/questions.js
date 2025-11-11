// 질문 데이터 (10문항)
export const questions = [
  {
    id: 1,
    category: "skin",
    question: "세안 후 피부가 어떻게 느껴지나요?",
    options: [
      {
        id: "q1a1",
        text: "매우 건조하고 당긴다",
        scores: { dry: 3 }
      },
      {
        id: "q1a2",
        text: "약간 건조하다",
        scores: { dry: 2 }
      },
      {
        id: "q1a3",
        text: "편안하다",
        scores: { normal: 2 }
      },
      {
        id: "q1a4",
        text: "살짝 유분이 있다",
        scores: { oily: 1 }
      },
      {
        id: "q1a5",
        text: "유분이 많다",
        scores: { oily: 2 }
      }
    ]
  },
  {
    id: 2,
    category: "skin",
    question: "오후가 되면 얼굴의 유분 상태는?",
    options: [
      {
        id: "q2a1",
        text: "여전히 건조하다",
        scores: { dry: 3 }
      },
      {
        id: "q2a2",
        text: "코 주변만 살짝 유분이 보인다",
        scores: { normal: 2 }
      },
      {
        id: "q2a3",
        text: "T존 위주로 유분이 보인다",
        scores: { combination: 2 }
      },
      {
        id: "q2a4",
        text: "얼굴 전체적으로 유분이 있다",
        scores: { oily: 2 }
      }
    ]
  },
  {
    id: 3,
    category: "skin",
    question: "피부가 붉어지거나 따가운 느낌이 드나요?",
    options: [
      {
        id: "q3a1",
        text: "매우 자주 있다",
        scores: { sensitive: 3 }
      },
      {
        id: "q3a2",
        text: "자주 있다",
        scores: { sensitive: 2 }
      },
      {
        id: "q3a3",
        text: "가끔 있다",
        scores: { sensitive: 1 }
      },
      {
        id: "q3a4",
        text: "거의 없다",
        scores: { normal: 2 }
      }
    ]
  },
  {
    id: 4,
    category: "skin",
    question: "환절기나 온도 변화 시 피부가 변하나요?",
    options: [
      {
        id: "q4a1",
        text: "항상 크게 영향을 받는다",
        scores: { sensitive: 3 }
      },
      {
        id: "q4a2",
        text: "자주 영향을 받는다",
        scores: { sensitive: 2 }
      },
      {
        id: "q4a3",
        text: "가끔 변화가 있다",
        scores: { sensitive: 1 }
      },
      {
        id: "q4a4",
        text: "거의 없다",
        scores: { normal: 2 }
      }
    ]
  },
  {
    id: 5,
    category: "environment",
    question: "미세먼지나 공기 오염에 피부가 민감한가요?",
    options: [
      {
        id: "q5a1",
        text: "바로 반응이 나타난다",
        scores: { sensitive: 3 }
      },
      {
        id: "q5a2",
        text: "자주 민감해진다",
        scores: { sensitive: 2 }
      },
      {
        id: "q5a3",
        text: "가끔 민감해진다",
        scores: { sensitive: 1 }
      },
      {
        id: "q5a4",
        text: "거의 없다",
        scores: { normal: 2 }
      }
    ]
  },
  {
    id: 6,
    category: "environment",
    question: "새로운 스킨케어 제품을 쓸 때 반응이 있나요?",
    options: [
      {
        id: "q6a1",
        text: "거의 항상 반응이 생긴다",
        scores: { sensitive: 3 }
      },
      {
        id: "q6a2",
        text: "종종 반응이 생긴다",
        scores: { sensitive: 2 }
      },
      {
        id: "q6a3",
        text: "가끔 반응이 생긴다",
        scores: { sensitive: 1 }
      },
      {
        id: "q6a4",
        text: "거의 없다",
        scores: { normal: 2 }
      }
    ]
  },
  {
    id: 7,
    category: "lifestyle",
    question: "주로 어떤 환경에서 시간을 보내나요?",
    options: [
      {
        id: "q7a1",
        text: "사무실, 학교 등 실내 정적 공간",
        scores: { indoor: 2 }
      },
      {
        id: "q7a2",
        text: "카페, 코워킹 등 다양한 공간",
        scores: { active: 2 }
      },
      {
        id: "q7a3",
        text: "외근이나 야외 활동이 많음",
        scores: { outdoor: 2 }
      },
      {
        id: "q7a4",
        text: "운동 시설, 헬스장",
        scores: { active: 3 }
      }
    ]
  },
  {
    id: 8,
    category: "lifestyle",
    question: "주로 머무는 공간의 환경은?",
    options: [
      {
        id: "q8a1",
        text: "건조한 냉난방 환경",
        scores: { dry: 2, indoor: 2 }
      },
      {
        id: "q8a2",
        text: "환기 어려운 밀폐 공간",
        scores: { indoor: 2 }
      },
      {
        id: "q8a3",
        text: "온도 변화가 큰 환경",
        scores: { outdoor: 2 }
      },
      {
        id: "q8a4",
        text: "다양한 공간을 자주 이동",
        scores: { active: 2 }
      }
    ]
  },
  {
    id: 9,
    category: "care",
    question: "평소 피부 관리 루틴은 어느 정도인가요?",
    options: [
      {
        id: "q9a1",
        text: "거의 관리하지 않는다",
        scores: { minimal: 3 }
      },
      {
        id: "q9a2",
        text: "토너/크림 정도만 한다",
        scores: { minimal: 2 }
      },
      {
        id: "q9a3",
        text: "여러 단계로 꾸준히 한다",
        scores: { active: 2 }
      },
      {
        id: "q9a4",
        text: "매우 적극적으로 한다",
        scores: { active: 3 }
      }
    ]
  },
  {
    id: 10,
    category: "care",
    question: "외출 시 스킨케어 제품을 휴대하나요?",
    options: [
      {
        id: "q10a1",
        text: "거의 휴대하지 않는다",
        scores: { minimal: 2 }
      },
      {
        id: "q10a2",
        text: "가끔 들고 다닌다",
        scores: { minimal: 1 }
      },
      {
        id: "q10a3",
        text: "미스트는 꼭 챙긴다",
        scores: { active: 2 }
      },
      {
        id: "q10a4",
        text: "여러 제품을 세트로 가지고 다닌다",
        scores: { active: 3 }
      }
    ]
  }
];
