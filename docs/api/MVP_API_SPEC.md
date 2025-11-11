# eventManager MVP API 명세서

**버전:** 1.0
**최종 업데이트:** 2025-10-21
**작성자:** API 설계팀

---

## 목차

1. [개요](#개요)
2. [아키텍처](#아키텍처)
3. [인증](#인증)
4. [데이터 모델](#데이터-모델)
5. [API 엔드포인트](#api-엔드포인트)
6. [에러 처리](#에러-처리)
7. [보안 정책](#보안-정책)

---

## 개요

### MVP 범위

eventManager MVP는 다음 핵심 기능을 제공합니다:

1. **이벤트 생성** - 관리자가 이벤트 기본 정보 생성
2. **회원 목록 관리** - 이벤트 참여 회원 등록 (이름 + 번호)
3. **설문 폼 작성** - 회원 대상 설문 폼 생성
4. **설문 링크 생성** - 회원이 설문에 응답할 수 있는 링크 제공

### 설계 원칙

#### 데이터 분리 전략
- **보안 격리 DB**: 회원 개인정보 (이름, 전화번호) 별도 관리
- **메인 DB**: UUID만 참조하여 개인정보 노출 최소화
- **느슨한 결합**: 외래키 대신 UUID로 서비스 간 독립성 확보

#### 접근 권한 제어
- **시간 기반 제약**: 폼 생성 시점 이전 가입 회원만 응답 가능
- **신규 회원**: 신규 폼은 응답 가능, 이미 지나간 폼은 불가

---

## 아키텍처

### 시스템 구성

```
┌──────────────────────────────────────────────┐
│           클라이언트 (React)                  │
└──────────────────────────────────────────────┘
                    ↕ HTTPS
┌──────────────────────────────────────────────┐
│         API Gateway (인증, 라우팅)            │
└──────────────────────────────────────────────┘
         ↕                          ↕
┌─────────────────┐      ┌─────────────────────┐
│   Main API      │      │  Members Service    │
│   (Events,      │←UUID→│  (보안 격리)        │
│   Forms,        │      │  - name             │
│   Responses)    │      │  - phone_number     │
└─────────────────┘      └─────────────────────┘
         ↕                          ↕
┌─────────────────┐      ┌─────────────────────┐
│   Main DB       │      │  Members DB         │
│   (PostgreSQL)  │      │  (암호화, 격리)     │
└─────────────────┘      └─────────────────────┘
```

### 데이터 흐름

**회원 추가 플로우:**
```
[관리자] → POST /api/events/{id}/members
            ↓
[Main API] → Members Service (보안 DB에 저장)
            ↓
[Members Service] → UUID 반환
            ↓
[관리자] ← 201 Created (UUID 포함)
```

**설문 응답 플로우:**
```
[회원] → POST /api/forms/{code}/responses (member_id + 응답)
         ↓
[Main API] → 권한 검증 (member.created_at vs form.created_at)
         ↓
[Main DB] → FormResponses에 저장 (UUID만 저장)
         ↓
[회원] ← 201 Created
```

---

## 인증

### JWT 기반 인증

**헤더 형식:**
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**토큰 구조:**
```json
{
  "sub": "usr_1a2b3c",
  "email": "user@example.com",
  "role": "organizer",
  "iat": 1696234567,
  "exp": 1696320967
}
```

### 권한 레벨

| 역할 | 권한 |
|------|------|
| `organizer` | 이벤트 생성, 회원 관리, 폼 생성, 응답 조회 |
| `member` | 설문 응답 제출 (인증 불필요, member_id로 식별) |

---

## 데이터 모델

### 1. Events (이벤트)

```typescript
Events {
  id: UUID                    // 기본 키
  organizer_id: UUID          // FK → Users
  name: string                // 이벤트 이름
  description?: string        // 설명
  datetime: {
    start: timestamp          // 시작 시간 (ISO 8601)
    timezone: string          // 시간대 (예: "Asia/Seoul")
  }
  location: {
    name: string              // 장소 이름
    address?: string          // 상세 주소
  }
  status: enum                // 'draft' | 'published' | 'in_progress' | 'completed'
  created_at: timestamp
  updated_at: timestamp
}
```

**인덱스:**
- PRIMARY KEY: `id`
- INDEX: `(organizer_id, status, datetime.start)`

---

### 2. Members (회원) - 보안 격리 DB

```typescript
Members {
  id: UUID                    // 공개 식별자
  event_id: UUID              // FK → Events
  name: string                // 실명 (암호화)
  phone_number: string        // 전화번호 (암호화)
  created_at: timestamp       // 가입 시점
  updated_at: timestamp
}
```

**보안 정책:**
- 컬럼 암호화: AES-256
- 네트워크 격리: Private VPC
- 접근 로그: 모든 조회 기록
- 최소 권한: Members Service만 접근 가능

**인덱스:**
- PRIMARY KEY: `id`
- INDEX: `(event_id, created_at)`

---

### 3. Forms (설문 폼)

```typescript
Forms {
  id: UUID                    // 기본 키
  event_id: UUID              // FK → Events
  title: string               // 폼 제목
  description?: string        // 폼 설명

  fields: FormField[]         // 설문 필드 (JSON)

  active: boolean             // 활성 상태
  expires_at?: timestamp      // 응답 마감 시간

  share_url: string           // 공유 URL (단축 코드)

  created_at: timestamp       // 폼 생성 시점 (접근 권한 기준)
  updated_at: timestamp
}
```

**FormField 구조:**
```typescript
FormField {
  id: string                  // "field_001"
  type: string                // 'text' | 'yes_no' | 'multiple_choice' | 'long_text' | 'number' | 'date'
  label: string               // 질문 텍스트
  description?: string        // 추가 설명
  required: boolean           // 필수 여부
  order: number               // 표시 순서

  // 선택형 필드
  options?: string[]          // ["옵션1", "옵션2"]

  // 검증 규칙
  validation?: {
    min?: number
    max?: number
    pattern?: string          // 정규식
  }
}
```

**인덱스:**
- PRIMARY KEY: `id`
- UNIQUE: `share_url`
- INDEX: `(event_id, active, created_at)`

---

### 4. FormResponses (설문 응답)

```typescript
FormResponses {
  id: UUID                    // 기본 키
  form_id: UUID               // FK → Forms
  member_id: UUID             // Members.id (외래키 아님, UUID만 저장)

  responses: {                // 응답 데이터 (JSON)
    [field_id: string]: any   // { "field_001": "예", "field_002": "오후 7시" }
  }

  submitted_at: timestamp     // 제출 시점
  updated_at?: timestamp      // 수정 시점
}
```

**인덱스:**
- PRIMARY KEY: `id`
- UNIQUE: `(form_id, member_id)` - 중복 응답 방지
- INDEX: `(member_id, submitted_at)`

---

## API 엔드포인트

### 기본 URL

```
Production:  https://api.eventmanager.app/v1
Development: http://localhost:3000/api/v1
```

---

### 1. 이벤트 관리

#### 1.1 이벤트 생성

```http
POST /api/events
Authorization: Bearer {access_token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "2025년 10월 북클럽 모임",
  "description": "이번 달 읽을 책은 '코스모스'입니다",
  "datetime": {
    "start": "2025-10-15T19:00:00+09:00",
    "timezone": "Asia/Seoul"
  },
  "location": {
    "name": "홍대 북카페",
    "address": "서울시 마포구 양화로 123"
  }
}
```

**필드 검증:**
- `name`: 필수, 3-100자
- `datetime.start`: 필수, 현재 시간 이후
- `location.name`: 필수, 1-200자

**Response (201 Created):**
```json
{
  "id": "evt_7x9k2m4n",
  "organizer_id": "usr_1a2b3c",
  "name": "2025년 10월 북클럽 모임",
  "description": "이번 달 읽을 책은 '코스모스'입니다",
  "datetime": {
    "start": "2025-10-15T19:00:00+09:00",
    "timezone": "Asia/Seoul"
  },
  "location": {
    "name": "홍대 북카페",
    "address": "서울시 마포구 양화로 123"
  },
  "status": "draft",
  "created_at": "2025-10-01T14:30:00Z",
  "updated_at": "2025-10-01T14:30:00Z"
}
```

**Error Responses:**
- `400 Bad Request`: 필수 필드 누락 또는 검증 실패
- `401 Unauthorized`: 인증 토큰 없음 또는 만료
- `403 Forbidden`: 권한 부족

---

#### 1.2 이벤트 조회

```http
GET /api/events/{eventId}
Authorization: Bearer {access_token}
```

**Response (200 OK):**
```json
{
  "id": "evt_7x9k2m4n",
  "organizer_id": "usr_1a2b3c",
  "name": "2025년 10월 북클럽 모임",
  "description": "이번 달 읽을 책은 '코스모스'입니다",
  "datetime": {
    "start": "2025-10-15T19:00:00+09:00",
    "timezone": "Asia/Seoul"
  },
  "location": {
    "name": "홍대 북카페",
    "address": "서울시 마포구 양화로 123"
  },
  "status": "published",
  "created_at": "2025-10-01T14:30:00Z",
  "updated_at": "2025-10-02T09:15:00Z",
  "stats": {
    "total_members": 42,
    "total_forms": 3,
    "active_forms": 1
  }
}
```

---

#### 1.3 이벤트 목록 조회

```http
GET /api/events
Authorization: Bearer {access_token}
```

**Query Parameters:**
- `status`: `draft` | `published` | `in_progress` | `completed` | `all` (기본값: all)
- `page`: 페이지 번호 (기본값: 1)
- `limit`: 페이지당 항목 수 (기본값: 20, 최대: 100)
- `sort`: `created_at` | `datetime.start` (기본값: datetime.start)
- `order`: `asc` | `desc` (기본값: desc)

**Response (200 OK):**
```json
{
  "total": 15,
  "page": 1,
  "limit": 20,
  "events": [
    {
      "id": "evt_7x9k2m4n",
      "name": "2025년 10월 북클럽 모임",
      "datetime": {
        "start": "2025-10-15T19:00:00+09:00"
      },
      "location": {
        "name": "홍대 북카페"
      },
      "status": "published",
      "stats": {
        "total_members": 42,
        "total_forms": 3
      }
    }
    // ... 더 많은 이벤트
  ]
}
```

---

### 2. 회원 관리

#### 2.1 단일 회원 추가

```http
POST /api/events/{eventId}/members
Authorization: Bearer {access_token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "홍길동",
  "phone_number": "010-1234-5678"
}
```

**필드 검증:**
- `name`: 필수, 1-50자
- `phone_number`: 필수, 한국 전화번호 형식 (010-XXXX-XXXX)

**Response (201 Created):**
```json
{
  "id": "mbr_8h3k5n2p",
  "event_id": "evt_7x9k2m4n",
  "name": "홍길동",
  "phone_number": "010-1234-5678",
  "created_at": "2025-10-02T10:15:00Z"
}
```

**Error Responses:**
- `400 Bad Request`: 필드 검증 실패
- `409 Conflict`: 동일 이벤트에 같은 전화번호로 이미 등록됨

---

#### 2.2 일괄 회원 추가 (Bulk)

```http
POST /api/events/{eventId}/members/bulk
Authorization: Bearer {access_token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "members": [
    {
      "name": "홍길동",
      "phone_number": "010-1234-5678"
    },
    {
      "name": "김철수",
      "phone_number": "010-2345-6789"
    },
    {
      "name": "이영희",
      "phone_number": "010-3456-7890"
    }
  ]
}
```

**제약사항:**
- 최대 100명까지 한 번에 추가 가능
- 중복 전화번호는 건너뜀 (에러 발생 안 함)

**Response (201 Created):**
```json
{
  "success": 3,
  "failed": 0,
  "members": [
    {
      "id": "mbr_8h3k5n2p",
      "name": "홍길동",
      "phone_number": "010-1234-5678",
      "created_at": "2025-10-02T10:20:00Z"
    },
    {
      "id": "mbr_9i4l6o3q",
      "name": "김철수",
      "phone_number": "010-2345-6789",
      "created_at": "2025-10-02T10:20:00Z"
    },
    {
      "id": "mbr_0j5m7p4r",
      "name": "이영희",
      "phone_number": "010-3456-7890",
      "created_at": "2025-10-02T10:20:00Z"
    }
  ],
  "errors": []
}
```

**부분 실패 예시:**
```json
{
  "success": 2,
  "failed": 1,
  "members": [
    {
      "id": "mbr_8h3k5n2p",
      "name": "홍길동",
      "created_at": "2025-10-02T10:20:00Z"
    },
    {
      "id": "mbr_9i4l6o3q",
      "name": "김철수",
      "created_at": "2025-10-02T10:20:00Z"
    }
  ],
  "errors": [
    {
      "index": 2,
      "name": "이영희",
      "phone_number": "010-3456-7890",
      "reason": "이미 등록된 전화번호입니다"
    }
  ]
}
```

---

#### 2.3 회원 목록 조회

```http
GET /api/events/{eventId}/members
Authorization: Bearer {access_token}
```

**Query Parameters:**
- `page`: 페이지 번호 (기본값: 1)
- `limit`: 페이지당 항목 수 (기본값: 50, 최대: 100)
- `search`: 이름 검색 (부분 일치)
- `sort`: `name` | `created_at` (기본값: created_at)
- `order`: `asc` | `desc` (기본값: desc)

**Response (200 OK):**
```json
{
  "total": 42,
  "page": 1,
  "limit": 50,
  "members": [
    {
      "id": "mbr_8h3k5n2p",
      "name": "홍길동",
      "phone_number": "010-1234-5678",
      "created_at": "2025-10-02T10:15:00Z",
      "stats": {
        "total_responses": 2,
        "latest_response": "2025-10-05T14:22:00Z"
      }
    }
    // ... 더 많은 회원
  ]
}
```

---

#### 2.4 회원 삭제

```http
DELETE /api/events/{eventId}/members/{memberId}
Authorization: Bearer {access_token}
```

**Response (204 No Content):**
- 본문 없음

**주의사항:**
- 회원 삭제 시 해당 회원의 모든 설문 응답도 삭제됩니다
- 삭제된 데이터는 복구할 수 없습니다

---

### 3. 설문 폼 관리

#### 3.1 설문 폼 생성

```http
POST /api/events/{eventId}/forms
Authorization: Bearer {access_token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "10월 모임 참석 의향 조사",
  "description": "다음 모임에 참석 가능하신지 알려주세요",
  "fields": [
    {
      "id": "field_001",
      "type": "yes_no",
      "label": "10월 15일 모임에 참석 가능하신가요?",
      "required": true,
      "order": 1
    },
    {
      "id": "field_002",
      "type": "multiple_choice",
      "label": "선호하는 시간대는?",
      "options": ["오후 6시", "오후 7시", "오후 8시"],
      "required": false,
      "order": 2
    },
    {
      "id": "field_003",
      "type": "text",
      "label": "전달하고 싶은 의견이 있으신가요?",
      "required": false,
      "order": 3
    }
  ],
  "expires_at": "2025-10-14T23:59:59+09:00"
}
```

**필드 타입:**
- `text`: 단답형 텍스트
- `long_text`: 장문형 텍스트
- `yes_no`: 예/아니오 선택
- `multiple_choice`: 객관식 (단일 선택)
- `number`: 숫자 입력
- `date`: 날짜 선택

**필드 검증:**
- `title`: 필수, 3-200자
- `fields`: 최소 1개, 최대 20개
- `field.id`: 폼 내에서 유니크
- `field.options`: `multiple_choice` 타입인 경우 필수 (2-10개)

**Response (201 Created):**
```json
{
  "id": "frm_5g7j9l2m",
  "event_id": "evt_7x9k2m4n",
  "title": "10월 모임 참석 의향 조사",
  "description": "다음 모임에 참석 가능하신지 알려주세요",
  "fields": [
    {
      "id": "field_001",
      "type": "yes_no",
      "label": "10월 15일 모임에 참석 가능하신가요?",
      "required": true,
      "order": 1
    },
    {
      "id": "field_002",
      "type": "multiple_choice",
      "label": "선호하는 시간대는?",
      "options": ["오후 6시", "오후 7시", "오후 8시"],
      "required": false,
      "order": 2
    },
    {
      "id": "field_003",
      "type": "text",
      "label": "전달하고 싶은 의견이 있으신가요?",
      "required": false,
      "order": 3
    }
  ],
  "active": true,
  "expires_at": "2025-10-14T23:59:59+09:00",
  "share_url": "https://eventmanager.app/f/ABC123",
  "created_at": "2025-10-03T09:00:00Z",
  "updated_at": "2025-10-03T09:00:00Z",
  "stats": {
    "total_members": 42,
    "eligible_members": 42,
    "responses": 0,
    "response_rate": 0
  }
}
```

**share_url 생성 규칙:**
- 6자리 단축 코드 (영대소문자 + 숫자, 62^6 = 약 568억 조합)
- 중복 방지: 생성 전 존재 여부 확인
- 예시: `ABC123`, `xYz789`

---

#### 3.2 설문 폼 수정

```http
PUT /api/events/{eventId}/forms/{formId}
Authorization: Bearer {access_token}
Content-Type: application/json
```

**Request Body (수정할 필드만):**
```json
{
  "title": "10월 모임 참석 의향 조사 (수정)",
  "active": true,
  "expires_at": "2025-10-15T12:00:00+09:00"
}
```

**수정 불가 필드:**
- `id`, `event_id`, `share_url`, `created_at`
- 이미 응답이 있는 폼의 `fields` (응답 데이터 무결성 보호)

**Response (200 OK):**
```json
{
  "id": "frm_5g7j9l2m",
  "event_id": "evt_7x9k2m4n",
  "title": "10월 모임 참석 의향 조사 (수정)",
  "active": true,
  "expires_at": "2025-10-15T12:00:00+09:00",
  "updated_at": "2025-10-04T11:20:00Z"
  // ... 나머지 필드
}
```

---

#### 3.3 설문 폼 목록 조회

```http
GET /api/events/{eventId}/forms
Authorization: Bearer {access_token}
```

**Query Parameters:**
- `status`: `active` | `expired` | `all` (기본값: all)
- `sort`: `created_at` | `title` | `response_rate` (기본값: created_at)
- `order`: `asc` | `desc` (기본값: desc)

**Response (200 OK):**
```json
{
  "total": 3,
  "forms": [
    {
      "id": "frm_5g7j9l2m",
      "title": "10월 모임 참석 의향 조사",
      "active": true,
      "expires_at": "2025-10-14T23:59:59+09:00",
      "created_at": "2025-10-03T09:00:00Z",
      "stats": {
        "total_members": 42,
        "eligible_members": 42,
        "responses": 28,
        "response_rate": 66.7
      }
    },
    {
      "id": "frm_6h8k0m3n",
      "title": "9월 모임 후기 설문",
      "active": false,
      "expires_at": "2025-09-20T23:59:59+09:00",
      "created_at": "2025-09-10T10:00:00Z",
      "stats": {
        "total_members": 35,
        "eligible_members": 35,
        "responses": 32,
        "response_rate": 91.4
      }
    }
    // ... 더 많은 폼
  ]
}
```

---

#### 3.4 설문 폼 상세 조회

```http
GET /api/events/{eventId}/forms/{formId}
Authorization: Bearer {access_token}
```

**Response (200 OK):**
```json
{
  "id": "frm_5g7j9l2m",
  "event_id": "evt_7x9k2m4n",
  "title": "10월 모임 참석 의향 조사",
  "description": "다음 모임에 참석 가능하신지 알려주세요",
  "fields": [
    // ... 전체 필드 정보
  ],
  "active": true,
  "expires_at": "2025-10-14T23:59:59+09:00",
  "share_url": "https://eventmanager.app/f/ABC123",
  "created_at": "2025-10-03T09:00:00Z",
  "updated_at": "2025-10-03T09:00:00Z",
  "stats": {
    "total_members": 42,
    "eligible_members": 42,
    "responses": 28,
    "response_rate": 66.7,
    "field_stats": [
      {
        "field_id": "field_001",
        "label": "10월 15일 모임에 참석 가능하신가요?",
        "answers": {
          "예": 20,
          "아니오": 8
        }
      }
      // ... 다른 필드 통계
    ]
  }
}
```

---

#### 3.5 설문 폼 삭제

```http
DELETE /api/events/{eventId}/forms/{formId}
Authorization: Bearer {access_token}
```

**Response (204 No Content):**
- 본문 없음

**주의사항:**
- 응답이 있는 폼은 삭제할 수 없습니다 (409 Conflict 반환)
- 대신 `active: false`로 비활성화하세요

---

### 4. 설문 링크 관리

#### 4.1 공유 링크 조회

```http
GET /api/events/{eventId}/forms/{formId}/share-link
Authorization: Bearer {access_token}
```

**Response (200 OK):**
```json
{
  "form_id": "frm_5g7j9l2m",
  "share_url": "https://eventmanager.app/f/ABC123",
  "qr_code_url": "https://eventmanager.app/api/qr/ABC123.png",
  "expires_at": "2025-10-14T23:59:59+09:00",
  "stats": {
    "views": 58,
    "responses": 28,
    "completion_rate": 48.3
  }
}
```

---

#### 4.2 링크 재생성 (보안)

```http
POST /api/events/{eventId}/forms/{formId}/regenerate-link
Authorization: Bearer {access_token}
```

**사용 사례:**
- 링크가 외부에 노출되어 보안 우려가 있을 때
- 기존 링크를 무효화하고 새 링크 발급

**Response (201 Created):**
```json
{
  "old_share_url": "https://eventmanager.app/f/ABC123",
  "new_share_url": "https://eventmanager.app/f/XYZ789",
  "regenerated_at": "2025-10-05T11:30:00Z",
  "warning": "기존 링크는 즉시 무효화됩니다. 이미 공유된 링크는 작동하지 않습니다."
}
```

---

### 5. 설문 응답 (회원용)

#### 5.1 설문 폼 정보 조회 (인증 불필요)

```http
GET /api/forms/{shareCode}
```

**URL 예시:**
```
https://eventmanager.app/api/forms/ABC123
```

**Response (200 OK):**
```json
{
  "form": {
    "id": "frm_5g7j9l2m",
    "title": "10월 모임 참석 의향 조사",
    "description": "다음 모임에 참석 가능하신지 알려주세요",
    "fields": [
      {
        "id": "field_001",
        "type": "yes_no",
        "label": "10월 15일 모임에 참석 가능하신가요?",
        "required": true,
        "order": 1
      }
      // ... 나머지 필드
    ],
    "expires_at": "2025-10-14T23:59:59+09:00"
  },
  "event": {
    "name": "2025년 10월 북클럽 모임",
    "datetime": {
      "start": "2025-10-15T19:00:00+09:00"
    },
    "location": {
      "name": "홍대 북카페"
    }
  }
}
```

**Error Responses:**
- `404 Not Found`: 링크가 존재하지 않음
- `410 Gone`: 폼이 만료되었거나 비활성화됨

---

#### 5.2 설문 응답 제출

```http
POST /api/forms/{shareCode}/responses
Content-Type: application/json
```

**Request Body:**
```json
{
  "member_id": "mbr_8h3k5n2p",
  "responses": {
    "field_001": "예",
    "field_002": "오후 7시",
    "field_003": "기대됩니다!"
  }
}
```

**검증 규칙:**
1. **회원 확인**: `member_id`가 이벤트 회원 목록에 존재하는지
2. **접근 권한**: `member.created_at < form.created_at` (폼 생성 시점 이전 가입 회원만)
3. **필수 필드**: `required: true` 필드가 모두 응답되었는지
4. **중복 응답**: 동일 회원이 이미 응답했는지 (수정은 별도 API)

**Response (201 Created):**
```json
{
  "id": "res_3d5f7h9j",
  "form_id": "frm_5g7j9l2m",
  "member_id": "mbr_8h3k5n2p",
  "responses": {
    "field_001": "예",
    "field_002": "오후 7시",
    "field_003": "기대됩니다!"
  },
  "submitted_at": "2025-10-05T14:22:00Z"
}
```

**Error Responses:**

**403 Forbidden - 접근 권한 없음:**
```json
{
  "error": {
    "code": "FORM_ACCESS_DENIED",
    "message": "이 설문은 귀하가 가입하기 전에 생성되었습니다.",
    "details": {
      "member_joined": "2025-10-10T10:00:00Z",
      "form_created": "2025-10-03T09:00:00Z"
    }
  }
}
```

**409 Conflict - 이미 응답함:**
```json
{
  "error": {
    "code": "ALREADY_RESPONDED",
    "message": "이미 이 설문에 응답하셨습니다.",
    "details": {
      "previous_response_id": "res_3d5f7h9j",
      "submitted_at": "2025-10-05T14:22:00Z"
    }
  }
}
```

---

#### 5.3 설문 응답 수정

```http
PUT /api/forms/{shareCode}/responses/{responseId}
Content-Type: application/json
```

**Request Body:**
```json
{
  "member_id": "mbr_8h3k5n2p",
  "responses": {
    "field_001": "아니오",
    "field_002": "오후 8시",
    "field_003": "일정이 변경되었습니다."
  }
}
```

**Response (200 OK):**
```json
{
  "id": "res_3d5f7h9j",
  "form_id": "frm_5g7j9l2m",
  "member_id": "mbr_8h3k5n2p",
  "responses": {
    "field_001": "아니오",
    "field_002": "오후 8시",
    "field_003": "일정이 변경되었습니다."
  },
  "submitted_at": "2025-10-05T14:22:00Z",
  "updated_at": "2025-10-06T09:30:00Z"
}
```

---

### 6. 응답 통계 조회 (주최자용)

#### 6.1 응답 목록 조회

```http
GET /api/events/{eventId}/forms/{formId}/responses
Authorization: Bearer {access_token}
```

**Query Parameters:**
- `include_member_info`: `true` | `false` (기본값: false)
  - `true`: 회원 이름/번호 포함 (보안 서비스 호출)
  - `false`: member_id(UUID)만 반환
- `page`: 페이지 번호 (기본값: 1)
- `limit`: 페이지당 항목 수 (기본값: 50, 최대: 100)

**Response (include_member_info=false):**
```json
{
  "form": {
    "id": "frm_5g7j9l2m",
    "title": "10월 모임 참석 의향 조사"
  },
  "total_responses": 28,
  "page": 1,
  "limit": 50,
  "responses": [
    {
      "id": "res_3d5f7h9j",
      "member_id": "mbr_8h3k5n2p",
      "responses": {
        "field_001": "예",
        "field_002": "오후 7시",
        "field_003": "기대됩니다!"
      },
      "submitted_at": "2025-10-05T14:22:00Z"
    }
    // ... 더 많은 응답
  ]
}
```

**Response (include_member_info=true):**
```json
{
  "form": {
    "id": "frm_5g7j9l2m",
    "title": "10월 모임 참석 의향 조사"
  },
  "total_responses": 28,
  "page": 1,
  "limit": 50,
  "responses": [
    {
      "id": "res_3d5f7h9j",
      "member_id": "mbr_8h3k5n2p",
      "member": {
        "name": "홍길동",
        "phone_number": "010-****-5678"
      },
      "responses": {
        "field_001": "예",
        "field_002": "오후 7시",
        "field_003": "기대됩니다!"
      },
      "submitted_at": "2025-10-05T14:22:00Z"
    }
    // ... 더 많은 응답
  ]
}
```

**주의사항:**
- `include_member_info=true`는 개인정보 조회이므로 접근 로그에 기록됩니다
- 전화번호는 중간 4자리가 마스킹됩니다 (010-****-5678)

---

#### 6.2 응답 통계 요약

```http
GET /api/events/{eventId}/forms/{formId}/stats
Authorization: Bearer {access_token}
```

**Response (200 OK):**
```json
{
  "form": {
    "id": "frm_5g7j9l2m",
    "title": "10월 모임 참석 의향 조사"
  },
  "overview": {
    "total_members": 42,
    "eligible_members": 42,
    "responses": 28,
    "response_rate": 66.7,
    "avg_completion_time": "2m 15s"
  },
  "field_stats": [
    {
      "field_id": "field_001",
      "label": "10월 15일 모임에 참석 가능하신가요?",
      "type": "yes_no",
      "responses": 28,
      "answers": {
        "예": {
          "count": 20,
          "percentage": 71.4
        },
        "아니오": {
          "count": 8,
          "percentage": 28.6
        }
      }
    },
    {
      "field_id": "field_002",
      "label": "선호하는 시간대는?",
      "type": "multiple_choice",
      "responses": 25,
      "answers": {
        "오후 6시": {
          "count": 5,
          "percentage": 20
        },
        "오후 7시": {
          "count": 15,
          "percentage": 60
        },
        "오후 8시": {
          "count": 5,
          "percentage": 20
        }
      }
    },
    {
      "field_id": "field_003",
      "label": "전달하고 싶은 의견이 있으신가요?",
      "type": "text",
      "responses": 18,
      "sample_answers": [
        "기대됩니다!",
        "시간이 맞아서 좋습니다",
        "다음에도 참석하고 싶어요"
      ]
    }
  ],
  "timeline": {
    "first_response": "2025-10-03T10:15:00Z",
    "last_response": "2025-10-05T14:22:00Z",
    "peak_hour": "14:00-15:00",
    "hourly_distribution": [
      {"hour": "10:00", "count": 3},
      {"hour": "11:00", "count": 5},
      {"hour": "14:00", "count": 8}
      // ...
    ]
  }
}
```

---

#### 6.3 응답 데이터 내보내기

```http
GET /api/events/{eventId}/forms/{formId}/export
Authorization: Bearer {access_token}
```

**Query Parameters:**
- `format`: `csv` | `xlsx` | `json` (기본값: csv)
- `include_member_info`: `true` | `false` (기본값: true)

**Response (200 OK):**
```http
Content-Type: text/csv
Content-Disposition: attachment; filename="form_responses_2025-10-05.csv"

member_id,member_name,member_phone,field_001,field_002,field_003,submitted_at
mbr_8h3k5n2p,홍길동,010-1234-5678,예,오후 7시,기대됩니다!,2025-10-05T14:22:00Z
mbr_9i4l6o3q,김철수,010-2345-6789,아니오,오후 8시,,2025-10-05T15:10:00Z
...
```

---

## 에러 처리

### 표준 에러 형식

모든 에러는 다음 형식을 따릅니다:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "사람이 읽을 수 있는 에러 메시지",
    "details": {
      // 추가 컨텍스트 정보
    }
  }
}
```

### HTTP 상태 코드

| 코드 | 의미 | 예시 |
|------|------|------|
| 200 | OK | 성공적인 GET 요청 |
| 201 | Created | 성공적인 POST 요청 (리소스 생성) |
| 204 | No Content | 성공적인 DELETE 요청 |
| 400 | Bad Request | 필수 필드 누락, 검증 실패 |
| 401 | Unauthorized | 인증 토큰 없음 또는 만료 |
| 403 | Forbidden | 권한 부족 |
| 404 | Not Found | 리소스가 존재하지 않음 |
| 409 | Conflict | 중복 데이터, 상태 충돌 |
| 410 | Gone | 만료된 리소스 (폼 마감) |
| 422 | Unprocessable Entity | 비즈니스 로직 검증 실패 |
| 429 | Too Many Requests | Rate limit 초과 |
| 500 | Internal Server Error | 서버 내부 오류 |

### 에러 코드 목록

#### 인증/권한 (AUTH_*)
- `AUTH_TOKEN_MISSING`: 인증 토큰이 없음
- `AUTH_TOKEN_EXPIRED`: 토큰이 만료됨
- `AUTH_TOKEN_INVALID`: 토큰이 유효하지 않음
- `AUTH_FORBIDDEN`: 권한 부족

#### 유효성 검증 (VALIDATION_*)
- `VALIDATION_REQUIRED_FIELD`: 필수 필드 누락
- `VALIDATION_INVALID_FORMAT`: 형식 오류
- `VALIDATION_OUT_OF_RANGE`: 범위 초과

#### 리소스 (RESOURCE_*)
- `RESOURCE_NOT_FOUND`: 리소스가 존재하지 않음
- `RESOURCE_CONFLICT`: 리소스 충돌 (중복)
- `RESOURCE_GONE`: 만료된 리소스

#### 비즈니스 로직 (BIZ_*)
- `FORM_ACCESS_DENIED`: 설문 접근 권한 없음
- `ALREADY_RESPONDED`: 이미 응답함
- `FORM_EXPIRED`: 설문 마감됨
- `MEMBER_NOT_ELIGIBLE`: 회원 자격 없음

---

## 보안 정책

### 1. 데이터 보호

#### 전송 중 암호화
- **프로토콜**: TLS 1.3
- **강제 HTTPS**: 모든 API 요청
- **HSTS**: HTTP Strict Transport Security 활성화

#### 저장 시 암호화
- **Members DB**: 컬럼 레벨 암호화 (AES-256)
  - `name`: 암호화
  - `phone_number`: 암호화
- **백업**: 전체 암호화
- **키 관리**: AWS KMS / Azure Key Vault

### 2. 접근 제어

#### JWT 토큰
- **알고리즘**: HS256 (대칭키) 또는 RS256 (비대칭키)
- **만료 시간**: 1시간
- **리프레시 토큰**: 7일

#### Rate Limiting
```
전역: 100 req/min per IP
인증: 1000 req/min per user
설문 응답: 10 req/min per member_id
```

### 3. 개인정보 보호

#### 데이터 최소화
- 회원 정보: 이름 + 전화번호만 수집
- 설문 응답: 필요한 정보만 요청

#### 접근 로그
- Members DB 접근 시 모두 기록
- 로그 항목: user_id, timestamp, action, member_id

#### 데이터 보관
- **무료 티어**: 이벤트 종료 후 90일
- **프리미엄**: 1년 또는 구독 기간 동안

---

## 버전 관리

### API 버전

현재 버전: `v1`

**URL 구조:**
```
https://api.eventmanager.app/v1/events
```

**버전 정책:**
- 하위 호환성 유지
- 주요 변경 시 새 버전 릴리스 (v2, v3...)
- 구버전 지원: 최소 6개월

---

## 참고 자료

- [PRD (한글)](../product/PRD_Korean.md) - 제품 요구사항 문서
- [DATA_FLOWS.md](../design/DATA_FLOWS.md) - 데이터 플로우
- [화면 정의서](../screens/README.md) - UI 명세

---

**문서 버전:** 1.0
**최종 업데이트:** 2025-10-21
**작성자:** API 설계팀
