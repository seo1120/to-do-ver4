# 🚀 Todo Full Stack 앱 (Express + React)

## 📋 프로젝트 개요
- **백엔드**: Express.js (포트 3002)
- **프론트엔드**: React + Vite (포트 5173)
- **데이터베이스**: 메모리 배열 (Week 5에서 MongoDB로 교체 예정)

## 🛠️ 설치 및 실행 방법

### 1. 백엔드 서버 실행

```bash
# 백엔드 의존성 설치
npm install express cors

# 개발용으로 nodemon 설치 (선택사항)
npm install -g nodemon

# 서버 실행
node server.js
# 또는 개발 모드로 실행
nodemon server.js
```

### 2. 프론트엔드 실행

```bash
# 프론트엔드 의존성 설치 (이미 설치됨)
npm install

# 개발 서버 실행
npm run dev
```

## 🌐 API 엔드포인트

### GET /api/todos
- **설명**: 모든 Todo 조회
- **응답**: 
```json
{
  "success": true,
  "count": 3,
  "data": [
    { "id": 1, "text": "Express 서버 만들기", "completed": false },
    { "id": 2, "text": "React와 연결하기", "completed": false },
    { "id": 3, "text": "Full Stack 개발자 되기", "completed": false }
  ]
}
```

### POST /api/todos
- **설명**: 새 Todo 생성
- **요청 본문**: 
```json
{ "text": "새로운 할 일" }
```
- **응답**: 
```json
{
  "success": true,
  "message": "Todo가 생성되었습니다",
  "data": { "id": 4, "text": "새로운 할 일", "completed": false }
}
```

### PUT /api/todos/:id
- **설명**: Todo 수정 (완료 상태 토글 또는 텍스트 수정)
- **요청 본문**: 
```json
{ "completed": true }
```
또는
```json
{ "text": "수정된 텍스트" }
```
- **응답**: 
```json
{
  "success": true,
  "message": "Todo가 수정되었습니다",
  "data": { "id": 1, "text": "Express 서버 만들기", "completed": true }
}
```

### DELETE /api/todos/:id
- **설명**: Todo 삭제
- **응답**: 204 No Content (성공 시 본문 없음)

## 🧪 테스트 방법

### 1. 브라우저에서 직접 테스트
- http://localhost:3002/api/todos 접속하여 JSON 응답 확인

### 2. Thunder Client (VS Code 확장) 사용
- GET, POST, PUT, DELETE 요청 테스트

### 3. React 앱에서 테스트
- http://localhost:5173 접속
- Todo 추가, 수정, 삭제 기능 테스트

## 🔧 주요 기능

### 백엔드 (Express)
- ✅ CORS 설정으로 React 앱에서 접근 허용
- ✅ JSON 파싱 미들웨어
- ✅ CRUD API 완전 구현
- ✅ HTTP 상태 코드 적절히 사용
- ✅ 에러 처리 및 유효성 검사

### 프론트엔드 (React)
- ✅ axios를 사용한 API 통신
- ✅ 로딩 상태 표시
- ✅ 에러 처리 및 사용자 알림
- ✅ 실시간 UI 업데이트
- ✅ 기존 기능 유지 (드래그앤드롭, 검색, 필터링, 다크모드)

## 📁 파일 구조

```
todo_ver3/
├── server.js                 # Express 서버
├── package-backend.json      # 백엔드 의존성 (참고용)
├── src/
│   ├── services/
│   │   └── todoService.js    # API 통신 서비스
│   ├── TodoApp.jsx           # 메인 컴포넌트 (API 연동)
│   ├── TodoList.jsx          # Todo 목록 컴포넌트
│   └── TodoItem.jsx          # 개별 Todo 컴포넌트
└── README-BACKEND.md         # 이 파일
```

## 🚨 주의사항

1. **서버 실행 순서**: 백엔드 서버를 먼저 실행한 후 프론트엔드를 실행하세요.
2. **포트 충돌**: 백엔드는 3002, 프론트엔드는 5173 포트를 사용합니다.
3. **데이터 지속성**: 현재는 메모리 배열을 사용하므로 서버 재시작 시 데이터가 초기화됩니다.

## 🔮 향후 개선 계획

- [ ] MongoDB 연동 (Week 5)
- [ ] 사용자 인증 시스템
- [ ] 실시간 업데이트 (WebSocket)
- [ ] 파일 업로드 기능
- [ ] 배포 설정 (Docker, AWS 등)
