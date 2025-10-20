-- Supabase Todo 앱을 위한 테이블 생성 스크립트
-- Supabase 대시보드의 SQL Editor에서 실행하세요

-- todos 테이블 생성
CREATE TABLE IF NOT EXISTS todos (
  id BIGSERIAL PRIMARY KEY,
  text TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_todos_created_at ON todos(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_todos_completed ON todos(completed);
CREATE INDEX IF NOT EXISTS idx_todos_user_id ON todos(user_id);

-- RLS (Row Level Security) 활성화
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;

-- 사용자별 데이터 분리를 위한 정책 생성
-- 사용자는 자신의 할일만 조회 가능
CREATE POLICY "Users can view own todos" ON todos
    FOR SELECT USING (auth.uid() = user_id);

-- 사용자는 자신의 할일만 추가 가능  
CREATE POLICY "Users can insert own todos" ON todos
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 사용자는 자신의 할일만 수정 가능
CREATE POLICY "Users can update own todos" ON todos
    FOR UPDATE USING (auth.uid() = user_id);

-- 사용자는 자신의 할일만 삭제 가능
CREATE POLICY "Users can delete own todos" ON todos
    FOR DELETE USING (auth.uid() = user_id);

-- updated_at 자동 업데이트를 위한 트리거 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- updated_at 트리거 생성
CREATE TRIGGER update_todos_updated_at 
  BEFORE UPDATE ON todos 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- 초기 데이터 삽입은 사용자별로 처리됩니다
-- 각 사용자가 로그인한 후 자신의 Todo를 생성할 수 있습니다
