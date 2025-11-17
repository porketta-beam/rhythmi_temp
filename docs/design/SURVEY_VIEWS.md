## 설문 분석용 View 설계 (JSON 전개)

본 문서는 설문 데이터(JSON)를 통계/분석에 적합한 형태로 전개하기 위한 데이터베이스 View와 인덱스, 머티리얼라이즈드 뷰 설계만을 다룹니다.

JSON 문항/응답의 상세 스키마는 다음 문서를 따르십시오:
- [FORM_DATA.md](./FORM_DATA.md)

---

### 1) 롱 포맷 View: JSON 응답 전개
form_responses.responses(JSONB)를 question_id/answer_raw 형태로 펼쳐 집계·필터링을 단순화합니다.

```sql
CREATE OR REPLACE VIEW v_form_answers AS
SELECT
  fr.form_id,
  fr.member_id,
  fr.submitted_at,
  (kv).key   AS question_id,
  (kv).value AS answer_raw
FROM form_responses fr,
LATERAL jsonb_each(fr.responses) AS kv;
```

특징
- 한 응답(row)이 여러 문항(row)으로 분해됩니다(롱 포맷).
- question_id 기준으로 빈도/평균/분포 등의 기본 통계가 쉬워집니다.

---

### 2) 타입 캐스팅 보조 View (옵션)
숫자/텍스트 캐스팅 컬럼을 제공해 통계 쿼리를 단순화합니다.

```sql
CREATE OR REPLACE VIEW v_form_answers_cast AS
SELECT
  form_id,
  member_id,
  submitted_at,
  question_id,
  answer_raw,
  NULLIF((answer_raw)::text, 'null') AS answer_text,
  CASE
    WHEN (jsonb_typeof(answer_raw) = 'number') THEN ((answer_raw)::text)::numeric
    WHEN (jsonb_typeof(answer_raw) = 'string' AND (answer_raw)::text ~ '^[0-9]+$') THEN ((answer_raw)::text)::numeric
    ELSE NULL
  END AS answer_numeric
FROM v_form_answers;
```

---

### 3) 다중선택 분해 View (옵션)
다중선택 배열 응답을 항목별로 분해합니다.

```sql
CREATE OR REPLACE VIEW v_form_answers_multi_expanded AS
SELECT
  a.form_id,
  a.member_id,
  a.submitted_at,
  a.question_id,
  jsonb_array_elements_text(a.answer_raw) AS answer_item
FROM v_form_answers a
WHERE jsonb_typeof(a.answer_raw) = 'array';
```

---

### 4) 생성 컬럼 및 인덱스 (권장)
자주 사용하는 필터 항목(예: AGE, GENDER)은 생성 컬럼과 인덱스로 최적화합니다.

```sql
ALTER TABLE form_responses
  ADD COLUMN IF NOT EXISTS age_bracket text GENERATED ALWAYS AS (responses->>'AGE') STORED,
  ADD COLUMN IF NOT EXISTS gender      text GENERATED ALWAYS AS (responses->>'GENDER') STORED;

CREATE INDEX IF NOT EXISTS idx_fr_age    ON form_responses(age_bracket);
CREATE INDEX IF NOT EXISTS idx_fr_gender ON form_responses(gender);

-- JSONB 전체에 대한 GIN 인덱스(존재/키 검색 가속)
CREATE INDEX IF NOT EXISTS idx_fr_responses_gin
  ON form_responses USING GIN (responses);
```

---

### 5) 통계/분석 쿼리 예시

- 단일선택 분포
```sql
SELECT question_id, answer_text AS answer, count(*) AS cnt
FROM v_form_answers_cast
WHERE form_id = :form_id
  AND question_id IN ('AGE','GENDER','Q3')
GROUP BY question_id, answer_text
ORDER BY question_id, cnt DESC;
```

- 평점 평균/분포
```sql
-- 평균
SELECT avg(answer_numeric) AS avg_score, count(*) AS n
FROM v_form_answers_cast
WHERE form_id = :form_id AND question_id = 'Q1';

-- 히스토그램(1~5)
SELECT answer_numeric::int AS score, count(*) AS cnt
FROM v_form_answers_cast
WHERE form_id = :form_id AND question_id = 'Q1'
GROUP BY answer_numeric::int ORDER BY score;
```

- 교차표(AGE x GENDER 기준 Q1 평균)
```sql
SELECT
  fr.age_bracket,
  fr.gender,
  avg((fr.responses->>'Q1')::int) AS avg_q1,
  count(*) AS n
FROM form_responses fr
WHERE fr.form_id = :form_id
GROUP BY fr.age_bracket, fr.gender
ORDER BY fr.age_bracket, fr.gender;
```

---

### 6) 머티리얼라이즈드 뷰 (자주 쓰는 리포트 캐시)
트래픽이 높은 리포트는 캐시 형태로 제공하고, 배치/이벤트로 갱신합니다.

```sql
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_q1_summary AS
SELECT form_id, (responses->>'Q1')::int AS score, count(*) AS cnt
FROM form_responses
GROUP BY form_id, (responses->>'Q1')::int;

-- 최신화
-- REFRESH MATERIALIZED VIEW CONCURRENTLY mv_q1_summary;
```

---

### 7) 운영 가이드
- 폼/응답의 JSON 스키마는 [FORM_DATA.md](./FORM_DATA.md)를 따릅니다(앱 레이어 검증 권장).
- 분석은 `v_form_answers`(롱 포맷) + 생성 컬럼/인덱스 조합으로 수행합니다.
- 잦은 리포트는 머티리얼라이즈드 뷰로 캐시하고, 적절한 주기로 REFRESH 합니다.
