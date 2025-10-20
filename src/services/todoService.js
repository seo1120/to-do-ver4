import { createClient } from '@supabase/supabase-js';

// Supabase 클라이언트 설정
const SUPABASE_URL = 'https://yshceldkcxsnmvofmenp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlzaGNlbGRrY3hzbm12b2ZtZW5wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzODMyNzksImV4cCI6MjA3NTk1OTI3OX0.vyAyB7ElpHZFThFDxBXFv0ga86vGTqteUBO1EzUDPZM';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Todo API 서비스 함수들
export const todoService = {
  // 전체 Todo 조회
  async getAllTodos() {
    try {
      console.log('🚀 Supabase 요청: 전체 Todo 조회');
      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      console.log('✅ Supabase 응답: Todo 조회 성공');
      return {
        success: true,
        data: data,
        count: data.length
      };
    } catch (error) {
      console.error('❌ Todo 조회 실패:', error);
      return {
        success: false,
        error: error.message || 'Todo 조회에 실패했습니다'
      };
    }
  },

  // 새 Todo 추가
  async createTodo(text) {
    try {
      console.log('🚀 Supabase 요청: 새 Todo 생성');
      
      // 현재 사용자 정보 가져오기
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('사용자 인증이 필요합니다');
      }

      const { data, error } = await supabase
        .from('todos')
        .insert([{ 
          text: text.trim(), 
          completed: false,
          user_id: user.id 
        }])
        .select()
        .single();

      if (error) throw error;

      console.log('✅ Supabase 응답: Todo 생성 성공');
      return {
        success: true,
        data: data,
        message: 'Todo가 생성되었습니다'
      };
    } catch (error) {
      console.error('❌ Todo 생성 실패:', error);
      return {
        success: false,
        error: error.message || 'Todo 생성에 실패했습니다'
      };
    }
  },

  // Todo 수정 (완료 상태 토글 또는 텍스트 수정)
  async updateTodo(id, updates) {
    try {
      console.log('🚀 Supabase 요청: Todo 수정');
      const { data, error } = await supabase
        .from('todos')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      console.log('✅ Supabase 응답: Todo 수정 성공');
      return {
        success: true,
        data: data,
        message: 'Todo가 수정되었습니다'
      };
    } catch (error) {
      console.error('❌ Todo 수정 실패:', error);
      return {
        success: false,
        error: error.message || 'Todo 수정에 실패했습니다'
      };
    }
  },

  // Todo 삭제
  async deleteTodo(id) {
    try {
      console.log('🚀 Supabase 요청: Todo 삭제');
      const { error } = await supabase
        .from('todos')
        .delete()
        .eq('id', id);

      if (error) throw error;

      console.log('✅ Supabase 응답: Todo 삭제 성공');
      return {
        success: true,
        message: 'Todo가 삭제되었습니다'
      };
    } catch (error) {
      console.error('❌ Todo 삭제 실패:', error);
      return {
        success: false,
        error: error.message || 'Todo 삭제에 실패했습니다'
      };
    }
  },

  // Todo 완료 상태 토글 (편의 함수)
  async toggleTodo(id, completed) {
    return this.updateTodo(id, { completed });
  }
};

export default todoService;
