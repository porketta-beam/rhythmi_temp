from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, List, Any
import uvicorn
from db.connection import get_engine
from sqlalchemy import text
from fastapi.middleware.cors import CORSMiddleware
import os
import logging
# AI 설문 분석 API 라우터 import
from api import survey_router, result_router, luckydraw_router

app = FastAPI(
    title="Event Manager",
    description="Event Manager Application API",
    version="0.1.0"
)

# CORS 설정
DEBUG = os.getenv("DEBUG", "true").lower() == "true"

if DEBUG:
    # 개발 환경: 모든 origin 허용
    allowed_origins = ["*"]
    print("🔓 [CORS] DEBUG 모드: 모든 origin 허용")
else:
    # 프로덕션 환경: 특정 도메인만 허용
    FRONT_URL = os.getenv("FRONT_URL", "http://localhost:3000")
    FRONT_URLS_STR = os.getenv("FRONT_URLS", "")
    FRONT_URLS = [url.strip() for url in FRONT_URLS_STR.split(",") if url.strip()]
    DEFAULT_DEPLOYMENT_ORIGINS = [
        "https://event-manager-gax2.vercel.app",
    ]
    allowed_origins = [FRONT_URL] + FRONT_URLS + DEFAULT_DEPLOYMENT_ORIGINS + ["http://127.0.0.1:3000", "http://localhost:3000"]
    allowed_origins = list(dict.fromkeys(allowed_origins))
    print(f"🔒 [CORS] 프로덕션 모드: {len(allowed_origins)}개 도메인 허용")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# 로깅 설정
logging.basicConfig(
    level=logging.INFO,
    format='%(levelname)s:     %(name)s - %(message)s'
)

# AI 설문 분석 라우터 등록
app.include_router(survey_router)

# 설문 결과 조회 라우터 등록
app.include_router(result_router)

# 경품추첨 라우터 등록
app.include_router(luckydraw_router)




class EventCreate(BaseModel):
    host_id: str
    title: str
    description: Optional[str] = None
    location: Optional[str] = None
    start_time: str  # ISO string
    end_time: str    # ISO string
    capacity: Optional[int] = None
    status: str = "draft"


class FormCreate(BaseModel):
    event_id: str
    title: str
    description: Optional[str] = None
    fields: Any = Field(..., description="FORM_DATA.md 포맷의 JSON")
    active: bool = True
    expires_at: Optional[str] = None
    share_url: Optional[str] = None


class AdminUpsert(BaseModel):
    id: str
    email: Optional[str] = None
    name: Optional[str] = None


@app.get("/")
async def root():
    return {"message": "OK"}


@app.post("/api/admins/upsert")
async def upsert_admin(payload: AdminUpsert):
    # 이름이 없으면 이메일 로컬파트로 대체
    derived_name = payload.name
    if not derived_name and payload.email:
        derived_name = payload.email.split("@")[0]

    # role 체크 제약 대응: 기본값을 'host'로 기록
    sql = text(
        """
        insert into admins (id, email, name, role)
        values (:id, :email, :name, 'host')
        on conflict (id) do update
          set email = excluded.email,
              name  = coalesce(excluded.name, admins.name)
        returning id;
        """
    )
    with get_engine().begin() as conn:
        row = conn.execute(sql, {"id": payload.id, "email": payload.email, "name": derived_name}).fetchone()
        return {"id": str(row[0])}


@app.post("/api/events")
async def create_event(payload: EventCreate):
    sql = text(
        """
        INSERT INTO events (host_id, title, description, location, start_time, end_time, capacity, status)
        VALUES (:host_id, :title, :description, :location, :start_time, :end_time, :capacity, :status)
        RETURNING id;
        """
    )
    with get_engine().begin() as conn:
        row = conn.execute(sql, payload.model_dump()).fetchone()
        return {"id": str(row[0])}


@app.get("/api/events")
async def list_events():
    sql = text("SELECT id, host_id, title, description, location, start_time, end_time, capacity, status, created_at FROM events ORDER BY created_at DESC")
    with get_engine().connect() as conn:
        rows = conn.execute(sql).mappings().all()
        return [dict(r) for r in rows]


@app.get("/api/events/{event_id}")
async def get_event(event_id: str):
    sql = text("SELECT id, host_id, title, description, location, start_time, end_time, capacity, status, qr_code_url, created_at, updated_at FROM events WHERE id = :id")
    with get_engine().connect() as conn:
        row = conn.execute(sql, {"id": event_id}).mappings().first()
        if not row:
            raise HTTPException(status_code=404, detail="Event not found")
        return dict(row)


