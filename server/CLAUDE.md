# eventManager Server - 폼 데이터 관리 가이드

**버전:** 1.0  
**최종 업데이트:** 2025-10-21  
**작성자:** 개발팀

---

## 목차

1. [개요](#개요)
2. [버전 관리 전략](#버전-관리-전략)
3. [마이그레이션 전략 구현](#마이그레이션-전략-구현)
4. [폼 관리 기능](#폼-관리-기능)
5. [응답 검증 로직](#응답-검증-로직)
6. [폼 응답 처리](#폼-응답-처리)
7. [API 엔드포인트 설계](#api-엔드포인트-설계)

---

## 개요

### 설계 원칙

1. **버전 관리**: 폼 수정 시 새로운 버전 생성으로 기존 응답 보호
2. **호환성 보장**: 삭제/수정된 필드 추적으로 이전 응답과 호환성 유지
3. **데이터 무결성**: 응답 검증 로직으로 데이터 품질 보장
4. **유연한 조회**: 버전별 응답 조회 및 통계 집계 지원

### 참고 문서

- [폼 데이터 스펙](../docs/design/FORM_DATA.md) - JSON 구조 및 필드 타입 정의
- [DB 스키마 명세](../docs/design/DB_SCHEMA_SPEC.md) - 테이블 구조
- [API 명세서](../docs/api/MVP_API_SPEC.md) - REST API 엔드포인트

---

## 버전 관리 전략

### 버전 관리 규칙

1. **폼 생성**: 초기 버전은 항상 1번
2. **폼 수정**: 버전을 1씩 증가시키며 마이그레이션 정보 기록
3. **응답 제출**: 항상 최신 폼 버전으로 응답 제출
4. **응답 조회**: 각 응답의 버전 정보로 호환성 보장

### 버전 관리 데이터 구조

```python
{
    "form_id": "frm_5g7j9l2m",
    "event_id": "evt_7x9k2m4n",
    "title": "참석 의향 조사",
    "description": "설문 설명",
    "fields": [...],  # FormField 배열
    "metadata": {
        "form_version": 1,  # 버전 번호
        "created_at": "2025-10-03T09:00:00Z",
        "updated_at": "2025-10-03T09:00:00Z",
        "active": True,
        "migration": {  # 수정 시에만 존재
            "deleted_fields": [],  # 삭제된 field_id 리스트
            "added_fields": [],    # 추가된 field_id 리스트
            "modified_fields": [] # 수정된 field_id 리스트
        }
    }
}
```

### 버전 관리 시나리오

#### 시나리오 1: 폼 필드 추가

```json
{
    "form_id": "frm_5g7j9l2m",
    "fields": [
        { "id": "field_001", "type": "yes_no", ... },
        { "id": "field_002", "type": "text", ... },
        { "id": "field_003", "type": "number", ... }  // 새로 추가
    ],
    "metadata": {
        "form_version": 2,
        "migration": {
            "deleted_fields": [],
            "added_fields": ["field_003"],
            "modified_fields": []
        }
    }
}
```

#### 시나리오 2: 폼 필드 삭제

```json
{
    "form_id": "frm_5g7j9l2m",
    "fields": [
        { "id": "field_001", "type": "yes_no", ... }
        // field_002가 삭제됨
    ],
    "metadata": {
        "form_version": 3,
        "migration": {
            "deleted_fields": ["field_002"],
            "added_fields": [],
            "modified_fields": []
        }
    }
}
```

#### 시나리오 3: 폼 필드 수정

```json
{
    "form_id": "frm_5g7j9l2m",
    "fields": [
        { "id": "field_001", "type": "text", "label": "새로운 질문", ... }
        // field_001의 label이 변경됨
    ],
    "metadata": {
        "form_version": 4,
        "migration": {
            "deleted_fields": [],
            "added_fields": [],
            "modified_fields": ["field_001"]
        }
    }
}
```

---

## 마이그레이션 전략 구현

### 1. 필드 변경 추적 함수

```python
def track_field_changes(old_form: dict, new_fields: list) -> dict:
    """
    폼 필드의 변경 사항을 추적합니다.
    
    Args:
        old_form: 기존 폼 데이터
        new_fields: 새로운 필드 목록
    
    Returns:
        migration 정보 (deleted, added, modified)
    """
    old_fields = {f["id"]: f for f in old_form["fields"]}
    new_field_dict = {f["id"]: f for f in new_fields}
    
    old_field_ids = set(old_fields.keys())
    new_field_ids = set(new_field_dict.keys())
    
    # 삭제된 필드: 기존에 있지만 새로운 필드에는 없음
    deleted = list(old_field_ids - new_field_ids)
    
    # 추가된 필드: 새로운 필드에는 있지만 기존에는 없음
    added = list(new_field_ids - old_field_ids)
    
    # 수정된 필드: 양쪽에 모두 있지만 내용이 다름
    modified = [
        field_id for field_id in (old_field_ids & new_field_ids)
        if old_fields[field_id] != new_field_dict[field_id]
    ]
    
    return {
        "deleted_fields": deleted,
        "added_fields": added,
        "modified_fields": modified
    }
```

### 2. 폼 수정 함수 (버전 증가)

```python
def update_form_with_versioning(
    form_id: str,
    updates: dict,
    db_collection
) -> dict:
    """
    폼을 수정하고 버전을 증가시킵니다.
    
    Args:
        form_id: 폼 ID
        updates: 수정할 내용 (title, description, fields 등)
        db_collection: MongoDB 컬렉션
    
    Returns:
        업데이트된 폼 데이터
    """
    old_form = db_collection.find_one({"form_id": form_id})
    if not old_form:
        raise ValueError(f"Form {form_id} not found")
    
    # 필드 변경 추적
    migration = {}
    if "fields" in updates:
        migration = track_field_changes(old_form, updates["fields"])
    
    # 새 버전 생성
    updated_form = {
        **old_form,
        **{k: v for k, v in updates.items() if k != "fields"},  # fields 제외하고 먼저 업데이트
        "fields": updates.get("fields", old_form["fields"]),
        "metadata": {
            **old_form["metadata"],
            "form_version": old_form["metadata"]["form_version"] + 1,
            "updated_at": datetime.now().isoformat(),
            "migration": migration
        }
    }
    
    # DB 업데이트
    db_collection.update_one(
        {"form_id": form_id},
        {"$set": updated_form}
    )
    
    return updated_form
```

---

## 폼 관리 기능

### 1. 폼 생성

```python
def create_form(
    event_id: str,
    title: str,
    description: str = None,
    fields: list = None,
    db_collection
) -> dict:
    """
    새 폼을 생성합니다.
    
    Args:
        event_id: 이벤트 ID
        title: 폼 제목
        description: 폼 설명
        fields: 필드 목록
        db_collection: MongoDB 컬렉션
    
    Returns:
        생성된 폼 데이터
    """
    form_data = {
        "form_id": generate_uuid(),
        "event_id": event_id,
        "title": title,
        "description": description,
        "fields": fields or [],
        "share_url": generate_share_url(),
        "active": True,
        "metadata": {
            "form_version": 1,
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat(),
            "expires_at": None
        }
    }
    
    # DB 저장
    db_collection.insert_one(form_data)
    return form_data
```

### 2. 폼 조회

```python
def get_form(form_id: str, db_collection) -> dict:
    """
    폼을 조회합니다.
    
    Args:
        form_id: 폼 ID
        db_collection: MongoDB 컬렉션
    
    Returns:
        폼 데이터
    """
    form = db_collection.find_one({"form_id": form_id})
    if not form:
        raise ValueError(f"Form {form_id} not found")
    
    return form

def get_form_by_share_url(share_url: str, db_collection) -> dict:
    """
    공유 URL로 폼을 조회합니다.
    
    Args:
        share_url: 공유 URL
        db_collection: MongoDB 컬렉션
    
    Returns:
        폼 데이터
    """
    form = db_collection.find_one({"share_url": share_url})
    if not form:
        raise ValueError(f"Form not found for share_url: {share_url}")
    
    return form
```

### 3. 폼 목록 조회

```python
def list_forms(
    event_id: str,
    status: str = "all",
    db_collection
) -> list:
    """
    이벤트의 폼 목록을 조회합니다.
    
    Args:
        event_id: 이벤트 ID
        status: 필터 (all, active, inactive)
        db_collection: MongoDB 컬렉션
    
    Returns:
        폼 목록
    """
    query = {"event_id": event_id}
    
    if status == "active":
        query["active"] = True
    elif status == "inactive":
        query["active"] = False
    
    forms = list(db_collection.find(query))
    return forms
```

---

## 응답 검증 로직

### 1. 필드별 값 검증

```python
def validate_field_value(field: dict, value: any) -> str:
    """
    개별 필드의 값을 검증합니다.
    
    Args:
        field: 필드 정의
        value: 입력 값
    
    Returns:
        에러 메시지 (검증 통과시 None)
    """
    if value is None and field.get("required"):
        return f"{field['label']}은(는) 필수입니다"
    
    field_type = field.get("type")
    validation = field.get("validation", {})
    
    # 타입별 검증
    if field_type in ["text", "long_text"]:
        if value:
            if validation.get("minLength") and len(value) < validation["minLength"]:
                return f"최소 {validation['minLength']}자 이상 입력해주세요"
            if validation.get("maxLength") and len(value) > validation["maxLength"]:
                return f"최대 {validation['maxLength']}자까지 입력 가능합니다"
            if validation.get("pattern") and not re.match(validation["pattern"], value):
                return validation.get("customMessage", "올바른 형식이 아닙니다")
    
    elif field_type == "number":
        if value is not None:
            if validation.get("min") and value < validation["min"]:
                return f"{validation['min']} 이상의 값을 입력해주세요"
            if validation.get("max") and value > validation["max"]:
                return f"{validation['max']} 이하의 값을 입력해주세요"
    
    elif field_type == "multiple_choice":
        if value and field.get("options") and value not in field["options"]:
            return "유효하지 않은 선택입니다"
    
    elif field_type == "checkbox":
        if value and (not isinstance(value, list) or len(value) == 0):
            return "최소 1개 이상 선택해주세요"
    
    elif field_type == "email":
        if value and not re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', value):
            return "올바른 이메일 형식이 아닙니다"
    
    elif field_type == "phone":
        if value and not re.match(r'^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$', value):
            return "올바른 전화번호 형식이 아닙니다 (010-XXXX-XXXX)"
    
    return None
```

### 2. 전체 응답 검증

```python
def validate_form_response(
    form_id: str,
    response_data: dict,
    db_collection
) -> tuple[bool, dict]:
    """
    폼 응답을 검증합니다.
    
    Args:
        form_id: 폼 ID
        response_data: 응답 데이터 (form_version 포함)
        db_collection: MongoDB 컬렉션
    
    Returns:
        (is_valid, errors)
    """
    form = get_form(form_id, db_collection)
    current_version = form["metadata"]["form_version"]
    response_version = response_data.get("form_version", 1)
    
    errors = {}
    
    # 버전 불일치 처리
    if response_version < current_version:
        # 삭제된 필드는 검증 제외
        deleted_fields = form["metadata"].get("migration", {}).get("deleted_fields", [])
        
        for field in form["fields"]:
            field_id = field["id"]
            
            # 삭제된 필드는 무시
            if field_id in deleted_fields:
                continue
            
            # 필수 필드 검증
            if field.get("required") and field_id not in response_data.get("responses", {}):
                errors[field_id] = f"{field['label']}은(는) 필수입니다"
            else:
                # 값 검증
                value = response_data.get("responses", {}).get(field_id)
                field_error = validate_field_value(field, value)
                if field_error:
                    errors[field_id] = field_error
    else:
        # 현재 버전 검증
        for field in form["fields"]:
            field_id = field["id"]
            value = response_data.get("responses", {}).get(field_id)
            
            # 필수 필드 검증
            if field.get("required") and not value:
                errors[field_id] = f"{field['label']}은(는) 필수입니다"
            
            # 값 검증
            field_error = validate_field_value(field, value)
            if field_error:
                errors[field_id] = field_error
    
    return len(errors) == 0, errors
```

---

## 폼 응답 처리

### 1. 응답 저장

```python
def save_form_response(
    form_id: str,
    member_id: str,
    responses: dict,
    db_collection
) -> dict:
    """
    폼 응답을 저장합니다.
    
    Args:
        form_id: 폼 ID
        member_id: 회원 ID
        responses: 응답 데이터
        db_collection: MongoDB 컬렉션
    
    Returns:
        저장된 응답 데이터
    """
    form = get_form(form_id, db_collection)
    
    # 중복 응답 체크
    existing_response = db_collection.responses.find_one({
        "form_id": form_id,
        "member_id": member_id
    })
    
    if existing_response:
        # 응답 수정 (같은 버전으로만)
        updated_response = {
            **existing_response,
            "responses": responses,
            "form_version": form["metadata"]["form_version"],
            "updated_at": datetime.now().isoformat()
        }
        db_collection.responses.update_one(
            {"response_id": existing_response["response_id"]},
            {"$set": updated_response}
        )
        return updated_response
    else:
        # 새 응답 생성
        response_data = {
            "response_id": generate_uuid(),
            "form_id": form_id,
            "member_id": member_id,
            "responses": responses,
            "form_version": form["metadata"]["form_version"],
            "submitted_at": datetime.now().isoformat(),
            "updated_at": None
        }
        db_collection.responses.insert_one(response_data)
        return response_data
```

### 2. 응답 조회

```python
def get_responses(
    form_id: str,
    include_member_info: bool = False,
    db_collection
) -> list:
    """
    폼의 응답 목록을 조회합니다.
    
    Args:
        form_id: 폼 ID
        include_member_info: 회원 정보 포함 여부
        db_collection: MongoDB 컬렉션
    
    Returns:
        응답 목록
    """
    responses = list(db_collection.responses.find({"form_id": form_id}))
    
    if include_member_info:
        # 회원 정보 추가 (보안 서비스 호출)
        for response in responses:
            member_info = get_member_info(response["member_id"])  # 별도 API 호출
            response["member"] = {
                "name": member_info["name"],
                "phone_number": mask_phone(member_info["phone_number"])
            }
    
    return responses

def get_form_statistics(form_id: str, db_collection) -> dict:
    """
    폼의 응답 통계를 집계합니다.
    
    Args:
        form_id: 폼 ID
        db_collection: MongoDB 컬렉션
    
    Returns:
        통계 데이터
    """
    form = get_form(form_id, db_collection)
    responses = list(db_collection.responses.find({"form_id": form_id}))
    
    stats = {
        "total_responses": len(responses),
        "response_rate": 0,  # eligible_members 대비
        "field_stats": []
    }
    
    # 필드별 통계 집계
    for field in form["fields"]:
        field_id = field["id"]
        field_stats = {
            "field_id": field_id,
            "label": field["label"],
            "type": field["type"],
            "responses": 0,
            "answers": {}
        }
        
        for response in responses:
            if field_id in response["responses"]:
                field_stats["responses"] += 1
                answer = response["responses"][field_id]
                
                if isinstance(answer, list):
                    for a in answer:
                        field_stats["answers"][a] = field_stats["answers"].get(a, 0) + 1
                else:
                    field_stats["answers"][str(answer)] = field_stats["answers"].get(str(answer), 0) + 1
        
        stats["field_stats"].append(field_stats)
    
    return stats
```

---

## API 엔드포인트 설계

### 1. 폼 생성

```python
@app.post("/api/events/{event_id}/forms")
async def create_form_endpoint(
    event_id: str,
    form_data: dict,
    db: MongoDB
):
    """설문 폼을 생성합니다."""
    form = create_form(
        event_id=event_id,
        title=form_data["title"],
        description=form_data.get("description"),
        fields=form_data.get("fields", []),
        db_collection=db.forms
    )
    return JSONResponse(
        status_code=201,
        content=form
    )
```

### 2. 폼 수정

```python
@app.put("/api/events/{event_id}/forms/{form_id}")
async def update_form_endpoint(
    event_id: str,
    form_id: str,
    updates: dict,
    db: MongoDB
):
    """설문 폼을 수정합니다."""
    updated_form = update_form_with_versioning(
        form_id=form_id,
        updates=updates,
        db_collection=db.forms
    )
    return JSONResponse(content=updated_form)
```

### 3. 응답 제출

```python
@app.post("/api/forms/{share_url}/responses")
async def submit_response_endpoint(
    share_url: str,
    response_data: dict,
    db: MongoDB
):
    """설문 응답을 제출합니다."""
    # 폼 조회
    form = get_form_by_share_url(share_url, db.forms)
    
    # 검증
    is_valid, errors = validate_form_response(
        form_id=form["form_id"],
        response_data={
            "responses": response_data["responses"],
            "form_version": form["metadata"]["form_version"]
        },
        db_collection=db.forms
    )
    
    if not is_valid:
        return JSONResponse(
            status_code=400,
            content={"error": {"code": "VALIDATION_ERROR", "errors": errors}}
        )
    
    # 응답 저장
    response = save_form_response(
        form_id=form["form_id"],
        member_id=response_data["member_id"],
        responses=response_data["responses"],
        db_collection=db
    )
    
    return JSONResponse(
        status_code=201,
        content=response
    )
```

### 4. 응답 조회

```python
@app.get("/api/events/{event_id}/forms/{form_id}/responses")
async def get_responses_endpoint(
    event_id: str,
    form_id: str,
    include_member_info: bool = False,
    db: MongoDB
):
    """설문 응답 목록을 조회합니다."""
    responses = get_responses(
        form_id=form_id,
        include_member_info=include_member_info,
        db_collection=db
    )
    return JSONResponse(content={"responses": responses})
```

### 5. 응답 통계

```python
@app.get("/api/events/{event_id}/forms/{form_id}/stats")
async def get_form_stats_endpoint(
    event_id: str,
    form_id: str,
    db: MongoDB
):
    """설문 응답 통계를 조회합니다."""
    stats = get_form_statistics(form_id, db)
    return JSONResponse(content=stats)
```

---

## 유틸리티 함수

### UUID 생성

```python
import uuid

def generate_uuid(prefix: str = "") -> str:
    """UUID를 생성합니다."""
    return f"{prefix}{uuid.uuid4().hex}" if prefix else str(uuid.uuid4())
```

### 공유 URL 생성

```python
import random
import string

def generate_share_url(length: int = 6) -> str:
    """공유 URL 코드를 생성합니다."""
    chars = string.ascii_letters + string.digits
    return ''.join(random.choice(chars) for _ in range(length))
```

### 전화번호 마스킹

```python
def mask_phone(phone: str) -> str:
    """전화번호를 마스킹합니다 (010-****-5678)."""
    parts = phone.split('-')
    if len(parts) == 3:
        return f"{parts[0]}-****-{parts[2]}"
    return phone
```

---

## 참고 자료

- [폼 데이터 스펙](../docs/design/FORM_DATA.md) - 폼 JSON 구조
- [DB 스키마](../docs/design/DB_SCHEMA_SPEC.md) - 테이블 정의
- [API 명세서](../docs/api/MVP_API_SPEC.md) - REST API 명세

---

**문서 버전:** 1.0  
**최종 업데이트:** 2025-10-21  
**작성자:** 개발팀
