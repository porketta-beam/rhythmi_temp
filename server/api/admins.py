"""
관리자 관리 API 엔드포인트

관리자 정보 생성 및 수정 기능을 제공합니다.
"""

import logging
from typing import Optional
from fastapi import APIRouter, status
from pydantic import BaseModel
from sqlalchemy import text
from db.connection import get_engine

logger = logging.getLogger(__name__)

# API 라우터 생성
router = APIRouter(
    prefix="/api/admins",
    tags=["Admins"]
)


# ============================================================
# Request/Response Models
# ============================================================

class AdminUpsert(BaseModel):
    """관리자 생성/수정 요청"""
    id: str
    email: Optional[str] = None
    name: Optional[str] = None


# ============================================================
# API Endpoints
# ============================================================

@router.post(
    "/upsert",
    status_code=status.HTTP_200_OK,
    summary="관리자 생성/수정",
    description="관리자 정보를 생성하거나 수정합니다 (이름이 없으면 이메일 로컬파트로 대체)"
)
async def upsert_admin(payload: AdminUpsert):
    """관리자 생성/수정"""
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
        row = conn.execute(
            sql,
            {"id": payload.id, "email": payload.email, "name": derived_name}
        ).fetchone()
        return {"id": str(row[0])}
