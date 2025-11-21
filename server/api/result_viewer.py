"""
결과 조회 API 엔드포인트

모바일 결과 페이지를 위한 memberId 기반 결과 조회 API
"""

import logging
from typing import Dict, Optional

from fastapi import APIRouter, HTTPException, status, Query

from db.supabase_client import get_supabase_client

logger = logging.getLogger(__name__)

# API 라우터 생성
router = APIRouter(
    prefix="/api/result",
    tags=["Result Viewer"]
)


# ============================================================
# API Endpoints
# ============================================================

@router.get(
    "",
    summary="설문 결과 조회",
    description="memberId로 Supabase에서 저장된 설문 결과를 조회합니다 (모바일 결과 페이지용)"
)
async def get_result(
    member_id: str = Query(..., description="회원 ID (UUID)"),
    share_url: str = Query(default="test/2", description="폼 공유 URL")
):
    """
    설문 결과 조회 API

    **사용 시나리오**:
    - 모바일 QR 코드 스캔 → `/test/2/share?memberId={id}`
    - 해당 페이지에서 GET /api/result?member_id={id}&share_url=test/2 호출
    - result_type 획득 → resultData[result_type] 표시

    **응답**:
    - 200: 결과 조회 성공
    - 404: 폼 또는 응답을 찾을 수 없음
    - 500: 서버 내부 에러
    """
    try:
        logger.info(f"=== 결과 조회 시작 ===")
        logger.info(f"member_id: {member_id}")
        logger.info(f"share_url: {share_url}")

        supabase_client = get_supabase_client()

        # Step 1: share_url로 form_id 조회
        form = supabase_client.get_form_by_share_url(share_url)

        if not form:
            logger.error(f"[FAIL] 폼을 찾을 수 없습니다 | share_url: {share_url}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={
                    "success": False,
                    "error": {
                        "code": "FORM_NOT_FOUND",
                        "message": f"폼을 찾을 수 없습니다: {share_url}",
                        "details": None
                    }
                }
            )

        form_id = form["id"]  # UUID form_id 추출
        logger.info(f"form_id: {form_id}")

        # Step 2: member_id로 응답 조회
        response = await supabase_client.get_form_response(
            member_id=member_id,
            form_id=form_id
        )

        if not response:
            logger.error(
                f"[FAIL] 응답을 찾을 수 없습니다 | "
                f"member_id: {member_id} | form_id: {form_id}"
            )
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={
                    "success": False,
                    "error": {
                        "code": "RESPONSE_NOT_FOUND",
                        "message": "이 회원의 설문 응답을 찾을 수 없습니다",
                        "details": f"member_id: {member_id}"
                    }
                }
            )

        # Step 3: result 정보 추출
        result = response.get("responses", {}).get("result", {})

        if not result:
            logger.error(f"[FAIL] result 정보가 없습니다 | response: {response}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail={
                    "success": False,
                    "error": {
                        "code": "RESULT_NOT_FOUND",
                        "message": "응답에 결과 정보가 포함되어 있지 않습니다",
                        "details": "result 필드 누락"
                    }
                }
            )

        # Step 4: 성공 응답
        logger.info(f"[SUCCESS] 결과 조회 완료 | result_type: {result.get('type')}")

        return {
            "success": True,
            "data": {
                "result_type": result.get("type"),
                "source": result.get("source"),
                "classified_at": result.get("classified_at"),
                "ai_error": result.get("ai_error")
            }
        }

    except HTTPException:
        # FastAPI HTTPException은 그대로 raise
        raise

    except Exception as e:
        # 예상치 못한 에러
        logger.error(f"[ERROR] 예상치 못한 에러: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "success": False,
                "error": {
                    "code": "INTERNAL_ERROR",
                    "message": "서버 내부 에러가 발생했습니다",
                    "details": str(e)
                }
            }
        )
