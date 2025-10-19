# ✨ 루미의 Todo 리스트 ver4

<div align="center">

![Todo App](https://img.shields.io/badge/Todo-App-pink?style=for-the-badge&logo=react)
![Express](https://img.shields.io/badge/Backend-Express-green?style=for-the-badge&logo=express)
![Supabase](https://img.shields.io/badge/Database-Supabase-green?style=for-the-badge&logo=supabase)
![React](https://img.shields.io/badge/Frontend-React-blue?style=for-the-badge&logo=react)
![Vite](https://img.shields.io/badge/Build-Vite-purple?style=for-the-badge&logo=vite)

**🎯 할 일을 관리하고 꿈을 이뤄가세요! 💕**

[![Live Demo](https://img.shields.io/badge/🚀_Live_Demo-View_App-brightgreen?style=for-the-badge)](https://seo1120.github.io/to-do-ver4/)
[![API Docs](https://img.shields.io/badge/📚_API_Docs-View_Documentation-orange?style=for-the-badge)](#-api-문서)

</div>

---

## 🌟 프로젝트 소개

**루미의 Todo 리스트 ver4**는 Express.js 백엔드와 React 프론트엔드가 완벽하게 연동된 Full Stack 웹 애플리케이션입니다! 

이전 버전의 아름다운 UI와 사용자 경험을 그대로 유지하면서, 이제는 **Supabase PostgreSQL 데이터베이스**와 연동되어 클라우드에서 데이터가 안전하게 저장됩니다.

### 🎨 주요 특징

- 🎯 **직관적인 UI/UX** - 드래그 앤 드롭, 검색, 필터링
- 🌙 **다크/라이트 모드** - 사용자 취향에 맞는 테마
- ⚡ **실시간 업데이트** - 서버와 실시간 동기화
- 💾 **클라우드 데이터 저장** - Supabase PostgreSQL로 안전한 클라우드 저장
- 📱 **반응형 디자인** - 모든 기기에서 완벽한 경험
- 🔄 **로딩 상태 표시** - 사용자 친화적인 피드백
- 🛡️ **에러 처리** - 안정적인 사용자 경험

---

## 🚀 빠른 시작

### 📋 사전 요구사항

- Node.js (v16 이상)
- npm 또는 yarn
- Supabase 계정 (무료)

### 🚀 Supabase 설정

#### 1️⃣ Supabase 프로젝트 생성
1. [Supabase](https://supabase.com)에 가입/로그인
2. "New Project" 클릭
3. 프로젝트 이름과 데이터베이스 비밀번호 설정
4. 프로젝트 생성 완료 후 대기 (약 2-3분)

#### 2️⃣ 데이터베이스 테이블 생성
1. Supabase 대시보드 → SQL Editor
2. `supabase-setup.sql` 파일의 내용을 복사하여 실행
3. 또는 Table Editor에서 수동으로 `todos` 테이블 생성

#### 3️⃣ 환경 변수 설정
프로젝트 루트에 `.env` 파일을 생성하고 다음 내용을 입력하세요:

```bash
# .env.example 파일을 .env로 복사
cp .env.example .env
```

`.env` 파일에서 Supabase URL과 키를 실제 값으로 수정하세요:
```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
PORT=3002
```

### ⚡ 1분 만에 실행하기

```bash
# 1️⃣ 저장소 클론
git clone https://github.com/seo1120/to-do-ver4.git
cd to-do-ver4

# 2️⃣ 의존성 설치
npm install

# 3️⃣ 환경 변수 설정
cp .env.example .env
# .env 파일에서 Supabase URL과 키를 실제 값으로 수정

# 4️⃣ Supabase 테이블 생성
# supabase-setup.sql 파일을 Supabase SQL Editor에서 실행

# 5️⃣ 백엔드 서버 실행 (터미널 1)
node server.js

# 6️⃣ 프론트엔드 실행 (터미널 2)
npm run dev
```

🎉 **완료!** 이제 http://localhost:3001 에서 앱을 확인하세요!

**📍 접속 주소:**
- 🌐 **프론트엔드**: http://localhost:3001
- 🔧 **백엔드 API**: http://localhost:3002/api/todos

---

## 🎯 주요 기능

### ✨ Todo 관리
- ➕ **추가**: 새로운 할 일을 쉽게 추가
- ✏️ **수정**: 완료 상태 토글 및 텍스트 수정
- 🗑️ **삭제**: 개별 또는 일괄 삭제
- 🔄 **정렬**: 드래그 앤 드롭으로 순서 변경

### 🔍 검색 & 필터
- 🔍 **실시간 검색**: 타이핑하는 즉시 결과 표시
- 📊 **상태별 필터**: 전체/진행중/완료된 항목만 보기
- 📈 **진행률 표시**: 시각적인 완료율 표시

### 🎨 사용자 경험
- 🌙 **다크 모드**: 눈에 편한 다크 테마
- 📱 **반응형**: 모바일부터 데스크톱까지
- ⚡ **빠른 로딩**: 최적화된 성능
- 🔄 **실시간 동기화**: 서버와 즉시 동기화

---

## 🛠️ 기술 스택

### Backend
- **Express.js** - 빠르고 유연한 웹 프레임워크
- **SQLite** - 경량화된 관계형 데이터베이스
- **CORS** - 크로스 오리진 요청 처리
- **RESTful API** - 표준화된 API 설계

### Frontend
- **React 19** - 최신 React 기능 활용
- **Vite** - 빠른 개발 서버와 빌드
- **Axios** - HTTP 클라이언트
- **@dnd-kit** - 드래그 앤 드롭 기능
- **Tailwind CSS** - 유틸리티 우선 CSS

### 개발 도구
- **ESLint** - 코드 품질 관리
- **Git** - 버전 관리
- **GitHub Pages** - 무료 호스팅

---

## 📚 API 문서

### 🔗 기본 URL
```
http://localhost:3002/api
```

### 📋 엔드포인트

| Method | Endpoint | 설명 | 요청 본문 |
|--------|----------|------|-----------|
| `GET` | `/todos` | 모든 Todo 조회 | - |
| `POST` | `/todos` | 새 Todo 생성 | `{"text": "할 일"}` |
| `PUT` | `/todos/:id` | Todo 수정 | `{"completed": true}` |
| `DELETE` | `/todos/:id` | Todo 삭제 | - |

### 📝 응답 예시

```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "id": 1,
      "text": "Express 서버 만들기",
      "completed": false
    }
  ]
}
```

---

## 💾 데이터베이스 정보

### SQLite 데이터베이스
- **파일 위치**: `./todos.db`
- **테이블 구조**:
  ```sql
  CREATE TABLE todos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    text TEXT NOT NULL,
    completed BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  ```

### 데이터 관리
- ✅ **자동 초기화**: 서버 시작 시 테이블 자동 생성
- ✅ **영구 저장**: 서버 재시작해도 데이터 유지
- ✅ **백업**: `todos.db` 파일 복사로 간단한 백업
- ✅ **확장성**: VS Code SQLite 확장으로 데이터 확인 가능

---

## 🧪 테스트 방법

### 1️⃣ 브라우저 테스트
- http://localhost:3002/api/todos - API 직접 확인
- http://localhost:3001 - React 앱 테스트

### 2️⃣ API 테스트 도구
- **Thunder Client** (VS Code 확장)
- **Postman**
- **curl** 명령어

### 3️⃣ 기능 테스트
- ✅ Todo 추가/수정/삭제
- ✅ 검색 및 필터링
- ✅ 드래그 앤 드롭
- ✅ 다크 모드 전환

---

## 📁 프로젝트 구조

```
to-do-ver3/
├── 🚀 server.js              # Express 서버 (SQLite 연동)
├── 💾 todos.db               # SQLite 데이터베이스
├── 📦 package.json           # 프로젝트 설정
├── 📖 README.md              # 프로젝트 문서
├── ⚙️ vite.config.js         # Vite 설정 (포트 3001)
├── 📁 src/
│   ├── 🎯 TodoApp.jsx        # 메인 컴포넌트
│   ├── 📋 TodoList.jsx       # Todo 목록
│   ├── 📝 TodoItem.jsx       # 개별 Todo
│   └── 📁 services/
│       └── 🔌 todoService.js # API 통신
└── 📁 public/                # 정적 파일
```

---

## 🎨 스크린샷

<div align="center">

### 🌞 라이트 모드
![Light Mode](https://via.placeholder.com/600x400/FFB6C1/FFFFFF?text=Light+Mode+Preview)

### 🌙 다크 모드  
![Dark Mode](https://via.placeholder.com/600x400/2D3748/FFFFFF?text=Dark+Mode+Preview)

</div>

---

## 🔧 문제 해결

### 자주 발생하는 문제들

#### 1️⃣ 포트 충돌
```bash
# 포트 사용 확인
lsof -i :3001  # 프론트엔드
lsof -i :3002  # 백엔드

# 프로세스 종료
pkill -f "node server.js"
pkill -f "vite"
```

#### 2️⃣ 데이터베이스 파일 문제
```bash
# SQLite 파일 확인
ls -la todos.db

# 데이터베이스 초기화 (주의: 모든 데이터 삭제)
rm todos.db
node server.js  # 자동으로 새 파일 생성
```

#### 3️⃣ 의존성 문제
```bash
# 클린 설치
rm -rf node_modules package-lock.json
npm install
```

#### 4️⃣ 브라우저 캐시 문제
- 개발자 도구 (F12) → Application → Storage → Clear storage
- 또는 하드 새로고침 (Ctrl+Shift+R)

---

## 🤝 기여하기

프로젝트에 기여하고 싶으시다면:

1. 🍴 **Fork** 이 저장소
2. 🌿 **브랜치 생성** (`git checkout -b feature/amazing-feature`)
3. 💾 **커밋** (`git commit -m 'Add amazing feature'`)
4. 📤 **푸시** (`git push origin feature/amazing-feature`)
5. 🔄 **Pull Request** 생성

---

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

---

## 👨‍💻 개발자

**서현** - Full Stack Developer

- 🌐 GitHub: [@seo1120](https://github.com/seo1120)
- 📧 이메일: [연락처]

---

<div align="center">

**⭐ 이 프로젝트가 도움이 되었다면 스타를 눌러주세요! ⭐**

Made with ❤️ by 서현

</div>