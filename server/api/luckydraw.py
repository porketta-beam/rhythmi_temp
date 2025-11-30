"""
경품추첨 API 엔드포인트

참가자 추첨번호 할당 및 관리자 추첨 기능을 제공합니다.
"""

import logging
from typing import Optional
from fastapi import APIRouter, HTTPException, status, Query, Header
from pydantic import BaseModel, Field

from services import luckydraw_service

logger = logging.getLogger(__name__)

# API 라우터 생성
router = APIRouter(
    prefix="/api/luckydraw",
    tags=["Lucky Draw"]
)


# ============================================================
# Request/Response Models
# ============================================================

class RegisterRequest(BaseModel):
    """참가자 등록 요청"""
    event_id: str = Field(..., description="이벤트 ID")
    session_token: Optional[str] = Field(None, description="기존 세션 토큰 (선택사항)")

    class Config:
        json_schema_extra = {
            "example": {
                "event_id": "550e8400-e29b-41d4-a716-446655440000",
                "session_token": None
            }
        }


class RegisterResponse(BaseModel):
    """참가자 등록 응답"""
    success: bool = Field(..., description="성공 여부")
    data: dict = Field(..., description="응답 데이터")
    message: Optional[str] = Field(None, description="메시지")


class DrawRequest(BaseModel):
    """추첨 요청"""
    prize_name: str = Field(..., description="상품 이름 (예: '1등 상')")
    prize_rank: int = Field(..., description="상품 등급 (1, 2, 3...)")
    count: int = Field(1, description="당첨자 수 (기본값: 1)")

    class Config:
        json_schema_extra = {
            "example": {
                "prize_name": "1등 상",
                "prize_rank": 1,
                "count": 1
            }
        }


class ResetRequest(BaseModel):
    """리셋 요청"""
    reset_participants: bool = Field(False, description="참가자 목록도 삭제할지")
    reset_draws: bool = Field(True, description="추첨 이력 삭제")

    class Config:
        json_schema_extra = {
            "example": {
                "reset_participants": False,
                "reset_draws": True
            }
        }


# ============================================================
# 참가자 API
# ============================================================

@router.post(
    "/register",
    response_model=RegisterResponse,
    status_code=status.HTTP_201_CREATED,
    summary="참가자 등록 및 추첨번호 할당",
    description="QR 코드 스캔 시 추첨번호 할당 및 세션 토큰 발급"
)
async def register_participant(request: RegisterRequest):
    """
    참가자 등록 API

    **플로우**:
    1. 기존 세션 토큰이 있으면 해당 번호 반환
    2. 없으면 신규 추첨번호 할당 및 세션 토큰 발급

    **에러 처리**:
    - 잘못된 요청 → 400 에러
    - 서버 오류 → 500 에러
    """
    try:
        result = await luckydraw_service.register_participant(
            event_id=request.event_id,
            session_token=request.session_token
        )

        return RegisterResponse(
            success=True,
            data=result,
            message="등록 완료" if not result.get("is_existing") else "기존 참가자 조회 완료"
        )

    except ValueError as e:
        logger.error(f"[ERROR] 잘못된 요청: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "code": "INVALID_REQUEST",
                "message": str(e)
            }
        )
    except Exception as e:
        logger.error(f"[ERROR] 서버 오류: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "code": "INTERNAL_ERROR",
                "message": "서버 내부 에러가 발생했습니다"
            }
        )


@router.get(
    "/my-number",
    response_model=RegisterResponse,
    summary="내 추첨번호 조회",
    description="세션 토큰으로 내 추첨번호 조회"
)
async def get_my_number(
    event_id: str = Query(..., description="이벤트 ID"),
    session_token: Optional[str] = Query(None, description="세션 토큰 (Query 파라미터)"),
    authorization: Optional[str] = Header(None, description="세션 토큰 (Authorization 헤더)")
):
    """
    내 추첨번호 조회 API

    **토큰 전달 방법**:
    - Query 파라미터: `?session_token=xxx`
    - Authorization 헤더: `Authorization: Bearer xxx` (Bearer 제거)

    **에러 처리**:
    - 토큰 없음 → 400 에러
    - 참가자 없음 → 404 에러
    """
    # 토큰 추출 (Query 우선, 없으면 Header)
    token = session_token
    if not token and authorization:
        # "Bearer " 제거
        token = authorization.replace("Bearer ", "").strip()

    if not token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "code": "TOKEN_REQUIRED",
                "message": "세션 토큰이 필요합니다"
            }
        )

    try:
        participant = await luckydraw_service.get_participant_by_token(
            event_id=event_id,
            session_token=token
        )

        if not participant:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={
                    "code": "PARTICIPANT_NOT_FOUND",
                    "message": "참가자를 찾을 수 없습니다"
                }
            )

        return RegisterResponse(
            success=True,
            data=participant,
            message="조회 완료"
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"[ERROR] 서버 오류: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "code": "INTERNAL_ERROR",
                "message": "서버 내부 에러가 발생했습니다"
            }
        )


