# front/CLAUDE.md - 프론트엔드 개발 가이드

이 파일은 eventManager 프론트엔드 애플리케이션 개발 시 Claude Code에 대한 지침을 제공합니다.

---

## 📋 프로젝트 개요

**eventManager 프론트엔드**는 소규모 커뮤니티를 위한 모바일 우선 이벤트 관리 플랫폼의 클라이언트 애플리케이션입니다.

### 확정된 기술 스택
- **프레임워크**: React 19
- **빌드 도구**: Vite 7
- **언어**: JavaScript (ES6+)
- **스타일링**: Tailwind CSS ✅
- **린팅**: ESLint

### 핵심 목표
- 🎯 **모바일 우선**: 스마트폰에 최적화된 UI/UX
- ⚡ **오프라인 지원**: 네트워크 없이도 핵심 기능 사용 가능
- 🔄 **실시간 동기화**: 멀티 디바이스 동기화
- 📱 **PWA**: Progressive Web App 지원 (예정)

---

## 🛠 현재 설치된 패키지

### 프로덕션 의존성
- `react`: ^19.1.1 - UI 라이브러리
- `react-dom`: ^19.1.1 - React DOM 렌더러

### 개발 의존성
- `vite`: ^7.1.7 - 빌드 도구 및 개발 서버
- `eslint`: ^9.36.0 - 코드 품질 관리
- `tailwindcss`: ^3.4.18 - 유틸리티 퍼스트 CSS 프레임워크 ✅
- `postcss`: ^8.5.6 - CSS 변환 도구 ✅
- `autoprefixer`: ^10.4.21 - CSS 벤더 프리픽스 자동 추가 ✅

---

## 📂 프로젝트 구조

### 현재 구조

```
front/
├── CLAUDE.md              # 이 파일 (프론트엔드 개발 가이드)
├── package.json           # 의존성 및 스크립트
├── vite.config.js         # Vite 설정
├── eslint.config.js       # ESLint 설정
├── index.html             # HTML 진입점
├── .gitignore
│
├── public/                # 정적 파일
│   └── vite.svg
│
└── src/                   # 소스 코드
    ├── main.jsx           # 앱 진입점
    ├── App.jsx            # 루트 컴포넌트
    ├── App.css            # App 스타일
    ├── index.css          # 글로벌 스타일
    └── assets/            # 이미지, 아이콘 등
        └── react.svg
```

### 권장 구조 (확장 시)

```
src/
├── components/            # 재사용 가능한 UI 컴포넌트
│   ├── common/            # 공통 컴포넌트 (Button, Input, Modal 등)
│   ├── layout/            # 레이아웃 컴포넌트 (Header, Footer, Nav)
│   └── features/          # 기능별 컴포넌트 (EventCard, CheckInList 등)
│
├── pages/                 # 페이지 컴포넌트
│   ├── auth/              # 인증 관련 페이지
│   ├── events/            # 이벤트 관리 페이지
│   └── ...
│
├── hooks/                 # 커스텀 훅
├── utils/                 # 유틸리티 함수
├── constants/             # 상수 정의
└── assets/                # 정적 자산
```

---

## 🚀 개발 명령어

```bash
# 개발 서버 실행 (http://localhost:5173)
npm run dev

# 프로덕션 빌드
npm run build

# 빌드 미리보기
npm run preview

# 린트 검사
npm run lint

# 린트 자동 수정
npm run lint -- --fix

# 의존성 설치
npm install

# 의존성 업데이트 확인
npm outdated
```

---

## 📝 코딩 컨벤션

### 파일 & 폴더 명명 규칙

```javascript
// 컴포넌트 파일: PascalCase.jsx
Button.jsx
EventCard.jsx
CheckInScreen.jsx

// 유틸/훅/스토어: camelCase.js
useAuth.js
eventStore.js
formatDate.js

// 상수 파일: camelCase.js (내부는 UPPER_SNAKE_CASE)
routes.js  // 내부: export const HOME_ROUTE = '/'
```

### 컴포넌트 작성 패턴

#### 1. 기본 컴포넌트 구조

```javascript
import { useState } from 'react'

/**
 * 버튼 컴포넌트
 * @param {Object} props
 * @param {string} props.label - 버튼 텍스트
 * @param {Function} props.onClick - 클릭 핸들러
 * @param {string} props.variant - 버튼 스타일 (primary, secondary, danger)
 * @param {boolean} props.disabled - 비활성화 여부
 */
function Button({ label, onClick, variant = 'primary', disabled = false }) {
  const handleClick = () => {
    if (!disabled) {
      onClick()
    }
  }

  return (
    <button 
      className={`btn btn-${variant}`}
      onClick={handleClick}
      disabled={disabled}
    >
      {label}
    </button>
  )
}

export default Button
```

