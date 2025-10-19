import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// 환경 변수 로드
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

// 미들웨어
app.use(cors()); // React 앱에서 접근 허용
app.use(express.json()); // JSON 파싱

// Supabase 클라이언트 설정
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase 환경 변수가 설정되지 않았습니다.');
  console.log('⚠️  .env 파일에 다음 변수들을 설정해주세요:');
  console.log('   - SUPABASE_URL');
  console.log('   - SUPABASE_SERVICE_ROLE_KEY 또는 SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function initDatabase() {
  try {
    // Supabase에서 테이블이 이미 존재하는지 확인
    const { data: existingTodos, error: fetchError } = await supabase
      .from('todos')
      .select('*')
      .limit(1);

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.log('Supabase 연결 확인 중...');
      console.log('⚠️  Supabase 테이블이 존재하지 않습니다.');
      console.log('   supabase-setup.sql 파일을 Supabase SQL Editor에서 실행해주세요.');
      return;
    }

    // 초기 데이터가 없으면 삽입
    if (!existingTodos || existingTodos.length === 0) {
      const { error: insertError } = await supabase
        .from('todos')
        .insert([
          { text: 'Express 서버 만들기', completed: false },
          { text: 'React와 연결하기', completed: false },
          { text: 'Full Stack 개발자 되기', completed: false }
        ]);

      if (insertError) {
        console.error('❌ 초기 데이터 삽입 실패:', insertError);
      } else {
        console.log('✅ 초기 데이터 삽입 완료');
      }
    }

    console.log('✅ Supabase 데이터베이스 연결 완료');
  } catch (error) {
    console.error('❌ Supabase 연결 실패:', error);
    console.log('⚠️  Supabase 설정을 확인해주세요:');
    console.log('   - Supabase 프로젝트가 활성화되었는지 확인');
    console.log('   - supabase-setup.sql 파일을 실행했는지 확인');
  }
}

// 데이터베이스 초기화
initDatabase();

// ============================================
// ✅ 1. 전체 조회 API (Supabase 버전)
// ============================================
// React 앱에서 useEffect로 첫 로딩 시 호출
app.get('/api/todos', async (req, res) => {
  try {
    console.log('📋 GET /api/todos - 전체 조회');
    
    const { data: todos, error } = await supabase
      .from('todos')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      throw error;
    }
    
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
// ✅ 2. 새 항목 추가 API (Supabase 버전)
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
    const { data: newTodo, error } = await supabase
      .from('todos')
      .insert([{ text: text.trim(), completed: false }])
      .select()
      .single();

    if (error) {
      throw error;
    }

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
// ✅ 3. 항목 수정 API (Supabase 버전)
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
    const { data: todo, error: fetchError } = await supabase
      .from('todos')
      .select('*')
      .eq('id', id)
      .single();
    
    if (fetchError || !todo) {
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

    // 업데이트할 데이터 준비
    const updateData = {};
    if (text !== undefined) updateData.text = text.trim();
    if (completed !== undefined) updateData.completed = completed;

    // Todo 업데이트
    const { data: updatedTodo, error: updateError } = await supabase
      .from('todos')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

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
// ✅ 4. 항목 삭제 API (Supabase 버전)
// ============================================
// DELETE /api/todos/:id
// 응답: 204 No Content (성공 시 본문 없음)
app.delete('/api/todos/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    console.log(`🗑️ DELETE /api/todos/${id} - 항목 삭제 요청`);

    // ID로 Todo 찾기
    const { data: todo, error: fetchError } = await supabase
      .from('todos')
      .select('*')
      .eq('id', id)
      .single();
    
    if (fetchError || !todo) {
      return res.status(404).json({
        success: false,
        error: '해당 ID의 Todo를 찾을 수 없습니다'
      });
    }

    // Todo 삭제
    const { error: deleteError } = await supabase
      .from('todos')
      .delete()
      .eq('id', id);

    if (deleteError) {
      throw deleteError;
    }

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
  console.log('🚀 Todo API 서버 실행! (Supabase 버전)');
  console.log('='.repeat(60));
  console.log(`\n📍 서버 주소: http://localhost:${PORT}`);
  console.log('💾 데이터베이스: Supabase (PostgreSQL)');
  console.log('\n✅ 구현 완료: GET, POST, PUT, DELETE (Supabase 연동)');
  console.log('\n🧪 테스트 방법:');
  console.log('   1. Thunder Client로 API 테스트');
  console.log('   2. React 앱에서 API 연동 테스트');
  console.log('   3. 브라우저에서 http://localhost:3002/api/todos 접속\n');
  console.log('⚠️  Supabase 설정 필요:');
  console.log('   - supabase-setup.sql 파일을 Supabase SQL Editor에서 실행');
  console.log('   - todos 테이블이 생성되었는지 확인');
  console.log('\n종료: Ctrl + C\n');
  console.log('='.repeat(60));
});
