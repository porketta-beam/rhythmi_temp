# EventManager Server

피부 진단 설문 및 AI 분류 서비스를 제공하는 FastAPI 백엔드 서버입니다.

## 📦 설치

### Poetry 사용 (권장)

```bash
# Poetry 설치 (처음 한 번만)
pip install poetry

# 의존성 설치
cd server
poetry install

# 가상환경 활성화
poetry shell
```

### Pip 사용

```bash
cd server
pip install -r requirements.txt
```

## 🚀 실행

```bash
# Poetry 사용 시
poetry run python main.py

# 또는 가상환경 활성화 후
poetry shell
python main.py

# Pip 사용 시
python main.py
```

## ⚙️ 환경 설정

### 1. 환경 변수 파일 생성

```bash
cp .env.example .env
```

### 2. API 키 설정

`.env` 파일을 열어서 다음 값들을 입력하세요:

```env
# OpenAI API 키 (필수)
OPENAI_API_KEY=sk-proj-your-key-here

# Supabase 설정 (선택)
SUPABASE_URL=your-supabase-url
SUPABASE_KEY=your-supabase-key
```

### 3. 설정 검증

```bash
python tests/test_ai_config.py
```

## 🧪 테스트

```bash
# Poetry 사용 시
poetry run pytest

# Pip 사용 시
pytest
```

## 📁 프로젝트 구조

```
server/
├── config/              # 설정 파일
│   ├── __init__.py
│   └── ai_config.py     # AI 서비스 설정
├── db/                  # 데이터베이스
│   ├── __init__.py
│   └── connection.py
├── services/            # 비즈니스 로직 (예정)
├── tests/               # 테스트
│   ├── __init__.py
│   └── test_ai_config.py
├── .env.example         # 환경 변수 템플릿
├── .gitignore
├── main.py              # FastAPI 진입점
├── pyproject.toml       # Poetry 설정
└── requirements.txt     # Pip 의존성
```

## 📚 주요 의존성

- **FastAPI**: 웹 프레임워크
- **OpenAI**: AI 분류 서비스
- **SQLAlchemy**: ORM
- **Pydantic**: 데이터 검증
- **python-dotenv**: 환경 변수 관리

## 🔧 개발 도구

```bash
# 코드 포맷팅 (Black)
poetry run black .

# 린팅 (Ruff)
poetry run ruff check .

# 타입 체킹 (MyPy)
poetry run mypy .
```
