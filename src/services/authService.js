import { createClient } from '@supabase/supabase-js';

// Supabase 클라이언트 설정
const SUPABASE_URL = 'https://yshceldkcxsnmvofmenp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlzaGNlbGRrY3hzbm12b2ZtZW5wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzODMyNzksImV4cCI6MjA3NTk1OTI3OX0.vyAyB7ElpHZFThFDxBXFv0ga86vGTqteUBO1EzUDPZM';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 인증 서비스 함수들
export const authService = {
  // 현재 사용자 정보 가져오기
  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      return { success: true, user };
    } catch (error) {
      console.error('사용자 정보 조회 실패:', error);
      return { success: false, error: error.message };
    }
  },

  // 회원가입
  async signUp(email, password) {
    try {
      console.log('🚀 Supabase 요청: 회원가입');
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      console.log('✅ Supabase 응답: 회원가입 성공');
      return {
        success: true,
        data,
        message: '회원가입이 완료되었습니다. 이메일을 확인해주세요.'
      };
    } catch (error) {
      console.error('❌ 회원가입 실패:', error);
      return {
        success: false,
        error: error.message || '회원가입에 실패했습니다'
      };
    }
  },

  // 로그인
  async signIn(email, password) {
    try {
      console.log('🚀 Supabase 요청: 로그인');
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      console.log('✅ Supabase 응답: 로그인 성공');
      return {
        success: true,
        data,
        message: '로그인되었습니다'
      };
    } catch (error) {
      console.error('❌ 로그인 실패:', error);
      return {
        success: false,
        error: error.message || '로그인에 실패했습니다'
      };
    }
  },

  // 로그아웃
  async signOut() {
    try {
      console.log('🚀 Supabase 요청: 로그아웃');
      const { error } = await supabase.auth.signOut();

      if (error) throw error;

      console.log('✅ Supabase 응답: 로그아웃 성공');
      return {
        success: true,
        message: '로그아웃되었습니다'
      };
    } catch (error) {
      console.error('❌ 로그아웃 실패:', error);
      return {
        success: false,
        error: error.message || '로그아웃에 실패했습니다'
      };
    }
  },

  // 인증 상태 변경 감지
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback);
  }
};

export default authService;
