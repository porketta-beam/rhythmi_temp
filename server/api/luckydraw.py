"""
경품추첨 API 엔드포인트

참가자 추첨번호 할당 및 관리자 추첨 기능을 제공합니다.
REST API와 WebSocket 엔드포인트를 모두 포함합니다.
"""

import logging
from typing import Optional
from fastapi import APIRouter, HTTPException, status, Query, Header, WebSocket, WebSocketDisconnect
from pydantic import BaseModel, Field

from services import get_luckydraw_service, get_connection_manager

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
        service = get_luckydraw_service()
        result = await service.register_participant(
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
        service = get_luckydraw_service()
        participant = await service.get_participant_by_token(
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
        service = get_luckydraw_service()
        result = await service.get_all_participants(event_id)
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


class DrawAnimationRequest(BaseModel):
    """추첨 애니메이션 시작 요청"""
    prize_name: str = Field(..., description="상품 이름")
    prize_rank: int = Field(..., description="상품 등급")
    prize_image: Optional[str] = Field(None, description="상품 이미지 URL (선택)")
    draw_mode: str = Field("slot", description="추첨 모드 (slot, card, network)")
    winner_count: int = Field(1, description="당첨자 수 (slot: 1, card: 1-5, network: 1-10)")

    class Config:
        json_schema_extra = {
            "example": {
                "prize_name": "1등 상",
                "prize_rank": 1,
                "draw_mode": "slot",
                "winner_count": 1
            }
        }


@router.post(
    "/admin/{event_id}/draw/standby",
    summary="추첨 대기 시작",
    description="WebSocket으로 모든 클라이언트에 상품 정보 미리 알림"
)
async def standby_draw(event_id: str, request: DrawAnimationRequest):
    """
    추첨 대기 API

    **플로우**:
    1. 관리자가 상품 선택 후 '추첨 대기' 버튼 클릭
    2. 이 엔드포인트 호출 → 모든 클라이언트에 상품 정보 알림
    3. /lottery 페이지 → /lottery/main 페이지로 전환
    4. /lottery/waiting 페이지 → 상품 정보 표시
    5. /lottery/main 페이지 → 상품 안내 오버레이 표시
    6. 관리자가 '추첨 시작하기' 버튼 클릭 시 start-animation 호출
    """
    try:
        service = get_luckydraw_service()
        await service.standby_draw(
            event_id=event_id,
            prize_name=request.prize_name,
            prize_rank=request.prize_rank,
            prize_image=request.prize_image,
            draw_mode=request.draw_mode,
            winner_count=request.winner_count
        )

        return {
            "success": True,
            "message": "추첨 대기 시작"
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
    "/admin/{event_id}/draw/start-animation",
    summary="추첨 시작 (실제 추첨 실행)",
    description="추첨을 실행하고 결과를 임시 저장한 뒤, 모든 클라이언트에 애니메이션 시작 알림"
)
async def start_draw_animation(event_id: str, request: DrawAnimationRequest):
    """
    추첨 시작 API (추첨 실행 + 애니메이션 시작)

    **플로우**:
    1. 관리자가 '추첨 시작' 버튼 클릭
    2. 서버에서 실제 추첨 실행 (당첨번호 결정)
    3. 결과를 임시 저장 (pending_draw)
    4. 모든 클라이언트에 draw_started 브로드캐스트 (당첨번호 미포함)
    5. '결과 발표' 버튼 클릭 시 /reveal 엔드포인트 호출
    """
    try:
        service = get_luckydraw_service()
        result = await service.start_draw_animation(
            event_id=event_id,
            prize_name=request.prize_name,
            prize_rank=request.prize_rank,
            prize_image=request.prize_image,
            draw_mode=request.draw_mode,
            winner_count=request.winner_count
        )

        return {
            "success": True,
            "message": result.get("message", "추첨이 완료되었습니다.")
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
    "/admin/{event_id}/draw/reveal",
    summary="결과 발표",
    description="main 페이지에 당첨번호를 전송하여 결과 애니메이션 시작"
)
async def reveal_winner(event_id: str):
    """
    결과 발표 API

    **플로우**:
    1. 관리자가 '결과 발표' 버튼 클릭
    2. pending_draw의 당첨번호를 main 페이지에 전송 (winner_revealed)
    3. main에서 슬롯 정지 + 결과 애니메이션
    4. main 애니메이션 완료 시 WebSocket으로 draw_complete 전송
    5. 서버가 waiting/admin에 winner_announced 브로드캐스트
    """
    try:
        service = get_luckydraw_service()
        result = await service.reveal_winner(event_id=event_id)

        return {
            "success": True,
            "data": result
        }

    except ValueError as e:
        logger.error(f"[ERROR] 결과 발표 실패: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "code": "REVEAL_FAILED",
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
    "/admin/{event_id}/draw/complete",
    summary="추첨 완료 (기록 저장)",
    description="추첨 결과를 이력에 기록하고 waiting/admin에 알림"
)
async def complete_draw(event_id: str):
    """
    추첨 완료 API

    **용도**:
    - WebSocket 없이 REST API만으로 추첨을 완료할 때 사용
    - reveal 호출 후 이 엔드포인트를 호출하면 추첨 이력이 기록됨

    **플로우**:
    1. reveal 호출 → 당첨번호 공개
    2. complete 호출 → draws에 기록 + waiting/admin 알림
    """
    try:
        service = get_luckydraw_service()
        result = await service.complete_draw(event_id=event_id)

        return {
            "success": True,
            "data": result
        }

    except ValueError as e:
        logger.error(f"[ERROR] 추첨 완료 실패: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "code": "COMPLETE_FAILED",
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
    "/check-winner",
    summary="당첨 여부 확인",
    description="특정 추첨번호의 당첨 여부를 확인합니다"
)
async def check_winner(event_id: str, draw_number: int):
    """
    당첨 여부 확인 API

    재접속 시 클라이언트가 당첨 여부를 확인할 때 사용합니다.

    **반환값**:
    - won: 당첨 여부 (true/false)
    - prizes: 당첨된 상품 목록 (복수 당첨 시)
    """
    try:
        service = get_luckydraw_service()
        result = service.check_winner(event_id, draw_number)

        return {
            "success": True,
            "data": result
        }

    except Exception as e:
        logger.error(f"[ERROR] 당첨 확인 실패: {str(e)}", exc_info=True)
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
        service = get_luckydraw_service()
        result = await service.reset_event(
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
        service = get_luckydraw_service()
        draws = await service.get_draw_history(event_id)
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


@router.get(
    "/admin/{event_id}/winners",
    summary="당첨자 정보 목록 조회",
    description="당첨자들의 개인정보 목록 조회 (연락처 마스킹)"
)
async def get_winners_info(event_id: str):
    """
    당첨자 정보 목록 조회 API

    **응답**:
    - winners: 당첨자 정보 목록
      - draw_number: 당첨 번호
      - prize_name: 상품 이름
      - name: 당첨자 이름
      - phone: 연락처 (마스킹: 010-****-5678)
      - submitted_at: 제출 시간
    """
    try:
        service = get_luckydraw_service()
        winners = service.get_winners_info(event_id)
        return {
            "success": True,
            "data": {
                "winners": winners,
                "total_count": len(winners)
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


# ============================================================
# WebSocket 엔드포인트
# ============================================================

@router.websocket("/ws/{event_id}")
async def websocket_luckydraw(websocket: WebSocket, event_id: str):
    """
    경품추첨 실시간 WebSocket 엔드포인트

    최종 경로: /api/luckydraw/ws/{event_id}

    클라이언트 연결 후:
    - 참가자 등록/업데이트 알림 수신
    - 추첨 시작/결과 알림 수신
    - 이벤트 리셋 알림 수신

    서버→클라이언트 메시지 타입:
    - participant_joined: 새 참가자 등록
    - draw_standby: 추첨 대기 (상품 정보)
    - draw_started: 추첨 시작 (애니메이션 시작)
    - winner_revealed: 결과 발표 (main만 처리)
    - winner_announced: 당첨자 발표 (waiting/admin 처리)
    - event_reset: 이벤트 리셋
    - connection_count: 연결 수 업데이트

    클라이언트→서버 메시지 타입:
    - ping: heartbeat
    - identify: 클라이언트 식별 (draw_number 전송 → 당첨 여부 응답)
    - draw_complete: main 애니메이션 완료 알림
    """
    connection_manager = get_connection_manager()

    try:
        # 연결 수락 및 등록
        await connection_manager.connect(websocket, event_id)
        logger.info(f"[WS] 클라이언트 연결: event_id={event_id}")

        # 연결 유지 (메시지 수신 대기)
        while True:
            # 클라이언트로부터 메시지 수신
            data = await websocket.receive_json()
            msg_type = data.get("type")

            # ping/pong heartbeat 처리
            if msg_type == "ping":
                await websocket.send_json({"type": "pong"})

            # identify: 클라이언트 식별 및 당첨 여부 확인
            elif msg_type == "identify":
                draw_number = data.get("draw_number")
                if draw_number is not None:
                    try:
                        service = get_luckydraw_service()
                        result = service.check_winner(event_id, int(draw_number))
                        if result["won"]:
                            # 이미 당첨된 경우 알림
                            await websocket.send_json({
                                "type": "already_won",
                                "won": True,
                                "prizes": result["prizes"]
                            })
                            logger.info(f"[WS] already_won 전송: draw_number={draw_number}")
                        else:
                            await websocket.send_json({
                                "type": "identify_ack",
                                "won": False
                            })
                    except Exception as e:
                        logger.error(f"[WS] identify 처리 오류: {e}")
                        await websocket.send_json({
                            "type": "identify_ack",
                            "won": False,
                            "error": str(e)
                        })

            # draw_complete: main 애니메이션 완료 → waiting/admin에 당첨번호 전송
            elif msg_type == "draw_complete":
                logger.info(f"[WS] draw_complete 수신: event_id={event_id}")
                try:
                    service = get_luckydraw_service()
                    result = await service.complete_draw(event_id)
                    # 성공 응답
                    await websocket.send_json({
                        "type": "draw_complete_ack",
                        "success": True,
                        "winners": result.get("winners", [])
                    })
                except ValueError as e:
                    logger.error(f"[WS] draw_complete 처리 실패: {e}")
                    await websocket.send_json({
                        "type": "draw_complete_ack",
                        "success": False,
                        "error": str(e)
                    })
                except Exception as e:
                    logger.error(f"[WS] draw_complete 처리 오류: {e}")
                    await websocket.send_json({
                        "type": "draw_complete_ack",
                        "success": False,
                        "error": "서버 오류"
                    })

            # submit_winner_info: 당첨자가 개인정보 제출
            elif msg_type == "submit_winner_info":
                logger.info(f"[WS] submit_winner_info 수신: event_id={event_id}")
                try:
                    service = get_luckydraw_service()
                    result = await service.submit_winner_info(
                        event_id=data.get("event_id", event_id),
                        draw_number=data.get("draw_number"),
                        prize_name=data.get("prize_name"),
                        name=data.get("name"),
                        phone=data.get("phone")
                    )
                    # 성공 응답
                    await websocket.send_json({
                        "type": "submit_winner_info_ack",
                        "success": True,
                        "message": result.get("message", "제출 완료")
                    })
                except ValueError as e:
                    logger.error(f"[WS] submit_winner_info 처리 실패: {e}")
                    await websocket.send_json({
                        "type": "submit_winner_info_ack",
                        "success": False,
                        "error": str(e)
                    })
                except Exception as e:
                    logger.error(f"[WS] submit_winner_info 처리 오류: {e}")
                    await websocket.send_json({
                        "type": "submit_winner_info_ack",
                        "success": False,
                        "error": "서버 오류"
                    })

    except WebSocketDisconnect:
        connection_manager.disconnect(websocket, event_id)
        logger.info(f"[WS] 클라이언트 연결 해제: event_id={event_id}")

    except Exception as e:
        connection_manager.disconnect(websocket, event_id)
        logger.error(f"[WS] 연결 오류: {e}")
