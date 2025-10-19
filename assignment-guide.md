# Week 5 과제: Todo 앱에 AI 기능 추가하기

**제출 기한**: 2025년 10월 19일 월요일 밤 11:59 PM

---

## 🎯 과제 개요

수업 중 Hands-on Part 1, 2에서 이미 만든 **Supabase Todo 앱**에 **AI 기능만 추가**하면 됩니다!

### 전제 조건 (수업 중 완료)
- ✅ **Hands-on Part 1**: Supabase 인증 (회원가입/로그인)
- ✅ **Hands-on Part 2**: Todo CRUD + RLS

### 추가 구현 사항 (과제)
- 🎯 **AI Todo Breakdown 기능 구현**

---

## 🤔 왜 Express 서버가 필요한가?

### Hands-on Part 1, 2에서는...
```javascript
// 프론트엔드에서 Supabase 직접 호출 - OK!
const { data } = await supabase.from('todos').select('*');
```
→ Supabase는 **프론트엔드에서 직접 호출해도 안전** (ANON KEY는 공개 가능)

### AI 기능에서는...
```javascript
// ❌ 프론트엔드에서 LLM API 직접 호출 - 위험!
const response = await fetch('https://api.openai.com/...', {
    headers: { 'Authorization': 'Bearer MY_SECRET_KEY' }  // 🚨 API 키 노출!
});
```
→ LLM API 키는 **절대 프론트엔드에 노출하면 안됨** (누구나 사용 가능)

### 해결책: Express 프록시 서버
```
프론트엔드 → Express 서버 (API 키 보관) → LLM API
```

**핵심 차이:**
- **Supabase**: 공개 키 사용 → 프론트엔드 직접 호출 OK
- **LLM API**: 비밀 키 사용 → Express 서버 필요!

---

## 📋 AI Todo Breakdown 기능

### 기능 설명
복잡한 작업을 입력하면 AI가 작은 단계로 자동 분해

**예시:**
```
입력: "Supabase와 React를 사용해서 블로그 만들기"

AI 출력:
1. Supabase 프로젝트 생성 및 테이블 설계
2. React 프로젝트 초기 설정
3. Supabase 클라이언트 통합
4. CRUD 기능 구현
5. UI 디자인 및 스타일링
```

### UI 요구사항
- [ ] 큰 작업을 입력할 수 있는 textarea
- [ ] "AI에게 분해 요청하기" 버튼
- [ ] AI가 분해한 단계들을 체크박스로 표시
- [ ] 선택한 단계를 Todo 리스트에 추가하는 버튼

### 기술 요구사항
- [ ] Express 서버 구현 (`server.js`)
- [ ] `/api/ai/generate` 엔드포인트 구현
- [ ] Rate limiting (1분당 10회)
- [ ] 프론트엔드에서 Express 서버로 fetch 요청
- [ ] AI 응답 파싱 및 UI에 표시

---

## 🚀 시작하기

### 1. 기존 React 프로젝트 준비

**⚠️ 중요: 프론트엔드는 기존 React Todo 프로젝트를 사용합니다!**

```bash
# Hands-on Part 2에서 작업한 React Todo 프로젝트 폴더로 이동
cd your-react-todo-project

# 또는 새 폴더에 복사
cp -r your-react-todo-project week05-assignment-[yourname]
cd week05-assignment-[yourname]
```

**과제 내용:**
- ✅ 기존 React 프론트엔드는 그대로 사용
- 🎯 **Express 서버 + LLM 연동만 새로 추가**
- 🎯 프론트엔드에 AI Todo Breakdown UI 추가

### 2. Express 서버용 의존성 설치

```bash
# React 프로젝트 폴더에서 Express 서버용 패키지 추가 설치
npm install express cors dotenv express-rate-limit @google/generative-ai
```

**폴더 구조:**
```
your-react-todo-project/
├── src/                    # 기존 React 코드
│   ├── App.jsx
│   ├── components/
│   └── ...
├── server.js               # 🆕 새로 만들 Express 서버
├── .env                    # 🆕 LLM API 키
├── package.json            # 기존 파일 (의존성 추가됨)
└── ...
```

### 3. Express 서버 구현

`server.js` 파일 생성:

**필수 구조:**
```javascript
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3002;

// 미들웨어
app.use(cors());
app.use(express.json());

// Rate limiting
const aiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,  // 1분
    max: 10,  // 1분에 10번
    message: { success: false, error: 'Too many requests' }
});

// AI 생성 엔드포인트
app.post('/api/ai/generate', aiLimiter, async (req, res) => {
    const { prompt } = req.body;

    if (!prompt) {
        return res.status(400).json({
            success: false,
            error: 'Prompt required'
        });
    }

    try {
        // TODO: LLM API 호출 (Gemini/OpenAI/Hugging Face)
        // 학생이 직접 구현!

        res.json({ success: true, text: aiResponse });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server: http://localhost:${PORT}`);
});
```

**참고 파일**: `server.js.reference`의 52-112번째 줄 (LLM 설정 부분)

### 4. 환경 변수 설정

`.env` 파일 생성:

```env
# LLM Provider
LLM_PROVIDER=gemini
GEMINI_API_KEY=your-gemini-api-key

