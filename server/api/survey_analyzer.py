"""
설문 분석 API 엔드포인트

AI 기반 피부 타입 분류 + Supabase 저장
"""

import logging
from typing import Dict, Optional
from datetime import datetime

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

from services.classifier import classify_with_fallback
from db.supabase_client import get_supabase_client

logger = logging.getLogger(__name__)

# API 라우터 생성
router = APIRouter(
    prefix="/api/survey",
    tags=["Survey Analysis"]
)


# ============================================================
# Request/Response Models
# ============================================================

class SurveyRequest(BaseModel):
    """설문 분석 요청"""
    member_id: str = Field(..., description="회원 ID (UUID)")
    share_url: str = Field(..., description="폼 공유 URL (예: test/2)")
    responses: Dict[str, str] = Field(..., description="설문 응답 데이터")

    class Config:
        json_schema_extra = {
            "example": {
                "member_id": "550e8400-e29b-41d4-a716-446655440000",
                "share_url": "test/2",
                "responses": {
                    "100": "gender_female",
                    "101": "age_20s",
                    "1": "q1a1",
                    "2": "q2a1",
                    "3": "q3a1",
                    "4": "q4a1",
                    "5": "q5a1",
                    "6": "q6a1",
                    "7": "q7a1",
                    "8": "q8a2",
                    "9": "q9a3",
                    "10": "q10a3"
                }
            }
        }


class AnalysisResult(BaseModel):
    """분석 결과"""
    type: str = Field(..., description="피부 타입 (8가지 중 하나)")
    source: str = Field(..., description="분류 출처 (ai, fallback, none)")
    ai_error: Optional[str] = Field(None, description="AI 에러 메시지 (있을 경우)")
    classified_at: str = Field(..., description="분류 시간 (ISO 8601)")

    class Config:
        json_schema_extra = {
            "example": {
                "type": "office_thirst",
                "source": "ai",
                "ai_error": None,
                "classified_at": "2025-11-21T10:30:00Z"
            }
        }


class SurveyResponse(BaseModel):
    """설문 분석 응답"""
    success: bool = Field(..., description="성공 여부")
    data: Dict = Field(..., description="응답 데이터")
    message: Optional[str] = Field(None, description="메시지")

    class Config:
        json_schema_extra = {
            "example": {
                "success": True,
                "data": {
                    "result_type": "office_thirst",
                    "source": "ai",
                    "response_id": "mock_response_id"
                },
                "message": "분석 완료"
            }
        }


class ErrorResponse(BaseModel):
    """에러 응답"""
    success: bool = Field(False, description="성공 여부 (항상 False)")
    error: Dict = Field(..., description="에러 정보")

    class Config:
        json_schema_extra = {
            "example": {
                "success": False,
                "error": {
                    "code": "CLASSIFICATION_FAILED",
                    "message": "AI 분류 및 Fallback 모두 실패했습니다",
                    "details": "AI timeout | Fallback error"
                }
            }
        }


# ============================================================
# API Endpoints
# ============================================================

