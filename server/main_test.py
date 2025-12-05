"""
테스트용 서버 - Lucky Draw API만 포함
DB 연결 없이 메모리 기반으로 동작
"""
from fastapi import FastAPI
import uvicorn
from fastapi.middleware.cors import CORSMiddleware
import os
import sys
import logging
import importlib.util

# api/__init__.py를 우회하여 luckydraw 모듈만 직접 로드
server_dir = os.path.dirname(os.path.abspath(__file__))
luckydraw_path = os.path.join(server_dir, "api", "luckydraw.py")

spec = importlib.util.spec_from_file_location("luckydraw", luckydraw_path)
luckydraw_module = importlib.util.module_from_spec(spec)
sys.modules["luckydraw"] = luckydraw_module
spec.loader.exec_module(luckydraw_module)

luckydraw_router = luckydraw_module.router

app = FastAPI(
    title="Event Manager - Test Server",
    description="Lucky Draw API Test Server",
    version="0.1.0"
)

# CORS 설정 - 테스트용 모든 origin 허용
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 로깅 설정
logging.basicConfig(
    level=logging.INFO,
    format='%(levelname)s:     %(name)s - %(message)s'
)

# Lucky Draw API 라우터 등록
app.include_router(luckydraw_router)

@app.get("/")
async def root():
    """루트 엔드포인트"""
    return {"message": "OK", "mode": "test"}

@app.get("/health")
async def health():
    """헬스체크 엔드포인트"""
    return {"status": "healthy", "mode": "test"}

if __name__ == "__main__":
    port = int(os.getenv("PORT", "8000"))
    print(f"[Test Server] Starting on port {port}")

    uvicorn.run(
        "main_test:app",
        host="0.0.0.0",
        port=port,
        reload=True
    )
