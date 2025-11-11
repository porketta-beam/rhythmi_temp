# Event Manager

이벤트 관리 애플리케이션 (Event Management Application)

## 📋 프로젝트 개요

- **Backend**: Python FastAPI
- **Frontend**: React (Vite)
- **Database**: PostgreSQL / SQLite
- **Package Manager**: Poetry

## 🚀 빠른 시작

### 전제 조건

- Python 3.10 이상
- Poetry 설치됨
- PostgreSQL (선택사항)

### Poetry 설치

```bash
# Windows (PowerShell)
(Invoke-WebRequest -Uri https://install.python-poetry.org -UseBasicParsing).Content | python -

# 또는 pip로 설치
pip install poetry
```

### 프로젝트 설정

```bash
# 1. 의존성 설치
poetry install

# 2. 환경 변수 설정
cp .env.example .env
# .env 파일을 편집하여 데이터베이스 연결 정보 입력

# 3. 가상환경 확인
poetry env info
```

### 서버 실행

```bash
# 방법 1: Poetry로 직접 실행
poetry run python server/main.py

# 방법 2: Uvicorn으로 실행 (개발 모드)
poetry run uvicorn server.main:app --reload --port 8000

# 방법 3: Poetry 쉘 활성화
poetry shell
python server/main.py
```

### 프론트엔드 실행

```bash
cd front
npm install
npm run dev
```

## 📁 프로젝트 구조

```
eventManager/
├── server/                 # Python Backend
│   ├── db/                # 데이터베이스 모듈
│   │   ├── __init__.py
│   │   └── connection.py
│   ├── service/           # 비즈니스 로직
│   ├── main.py            # FastAPI 앱 엔트리
│   ├── models.py          # SQLAlchemy 모델
│   └── test_connection.py # DB 연결 테스트
├── front/                 # React Frontend
├── docs/                  # 문서
├── pyproject.toml         # Poetry 설정
└── poetry.lock           # 패키지 버전 잠금
```

## 📚 Poetry 사용 가이드

### 기본 명령어

```bash
# 프로젝트 초기화 (이미 완료됨)
poetry init

# 의존성 설치
poetry install

# 가상환경 내에서 Python 실행
poetry run python server/main.py

# Poetry 쉘 활성화
poetry shell
```

### 패키지 관리

#### 라이브러리 추가

```bash
# 프로덕션 의존성 추가
poetry add fastapi
poetry add sqlalchemy

# 특정 버전 지정
poetry add "pytest>=7.0"

# 개발용 의존성 추가
poetry add --group dev pytest
poetry add --group dev black

# 옵션 포함
poetry add python-jose[cryptography]
```

#### 패키지 업데이트

```bash
# 모든 패키지 업데이트
poetry update

# 특정 패키지만 업데이트
poetry update fastapi

# 최신 버전으로
poetry add fastapi@latest
```

#### 패키지 제거

```bash
poetry remove 패키지이름
```

### 의존성 확인

```bash
# 설치된 패키지 목록
poetry show

# 트리 형태로 보기
poetry show --tree

# 특정 패키지 정보
poetry show fastapi
```

### 잠금 파일 관리

```bash
# pyproject.toml 수정 후 잠금 파일 갱신
poetry lock

# 잠금 파일 갱신 + 자동 설치
poetry lock --no-update && poetry install
```

### 가상환경 관리

```bash
# 가상환경 정보 확인
poetry env info

# 가상환경 목록
poetry env list

# 가상환경 삭제
poetry env remove python3.10

# 가상환경 경로 확인
poetry env info --path
```

## 🛠️ 개발 도구

### 코드 포맷팅

```bash
# Black으로 코드 포맷팅
poetry run black server/

# 특정 파일만
poetry run black server/main.py
```

### 린팅

```bash
# Flake8로 린트
poetry run flake8 server/

# 설정 가능: pyproject.toml에 [tool.flake8] 섹션 추가
```

### 테스트

```bash
# Pytest 실행
poetry run pytest

# 특정 파일만
poetry run pytest server/test_connection.py

# 커버리지 포함
poetry run pytest --cov=server
```

## 🔧 환경 설정

### 환경 변수

프로젝트 루트에 `.env` 파일을 생성하세요:

```env
# Database Configuration
user=your_db_user
password=your_db_password
host=localhost
port=5432
dbname=eventmanager

# 또는 DATABASE_URL 사용
DATABASE_URL=postgresql://user:password@host:port/dbname

# SQLite 사용 여부 (개발용)
USE_SQLITE=true
```

### 데이터베이스 연결 테스트

```bash
poetry run python server/test_connection.py
```

## 📝 개발 워크플로우

1. **작업 시작**
   ```bash
   poetry install
   poetry shell
   ```

2. **개발**
   ```bash
   # 서버 자동 리로드 모드
   poetry run python server/main.py
   
   # 또는
   poetry run uvicorn server.main:app --reload
   ```

3. **코드 정리**
   ```bash
   poetry run black server/
   poetry run flake8 server/
   ```

4. **테스트**
   ```bash
   poetry run pytest
   ```

5. **새 라이브러리 추가**
   ```bash
   poetry add 라이브러리이름
   ```

## 🌐 API 접근

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **Health Check**: http://localhost:8000/

## 📦 의존성

현재 설치된 주요 패키지:

- `fastapi`: 웹 프레임워크
- `uvicorn`: ASGI 서버
- `sqlalchemy`: ORM
- `psycopg2-binary`: PostgreSQL 드라이버
- `python-jose`: JWT 토큰 처리
- `passlib`: 비밀번호 해싱
- `python-dotenv`: 환경 변수 관리

전체 목록은 `poetry.lock` 파일을 참조하세요.

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

This project is licensed under the MIT License.

## 👥 팀

- Jeongu <jeongu@example.com>

---

## 🔗 유용한 링크

- [FastAPI 공식 문서](https://fastapi.tiangolo.com/)
- [Poetry 공식 문서](https://python-poetry.org/docs/)
- [SQLAlchemy 공식 문서](https://www.sqlalchemy.org/)
- [React 공식 문서](https://react.dev/)