@router.post(
    "/analyze",
    response_model=SurveyResponse,
    status_code=status.HTTP_201_CREATED,
    summary="설문 분석 및 저장",
    description="AI 기반 피부 타입 분류 후 Supabase에 저장합니다"
)
async def analyze_survey(request: SurveyRequest):
    """
    설문 분석 API

    **플로우**:
    1. AI 분류 시도 (+ Fallback)
    2. Supabase에 응답 + 결과 저장
    3. 프론트엔드에 결과 반환

    **에러 처리**:
    - AI 및 Fallback 모두 실패 → 500 에러
    - Supabase 저장 실패 → 500 에러
    - 잘못된 요청 → 400 에러
    """
    try:
        # Step 0: share_url로 폼 조회
        supabase_client = get_supabase_client()
        form = supabase_client.get_form_by_share_url(request.share_url)

        if not form:
            logger.error(f"[FAIL] 폼을 찾을 수 없습니다 | share_url: {request.share_url}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={
                    "code": "FORM_NOT_FOUND",
                    "message": f"폼을 찾을 수 없습니다: {request.share_url}",
                    "details": None
                }
            )

        form_id = form["id"]  # UUID form_id 추출

        # Step 1: AI 분류 (+ Fallback)
        logger.info(f"=== 설문 분석 시작 ===")
        logger.info(f"member_id: {request.member_id}")
        logger.info(f"share_url: {request.share_url}")
        logger.info(f"form_id: {form_id}")

        result_type, source, ai_error = await classify_with_fallback(
            request.responses
        )

        # 분류 실패 처리
        if not result_type:
            logger.error(
                f"[FAIL] AI 및 Fallback 모두 실패 | "
                f"member_id: {request.member_id} | "
                f"error: {ai_error}"
            )
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail={
                    "code": "CLASSIFICATION_FAILED",
                    "message": "AI 분류 및 Fallback 모두 실패했습니다",
                    "details": ai_error
                }
            )

        # 분류 성공 로깅 (source별 구분)
        if source == "ai":
            logger.info(f"✅ [AI 분류 성공] result_type={result_type} | source={source}")
        elif source == "fallback":
            logger.warning(f"⚠️ [Fallback 분류 사용] result_type={result_type} | source={source} | ai_error={ai_error}")
        else:
            logger.info(f"[분류 완료] result_type={result_type} | source={source}")

        # Step 2: Supabase 저장
        result = {
            "type": result_type,
            "source": source,
            "ai_error": ai_error,
            "classified_at": datetime.now().isoformat()
        }

        # 기존 응답 확인
        existing_response = await supabase_client.get_form_response(
            member_id=request.member_id,
            form_id=form_id
        )

        if existing_response:
            # 응답 수정
            logger.info(f"기존 응답 수정 중...")
            saved_data = await supabase_client.update_form_response(
                member_id=request.member_id,
                form_id=form_id,
                responses=request.responses,
                result=result
            )
        else:
            # 새 응답 저장
            logger.info(f"새 응답 저장 중...")
            saved_data = await supabase_client.insert_form_response(
                member_id=request.member_id,
                form_id=form_id,
                responses=request.responses,
                result=result
            )

        logger.info(f"[SUCCESS] Supabase 저장 완료")

        # Step 3: 프론트엔드 응답
        return SurveyResponse(
            success=True,
            data={
                "result_type": result_type,
                "source": source,
                "response_id": saved_data.get("id")
            },
            message="분석 완료"
        )

    except HTTPException:
        # FastAPI HTTPException은 그대로 raise
        raise

    except Exception as e:
        # 예상치 못한 에러
        logger.error(f"[ERROR] 예상치 못한 에러: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "code": "INTERNAL_ERROR",
                "message": "서버 내부 에러가 발생했습니다",
                "details": str(e)
            }
        )


@router.get(
    "/health",
    summary="헬스 체크",
    description="API 서버 상태를 확인합니다"
)
async def health_check():
    """
    헬스 체크 API

    **응답**:
    - 200: 정상 작동
    - 500: AI 서비스 또는 DB 연결 문제
    """
    try:
        # AI 설정 확인
        from config.ai_config import AIConfig

        if not AIConfig.OPENAI_API_KEY:
            raise ValueError("OPENAI_API_KEY not configured")

        # Supabase 설정 확인
        from db.supabase_client import SupabaseConfig

        SupabaseConfig.validate_config()

        return {
            "status": "healthy",
            "ai_configured": True,
            "supabase_configured": True,
            "fallback_enabled": AIConfig.ENABLE_FALLBACK,
            "timestamp": datetime.now().isoformat()
        }

    except Exception as e:
        logger.error(f"[ERROR] Health check 실패: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "status": "unhealthy",
                "error": str(e)
            }
        )
