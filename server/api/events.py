"""
이벤트 관리 API 엔드포인트

이벤트 CRUD 기능을 제공합니다.
"""

import logging
from typing import Optional
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import text
from db.connection import get_engine

logger = logging.getLogger(__name__)

# API 라우터 생성
router = APIRouter(
    prefix="/api/events",
    tags=["Events"]
)


# ============================================================
# Request/Response Models
# ============================================================

class EventCreate(BaseModel):
    """이벤트 생성 요청"""
    host_id: str
    title: str
    description: Optional[str] = None
    location: Optional[str] = None
    start_time: str  # ISO string
    end_time: str    # ISO string
    capacity: Optional[int] = None
    status: str = "draft"


# ============================================================
# API Endpoints
# ============================================================

@router.post(
    "",
    status_code=status.HTTP_201_CREATED,
    summary="이벤트 생성",
    description="새로운 이벤트를 생성합니다"
)
async def create_event(payload: EventCreate):
    """이벤트 생성"""
    sql = text(
        """
        INSERT INTO events (
            host_id, title, description, location,
            start_time, end_time, capacity, status
        )
        VALUES (
            :host_id, :title, :description, :location,
            :start_time, :end_time, :capacity, :status
        )
        RETURNING id;
        """
    )
    with get_engine().begin() as conn:
        row = conn.execute(sql, payload.model_dump()).fetchone()
        return {"id": str(row[0])}


@router.get(
    "",
    summary="이벤트 목록 조회",
    description="모든 이벤트 목록을 조회합니다"
)
async def list_events():
    """이벤트 목록 조회"""
    sql = text(
        "SELECT id, host_id, title, description, location, "
        "start_time, end_time, capacity, status, created_at "
        "FROM events ORDER BY created_at DESC"
    )
    with get_engine().connect() as conn:
        rows = conn.execute(sql).mappings().all()
        return [dict(r) for r in rows]


@router.get(
    "/{event_id}",
    summary="이벤트 조회",
    description="특정 이벤트의 상세 정보를 조회합니다"
)
async def get_event(event_id: str):
    """이벤트 조회"""
    sql = text(
        "SELECT id, host_id, title, description, location, "
        "start_time, end_time, capacity, status, qr_code_url, "
        "created_at, updated_at FROM events WHERE id = :id"
    )
    with get_engine().connect() as conn:
        row = conn.execute(sql, {"id": event_id}).mappings().first()
        if not row:
            raise HTTPException(status_code=404, detail="Event not found")
        return dict(row)


@router.put(
    "/{event_id}",
    summary="이벤트 수정",
    description="이벤트 정보를 수정합니다"
)
async def update_event(event_id: str, payload: EventCreate):
    """이벤트 수정"""
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