**JSDoc 작성 권장사항:**
- 컴포넌트 설명과 파라미터 타입을 명시
- IDE 자동완성 및 타입 힌트 제공
- 코드 가독성 향상

#### 2. 상태를 가진 컴포넌트

```javascript
import { useState, useEffect } from 'react'

function EventList() {
  const [events, setEvents] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/events')
      const data = await response.json()
      setEvents(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) return <div>로딩 중...</div>
  if (error) return <div>에러: {error}</div>

  return (
    <div>
      <h1>이벤트 목록</h1>
      <ul>
        {events.map(event => (
          <li key={event.id}>{event.name}</li>
        ))}
      </ul>
    </div>
  )
}

export default EventList
```

### 커스텀 훅 패턴

```javascript
// hooks/useFetch.js
import { useState, useEffect } from 'react'

/**
 * 데이터 fetch를 위한 커스텀 훅
 * @param {string} url - API URL
 */
export function useFetch(url) {
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(url)
        if (!response.ok) {
          throw new Error('Network response was not ok')
        }
        const result = await response.json()
        setData(result)
      } catch (err) {
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [url])

  return { data, isLoading, error }
}

// 사용 예시
function EventList() {
  const { data: events, isLoading, error } = useFetch('/api/events')

  if (isLoading) return <div>로딩 중...</div>
  if (error) return <div>에러: {error}</div>

  return (
    <ul>
      {events.map(event => (
        <li key={event.id}>{event.name}</li>
      ))}
    </ul>
  )
}
```

### API 통신 패턴

```javascript
// utils/api.js
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

/**
 * API 요청 헬퍼 함수
 * @param {string} endpoint - API 엔드포인트
 * @param {Object} options - fetch 옵션
 */
export async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`
  const token = localStorage.getItem('authToken')

  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  }

  const response = await fetch(url, config)

  if (!response.ok) {
    if (response.status === 401) {
      // 인증 만료 처리
      localStorage.removeItem('authToken')
      window.location.href = '/login'
    }
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return response.json()
}

// 사용 예시
export const eventAPI = {
  getAll: () => apiRequest('/events'),
  getById: (id) => apiRequest(`/events/${id}`),
  create: (data) => apiRequest('/events', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  update: (id, data) => apiRequest(`/events/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  delete: (id) => apiRequest(`/events/${id}`, { method: 'DELETE' })
}
```

---

## 🎨 스타일링 가이드 (Tailwind CSS)

### Tailwind CSS 초기 설정

```bash
# 이미 설치됨 ✅
npm install -D tailwindcss postcss autoprefixer

# 설정 파일 생성
npx tailwindcss init -p
```

**tailwind.config.js 설정:**
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // 커스텀 색상, 간격 등 추가
    },
  },
  plugins: [],
}
```

**src/index.css에 추가:**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* 커스텀 스타일 */
@layer components {
  .btn-primary {
    @apply px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors;
  }
}
```

### Tailwind 컴포넌트 패턴

#### 1. 기본 버튼 컴포넌트

```javascript
function Button({ variant = 'primary', children, disabled, className = '' }) {
  const baseStyles = 'px-4 py-2 rounded-lg font-medium transition-colors duration-200'
  
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 active:bg-gray-400',
    danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800',
    outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50'
  }
  
  const disabledStyles = 'opacity-50 cursor-not-allowed pointer-events-none'
  
  return (
    <button 
      className={`
        ${baseStyles} 
        ${variants[variant]} 
        ${disabled ? disabledStyles : ''} 
        ${className}
      `}
      disabled={disabled}
    >
      {children}
    </button>
  )
}

// 사용
<Button variant="primary">저장</Button>
<Button variant="secondary" className="w-full">전체 너비</Button>
```

#### 2. 조건부 스타일 (추천 패키지: clsx)

```javascript
// 간단한 방법
function Card({ active, large }) {
  return (
    <div className={`
      p-4 rounded-lg border
      ${active ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}
      ${large ? 'p-6' : 'p-4'}
    `}>
      컨텐츠
    </div>
  )
}

// 배열 방식 (더 깔끔)
function Card({ active, large }) {
  const classes = [
    'p-4 rounded-lg border',
    active ? 'border-blue-500 bg-blue-50' : 'border-gray-200',
    large && 'p-6'
  ].filter(Boolean).join(' ')
  
  return <div className={classes}>컨텐츠</div>
}
```

**clsx 사용 (선택사항):**
```bash
npm install clsx
```

```javascript
import clsx from 'clsx'

function Card({ active, large, className }) {
  return (
    <div className={clsx(
      'p-4 rounded-lg border',
      active ? 'border-blue-500 bg-blue-50' : 'border-gray-200',
      large && 'p-6',
      className
    )}>
      컨텐츠
    </div>
  )
}
```

