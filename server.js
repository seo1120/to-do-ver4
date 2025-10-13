const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3002;

// 미들웨어
app.use(cors()); // React 앱에서 접근 허용
app.use(express.json()); // JSON 파싱

// 데이터 저장소 (메모리 배열 - in-memory database)
// Week 5에서는 MongoDB로 교체 예정
let todos = [
  { id: 1, text: 'Express 서버 만들기', completed: false },
  { id: 2, text: 'React와 연결하기', completed: false },
  { id: 3, text: 'Full Stack 개발자 되기', completed: false }
];

let nextId = 4; // 다음에 생성할 Todo의 ID

// ============================================
// ✅ 1. 전체 조회 API (이미 구현됨 - 참고용)
// ============================================
// React 앱에서 useEffect로 첫 로딩 시 호출
app.get('/api/todos', (req, res) => {
  console.log('📋 GET /api/todos - 전체 조회');

  res.json({
    success: true,
    count: todos.length,
    data: todos
  });
});

// ============================================
// ✅ 2. 새 항목 추가 API (이미 구현됨 - 참고용)
// ============================================
// React 앱에서 입력 폼 제출 시 호출
app.post('/api/todos', (req, res) => {
  const { text } = req.body;

  // 유효성 검사
  if (!text || text.trim() === '') {
    return res.status(400).json({
      success: false,
      error: 'text 필드는 필수입니다'
    });
  }

  // 새 Todo 생성
  const newTodo = {
    id: nextId++,
    text: text.trim(),
    completed: false
  };

  todos.push(newTodo);

  console.log(`✅ POST /api/todos - 새 Todo 생성: "${newTodo.text}"`);

  res.status(201).json({
    success: true,
    message: 'Todo가 생성되었습니다',
    data: newTodo
  });
});

// ============================================
// ✅ 3. 항목 수정 API 구현
// ============================================
// PUT /api/todos/:id
// 요청 body: { "completed": true } 또는 { "text": "수정된 텍스트" }
// 응답: 수정된 todo 객체
app.put('/api/todos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { text, completed } = req.body;

  console.log(`🔄 PUT /api/todos/${id} - 항목 수정 요청`);

  // ID로 Todo 찾기
  const todo = todos.find(t => t.id === id);
  
  if (!todo) {
    return res.status(404).json({
      success: false,
      error: '해당 ID의 Todo를 찾을 수 없습니다'
    });
  }

  // 유효성 검사
  if (text !== undefined && (!text || text.trim() === '')) {
    return res.status(400).json({
      success: false,
      error: 'text 필드는 비어있을 수 없습니다'
    });
  }

  // Todo 업데이트
  if (text !== undefined) {
    todo.text = text.trim();
  }
  if (completed !== undefined) {
    todo.completed = completed;
  }

  console.log(`✅ PUT /api/todos/${id} - Todo 수정 완료:`, todo);

  res.json({
    success: true,
    message: 'Todo가 수정되었습니다',
    data: todo
  });
});

// ============================================
// ✅ 4. 항목 삭제 API 구현
// ============================================
// DELETE /api/todos/:id
// 응답: 204 No Content (성공 시 본문 없음)
app.delete('/api/todos/:id', (req, res) => {
  const id = parseInt(req.params.id);

  console.log(`🗑️ DELETE /api/todos/${id} - 항목 삭제 요청`);

  // ID로 Todo 인덱스 찾기
  const index = todos.findIndex(t => t.id === id);
  
  if (index === -1) {
    return res.status(404).json({
      success: false,
      error: '해당 ID의 Todo를 찾을 수 없습니다'
    });
  }

  // Todo 삭제
  const deletedTodo = todos.splice(index, 1)[0];

  console.log(`✅ DELETE /api/todos/${id} - Todo 삭제 완료:`, deletedTodo);

  res.status(204).send(); // 본문 없이 성공 응답
});

// ============================================
// 서버 시작
// ============================================
app.listen(PORT, () => {
  console.log('='.repeat(60));
  console.log('🚀 Week 4 Todo API 서버 실행!');
  console.log('='.repeat(60));
  console.log(`\n📍 서버 주소: http://localhost:${PORT}`);
  console.log('📋 초기 Todos:', todos.length, '개');
  console.log('\n✅ 구현 완료: GET, POST, PUT, DELETE');
  console.log('\n🧪 테스트 방법:');
  console.log('   1. Thunder Client로 API 테스트');
  console.log('   2. React 앱에서 API 연동 테스트');
  console.log('   3. 브라우저에서 http://localhost:3002/api/todos 접속\n');
  console.log('종료: Ctrl + C\n');
  console.log('='.repeat(60));
});
