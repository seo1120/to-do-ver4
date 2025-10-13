import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const app = express();
const PORT = 3002;

// 미들웨어
app.use(cors()); // React 앱에서 접근 허용
app.use(express.json()); // JSON 파싱

// SQLite 데이터베이스 설정
let db;

async function initDatabase() {
  try {
    db = await open({
      filename: './todos.db',
      driver: sqlite3.Database
    });

    // todos 테이블 생성
    await db.exec(`
      CREATE TABLE IF NOT EXISTS todos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        text TEXT NOT NULL,
        completed BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 초기 데이터 삽입 (테이블이 비어있을 때만)
    const count = await db.get('SELECT COUNT(*) as count FROM todos');
    if (count.count === 0) {
      await db.exec(`
        INSERT INTO todos (text, completed) VALUES 
        ('Express 서버 만들기', 0),
        ('React와 연결하기', 0),
        ('Full Stack 개발자 되기', 0)
      `);
    }

    console.log('✅ SQLite 데이터베이스 초기화 완료');
  } catch (error) {
    console.error('❌ 데이터베이스 초기화 실패:', error);
  }
}

// 데이터베이스 초기화
initDatabase();

// ============================================
// ✅ 1. 전체 조회 API (SQLite 버전)
// ============================================
// React 앱에서 useEffect로 첫 로딩 시 호출
app.get('/api/todos', async (req, res) => {
  try {
    console.log('📋 GET /api/todos - 전체 조회');
    
    const todos = await db.all('SELECT * FROM todos ORDER BY created_at DESC');
    
    res.json({
      success: true,
      count: todos.length,
      data: todos
    });
  } catch (error) {
    console.error('❌ GET /api/todos 오류:', error);
    res.status(500).json({
      success: false,
      error: '서버 오류가 발생했습니다'
    });
  }
});

// ============================================
// ✅ 2. 새 항목 추가 API (SQLite 버전)
// ============================================
// React 앱에서 입력 폼 제출 시 호출
app.post('/api/todos', async (req, res) => {
  try {
    const { text } = req.body;

    // 유효성 검사
    if (!text || text.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'text 필드는 필수입니다'
      });
    }

    // 새 Todo 생성
    const result = await db.run(
      'INSERT INTO todos (text, completed) VALUES (?, ?)',
      [text.trim(), 0]
    );

    const newTodo = {
      id: result.lastID,
      text: text.trim(),
      completed: false
    };

    console.log(`✅ POST /api/todos - 새 Todo 생성: "${newTodo.text}"`);

    res.status(201).json({
      success: true,
      message: 'Todo가 생성되었습니다',
      data: newTodo
    });
  } catch (error) {
    console.error('❌ POST /api/todos 오류:', error);
    res.status(500).json({
      success: false,
      error: '서버 오류가 발생했습니다'
    });
  }
});

// ============================================
// ✅ 3. 항목 수정 API (SQLite 버전)
// ============================================
// PUT /api/todos/:id
// 요청 body: { "completed": true } 또는 { "text": "수정된 텍스트" }
// 응답: 수정된 todo 객체
app.put('/api/todos/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { text, completed } = req.body;

    console.log(`🔄 PUT /api/todos/${id} - 항목 수정 요청`);

    // ID로 Todo 찾기
    const todo = await db.get('SELECT * FROM todos WHERE id = ?', [id]);
    
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
    let updateQuery = 'UPDATE todos SET ';
    let updateValues = [];
    
    if (text !== undefined) {
      updateQuery += 'text = ?';
      updateValues.push(text.trim());
    }
    
    if (completed !== undefined) {
      if (text !== undefined) updateQuery += ', ';
      updateQuery += 'completed = ?';
      updateValues.push(completed ? 1 : 0);
    }
    
    updateQuery += ' WHERE id = ?';
    updateValues.push(id);

    await db.run(updateQuery, updateValues);

    // 수정된 Todo 조회
    const updatedTodo = await db.get('SELECT * FROM todos WHERE id = ?', [id]);

    console.log(`✅ PUT /api/todos/${id} - Todo 수정 완료:`, updatedTodo);

    res.json({
      success: true,
      message: 'Todo가 수정되었습니다',
      data: updatedTodo
    });
  } catch (error) {
    console.error('❌ PUT /api/todos 오류:', error);
    res.status(500).json({
      success: false,
      error: '서버 오류가 발생했습니다'
    });
  }
});

// ============================================
// ✅ 4. 항목 삭제 API (SQLite 버전)
// ============================================
// DELETE /api/todos/:id
// 응답: 204 No Content (성공 시 본문 없음)
app.delete('/api/todos/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    console.log(`🗑️ DELETE /api/todos/${id} - 항목 삭제 요청`);

    // ID로 Todo 찾기
    const todo = await db.get('SELECT * FROM todos WHERE id = ?', [id]);
    
    if (!todo) {
      return res.status(404).json({
        success: false,
        error: '해당 ID의 Todo를 찾을 수 없습니다'
      });
    }

    // Todo 삭제
    await db.run('DELETE FROM todos WHERE id = ?', [id]);

    console.log(`✅ DELETE /api/todos/${id} - Todo 삭제 완료:`, todo);

    res.status(204).send(); // 본문 없이 성공 응답
  } catch (error) {
    console.error('❌ DELETE /api/todos 오류:', error);
    res.status(500).json({
      success: false,
      error: '서버 오류가 발생했습니다'
    });
  }
});

// ============================================
// 서버 시작
// ============================================
app.listen(PORT, () => {
  console.log('='.repeat(60));
  console.log('🚀 Todo API 서버 실행! (SQLite 버전)');
  console.log('='.repeat(60));
  console.log(`\n📍 서버 주소: http://localhost:${PORT}`);
  console.log('💾 데이터베이스: SQLite (todos.db)');
  console.log('\n✅ 구현 완료: GET, POST, PUT, DELETE (SQLite 연동)');
  console.log('\n🧪 테스트 방법:');
  console.log('   1. Thunder Client로 API 테스트');
  console.log('   2. React 앱에서 API 연동 테스트');
  console.log('   3. 브라우저에서 http://localhost:3002/api/todos 접속\n');
  console.log('종료: Ctrl + C\n');
  console.log('='.repeat(60));
});