### 모바일 우선 반응형 디자인

```javascript
// Tailwind는 기본적으로 모바일 우선
function ResponsiveLayout() {
  return (
    <div className="
      w-full p-4           // 모바일 (기본)
      md:w-1/2 md:p-6      // 태블릿 (768px+)
      lg:w-1/3 lg:p-8      // 데스크톱 (1024px+)
      xl:w-1/4             // 대형 화면 (1280px+)
    ">
      <h1 className="text-xl md:text-2xl lg:text-3xl">
        반응형 제목
      </h1>
    </div>
  )
}

// 그리드 레이아웃
function EventGrid({ events }) {
  return (
    <div className="
      grid gap-4
      grid-cols-1           // 모바일: 1열
      sm:grid-cols-2        // 작은 화면: 2열
      lg:grid-cols-3        // 큰 화면: 3열
      xl:grid-cols-4        // 초대형: 4열
    ">
      {events.map(event => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  )
}
```

### 터치 타겟 최소 크기

```javascript
// 버튼: 최소 44x44px (Apple HIG)
<button className="min-h-[44px] min-w-[44px] px-6 py-2">
  버튼
</button>

// 아이콘 버튼: 48x48px 영역
<button className="w-12 h-12 flex items-center justify-center">
  <Icon className="w-6 h-6" />
</button>

// 터치 영역 확장 (시각적 크기는 작게, 터치는 크게)
<button className="relative">
  <span className="text-sm">작은 텍스트</span>
  <span className="absolute inset-0 -m-2" /> {/* 터치 영역 확장 */}
</button>
```

### 커스텀 디자인 토큰

```javascript
// tailwind.config.js
export default {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        // eventManager 브랜드 컬러
        brand: {
          blue: '#3b82f6',
          dark: '#1e293b',
        }
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      minHeight: {
        'touch': '44px', // 터치 타겟 최소 높이
      },
    },
  },
}

// 사용
<button className="bg-primary-600 hover:bg-primary-700 min-h-touch">
  클릭
</button>
```

### 다크 모드 (선택사항)

```javascript
// tailwind.config.js
export default {
  darkMode: 'class', // 또는 'media'
  // ...
}

// 사용
function Card() {
  return (
    <div className="
      bg-white text-gray-900
      dark:bg-gray-800 dark:text-white
    ">
      다크 모드 지원 카드
    </div>
  )
}
```

---

## ⚡ 성능 최적화

### 1. 컴포넌트 메모이제이션

```javascript
import { memo, useMemo, useCallback } from 'react'

// 컴포넌트 메모이제이션
const EventCard = memo(function EventCard({ event, onEdit }) {
  return (
    <div>
      <h3>{event.name}</h3>
      <button onClick={() => onEdit(event.id)}>수정</button>
    </div>
  )
})

// 값 메모이제이션
function EventList({ events }) {
  const sortedEvents = useMemo(() => {
    return events.sort((a, b) => new Date(b.date) - new Date(a.date))
  }, [events])

  return <div>{sortedEvents.map(e => <EventCard key={e.id} event={e} />)}</div>
}

// 함수 메모이제이션
function ParentComponent() {
  const handleEdit = useCallback((eventId) => {
    console.log('Edit:', eventId)
  }, [])

  return <EventCard event={event} onEdit={handleEdit} />
}
```

### 2. 지연 로딩 (Code Splitting)

```javascript
import { lazy, Suspense } from 'react'

// 페이지 컴포넌트 지연 로딩
const EventListPage = lazy(() => import('./pages/EventListPage'))
const CheckInPage = lazy(() => import('./pages/CheckInPage'))

function App() {
  return (
    <Suspense fallback={<div>로딩 중...</div>}>
      {/* 라우팅 라이브러리에 따라 구현 방식이 달라질 수 있음 */}
      <EventListPage />
    </Suspense>
  )
}
```

---

## 🧪 테스트 (예정)

```javascript
// 컴포넌트 테스트 예시 (Vitest + React Testing Library)
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import Button from './Button'

describe('Button', () => {
  it('렌더링되고 클릭 가능해야 함', () => {
    const handleClick = vi.fn()
    render(<Button label="클릭" onClick={handleClick} />)
    
    const button = screen.getByText('클릭')
    expect(button).toBeInTheDocument()
    
    fireEvent.click(button)
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
```

---

## 🔐 환경 변수

```bash
# .env.development
VITE_API_BASE_URL=http://localhost:3000/api
VITE_WS_URL=ws://localhost:3000

# .env.production
VITE_API_BASE_URL=https://api.eventmanager.com
VITE_WS_URL=wss://api.eventmanager.com
```