@app.put("/api/events/{event_id}")
async def update_event(event_id: str, payload: EventCreate):
    sql = text(
        """
        UPDATE events
        SET title = :title,
            description = :description,
            location = :location,
            start_time = :start_time,
            end_time = :end_time,
            capacity = :capacity,
            status = :status,
            qr_code_url = :qr_code_url,
            updated_at = now()
        WHERE id = :id
        RETURNING id;
        """
    )
    with get_engine().begin() as conn:
        row = conn.execute(sql, {
            "id": event_id,
            "title": payload.title,
            "description": payload.description,
            "location": payload.location,
            "start_time": payload.start_time,
            "end_time": payload.end_time,
            "capacity": payload.capacity,
            "status": payload.status,
            "qr_code_url": None,
        }).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Event not found")
        return {"id": str(row[0])}


@app.post("/api/forms")
async def create_form(payload: FormCreate):
    sql = text(
        """
        INSERT INTO forms (event_id, title, description, fields, active, expires_at, share_url)
        VALUES (:event_id, :title, :description, CAST(:fields AS JSONB), :active, :expires_at, :share_url)
        RETURNING id;
        """
    )
    import json
    with get_engine().begin() as conn:
        row = conn.execute(sql, {
            "event_id": payload.event_id,
            "title": payload.title,
            "description": payload.description,
            "fields": json.dumps(payload.fields),
            "active": payload.active,
            "expires_at": payload.expires_at,
            "share_url": payload.share_url,
        }).fetchone()
        return {"id": str(row[0])}


@app.get("/api/forms")
async def list_forms(event_id: Optional[str] = None, share_url: Optional[str] = None):
    base = "SELECT id, event_id, title, description, fields, active, expires_at, share_url, created_at FROM forms"
    where = []
    params = {}
    if event_id:
        where.append("event_id = :event_id")
        params["event_id"] = event_id
    if share_url:
        where.append("share_url = :share_url")
        params["share_url"] = share_url
    if where:
        base += " WHERE " + " AND ".join(where)
    base += " ORDER BY created_at DESC"
    sql = text(base)
    with get_engine().connect() as conn:
        rows = conn.execute(sql, params).mappings().all()
        return [dict(r) for r in rows]


@app.put("/api/forms/{form_id}")
async def update_form(form_id: str, payload: FormCreate):
    sql = text(
        """
        UPDATE forms
        SET title = :title,
            description = :description,
            fields = CAST(:fields AS JSONB),
            active = :active,
            expires_at = :expires_at,
            share_url = :share_url,
            updated_at = now()
        WHERE id = :form_id
        RETURNING id;
        """
    )
    import json
    with get_engine().begin() as conn:
        row = conn.execute(sql, {
            "form_id": form_id,
            "title": payload.title,
            "description": payload.description,
            "fields": json.dumps(payload.fields),
            "active": payload.active,
            "expires_at": payload.expires_at,
            "share_url": payload.share_url,
        }).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Form not found")
        return {"id": str(row[0])}


@app.get("/api/forms/{form_id}")
async def get_form(form_id: str):
    sql = text("SELECT id, event_id, title, description, fields, active, expires_at, share_url, created_at, updated_at FROM forms WHERE id = :id")
    with get_engine().connect() as conn:
        row = conn.execute(sql, {"id": form_id}).mappings().first()
        if not row:
            raise HTTPException(status_code=404, detail="Form not found")
        return dict(row)


class FormResponseCreate(BaseModel):
    form_id: str
    member_id: Optional[str] = None
    responses: Any
    form_version: Optional[int] = 1


@app.post("/api/forms/{form_id}/responses")
async def create_form_response(form_id: str, payload: FormResponseCreate):
    sql = text(
        """
        INSERT INTO form_responses (id, form_id, member_id, responses, form_version)
        VALUES (uuid_generate_v4(), :form_id, COALESCE(:member_id, uuid_generate_v4()), CAST(:responses AS JSONB), :form_version)
        RETURNING id, member_id;
        """
    )
    import json
    with get_engine().begin() as conn:
        row = conn.execute(sql, {
            "form_id": form_id,
            "member_id": payload.member_id,
            "responses": json.dumps(payload.responses),
            "form_version": payload.form_version or 1,
        }).fetchone()
        return {"id": str(row[0]), "member_id": str(row[1])}


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
