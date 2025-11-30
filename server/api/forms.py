"""
폼 관리 API 엔드포인트

설문 폼 CRUD 및 응답 생성 기능을 제공합니다.
"""

import json
import logging
from typing import Optional, Any
from fastapi import APIRouter, HTTPException, status, Query
from pydantic import BaseModel, Field
from sqlalchemy import text
from db.connection import get_engine

logger = logging.getLogger(__name__)

# API 라우터 생성
router = APIRouter(
    prefix="/api/forms",
    tags=["Forms"]
)


# ============================================================
# Request/Response Models
# ============================================================

class FormCreate(BaseModel):
    """폼 생성 요청"""
    event_id: str
    title: str
    description: Optional[str] = None
    fields: Any = Field(..., description="FORM_DATA.md 포맷의 JSON")
    active: bool = True
    expires_at: Optional[str] = None
    share_url: Optional[str] = None


class FormResponseCreate(BaseModel):
    """폼 응답 생성 요청"""
    form_id: str
    member_id: Optional[str] = None
    responses: Any
    form_version: Optional[int] = 1


# ============================================================
# API Endpoints
# ============================================================

@router.post(
    "",
    status_code=status.HTTP_201_CREATED,
    summary="폼 생성",
    description="새로운 설문 폼을 생성합니다"
)
async def create_form(payload: FormCreate):
    """폼 생성"""
    sql = text(
        """
        INSERT INTO forms (
            event_id, title, description, fields,
            active, expires_at, share_url
        )
        VALUES (
            :event_id, :title, :description, CAST(:fields AS JSONB),
            :active, :expires_at, :share_url
        )
        RETURNING id;
        """
    )
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


@router.get(
    "",
    summary="폼 목록 조회",
    description="폼 목록을 조회합니다 (event_id 또는 share_url로 필터링 가능)"
)
async def list_forms(
    event_id: Optional[str] = Query(None, description="이벤트 ID로 필터링"),
    share_url: Optional[str] = Query(None, description="공유 URL로 필터링")
):
    """폼 목록 조회"""
    base = (
        "SELECT id, event_id, title, description, fields, active, expires_at, "
        "share_url, created_at FROM forms"
    )
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


@router.get(
    "/{form_id}",
    summary="폼 조회",
    description="특정 폼의 상세 정보를 조회합니다"
)
async def get_form(form_id: str):
    """폼 조회"""
    sql = text(
        "SELECT id, event_id, title, description, fields, "
        "active, expires_at, share_url, created_at, updated_at "
        "FROM forms WHERE id = :id"
    )
    with get_engine().connect() as conn:
        row = conn.execute(sql, {"id": form_id}).mappings().first()
        if not row:
            raise HTTPException(status_code=404, detail="Form not found")
        return dict(row)


@router.put(
    "/{form_id}",
    summary="폼 수정",
    description="폼 정보를 수정합니다"
)
async def update_form(form_id: str, payload: FormCreate):
    """폼 수정"""
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


@router.post(
    "/{form_id}/responses",
    status_code=status.HTTP_201_CREATED,
    summary="폼 응답 생성",
    description="폼에 대한 응답을 생성합니다"
)
async def create_form_response(form_id: str, payload: FormResponseCreate):
    """폼 응답 생성"""
    sql = text(
        """
        INSERT INTO form_responses (
            id, form_id, member_id, responses, form_version
        )
        VALUES (
            uuid_generate_v4(), :form_id,
            COALESCE(:member_id, uuid_generate_v4()),
            CAST(:responses AS JSONB), :form_version
        )
        RETURNING id, member_id;
        """
    )
    with get_engine().begin() as conn:
        row = conn.execute(sql, {
            "form_id": form_id,
            "member_id": payload.member_id,
            "responses": json.dumps(payload.responses),
            "form_version": payload.form_version or 1,
        }).fetchone()
        return {"id": str(row[0]), "member_id": str(row[1])}