```javascript
// 사용
const apiUrl = import.meta.env.VITE_API_BASE_URL
```

---

## 📚 참고 문서

### 프로젝트 문서
- [프로젝트 CLAUDE.md](../CLAUDE.md) - 전체 프로젝트 개요
- [PRD](../docs/product/PRD_Korean.md) - 제품 요구사항
- [사용자 플로우](../docs/design/USER_FLOWS.md) - 사용자 시나리오
- [화면 정의서](../docs/screens/README.md) - 화면별 상세 스펙

### 외부 문서
- [React 공식 문서](https://react.dev)
- [Vite 공식 문서](https://vitejs.dev)
- [Tailwind CSS 공식 문서](https://tailwindcss.com)
- [Tailwind CSS Cheat Sheet](https://nerdcave.com/tailwind-cheat-sheet)
- [MDN Web Docs](https://developer.mozilla.org)

---

## 🎯 다음 단계

### ✅ 1단계: Tailwind CSS 설정 완료!

**완료된 작업:**
- ✅ Tailwind CSS v3.4.18 설치
- ✅ `tailwind.config.js` 생성 및 구성
  - content 경로: `./index.html`, `./src/**/*.{js,jsx}`
  - 커스텀 브랜드 컬러 (primary, brand)
  - 터치 타겟 최소 크기 (44px)
- ✅ `postcss.config.js` 생성
- ✅ `src/index.css`에 Tailwind 디렉티브 추가
- ✅ 커스텀 버튼 클래스 (`.btn-primary`, `.btn-secondary`)

### 2단계: 추가 기술 스택 결정
- [ ] 라우팅 라이브러리 선택 (React Router, TanStack Router 등)
- [ ] 상태 관리 방식 결정 (Context API, Zustand, Redux 등)
- [ ] HTTP 클라이언트 선택 (fetch API, axios 등)
- [ ] 오프라인 저장소 선택 (localStorage, IndexedDB 등)
- [ ] 유틸리티: `clsx` (조건부 클래스), `date-fns` (날짜)

### 3단계: 프로젝트 구조 설정
```bash
# 필요한 디렉토리 생성
mkdir -p src/components/common
mkdir -p src/components/layout
mkdir -p src/components/features
mkdir -p src/pages
mkdir -p src/hooks
mkdir -p src/utils
mkdir -p src/constants
```

### 4단계: 기본 설정
- [ ] 환경 변수 설정 (.env 파일)
- [ ] Tailwind 커스텀 설정 (색상, 간격)
- [ ] 라우팅 기본 구조 설정
- [ ] API 통신 유틸리티 작성

### 5단계: 공통 컴포넌트 개발 (Tailwind 활용)
- [ ] Button (버튼) - variant 지원
- [ ] Input (입력 필드) - validation 표시
- [ ] Modal (모달) - 애니메이션
- [ ] Loading (로딩 인디케이터)
- [ ] ErrorBoundary (에러 처리)
- [ ] Card (카드 레이아웃)

### 6단계: 화면 구현
- [ ] 온보딩 화면 ([화면 정의서 참조](../docs/screens/01_ONBOARDING.md))
- [ ] 로그인/회원가입
- [ ] 이벤트 생성 ([화면 정의서 참조](../docs/screens/02_EVENT_CREATION.md))
- [ ] 이벤트 목록 (그리드 레이아웃)
- [ ] 출석 체크 (터치 최적화)

---

## 💡 개발 팁

### 1. Hot Module Replacement (HMR)
Vite는 자동으로 HMR을 지원합니다. 파일 저장 시 브라우저가 자동으로 업데이트됩니다.

### 2. React DevTools
Chrome/Firefox 확장 프로그램 "React Developer Tools"를 설치하면:
- 컴포넌트 트리 검사
- Props와 State 확인
- 성능 프로파일링

### 3. 에러 바운더리
```javascript
// components/common/ErrorBoundary.jsx
import { Component } from 'react'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return <h1>문제가 발생했습니다.</h1>
    }
    return this.props.children
  }
}

export default ErrorBoundary
```

---

## 🐛 디버깅

```javascript
// 개발 모드에서만 콘솔 로그
if (import.meta.env.DEV) {
  console.log('개발 모드:', data)
}

// React DevTools 사용
// Chrome 확장 프로그램 설치: React Developer Tools
```

---

**문서 버전**: 1.3  
**최종 업데이트**: 2025-10-20  
**작성자**: Frontend Development Team  
**변경 사항**: Tailwind CSS v3.4.18 설치 완료, 모든 설정 파일 구성 완료

**관련 문서**: [프로젝트 CLAUDE.md](../CLAUDE.md) | [문서 허브](../docs/CLAUDE.md)

