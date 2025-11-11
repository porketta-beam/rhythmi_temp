# eventManager 폼 데이터 스펙 (Form Data Specification)

**버전:** 1.0  
**최종 업데이트:** 2025-10-21  
**작성자:** 설계팀

---

## 목차

1. [개요](#개요)
2. [기본 구조](#기본-구조)
3. [필드 타입 정의](#필드-타입-정의)
4. [응답 데이터 구조](#응답-데이터-구조)
5. [폼 수정과 호환성 관리](#폼-수정과-호환성-관리)
6. [검증 규칙](#검증-규칙)
7. [사용 예시](#사용-예시)

---

## 개요

### 설계 목표

1. **프론트엔드 독립적 렌더링**: JSON만으로 폼 렌더링 가능
2. **서버 응답 검증 용이**: 응답 데이터 구조가 예측 가능
3. **버전 호환성 보장**: 폼 수정 시 기존 응답과 호환
4. **확장 가능성**: 새로운 필드 타입 추가 용이

### 설계 원칙

- **선언적 구조**: 필드 메타데이터로 렌더링 제어
- **버전 관리**: form_version으로 수정 추적
- **유연한 검증**: 필드별 검증 규칙 정의
- **하위 호환성**: 삭제/수정된 필드 처리

---

## 기본 구조

### 폼 메타데이터 (Form Metadata)

```json
{
  "version": "1.0",
  "form_id": "frm_5g7j9l2m",
  "event_id": "evt_7x9k2m4n",
  "title": "10월 모임 참석 의향 조사",
  "description": "다음 모임에 참석 가능하신지 알려주세요",
  "fields": [
    {
      "id": "field_001",
      "type": "yes_no",
      "label": "10월 15일 모임에 참석 가능하신가요?",
      "required": true,
      "order": 1
    }
  ],
  "metadata": {
    "created_at": "2025-10-03T09:00:00Z",
    "updated_at": "2025-10-04T11:20:00Z",
    "form_version": 1,
    "expires_at": "2025-10-14T23:59:59+09:00",
    "active": true
  }
}
```

### 필드 구조 (Field Structure)

```javascript
// FormField 객체 구조
// {
//   id: string,                    // 필드 고유 ID (폼 내 유니크)
//   type: string,                  // 필드 타입
//   label: string,                 // 질문 텍스트
//   description?: string,          // 추가 설명 (도움말)
//   required: boolean,            // 필수 여부
//   order: number,                 // 표시 순서
//   options?: string[],           // 선택형 필드용 옵션 목록
//   validation?: object            // 검증 규칙
// }

// FormFieldType 가능한 값들:
// "text"              - 단답형 텍스트
// "long_text"         - 장문형 텍스트 (textarea)
// "yes_no"           - 예/아니오 (radio 버튼)
// "multiple_choice"   - 객관식 단일 선택 (radio)
// "checkbox"        - 객관식 다중 선택 (checkbox)
// "number"          - 숫자 입력
// "date"            - 날짜 선택
// "time"            - 시간 선택
// "email"           - 이메일 주소
// "phone"           - 전화번호
// "rating"          - 별점/평점
// "matrix"          - 매트릭스 질문
```

### 검증 규칙 (Validation Rules)

```javascript
// ValidationRule 객체 구조
// {
//   min?: number,        // 최소값 (number, text)
//   max?: number,        // 최대값 (number, text)
//   minLength?: number,  // 최소 길이 (text)
//   maxLength?: number,  // 최대 길이 (text)
//   pattern?: string,    // 정규식 패턴
//   customMessage?: string  // 사용자 정의 에러 메시지
// }
```

---

## 필드 타입 정의

### 필드 타입별 속성 요약

각 필드 타입별로 사용 가능한 속성을 표로 정리합니다.

| 속성 | 설명 | 필수 | text | long_text | yes_no | multiple_choice | checkbox | number | date | email | phone | rating |
|------|------|------|:----:|:---------:|:------:|:--------------:|:--------:|:------:|:----:|:-----:|:-----:|:------:|
| **id** | 필드 고유 ID | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **type** | 필드 타입 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **label** | 질문 텍스트 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **required** | 필수 여부 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **order** | 표시 순서 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **description** | 추가 설명 | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **options** | 선택 옵션 목록 | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **validation** | 검증 규칙 | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ | ✅ | ❌ |

#### validation 객체 내부 속성

| 속성 | 설명 | 타입 | 사용 가능한 필드 타입 |
|------|------|------|---------------------|
| **min** | 최소값 | number | text, number |
| **max** | 최대값 | number | text, number |
| **minLength** | 최소 길이 | number | text, long_text |
| **maxLength** | 최대 길이 | number | text, long_text |
| **pattern** | 정규식 패턴 | string | text, long_text, email, phone |
| **customMessage** | 사용자 정의 에러 메시지 | string | 모든 타입 |

---

### 1. 단답형 (text)

```json
{
  "id": "field_001",
  "type": "text",
  "label": "이름을 입력해주세요",
  "required": true,
  "order": 1,
  "validation": {
    "minLength": 2,
    "maxLength": 50,
    "pattern": "^[가-힣a-zA-Z\\s]+$",
    "customMessage": "한글 또는 영문만 입력 가능합니다"
  }
}
```

### 2. 장문형 (long_text)

```json
{
  "id": "field_002",
  "type": "long_text",
  "label": "의견이나 건의사항을 남겨주세요",
  "required": false,
  "order": 2,
  "validation": {
    "maxLength": 500
  }
}
```

### 3. 예/아니오 (yes_no)

```json
{
  "id": "field_003",
  "type": "yes_no",
  "label": "10월 15일 모임에 참석 가능하신가요?",
  "required": true,
  "order": 1
}
```

### 4. 객관식 단일 선택 (multiple_choice)

```json
{
  "id": "field_004",
  "type": "multiple_choice",
  "label": "선호하는 시간대는?",
  "required": false,
  "order": 2,
  "options": [
    "오후 6시",
    "오후 7시",
    "오후 8시"
  ]
}
```

### 5. 객관식 다중 선택 (checkbox)

```json
{
  "id": "field_005",
  "type": "checkbox",
  "label": "관심있는 주제를 선택해주세요 (복수 선택 가능)",
  "required": false,
  "order": 3,
  "options": [
    "기술 트렌드",
    "사업 전략",
    "마케팅",
    "디자인"
  ]
}
```

### 6. 숫자 (number)

```json
{
  "id": "field_006",
  "type": "number",
  "label": "참석 가능 인원 수",
  "required": true,
  "order": 4,
  "validation": {
    "min": 1,
    "max": 10,
    "customMessage": "1-10명 사이로 입력해주세요"
  }
}
```

### 7. 날짜 (date)

```json
{
  "id": "field_007",
  "type": "date",
  "label": "희망하는 일정은?",
  "required": false,
  "order": 5
}
```

### 8. 이메일 (email)

```json
{
  "id": "field_008",
  "type": "email",
  "label": "이메일 주소를 입력해주세요",
  "required": true,
  "order": 6,
  "validation": {
    "pattern": "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
    "customMessage": "올바른 이메일 형식이 아닙니다"
  }
}
```

### 9. 전화번호 (phone)

```json
{
  "id": "field_009",
  "type": "phone",
  "label": "연락 가능한 전화번호",
  "required": true,
  "order": 7,
  "validation": {
    "pattern": "^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$",
    "customMessage": "010-XXXX-XXXX 형식으로 입력해주세요"
  }
}
```

### 10. 평점 (rating)

```json
{
  "id": "field_010",
  "type": "rating",
  "label": "이번 이벤트에 대한 만족도를 평가해주세요",
  "required": false,
  "order": 8,
  "options": [
    "1 - 매우 불만족",
    "2 - 불만족",
    "3 - 보통",
    "4 - 만족",
    "5 - 매우 만족"
  ]
}
```

---

## 응답 데이터 구조

### 기본 응답 구조

```json
{
  "response_id": "res_3d5f7h9j",
  "form_id": "frm_5g7j9l2m",
  "member_id": "mbr_8h3k5n2p",
  "responses": {
    "field_001": "홍길동",
    "field_002": "좋은 시간이었습니다",
    "field_003": "예",
    "field_004": "오후 7시",
    "field_005": ["기술 트렌드", "디자인"],
    "field_006": 3,
    "field_007": "2025-10-15",
    "field_008": "hong@example.com",
    "field_009": "010-1234-5678",
    "field_010": "5"
  },
  "submitted_at": "2025-10-05T14:22:00Z",
  "form_version": 1
}
```

### 응답 값 데이터 타입

각 필드 타입별로 다음과 같은 데이터 타입을 사용합니다:

| 필드 타입 | 응답 데이터 타입 | 예시 |
|----------|-----------------|------|
| text | string | "홍길동" |
| long_text | string | "훌륭한 시간이었습니다" |
| yes_no | string | "예" 또는 "아니오" |
| multiple_choice | string | "오후 7시" |
| checkbox | string[] | ["기술 트렌드", "디자인"] |
| number | number | 3 |
| date | string (ISO 8601) | "2025-10-15" |
| time | string (HH:MM) | "19:00" |
| email | string | "hong@example.com" |
| phone | string | "010-1234-5678" |
| rating | string | "5" |
| matrix | object | { "row1": "col1", "row2": "col2" } |

---

## 폼 수정과 호환성 관리

### 버전 관리 전략

폼을 수정할 때는 **새로운 버전**을 생성하여 기존 응답과 호환성을 유지합니다.

#### 1. 폼 초기 생성 (v1)

```json
{
  "form_id": "frm_5g7j9l2m",
  "title": "참석 의향 조사",
  "fields": [
    { "id": "field_001", "type": "yes_no", "label": "참석 가능하신가요?", "required": true, "order": 1 },
    { "id": "field_002", "type": "multiple_choice", "label": "선호 시간대는?", "required": false, "order": 2, "options": ["6시", "7시", "8시"] },
    { "id": "field_003", "type": "text", "label": "의견을 남겨주세요", "required": false, "order": 3 }
  ],
  "metadata": {
    "form_version": 1,
    "created_at": "2025-10-03T09:00:00Z",
    "updated_at": "2025-10-03T09:00:00Z"
  }
}
```

#### 2. 필드 추가 (v2)

```json
{
  "form_id": "frm_5g7j9l2m",
  "title": "참석 의향 조사 (수정)",
  "fields": [
    { "id": "field_001", "type": "yes_no", "label": "참석 가능하신가요?", "required": true, "order": 1 },
    { "id": "field_002", "type": "multiple_choice", "label": "선호 시간대는?", "required": false, "order": 2, "options": ["6시", "7시", "8시"] },
    { "id": "field_003", "type": "text", "label": "의견을 남겨주세요", "required": false, "order": 3 },
    { "id": "field_004", "type": "number", "label": "참석 인원 수", "required": false, "order": 4 }  // 새로 추가된 필드
  ],
  "metadata": {
    "form_version": 2,
    "created_at": "2025-10-03T09:00:00Z",
    "updated_at": "2025-10-04T11:20:00Z",
    "migration": {
      "deleted_fields": [],
      "added_fields": ["field_004"],
      "modified_fields": []
    }
  }
}
```

#### 3. 필드 삭제 (v3)

```json
{
  "form_id": "frm_5g7j9l2m",
  "title": "참석 의향 조사 (수정2)",
  "fields": [
    { "id": "field_001", "type": "yes_no", "label": "참석 가능하신가요?", "required": true, "order": 1 },
    { "id": "field_004", "type": "number", "label": "참석 인원 수", "required": false, "order": 2 }
  ],
  "metadata": {
    "form_version": 3,
    "created_at": "2025-10-03T09:00:00Z",
    "updated_at": "2025-10-05T14:00:00Z",
    "migration": {
      "deleted_fields": ["field_002", "field_003"],
      "added_fields": [],
      "modified_fields": []
    }
  }
}
```

### 호환성 처리 규칙

#### 응답 제출 시

1. **현재 폼 버전으로 응답**: 항상 최신 폼 구조로 응답 제출
2. **기존 필드만 필수 검증**: 삭제된 필드는 검증하지 않음
3. **새 필드는 선택**: 새로 추가된 필드는 required가 아니면 생략 가능

#### 응답 조회 시

1. **버전 정보 포함**: 각 응답은 `form_version` 필드 포함
2. **기존 응답 필터링**: 삭제된 필드는 조회 시 제외
3. **통계 집계**: 버전별로 다른 필드 집계 가능

### 응답 데이터 예시

#### v1로 제출된 응답

```json
{
  "response_id": "res_001",
  "form_id": "frm_5g7j9l2m",
  "responses": {
    "field_001": "예",
    "field_002": "7시",
    "field_003": "기대됩니다"
  },
  "form_version": 1,
  "submitted_at": "2025-10-04T10:00:00Z"
}
```

#### v2로 제출된 응답

```json
{
  "response_id": "res_002",
  "form_id": "frm_5g7j9l2m",
  "responses": {
    "field_001": "아니오",
    "field_002": "8시",
    "field_004": 2
  },
  "form_version": 2,
  "submitted_at": "2025-10-05T14:00:00Z"
}
```

#### v3으로 제출된 응답

```json
{
  "response_id": "res_003",
  "form_id": "frm_5g7j9l2m",
  "responses": {
    "field_001": "예",
    "field_004": 5
  },
  "form_version": 3,
  "submitted_at": "2025-10-06T09:00:00Z"
}
```

---

## 검증 규칙

### 클라이언트 측 검증 (프론트엔드)

```javascript
function validateResponse(formData, responses) {
  const errors = {};
  
  for (const field of formData.fields) {
    const value = responses[field.id];
    
    // 필수 필드 검증
    if (field.required && (!value || value === '')) {
      errors[field.id] = `${field.label}은(는) 필수입니다`;
      continue;
    }
    
    // 타입별 검증
    switch (field.type) {
      case 'text':
      case 'long_text':
        if (field.validation?.minLength && value.length < field.validation.minLength) {
          errors[field.id] = `최소 ${field.validation.minLength}자 이상 입력해주세요`;
        }
        if (field.validation?.maxLength && value.length > field.validation.maxLength) {
          errors[field.id] = `최대 ${field.validation.maxLength}자까지 입력 가능합니다`;
        }
        if (field.validation?.pattern && !new RegExp(field.validation.pattern).test(value)) {
          errors[field.id] = field.validation.customMessage || '올바른 형식이 아닙니다';
        }
        break;
        
      case 'number':
        if (field.validation?.min && value < field.validation.min) {
          errors[field.id] = `${field.validation.min} 이상의 값을 입력해주세요`;
        }
        if (field.validation?.max && value > field.validation.max) {
          errors[field.id] = `${field.validation.max} 이하의 값을 입력해주세요`;
        }
        break;
        
      case 'multiple_choice':
        if (!field.options?.includes(value)) {
          errors[field.id] = '유효하지 않은 선택입니다';
        }
        break;
        
      case 'checkbox':
        if (!Array.isArray(value) || value.length === 0) {
          errors[field.id] = '최소 1개 이상 선택해주세요';
        }
        break;
        
      case 'email':
        if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)) {
          errors[field.id] = '올바른 이메일 형식이 아닙니다';
        }
        break;
    }
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}
```

### 서버 측 검증

```python
def validate_form_response(form_id: str, response: dict) -> tuple[bool, dict]:
    """
    폼 응답을 검증합니다.
    
    Returns:
        (is_valid, errors)
    """
    form = get_form(form_id)
    current_version = form['metadata']['form_version']
    response_version = response.get('form_version', 1)
    
    errors = {}
    
    # 버전 불일치 처리
    if response_version < current_version:
        # 삭제된 필드 제외하고 검증
        for field in form['fields']:
            field_id = field['id']
            
            # 삭제된 필드는 무시
            if field_id in form['metadata'].get('migration', {}).get('deleted_fields', []):
                continue
                
            # 필수 필드 검증
            if field.get('required') and field_id not in response['responses']:
                errors[field_id] = f"{field['label']}은(는) 필수입니다"
    else:
        # 현재 버전 검증
        for field in form['fields']:
            field_id = field['id']
            value = response['responses'].get(field_id)
            
            # 필수 필드
            if field.get('required') and not value:
                errors[field_id] = f"{field['label']}은(는) 필수입니다"
            
            # 타입 검증
            value_errors = _validate_field_value(field, value)
            if value_errors:
                errors[field_id] = value_errors
    
    return len(errors) == 0, errors
```

---

## 사용 예시

### 프론트엔드 렌더링 예시 (React)

```jsx
// 폼 렌더러 컴포넌트
function FormRenderer({ formData, onSubmit }) {
  const [responses, setResponses] = useState({});
  const [errors, setErrors] = useState({});
  
  const handleFieldChange = (fieldId, value) => {
    setResponses(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 검증
    const validation = validateResponse(formData, responses);
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }
    
    // 제출
    await onSubmit({
      form_id: formData.form_id,
      responses,
      form_version: formData.metadata.form_version
    });
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <h1>{formData.title}</h1>
      <p>{formData.description}</p>
      
      {formData.fields
        .sort((a, b) => a.order - b.order)
        .map(field => (
          <FieldRenderer
            key={field.id}
            field={field}
            value={responses[field.id]}
            error={errors[field.id]}
            onChange={(value) => handleFieldChange(field.id, value)}
          />
        ))}
      
      <button type="submit">제출</button>
    </form>
  );
}

// 필드별 렌더러
function FieldRenderer({ field, value, error, onChange }) {
  switch (field.type) {
    case 'text':
    case 'long_text':
      return (
        <TextField
          label={field.label}
          required={field.required}
          value={value}
          error={error}
          onChange={onChange}
          multiline={field.type === 'long_text'}
        />
      );
      
    case 'yes_no':
      return (
        <YesNoField
          label={field.label}
          required={field.required}
          value={value}
          error={error}
          onChange={onChange}
        />
      );
      
    case 'multiple_choice':
      return (
        <MultipleChoiceField
          label={field.label}
          options={field.options}
          required={field.required}
          value={value}
          error={error}
          onChange={onChange}
        />
      );
      
    case 'checkbox':
      return (
        <CheckboxField
          label={field.label}
          options={field.options}
          required={field.required}
          value={value}
          error={error}
          onChange={onChange}
        />
      );
      
    case 'number':
      return (
        <NumberField
          label={field.label}
          required={field.required}
          value={value}
          error={error}
          onChange={onChange}
        />
      );
      
    case 'date':
      return (
        <DateField
          label={field.label}
          required={field.required}
          value={value}
          error={error}
          onChange={onChange}
        />
      );
      
    case 'email':
      return (
        <EmailField
          label={field.label}
          required={field.required}
          value={value}
          error={error}
          onChange={onChange}
        />
      );
      
    case 'phone':
      return (
        <PhoneField
          label={field.label}
          required={field.required}
          value={value}
          error={error}
          onChange={onChange}
        />
      );
      
    default:
      return <div>Unsupported field type: {field.type}</div>;
  }
}
```

### 백엔드 저장 예시 (Python)

```python
# 폼 생성
def create_form(event_id: str, title: str, fields: list) -> dict:
    form_data = {
        "form_id": generate_uuid(),
        "event_id": event_id,
        "title": title,
        "fields": fields,
        "metadata": {
            "form_version": 1,
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat(),
            "active": True
        }
    }
    
    # DB 저장
    db.forms.insert_one(form_data)
    return form_data

# 폼 수정
def update_form(form_id: str, updates: dict) -> dict:
    old_form = db.forms.find_one({"form_id": form_id})
    
    # 필드 변경 추적
    old_fields = {f["id"]: f for f in old_form["fields"]}
    new_fields = {f["id"]: f for f in updates.get("fields", [])}
    
    deleted = [fid for fid in old_fields if fid not in new_fields]
    added = [fid for fid in new_fields if fid not in old_fields]
    modified = [
        fid for fid in old_fields 
        if fid in new_fields and old_fields[fid] != new_fields[fid]
    ]
    
    # 새 버전 생성
    updated_form = {
        **old_form,
        **updates,
        "metadata": {
            **old_form["metadata"],
            "form_version": old_form["metadata"]["form_version"] + 1,
            "updated_at": datetime.now().isoformat(),
            "migration": {
                "deleted_fields": deleted,
                "added_fields": added,
                "modified_fields": modified
            }
        }
    }
    
    db.forms.update_one(
        {"form_id": form_id},
        {"$set": updated_form}
    )
    
    return updated_form

# 응답 저장
def save_response(form_id: str, member_id: str, responses: dict) -> dict:
    form = db.forms.find_one({"form_id": form_id})
    
    # 검증
    is_valid, errors = validate_form_response(form_id, {
        "responses": responses,
        "form_version": form["metadata"]["form_version"]
    })
    
    if not is_valid:
        raise ValidationError(errors)
    
    # 응답 저장
    response_data = {
        "response_id": generate_uuid(),
        "form_id": form_id,
        "member_id": member_id,
        "responses": responses,
        "form_version": form["metadata"]["form_version"],
        "submitted_at": datetime.now().isoformat()
    }
    
    db.form_responses.insert_one(response_data)
    return response_data
```

---

## 참고 자료

- [MVP API 명세서](../api/MVP_API_SPEC.md) - API 엔드포인트 및 데이터 모델
- [데이터 플로우](./DATA_FLOWS.md) - 데이터 아키텍처 및 라이프사이클
- [사용자 플로우](./USER_FLOWS.md) - 사용자 시나리오

---

**문서 버전:** 1.0  
**최종 업데이트:** 2025-10-21  
**작성자:** 설계팀
