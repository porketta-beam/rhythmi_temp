# eventManager 데이터 플로우 (Data Flows)

## 목차
1. [데이터 아키텍처 개요](#데이터-아키텍처-개요)
2. [핵심 데이터 엔티티](#핵심-데이터-엔티티)
3. [실시간 동기화 패턴](#실시간-동기화-패턴)
4. [데이터 라이프사이클](#데이터-라이프사이클)
5. [통합 포인트](#통합-포인트)

---

## 데이터 아키텍처 개요

### 시스템 레이어

```
┌────────────────────────────────────────────────────────────┐
│                    프레젠테이션 레이어                       │
│  [모바일 앱/PWA] ← 사용자 인터페이스                         │
└────────────────────────────────────────────────────────────┘
                            ↕
┌────────────────────────────────────────────────────────────┐
│                    애플리케이션 레이어                       │
│  [상태 관리] [오프라인 큐] [동기화 엔진]                     │
└────────────────────────────────────────────────────────────┘
                            ↕
┌────────────────────────────────────────────────────────────┐
│                    로컬 스토리지 레이어                      │
│  [IndexedDB] [LocalStorage] [Cache API]                   │
└────────────────────────────────────────────────────────────┘
                            ↕
┌────────────────────────────────────────────────────────────┐
│                    네트워크 레이어                           │
│  [REST API] [WebSocket] [푸시 알림]                         │
└────────────────────────────────────────────────────────────┘
                            ↕
┌────────────────────────────────────────────────────────────┐
│                    백엔드 서비스 레이어                      │
│  [API 게이트웨이] [인증] [비즈니스 로직]                     │
└────────────────────────────────────────────────────────────┘
                            ↕
┌────────────────────────────────────────────────────────────┐
│                    데이터 레이어                             │
│  [PostgreSQL] [Redis] [S3/스토리지]                         │
└────────────────────────────────────────────────────────────┘
                            ↕
┌────────────────────────────────────────────────────────────┐
│                    외부 통합 레이어                          │
│  [토스페이먼츠] [이메일] [프린터] [캘린더]                   │
└────────────────────────────────────────────────────────────┘
```

---

## 핵심 데이터 엔티티

### 1. 사용자 (Users)

**엔티티 구조:**
```typescript
User {
  id: UUID                    // 기본 키
  email: string               // 로그인 ID (유니크)
  password_hash: string       // 암호화된 비밀번호
  profile: {
    name: string
    organization?: string
    profile_image_url?: string
  }
  tier: 'free' | 'basic_premium' | 'pro_premium'
  subscription: {
    status: 'active' | 'cancelled' | 'expired'
    current_period_start: timestamp
    current_period_end: timestamp
    payment_method_id?: string
  }
  preferences: {
    language: 'ko' | 'en'
    notifications: boolean
    timezone: string
  }
  created_at: timestamp
  last_login: timestamp
}
```

**관계:**
- 1:N → Events (주최자로서)
- 1:N → Subscriptions (결제 이력)

**인덱스:**
- PRIMARY: id
- UNIQUE: email
- INDEX: tier, created_at

---

### 2. 이벤트 (Events)

**엔티티 구조:**
```typescript
Event {
  id: UUID
  organizer_id: UUID          // FK → Users

  // 기본 정보
  name: string
  description: text
  location: {
    type: 'physical' | 'online' | 'hybrid'
    address?: string
    coordinates?: {
      lat: float
      lng: float
    }
    online_link?: string
  }

  // 일정
  datetime: {
    start: timestamp
    end?: timestamp
    timezone: string
  }

  // 참여자 관리
  capacity: {
    max_participants?: number
    waitlist_enabled: boolean
  }
  registration: {
    deadline?: timestamp
    requires_approval: boolean
    form_fields: FormField[]   // 커스텀 필드 정의
  }

  // 상태
  status: 'draft' | 'published' | 'in_progress' | 'completed' | 'cancelled'
  privacy: 'public' | 'private'

  // 기능 활성화
  features: {
    checkin_enabled: boolean
    prize_drawing_enabled: boolean
    anonymous_mode: boolean
  }

  // 브랜딩 (프리미엄)
  branding?: {
    logo_url: string
    primary_color: string
    custom_domain?: string
  }

  // 메타데이터
  share_url: string            // 단축 URL
  created_at: timestamp
  updated_at: timestamp
  deleted_at?: timestamp       // 소프트 삭제
}
```

**관계:**
- N:1 → User (주최자)
- 1:N → Participants
- 1:N → CheckIns
- 1:N → PrizeDrawings

**인덱스:**
- PRIMARY: id
- INDEX: organizer_id, status, datetime.start
- UNIQUE: share_url

---

### 3. 참여자 (Participants)

**엔티티 구조:**
```typescript
Participant {
  id: UUID
  event_id: UUID              // FK → Events

  // 신원 정보
  identity: {
    name: string              // 실명 또는 닉네임
    email: string
    phone?: string
  }

  // 커스텀 응답
  custom_responses: {
    [field_id: string]: any   // 주최자 정의 필드 응답
  }

  // 등록 정보
  registration: {
    number: number            // 등록 순서 (#001, #002...)
    timestamp: timestamp
    source: 'direct' | 'referral' | 'import'
    status: 'registered' | 'waitlist' | 'cancelled'
  }

  // 출석 상태
  checkin: {
    status: 'not_checked_in' | 'checked_in' | 'no_show'
    timestamp?: timestamp
    checked_by?: UUID         // FK → Users (출석 처리자)
    device_id?: string
  }

  // 메타데이터
  created_at: timestamp
  updated_at: timestamp
}
```

**관계:**
- N:1 → Event
- 1:N → CheckInLogs (출석 이력)

**인덱스:**
- PRIMARY: id
- INDEX: event_id, checkin.status
- UNIQUE: (event_id, email)

---

### 4. 출석 체크 로그 (CheckInLogs)

**실시간 동기화 핵심 엔티티**

```typescript
CheckInLog {
  id: UUID
  event_id: UUID
  participant_id: UUID

  // 체크인 정보
  action: 'check_in' | 'undo_check_in'
  timestamp: timestamp

  // 디바이스 추적
  device: {
    id: string                // 디바이스 고유 ID
    name: string              // "김사라의 iPhone"
    user_id: UUID             // 주최자 ID
  }

  // 충돌 해결
  sync_metadata: {
    local_timestamp: timestamp    // 클라이언트 시간
    server_timestamp: timestamp   // 서버 시간
    version: number                // 낙관적 잠금
    conflict_resolved: boolean
  }

  // 위치 정보 (선택)
  location?: {
    coordinates: {lat, lng}
    accuracy: float
  }
}
```

**데이터 흐름:**
```
[디바이스 A] 출석 체크
      ↓
[로컬 DB] 즉시 저장
      ↓
[동기화 큐] 추가
      ↓
[서버] 비동기 전송
      ↓
[충돌 검사] 타임스탬프 비교
      ↓
[WebSocket] 다른 디바이스에 브로드캐스트
      ↓
[디바이스 B, C...] 실시간 업데이트
```

---

### 5. 경품 추첨 (PrizeDrawings)

```typescript
PrizeDrawing {
  id: UUID
  event_id: UUID

  // 추첨 설정
  config: {
    participant_pool: 'all' | 'checked_in'
    exclude_previous_winners: boolean
    filter?: {
      field_id: string
      value: any
    }
  }

  // 추첨 결과
  winner: {
    participant_id: UUID
    participant_name: string  // 비정규화 (성능)
    registration_number: number
  }

  // 메타데이터
  drawn_by: UUID              // FK → Users
  drawn_at: timestamp
  confirmed: boolean
  announcement_shared: boolean
}
```

---

### 6. 구독 및 결제 (Subscriptions & Payments)

```typescript
Subscription {
  id: UUID
  user_id: UUID

  // 플랜 정보
  plan: {
    tier: 'basic_premium' | 'pro_premium'
    billing_cycle: 'monthly' | 'yearly' | 'per_event'
    price: number
    currency: 'USD' | 'KRW'
  }

  // 애드온
  addons: {
    sports_module: boolean
    payment_collection: boolean
    badge_printing: boolean
    professional_events: boolean
    educational_events: boolean
  }

  // 상태
  status: 'active' | 'cancelled' | 'past_due' | 'expired'
  current_period_start: timestamp
  current_period_end: timestamp
  cancel_at_period_end: boolean

  // 결제 정보
  payment_method: {
    type: 'card' | 'toss' | 'kakao' | 'naver'
    last_4_digits?: string
    expiry?: string
  }
}

Payment {
  id: UUID
  subscription_id: UUID

  // 거래 정보
  amount: number
  currency: string
  status: 'pending' | 'succeeded' | 'failed' | 'refunded'

  // 외부 참조
  provider: 'toss' | 'stripe'
  provider_payment_id: string
  provider_receipt_url?: string

  // 메타데이터
  created_at: timestamp
  succeeded_at?: timestamp
  failure_reason?: string
}
```

---

## 실시간 동기화 패턴

### 1. 오프라인 우선 아키텍처

**데이터 쓰기 플로우:**

```
┌──────────────────────────────────────────────────────┐
│ 사용자 액션 (예: 출석 체크)                           │
└──────────────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────────┐
│ Step 1: 로컬 DB에 즉시 저장 (IndexedDB)               │
│ • 동기 작업 (< 50ms)                                  │
│ • UI 즉시 업데이트                                    │
│ • 낙관적 UI (Optimistic Update)                       │
└──────────────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────────┐
│ Step 2: 동기화 큐에 추가                              │
│ sync_queue: {                                        │
│   id: UUID,                                          │
│   type: 'check_in',                                  │
│   payload: {...},                                    │
│   retry_count: 0,                                    │
│   created_at: timestamp                              │
│ }                                                    │
└──────────────────────────────────────────────────────┘
                    ↓
          [네트워크 상태 확인]
                    ↓
        ┌──────────┴──────────┐
        │                     │
   [오프라인]            [온라인]
        │                     │
        ↓                     ↓
┌─────────────┐      ┌──────────────────┐
│ 큐에서 대기  │      │ Step 3: 서버 전송 │
│ • 재연결 시  │      │ • POST /api/...  │
│   자동 재시도│      │ • 인증 헤더 포함  │
└─────────────┘      └──────────────────┘
                              ↓
                    ┌──────────┴──────────┐
                    │                     │
              [성공 200]            [실패 4xx/5xx]
                    │                     │
                    ↓                     ↓
          ┌──────────────────┐   ┌──────────────────┐
          │ Step 4: 서버 응답 │   │ 재시도 로직       │
          │ • 서버 타임스탬프 │   │ • 지수 백오프     │
          │ • 버전 확인       │   │ • 최대 5회 재시도 │
          │ • 충돌 검사       │   │ • 실패 시 알림    │
          └──────────────────┘   └──────────────────┘
                    ↓
          ┌──────────────────┐
          │ Step 5: 다른 기기 │
          │ • WebSocket 푸시  │
          │ • 실시간 업데이트 │
          └──────────────────┘
```

---

### 2. 충돌 해결 전략

**시나리오: 두 디바이스에서 동시에 같은 참여자 출석 체크**

```
시간: T0
┌─────────────┐                    ┌─────────────┐
│  디바이스 A  │                    │  디바이스 B  │
│  (김사라)    │                    │  (이민수)    │
└─────────────┘                    └─────────────┘
      │                                    │
      │ T1: 홍길동 출석 체크                │
      ├────────────────────────────────────┤ T1: 홍길동 출석 해제
      │                                    │
      ↓                                    ↓
[로컬 DB]                            [로컬 DB]
status: checked_in                   status: not_checked_in
local_ts: T1                         local_ts: T1
      │                                    │
      ↓                                    ↓
[서버로 전송]                        [서버로 전송]
      │                                    │
      └────────────→ [서버] ←──────────────┘
                       ↓
              [충돌 감지 알고리즘]

┌────────────────────────────────────────────────────────┐
│ 충돌 해결 규칙:                                         │
│ 1. Last-Write-Wins (LWW)                               │
│    → 서버 타임스탬프 기준 최신 우선                     │
│                                                        │
│ 2. 특수 규칙: 출석 체크 우선                            │
│    → checked_in이 not_checked_in보다 우선              │
│    (실수로 해제하는 경우가 많음)                        │
│                                                        │
│ 3. 사용자 알림                                          │
│    → "다른 디바이스에서 수정됨" 배너 표시               │
└────────────────────────────────────────────────────────┘
                       ↓
              [최종 상태 결정]
              status: checked_in
              server_ts: T1
                       ↓
        ┌──────────────┴──────────────┐
        │                             │
        ↓                             ↓
  [디바이스 A]                   [디바이스 B]
  "✓ 동기화됨"                   "⚠️ 다른 디바이스에서
                                  출석 체크로 변경됨"
```

**충돌 해결 코드 로직:**

```typescript
function resolveConflict(
  localChange: CheckInLog,
  serverChange: CheckInLog
): CheckInLog {
  // 규칙 1: 타임스탬프 차이가 5초 이내면 특수 규칙 적용
  const timeDiff = Math.abs(
    localChange.timestamp - serverChange.timestamp
  );

  if (timeDiff < 5000) {
    // 규칙 2: checked_in이 우선
    if (localChange.action === 'check_in') return localChange;
    if (serverChange.action === 'check_in') return serverChange;
  }

  // 규칙 3: Last-Write-Wins
  return localChange.timestamp > serverChange.timestamp
    ? localChange
    : serverChange;
}
```

---

### 3. 실시간 동기화 프로토콜

**WebSocket 이벤트 구조:**

```typescript
// 서버 → 클라이언트
type ServerEvent =
  | { type: 'participant_registered', eventId: UUID, participant: Participant }
  | { type: 'checkin_updated', eventId: UUID, participantId: UUID, status: string }
  | { type: 'event_updated', eventId: UUID, changes: Partial<Event> }
  | { type: 'sync_conflict', conflictId: UUID, details: ConflictDetails }

// 클라이언트 → 서버
type ClientEvent =
  | { type: 'subscribe_event', eventId: UUID }
  | { type: 'unsubscribe_event', eventId: UUID }
  | { type: 'heartbeat', timestamp: number }
```

**연결 라이프사이클:**

```
[앱 시작]
      ↓
[WebSocket 연결]
ws://api.eventmanager.app/realtime
      ↓
[인증]
{ type: 'auth', token: 'JWT...' }
      ↓
[이벤트 구독]
{ type: 'subscribe_event', eventId: 'abc-123' }
      ↓
┌──────────────────────────────────────┐
│ 활성 연결 유지                        │
│ • 30초마다 heartbeat                 │
│ • 재연결 로직 (지수 백오프)           │
│ • 재연결 시 자동 재구독               │
└──────────────────────────────────────┘
      ↓
[실시간 업데이트 수신]
      ↓
[로컬 상태 병합]
      ↓
[UI 자동 갱신]
```

---

## 데이터 라이프사이클

### 1. 이벤트 데이터 생명주기

```
┌────────────────────────────────────────────────────────┐
│ 1. 생성 (Creation)                                     │
└────────────────────────────────────────────────────────┘
      ↓
[주최자] 이벤트 생성
      ↓
[서버] 데이터 저장
• events 테이블에 INSERT
• 공유 URL 생성 (단축 링크)
• 인덱스 업데이트
      ↓
[캐시] 최근 이벤트 캐싱
• Redis: event:{id} → 15분 TTL
      ↓

┌────────────────────────────────────────────────────────┐
│ 2. 활성 사용 (Active Usage)                            │
└────────────────────────────────────────────────────────┘
      ↓
[참여자 등록]
• participants 테이블에 INSERT
• 이벤트 통계 업데이트 (트리거)
      ↓
[출석 체크]
• checkin_logs 테이블에 INSERT
• participants.checkin 업데이트
• 실시간 브로드캐스트
      ↓
[경품 추첨]
• prize_drawings 테이블에 INSERT
• 당첨 이력 저장
      ↓

┌────────────────────────────────────────────────────────┐
│ 3. 완료 (Completion)                                   │
└────────────────────────────────────────────────────────┘
      ↓
[이벤트 종료]
event.status = 'completed'
      ↓
[데이터 집계]
• 최종 통계 계산
• 분석 데이터 생성
• 보고서 생성 (프리미엄)
      ↓
[알림 발송]
• 참여자 감사 이메일
• 주최자 요약 리포트
      ↓

┌────────────────────────────────────────────────────────┐
│ 4. 보관 (Retention)                                    │
└────────────────────────────────────────────────────────┘
      ↓
[티어별 보관 기간]
• 무료: 90일
• 프리미엄: 365일 또는 무제한
      ↓
[데이터 압축]
• 콜드 스토리지로 이동
• S3 Glacier (장기 보관)
      ↓

┌────────────────────────────────────────────────────────┐
│ 5. 삭제 (Deletion)                                     │
└────────────────────────────────────────────────────────┘
      ↓
[보관 기간 만료]
      ↓
[소프트 삭제]
events.deleted_at = NOW()
• 사용자에게 보이지 않음
• 30일간 복구 가능
      ↓
[하드 삭제]
• 30일 후 영구 삭제
• 관련 participants, checkin_logs 삭제
• CASCADE 처리
      ↓
[GDPR 준수]
• 개인정보 완전 제거
• 삭제 로그 기록
• 사용자 확인 이메일
```

---

### 2. 개인정보 처리 플로우

**GDPR/개인정보보호법 준수**

```
┌────────────────────────────────────────────────────────┐
│ 데이터 수집                                             │
└────────────────────────────────────────────────────────┘

[참여자 등록]
      ↓
[동의 수집]
필수:
☑ 개인정보 수집 및 이용 동의
└─ 목적: 이벤트 참여자 관리
└─ 항목: 이름, 이메일
└─ 보유기간: 이벤트 종료 후 90일

선택:
☐ 마케팅 수신 동의
      ↓
[암호화 저장]
• 이메일: AES-256 암호화
• 전화번호: 마스킹 + 암호화
• 민감정보: 컬럼 레벨 암호화
      ↓

┌────────────────────────────────────────────────────────┐
│ 데이터 접근                                             │
└────────────────────────────────────────────────────────┘

[주최자 접근]
• 자신의 이벤트 참여자만 조회
• 접근 로그 기록
      ↓
[참여자 권리]
• 내 정보 조회
• 정보 수정
• 삭제 요청
      ↓

┌────────────────────────────────────────────────────────┐
│ 삭제 요청 처리                                          │
└────────────────────────────────────────────────────────┘

[참여자] "내 정보 삭제 요청"
      ↓
[검증]
• 이메일 인증
• 신원 확인
      ↓
[처리 옵션]
├─ 즉시 삭제 (이벤트 전)
│   → 등록 취소 + 데이터 삭제
│
└─ 익명화 (이벤트 후)
    → 개인 식별 정보만 제거
    → 통계 데이터 보존
      ↓
[확인 이메일]
"귀하의 개인정보가 삭제되었습니다"
```

---

## 통합 포인트

### 1. 결제 통합 (토스페이먼츠)

**결제 플로우:**

```
[사용자] 프리미엄 업그레이드 선택
      ↓
[클라이언트] 결제 준비
POST /api/payments/prepare
{
  plan: 'basic_premium',
  billing_cycle: 'monthly'
}
      ↓
[서버] 주문 생성
• 고유 주문 ID 생성
• 금액 계산
• 토스 API 호출 준비
      ↓
[토스페이먼츠 API]
POST https://api.tosspayments.com/v1/payments
{
  orderId: "ORDER_123",
  amount: 25000,
  orderName: "eventManager 기본 프리미엄",
  customerEmail: "user@example.com",
  successUrl: "https://eventmanager.app/payment/success",
  failUrl: "https://eventmanager.app/payment/fail"
}
      ↓
[토스] 결제 페이지 리다이렉트
      ↓
[사용자] 카드 정보 입력
      ↓
        ┌──────────┴──────────┐
        │                     │
   [성공]                 [실패]
        │                     │
        ↓                     ↓
[successUrl 리다이렉트]  [failUrl 리다이렉트]
with paymentKey          with code, message
        │                     │
        ↓                     ↓
[서버] 결제 승인          [서버] 실패 처리
POST /v1/payments/confirm • 주문 취소
{                         • 사용자 알림
  paymentKey: "...",      • 재시도 옵션
  orderId: "ORDER_123",
  amount: 25000
}
        ↓
[토스] 최종 승인
        ↓
[서버] 구독 활성화
• subscriptions 테이블 업데이트
• user.tier 업데이트
• 영수증 이메일 발송
        ↓
[클라이언트] 성공 화면
```

**데이터 매핑:**

```typescript
// eventManager → 토스페이먼츠
{
  orderId: subscription.id,
  amount: subscription.plan.price,
  orderName: `eventManager ${subscription.plan.tier}`,
  customerEmail: user.email,
  customerName: user.profile.name
}

// 토스페이먼츠 → eventManager
{
  payment_id: toss.paymentKey,
  provider: 'toss',
  status: toss.status,
  approved_at: toss.approvedAt,
  receipt_url: toss.receipt.url
}
```

---

### 2. 이메일 통합

**이메일 발송 시나리오:**

```
트리거 이벤트:
├─ 참여자 등록 → 등록 확인 이메일
├─ 이벤트 1일 전 → 리마인더 이메일
├─ 이벤트 3시간 전 → 알림 이메일
├─ 이벤트 종료 → 감사 이메일
├─ 프리미엄 구독 → 영수증 이메일
└─ 삭제 요청 → 확인 이메일
```

**이메일 큐 시스템:**

```
[트리거 발생]
      ↓
[이메일 작업 생성]
email_queue {
  id: UUID,
  type: 'registration_confirmation',
  recipient: 'user@example.com',
  template_id: 'tmpl_reg_confirm_ko',
  data: {
    participant_name: '홍길동',
    event_name: '북클럽 모임',
    event_date: '2025-10-15'
  },
  scheduled_at: NOW(),
  status: 'pending'
}
      ↓
[백그라운드 워커]
• 큐에서 작업 가져오기
• 템플릿 렌더링
• 이메일 서비스 호출 (SendGrid/AWS SES)
      ↓
        ┌──────────┴──────────┐
        │                     │
   [성공]                 [실패]
        │                     │
        ↓                     ↓
status='sent'           retry_count++
sent_at=NOW()           next_retry=+5min
        │                     │
        ↓                     ↓
[전송 로그 기록]        [재시도 또는 실패]
                        (최대 3회)
```

---

### 3. 명찰 프린터 통합

**블루투스 프린터 연결 플로우:**

```
[주최자] 명찰 출력 기능 활성화
      ↓
[앱] 프린터 검색
• Bluetooth Low Energy (BLE) 스캔
• 지원 모델: Brother QL-820NWB, Dymo LabelWriter
      ↓
[프린터 목록 표시]
┌────────────────────────┐
│ Brother QL-820NWB      │
│ 신호 강도: ▂▃▅▆█       │
│ [연결]                 │
└────────────────────────┘
      ↓
[페어링 및 연결]
      ↓
[프린터 설정 저장]
localStorage: {
  printer_id: 'BT:12:34:56:78:90',
  printer_model: 'Brother_QL820',
  last_connected: timestamp
}
      ↓
[출석 체크 시 자동 출력]
participant checked_in
      ↓
[명찰 데이터 생성]
{
  name: participant.name,
  company: participant.custom_responses.company,
  qr_code: participant.id,
  logo: event.branding.logo_url
}
      ↓
[인쇄 명령 생성]
• ESC/POS 또는 Brother P-touch 프로토콜
• 바코드/QR 코드 임베드
      ↓
[Bluetooth 전송]
      ↓
[프린터 출력]
      ↓
[인쇄 확인]
• 성공: 다음 참여자
• 실패: 재시도 또는 수동 출력
```

**명찰 템플릿 데이터 구조:**

```typescript
BadgeTemplate {
  id: UUID
  name: string
  dimensions: {
    width: number    // mm
    height: number   // mm
  }
  layout: {
    logo: {x, y, width, height},
    name: {x, y, fontSize, fontFamily, align},
    company: {x, y, fontSize, fontFamily, align},
    qr_code: {x, y, size}
  }
  styles: {
    background_color: string,
    border: boolean,
    ...
  }
}
```

---

### 4. 캘린더 통합

**iCal 파일 생성:**

```
[참여자] "캘린더에 추가" 버튼 클릭
      ↓
[서버] .ics 파일 생성
BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//eventManager//Event//EN
BEGIN:VEVENT
UID:abc-123@eventmanager.app
DTSTAMP:20251012T120000Z
DTSTART:20251015T100000Z
DTEND:20251015T120000Z
SUMMARY:2025년 10월 북클럽 모임
DESCRIPTION:이번 달 읽을 책은 '코스모스'입니다...
LOCATION:홍대 북카페
URL:https://eventmanager.app/e/abc-123
BEGIN:VALARM
TRIGGER:-PT3H
DESCRIPTION:이벤트 3시간 전 알림
END:VALARM
END:VEVENT
END:VCALENDAR
      ↓
[다운로드 또는 딥링크]
• 다운로드: event.ics 파일
• 구글 캘린더: webcal:// 링크
• 애플 캘린더: iOS 딥링크
• 아웃룩: .ics 다운로드
      ↓
[사용자 캘린더에 자동 추가]
```

---

## 성능 최적화 전략

### 1. 캐싱 전략

```
레이어별 캐싱:

┌────────────────────────────────────────────────┐
│ 클라이언트 캐시 (IndexedDB)                     │
│ • 참여자 목록: 이벤트별 전체 캐싱               │
│ • TTL: 수동 새로고침 또는 WebSocket 업데이트    │
└────────────────────────────────────────────────┘
                    ↕
┌────────────────────────────────────────────────┐
│ CDN 캐시 (CloudFlare)                          │
│ • 정적 자산: 이미지, CSS, JS                    │
│ • TTL: 1년                                     │
└────────────────────────────────────────────────┘
                    ↕
┌────────────────────────────────────────────────┐
│ 애플리케이션 캐시 (Redis)                       │
│ • 이벤트 상세: event:{id} (15분)                │
│ • 참여자 카운트: event:{id}:count (5분)         │
│ • 사용자 세션: session:{token} (7일)            │
└────────────────────────────────────────────────┘
                    ↕
┌────────────────────────────────────────────────┐
│ 데이터베이스 쿼리 캐시 (PostgreSQL)              │
│ • 자동 쿼리 플랜 캐싱                           │
└────────────────────────────────────────────────┘
```

---

### 2. 데이터베이스 최적화

**인덱스 전략:**

```sql
-- 이벤트 조회 최적화
CREATE INDEX idx_events_organizer_status
ON events(organizer_id, status, datetime);

-- 참여자 검색 최적화
CREATE INDEX idx_participants_event_name
ON participants(event_id, name);
CREATE INDEX idx_participants_checkin
ON participants(event_id, checkin_status);

-- 풀텍스트 검색
CREATE INDEX idx_participants_name_ft
ON participants USING gin(to_tsvector('korean', name));

-- 복합 인덱스 (출석 체크 화면)
CREATE INDEX idx_checkin_event_status
ON participants(event_id, checkin_status)
INCLUDE (name, email, registration_number);
```

**쿼리 최적화 예시:**

```sql
-- 비효율적 (N+1 문제)
SELECT * FROM events WHERE organizer_id = ?;
-- 각 이벤트마다
SELECT COUNT(*) FROM participants WHERE event_id = ?;

-- 최적화 (단일 쿼리)
SELECT
  e.*,
  COUNT(p.id) as participant_count,
  SUM(CASE WHEN p.checkin_status = 'checked_in' THEN 1 ELSE 0 END) as checked_in_count
FROM events e
LEFT JOIN participants p ON e.id = p.event_id
WHERE e.organizer_id = ?
GROUP BY e.id;
```

---

### 3. 배치 처리

**대량 알림 발송:**

```
[이벤트 리마인더 배치 작업]
      ↓
[대상 이벤트 조회]
SELECT * FROM events
WHERE datetime BETWEEN NOW() + INTERVAL '23 hours'
                   AND NOW() + INTERVAL '25 hours'
AND status = 'published';
      ↓
[참여자 목록 조회]
SELECT email, name FROM participants
WHERE event_id IN (...)
AND registration_status = 'registered';
      ↓
[배치 단위로 분할]
• 1000명씩 청크로 분할
• 각 청크별로 병렬 처리
      ↓
[이메일 큐에 추가]
• 비동기 처리
• 속도 제한 (rate limiting)
      ↓
[진행 상황 모니터링]
• 성공/실패 카운트
• 재시도 관리
```

---

## 보안 및 규정 준수

### 데이터 암호화

```
[전송 중 암호화]
• TLS 1.3
• 모든 API 요청 HTTPS 강제

[저장 시 암호화]
• 데이터베이스 컬럼 레벨 암호화 (AES-256)
  - participants.email
  - participants.phone
• 백업 암호화
• 암호화 키 관리 (AWS KMS)

[애플리케이션 레벨 암호화]
• JWT 토큰: HS256 또는 RS256
• 비밀번호: bcrypt (cost factor 12)
• API 키: SHA-256 해싱
```

---

## 모니터링 및 로깅

### 데이터 플로우 모니터링

```
[메트릭 수집]
├─ API 응답 시간
├─ 데이터베이스 쿼리 시간
├─ 동기화 큐 길이
├─ WebSocket 연결 수
└─ 캐시 히트율

[알림 임계값]
├─ API 응답 > 1초: 경고
├─ 동기화 큐 > 1000건: 경고
├─ 데이터베이스 CPU > 80%: 심각
└─ 캐시 히트율 < 70%: 경고

[로그 수집]
• 애플리케이션 로그 (JSON 형식)
• 접근 로그 (nginx)
• 에러 로그 (Sentry)
• 감사 로그 (개인정보 접근)
```

---

**문서 버전:** 1.0
**최종 업데이트:** 2025-10-12
**관련 문서:** [USER_FLOWS.md](./USER_FLOWS.md)