# Server
PORT=3002
```

**API Key 발급:**
- Gemini: https://ai.google.dev/ → Get API Key (무료)

### 5. React 컴포넌트에서 Express 호출

**기존 React Todo 앱에 AI 기능을 추가합니다:**

```javascript
// React 컴포넌트 내부 (예: App.jsx 또는 AIBreakdown.jsx)
async function handleAIBreakdown() {
    const task = aiTaskInput.trim(); // React state 사용

    if (!task) {
        alert('큰 작업을 입력하세요!');
        return;
    }

    try {
        // Express 서버로 요청
        const response = await fetch('http://localhost:3002/api/ai/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                prompt: `다음 작업을 5개 이하의 단계로 나누세요: "${task}"`
            })
        });

        const data = await response.json();

        if (data.success) {
            // AI 응답 파싱 및 표시
            const steps = parseSteps(data.text);
            displaySteps(steps);
        }
    } catch (error) {
        console.error('AI Error:', error);
        alert('AI 요청 실패');
    }
}

// AI 응답을 배열로 파싱
function parseSteps(text) {
    return text
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .map(line => line.replace(/^[\d]+[\.\)\-\:]\s*/, ''))  // 번호 제거
        .filter(line => line.length > 5);
}
```

**참고 파일**: `index.html.reference`의 334-398번째 줄 (fetch API 호출 부분 참고)

---

## 📚 참고 파일 사용 안내

### ⚠️ 중요: 참고 파일은 "막힐 때만" 보세요!

**`.reference` 파일들은 완성된 구현 예시입니다:**
- 먼저 스스로 구현해보세요
- 막히거나 에러가 발생하면 참고 파일을 열어보세요
- 이해하면서 참고하세요 (복사/붙여넣기 금지!)

### 참고 파일 활용 방법

```bash
# 참고 파일 전체 보기
cat server.js.reference

# 특정 줄만 보기 (예: 52-112줄)
sed -n '52,112p' server.js.reference

# VS Code에서 열기
code server.js.reference
```

### 참고 파일별 용도

| 파일 | 내용 | 언제 보나요? |
|------|------|-------------|
| `server.js.reference` | Express + LLM 연동 완성 코드 | Express 서버 설정이 막힐 때 |
| `index.html.reference` | HTML 버전 Todo 앱 (참고용) | fetch API 호출 부분만 참고 |
| `llmService.js.reference` | LLM API 추상화 레이어 | 코드를 더 깔끔하게 만들고 싶을 때 |
| `style.css.reference` | UI 스타일 | UI 디자인 아이디어 참고 |

**💡 중요:**
- 프론트엔드는 **기존 React 프로젝트를 사용**합니다
- `index.html.reference`는 fetch API 호출 로직만 참고하세요
- React 컴포넌트 구조는 본인 프로젝트에 맞게 작성

---

## 📤 제출 방법

### 1. GitHub Repository

**필수 파일:**
```
week05-assignment-[yourname]/
├── server.js              # 🆕 Express AI proxy
├── src/                   # 기존 React 프로젝트
│   ├── App.jsx            # AI 기능 추가됨
│   ├── components/
│   └── ...
├── package.json
├── .env.example
├── .gitignore
└── README.md
```

### 2. README.md 작성

1. 앱 이름 및 설명
2. 구현한 AI 기능 목록
3. 기술 스택
4. 설치 및 실행 방법
5. 스크린샷 (최소 3개)
6. 어려웠던 점 및 해결 방법

### 3. 제출
- LMS에 GitHub Repository URL 제출
- 제출 기한: **2025년 10월 19일 월요일 11:59 PM**

### 제출 전 체크리스트

```bash
# 1. .reference 파일 제거
rm *.reference

# 2. .env 파일이 .gitignore에 있는지 확인
cat .gitignore | grep .env

# 3. 브라우저 콘솔 에러 확인
# 개발자 도구 열기 (F12) → Console 탭 확인

# 4. Express 서버 테스트
curl -X POST http://localhost:3002/api/ai/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Test"}'

# 5. Git에 추가 및 푸시
git add .
git commit -m "Complete Week 5 assignment"
git push
```

---

## ✅ 테스트 체크리스트

**기능:**
- [ ] Express 서버가 `http://localhost:3002`에서 실행됨
- [ ] 큰 작업 입력 시 AI가 3-5개 단계로 분해
- [ ] 단계 선택/해제 가능
- [ ] 선택한 단계가 Supabase Todo에 추가됨
- [ ] Rate limiting 작동 (10회 요청 후 제한)

