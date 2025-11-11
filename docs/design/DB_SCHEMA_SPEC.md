# DB 스키마 제안

# 0. 목차

# 1. DB 스키마

### 1️⃣ 핵심 테이블

### **users (사용자)**

| 필드명 | 타입 | 설명 |  |
| --- | --- | --- | --- |
| id | UUID (PK) | 고유 사용자 ID |  |
| name | VARCHAR | 이름 |  |
| email | VARCHAR (Unique) | 로그인 이메일 |  |
| password_hash | TEXT | 해시된 비밀번호 |  |
| role | ENUM('host', 'participant') | 개최자/참가자 구분 |  |
| created_at | TIMESTAMP | 가입일 |  |
| updated_at | TIMESTAMP | 수정일 |  |

> 개최자/참가자 모두 한 테이블로 관리하되, 역할(role)로 구분ㅁ1
> 

---

### **events (이벤트)**

| 필드명 | 타입 | 설명 |
| --- | --- | --- |
| id | UUID (PK) | 이벤트 ID |
| host_id | UUID (FK → users.id) | 개최자 |
| title | VARCHAR | 이벤트명 |
| description | TEXT | 이벤트 설명 |
| location | VARCHAR | 장소 |
| start_time | TIMESTAMP | 시작 시각 |
| end_time | TIMESTAMP | 종료 시각 |
| capacity | INT | 최대 인원 |
| status | ENUM('draft','published','active','completed') | 상태 |
| qr_code_url | TEXT | 참가자용 QR 링크 |
| created_at | TIMESTAMP | 생성일 |
| updated_at | TIMESTAMP | 수정일 |

---

### **participants (참가자 등록 정보)**

| 필드명 | 타입 | 설명 |
| --- | --- | --- |
| id | UUID (PK) | 참가자 등록 ID |
| event_id | UUID (FK → events.id) | 이벤트 ID |
| user_id | UUID (Nullable, FK → users.id) | 로그인 기반 참가자일 경우 |
| nickname | VARCHAR | 익명 모드 시 닉네임 |
| contact | VARCHAR | 연락처 |
| organization | VARCHAR | 소속 (옵션) |
| registered_at | TIMESTAMP | 등록일 |
| is_anonymous | BOOLEAN | 익명 여부 |

> 앱 설치 없이 등록 가능하도록 user_id는 nullable 처리
> 

---

### **formData(설문조사 데이터)** - 1차 개발기간까지 (~10/29)

> 📄 **상세 명세**: [FORM_DATA.md](./FORM_DATA.md) 참조

#### **forms 테이블**
```sql
CREATE TABLE forms (
    id UUID PRIMARY KEY,
    event_id UUID REFERENCES events(id),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    
    -- JSON 필드: 설문 필드 정의
    fields JSONB NOT NULL,
    
    active BOOLEAN DEFAULT true,
    expires_at TIMESTAMP,
    share_url VARCHAR(200) UNIQUE,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

#### **form_responses 테이블**
```sql
CREATE TABLE form_responses (
    id UUID PRIMARY KEY,
    form_id UUID REFERENCES forms(id),
    member_id UUID NOT NULL,  -- UUID만 저장 (Members DB 별도)
    
    -- JSON 필드: 응답 데이터
    responses JSONB NOT NULL,
    
    form_version INTEGER NOT NULL,  -- 응답 시점의 폼 버전
    submitted_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP
);

CREATE UNIQUE INDEX idx_form_response_unique 
ON form_responses(form_id, member_id);