# ============================================================
# 관리자 API
# ============================================================

@router.get(
    "/admin/{event_id}/participants",
    summary="참가자 목록 조회",
    description="할당된 추첨번호 목록 조회"
)
async def get_participants(event_id: str):
    """
    참가자 목록 조회 API

    **응답**:
    - total_count: 전체 참가자 수
    - participants: 참가자 목록 (draw_number 순으로 정렬)
    """
    try:
        result = await luckydraw_service.get_all_participants(event_id)
        return {
            "success": True,
            "data": result
        }

    except Exception as e:
        logger.error(f"[ERROR] 서버 오류: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "code": "INTERNAL_ERROR",
                "message": "서버 내부 에러가 발생했습니다"
            }
        )


@router.post(
    "/admin/{event_id}/draw",
    summary="추첨 시작",
    description="추첨 실행 및 당첨자 선택"
)
async def draw_winner(event_id: str, request: DrawRequest):
    """
    추첨 시작 API

    **플로우**:
    1. 참가자 목록 조회
    2. 이미 당첨된 번호 제외
    3. 랜덤 추첨
    4. 추첨 이력 저장

    **에러 처리**:
    - 참가자 없음 → 400 에러
    - 추첨 가능한 참가자 없음 → 400 에러
    """
    try:
        result = await luckydraw_service.draw_winner(
            event_id=event_id,
            prize_name=request.prize_name,
            prize_rank=request.prize_rank,
            count=request.count
        )

        return {
            "success": True,
            "data": result
        }

    except ValueError as e:
        logger.error(f"[ERROR] 추첨 실패: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "code": "DRAW_FAILED",
                "message": str(e)
            }
        )
    except Exception as e:
        logger.error(f"[ERROR] 서버 오류: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "code": "INTERNAL_ERROR",
                "message": "서버 내부 에러가 발생했습니다"
            }
        )


@router.post(
    "/admin/{event_id}/reset",
    summary="리셋 / 다시 시작",
    description="관리자 페이지의 리셋 버튼으로 호출"
)
async def reset_event(event_id: str, request: ResetRequest):
    """
    리셋 API

    **기능**:
    - 참가자 목록 삭제 (선택사항)
    - 추첨 이력 삭제 (기본값: True)

    **참고**: 이 엔드포인트는 관리자 페이지의 리셋 버튼 클릭 시 호출됩니다.
    """
    try:
        result = await luckydraw_service.reset_event(
            event_id=event_id,
            reset_participants=request.reset_participants,
            reset_draws=request.reset_draws
        )

        return {
            "success": True,
            "message": result["message"]
        }

    except Exception as e:
        logger.error(f"[ERROR] 서버 오류: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "code": "INTERNAL_ERROR",
                "message": "서버 내부 에러가 발생했습니다"
            }
        )


@router.get(
    "/admin/{event_id}/draws",
    summary="추첨 이력 조회",
    description="이벤트의 추첨 이력 조회"
)
async def get_draw_history(event_id: str):
    """
    추첨 이력 조회 API

    **응답**:
    - 추첨 이력 목록 (상품별, 시간순)
    """
    try:
        draws = await luckydraw_service.get_draw_history(event_id)
        return {
            "success": True,
            "data": {
                "draws": draws,
                "total_count": len(draws)
            }
        }

    except Exception as e:
        logger.error(f"[ERROR] 서버 오류: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "code": "INTERNAL_ERROR",
                "message": "서버 내부 에러가 발생했습니다"
            }
        )

