"""
데이터베이스 연결 모듈

이 모듈은 데이터베이스 연결을 관리하고 연결 풀을 제공합니다.
"""

import os
from typing import Optional
from sqlalchemy import create_engine, Engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import StaticPool
from contextlib import contextmanager
from dotenv import load_dotenv

# Load environment variables from .env (프로젝트 루트의 .env 파일)
load_dotenv("../.env")  # server/db 디렉토리에서 상위로 올라가서 .env 찾기


class DatabaseConnection:
    """데이터베이스 연결 관리 클래스"""
    
    def __init__(self):
        self.engine: Optional[Engine] = None
        self.SessionLocal: Optional[sessionmaker] = None
        self._initialize_connection()
    
    def _initialize_connection(self):
        """데이터베이스 연결 초기화"""
        # 환경변수에서 개별 연결 정보 가져오기
        user = os.getenv("user")
        password = os.getenv("password")
        host = os.getenv("host")
        port = os.getenv("port")
        dbname = os.getenv("dbname")
        
        # DATABASE_URL이 있으면 사용, 없으면 개별 정보로 구성
        database_url = os.getenv("DATABASE_URL")
        if not database_url:
            database_url = f"postgresql://{user}:{password}@{host}:{port}/{dbname}"
        
        # 개발용으로 SQLite 사용 (USE_SQLITE=false일 때 PostgreSQL 사용)
        use_sqlite = os.getenv("USE_SQLITE", "false").lower() == "true"
        
        if use_sqlite:
            database_url = "sqlite:///./eventmanager.db"
            self.engine = create_engine(
                database_url,
                poolclass=StaticPool,
                connect_args={"check_same_thread": False}
            )
        else:
            # PostgreSQL 연결 설정
            self.engine = create_engine(
                database_url,
                pool_size=10,
                max_overflow=20,
                pool_pre_ping=True,
                pool_recycle=3600
            )
        
        self.SessionLocal = sessionmaker(
            autocommit=False,
            autoflush=False,
            bind=self.engine
        )
    
    def get_session(self) -> Session:
        """데이터베이스 세션 반환"""
        if self.SessionLocal is None:
            raise RuntimeError("데이터베이스 연결이 초기화되지 않았습니다.")
        return self.SessionLocal()
    
    @contextmanager
    def get_db_session(self):
        """컨텍스트 매니저로 데이터베이스 세션 제공"""
        session = self.get_session()
        try:
            yield session
            session.commit()
        except Exception:
            session.rollback()
            raise
        finally:
            session.close()
    
    def get_engine(self) -> Engine:
        """SQLAlchemy 엔진 반환"""
        if self.engine is None:
            raise RuntimeError("데이터베이스 연결이 초기화되지 않았습니다.")
        return self.engine
    
    def close_connection(self):
        """데이터베이스 연결 종료"""
        if self.engine:
            self.engine.dispose()
            self.engine = None
            self.SessionLocal = None


# 전역 데이터베이스 연결 인스턴스
db_connection = DatabaseConnection()


def get_db():
    """FastAPI 의존성 주입을 위한 데이터베이스 세션 생성기"""
    with db_connection.get_db_session() as session:
        yield session


def get_engine() -> Engine:
    """데이터베이스 엔진 반환"""
    return db_connection.get_engine()


def init_database():
    """데이터베이스 초기화 (테이블 생성 등)"""
    from .models import Base
    Base.metadata.create_all(bind=db_connection.get_engine())


def close_database():
    """데이터베이스 연결 종료"""
    db_connection.close_connection()
