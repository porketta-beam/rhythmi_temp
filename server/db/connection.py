"""
데이터베이스 연결 모듈 (PostgreSQL 전용)

이 모듈은 PostgreSQL 연결을 관리합니다.
"""

import os
from typing import Optional
from sqlalchemy import create_engine, Engine
from sqlalchemy.engine import URL
from sqlalchemy.orm import sessionmaker, Session
from contextlib import contextmanager
from dotenv import load_dotenv, find_dotenv

# 어디서 실행하든 루트 .env를 찾아 로드
ENV_PATH = find_dotenv(".env", raise_error_if_not_found=False)
load_dotenv(ENV_PATH, override=True)


class DatabaseConnection:
    """데이터베이스 연결 관리 클래스 (PostgreSQL only)"""

    def __init__(self):
        self.engine: Optional[Engine] = None
        self.SessionLocal: Optional[sessionmaker] = None
        self._initialize_connection()

    def _initialize_connection(self):
        """PostgreSQL 연결 초기화"""
        # 개별 항목이 존재하면 이를 우선 사용 (비밀번호 특수문자 자동 인코딩 보장)
        user = os.getenv("user")
        password = os.getenv("password")
        host = os.getenv("host")
        port = os.getenv("port")
        dbname = os.getenv("dbname")

        url_obj: URL | str
        if user and password and host:
            port = port or "5432"
            dbname = dbname or "postgres"
            if not str(port).isdigit():
                raise RuntimeError("port 값이 유효하지 않습니다. 예: 5432")
            url_obj = URL.create(
                drivername="postgresql+psycopg2",
                username=user,
                password=password,
                host=host,
                port=int(port),
                database=dbname,
            )
        else:
            # 개별 항목이 없으면 DATABASE_URL 사용 (이미 퍼센트 인코딩되어 있어야 함)
            database_url = os.getenv("DATABASE_URL")
            if not database_url:
                raise RuntimeError(
                    "DATABASE_URL 또는 user/password/host 환경변수가 필요합니다. .env 설정을 확인하세요."
                )
            url_obj = database_url

        # 엔진 생성 (TLS 필수)
        self.engine = create_engine(
            url_obj,
            pool_size=10,
            max_overflow=20,
            pool_pre_ping=True,
            pool_recycle=3600,
            connect_args={"sslmode": "require"},
        )

        self.SessionLocal = sessionmaker(
            autocommit=False,
            autoflush=False,
            bind=self.engine,
        )

    def get_session(self) -> Session:
        if self.SessionLocal is None:
            raise RuntimeError("데이터베이스 연결이 초기화되지 않았습니다.")
        return self.SessionLocal()

    @contextmanager
    def get_db_session(self):
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
        if self.engine is None:
            raise RuntimeError("데이터베이스 연결이 초기화되지 않았습니다.")
        return self.engine

    def close_connection(self):
        if self.engine:
            self.engine.dispose()
            self.engine = None
            self.SessionLocal = None


# 전역 인스턴스
db_connection = DatabaseConnection()


def get_db():
    with db_connection.get_db_session() as session:
        yield session


def get_engine() -> Engine:
    return db_connection.get_engine()


def init_database():
    from .models import Base
    Base.metadata.create_all(bind=db_connection.get_engine())


def close_database():
    db_connection.close_connection()