CREATE INDEX idx_form_responses_form 
ON form_responses(form_id, form_version);
```

**설명:**
- `fields` JSONB: [FORM_DATA.md](./FORM_DATA.md)의 FormField 배열
- `responses` JSONB: 각 field_id를 키로 한 응답 값
- `form_version`: 폼 수정 시 기존 응답과의 호환성 관리용

---


## ✅ **구조 요약**(수정필요)

| 핵심 엔티티 | 관계 | 설명 |
| --- | --- | --- |
| `users` | 개최자/참가자 모두 관리 | 역할(role)로 구분 |
| `events` | `users(host_id)` → `events` | 한 명의 개최자가 여러 이벤트 생성 |
| `participants` | `events` ↔ 참가자 | 익명 등록도 가능 |
| `attendance` | 참가자 출석 상태 | 현장 출석용 |
| `raffle_draws` | 이벤트별 경품 이력 | 랜덤 추첨, 당첨자 기록 |
| `custom_fields` / `custom_responses` | 맞춤 등록폼 | 이벤트별 필드 생성 |
| `event_settings` | 이벤트 설정값 | 익명 허용, 브랜딩 등 |

---

---

---


📘 **해석 요약**

- 한 `user`(개최자)는 여러 `event`를 생성할 수 있음.
- 각 `event`는 여러 `participant`를 가짐.
- `participant`는 익명일 수도 있고, 로그인 기반(`user_id`)일 수도 있음.
- `attendance`는 참가자와 출석 시각의 관계 테이블.
- `raffle_draws`는 경품 추첨 기록.
- `custom_fields` + `custom_responses`는 등록폼의 동적 구조를 지원.
- `event_settings`는 1:1 구성으로 각 이벤트별 환경설정 저장.

---

---

# **2. Python 구조 예시 (`connection.py` + `queries/`)**

### 📁 프로젝트 구조 예시

```
server/
├── db/
│   ├── connection.py
│   ├── queries/
│   │   ├── users.py
│   │   ├── events.py
│   │   ├── participants.py
│   │   ├── attendance.py
│   │   └── raffle_draws.py
│   └── __init__.py
├── main.py
└── config.py

```

---

### 🧩 `db/connection.py`

```python
import psycopg2
from psycopg2.extras import RealDictCursor
import os

def get_connection():
    conn = psycopg2.connect(
        host=os.getenv("DB_HOST"),
        dbname=os.getenv("DB_NAME"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        port=os.getenv("DB_PORT", 5432),
        cursor_factory=RealDictCursor
    )
    return conn

def execute_query(query, params=None, fetch=False):
    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute(query, params)
        if fetch:
            result = cur.fetchall()
        else:
            result = None
        conn.commit()
        return result
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        cur.close()
        conn.close()

```

---

### 🧱 `db/queries/events.py`

```python
from db.connection import execute_query

def create_event(host_id, title, description, location, start_time, end_time, capacity):
    query = """
        INSERT INTO events (host_id, title, description, location, start_time, end_time, capacity)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        RETURNING id;
    """
    params = (host_id, title, description, location, start_time, end_time, capacity)
    return execute_query(query, params, fetch=True)

def get_event_by_id(event_id):
    query = "SELECT * FROM events WHERE id = %s;"
    return execute_query(query, (event_id,), fetch=True)

def update_event_status(event_id, status):
    query = "UPDATE events SET status = %s, updated_at = NOW() WHERE id = %s;"
    execute_query(query, (status, event_id))

```

---

### 🧾 `db/queries/participants.py`

```python
from db.connection import execute_query

def register_participant(event_id, nickname, contact, organization=None, is_anonymous=False):
    query = """
        INSERT INTO participants (event_id, nickname, contact, organization, is_anonymous)
        VALUES (%s, %s, %s, %s, %s)
        RETURNING id;
    """
    params = (event_id, nickname, contact, organization, is_anonymous)
    return execute_query(query, params, fetch=True)

def get_participants(event_id):
    query = "SELECT * FROM participants WHERE event_id = %s;"
    return execute_query(query, (event_id,), fetch=True)

```

---

### ⚙️ `db/queries/attendance.py`

```python
from db.connection import execute_query

def mark_attendance(participant_id, checked_by, status="present"):
    query = """
        INSERT INTO attendance (participant_id, checked_by, status)
        VALUES (%s, %s, %s)
        RETURNING id;
    """
    params = (participant_id, checked_by, status)
    return execute_query(query, params, fetch=True)

```

---

### ✅ `main.py` 예시

```python
from db.queries.events import create_event, get_event_by_id
from db.queries.participants import register_participant, get_participants

if __name__ == "__main__":
    # 이벤트 생성
    new_event = create_event(
        host_id="uuid-of-host",
        title="테스트 이벤트",
        description="테스트용 이벤트입니다.",
        location="서울 강남구",
        start_time="2025-11-01 14:00",
        end_time="2025-11-01 18:00",
        capacity=100
    )
    print("생성된 이벤트:", new_event)

    # 참가자 등록
    participant = register_participant(new_event[0]['id'], "정우", "010-1234-5678")
    print("참가자 등록:", participant)

    # 참가자 목록 조회
    participants = get_participants(new_event[0]['id'])
    print("참가자 목록:", participants)

```

---