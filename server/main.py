from fastapi import FastAPI
import uvicorn
from fastapi.middleware.cors import CORSMiddleware
import os
import logging
# API 라우터 import
from api import (
    survey_router,
    result_router,
    luckydraw_router,
    events_router,
    forms_router,
    admins_router
)

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
    FRONT_URLS = [
        url.strip() for url in FRONT_URLS_STR.split(",") if url.strip()
    ]
    DEFAULT_DEPLOYMENT_ORIGINS = [
        "https://event-manager-gax2.vercel.app",
    ]
    allowed_origins = (
        [FRONT_URL] + FRONT_URLS + DEFAULT_DEPLOYMENT_ORIGINS +
        ["http://127.0.0.1:3000", "http://localhost:3000"]
    )
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

# API 라우터 등록
app.include_router(survey_router)      # 설문 분석
app.include_router(result_router)      # 설문 결과 조회
app.include_router(luckydraw_router)   # 경품추첨
app.include_router(events_router)      # 이벤트 관리
app.include_router(forms_router)       # 폼 관리
app.include_router(admins_router)      # 관리자 관리


@app.get("/")
async def root():
    """루트 엔드포인트"""
    return {"message": "OK"}


# WebSocket 엔드포인트는 api/luckydraw.py의 luckydraw_router에서 관리됩니다.
# 경로: /api/luckydraw/ws/{event_id}


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