**코드 품질:**
- [ ] `.env` 파일에만 API 키 존재 (프론트엔드 코드에 없음)
- [ ] `.gitignore`에 `.env` 포함
- [ ] 브라우저 콘솔에 에러 없음

---

## 🐛 자주 발생하는 문제

### 문제 1: "Cannot connect to server"
**원인**: Express 서버가 실행되지 않음
**해결**: 터미널에서 `node server.js` 실행 확인

### 문제 2: CORS 에러
**원인**: Express에서 CORS 미들웨어 누락
**해결**: `app.use(cors());` 추가 확인

### 문제 3: API 키 에러
**원인**: `.env` 파일 설정 오류
**해결**:
```env
GEMINI_API_KEY=실제_키_여기_입력  # 따옴표 없이!
```

### 문제 4: AI 응답이 이상함
**원인**: 프롬프트가 불명확
**해결**: 명확한 지시사항 추가
```javascript
const prompt = `다음 작업을 구체적이고 실행 가능한 5개 이하의 작은 단계로 나누세요:
"${task}"

규칙:
- 각 단계는 한 줄로 작성
- 번호를 붙이지 마세요
- 실행 가능한 동사로 시작 (예: "~하기")`;
```

---

## 💡 개발 팁

### 1. 프롬프트 엔지니어링

**좋은 프롬프트 3요소:**
1. **명확한 지시**: "5개 이하의 단계로 나누세요"
2. **형식 지정**: "각 단계는 한 줄로"
3. **예시 제공**: "예: 데이터베이스 설계하기"

### 2. AI 응답 파싱

LLM은 때때로 예상과 다른 형식으로 응답합니다:
```javascript
function parseSteps(text) {
    return text
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .map(line => {
            // "1. ", "- ", "• " 등 다양한 형식 처리
            return line.replace(/^[\d]+[\.\)\-\:\•]\s*/, '');
        })
        .filter(line => line.length > 5);  // 너무 짧은 줄 제외
}
```

### 3. 에러 처리

사용자에게 친절한 에러 메시지:
```javascript
catch (error) {
    console.error('AI Error:', error);

    let message = 'AI 요청 실패';
    if (error.message.includes('fetch')) {
        message = 'Express 서버에 연결할 수 없습니다. 서버가 실행 중인지 확인하세요.';
    } else if (error.message.includes('API key')) {
        message = 'API 키 오류입니다. .env 파일을 확인하세요.';
    }

    alert(message);
}
```

---

## 📚 참고 자료

### 완성 예제 (참고 파일)
- **Express 서버**: `server.js.reference`
- **프론트엔드 통합**: `index.html.reference`
- **LLM 서비스 계층**: `llmService.js.reference` (선택)
- **스타일**: `style.css.reference`

### 문서
- **Gemini API**: https://ai.google.dev/docs
- **Express.js**: https://expressjs.com/
- **프롬프트 엔지니어링**: https://platform.openai.com/docs/guides/prompt-engineering

---

## 🆘 도움 받기

### 막혔을 때 순서
1. ✅ assignment-guide.md의 "자주 발생하는 문제" 섹션 확인
2. ✅ `.reference` 파일에서 해당 부분 확인
3. ✅ 브라우저 콘솔과 서버 로그 확인

### 디버깅 팁

```javascript
// 1. 브라우저 콘솔에서 확인
console.log('AI 응답:', response);

// 2. 서버 로그 확인
node server.js
// 터미널에서 요청 로그 확인

// 3. API 테스트 (curl)
curl -X POST http://localhost:3002/api/ai/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Test"}'
```

### Office Hours
- 수업 시간 또는 별도 공지된 시간에 질문 가능

---

**행운을 빕니다! AI와 함께하는 스마트 Todo 앱을 만들어보세요! 🚀**

---

## 📌 핵심 요약

1. **기존 React Todo 프로젝트** 사용 ✅
2. **Express 서버** 구현 (API 키 보호용)
3. **AI Todo Breakdown** 기능 추가
4. **GitHub + README** 제출

## 🎯 학습 목표

이 과제를 통해 다음을 배웁니다:
- ✅ **Express 서버를 API 프록시로 사용하는 방법**
- ✅ **LLM API 안전하게 호출하기** (API 키 보호)
- ✅ **React와 Express 서버 연동** (프론트엔드 ↔ 백엔드)
- ✅ 비동기 처리 (async/await)
- ✅ Rate limiting으로 서버 보호
- ✅ AI 응답 파싱 및 React 상태 업데이트
- ✅ 기존 프로젝트에 새 기능 통합하기
