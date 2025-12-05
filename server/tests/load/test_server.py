"""
부하 테스트용 경량 서버

LuckyDraw API만 포함하여 DB 의존성 없이 테스트합니다.
"""

from fastapi import FastAPI
import uvicorn
from fastapi.middleware.cors import CORSMiddleware
import sys
import os

# 상위 디렉토리를 path에 추가
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

# api/__init__.py를 거치지 않고 직접 import
import importlib.util
spec = importlib.util.spec_from_file_location(
    "luckydraw",
    os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "api", "luckydraw.py")
)
luckydraw_module = importlib.util.module_from_spec(spec)
sys.modules["api.luckydraw"] = luckydraw_module
spec.loader.exec_module(luckydraw_module)
luckydraw_router = luckydraw_module.router

app = FastAPI(
    title="LuckyDraw Load Test Server",
    description="부하 테스트용 경량 서버",
    version="1.0.0"
)

# CORS 설정 (테스트용: 모든 origin 허용)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# LuckyDraw 라우터만 등록
app.include_router(luckydraw_router)


@app.get("/")
async def root():
    """루트 엔드포인트"""
    return {"message": "LuckyDraw Test Server OK"}


@app.get("/health")
async def health():
    """헬스체크 엔드포인트"""
    return {"status": "healthy"}


if __name__ == "__main__":
    print("=" * 60)
    print("LuckyDraw 부하 테스트 서버 시작")
    print("=" * 60)
    print("  URL: http://localhost:8000")
    print("  WebSocket: ws://localhost:8000/api/luckydraw/ws/{event_id}")
    print("=" * 60)

    uvicorn.run(
        "test_server:app",
        host="0.0.0.0",
        port=8000,
        reload=False,  # 테스트 시 reload 비활성화
        log_level="warning"  # 로그 레벨 낮춤
    )
