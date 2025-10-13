import axios from 'axios';

// API 기본 URL 설정
const API_BASE_URL = 'http://localhost:3002/api';

// axios 인스턴스 생성
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터 (요청 전 로깅)
apiClient.interceptors.request.use(
  (config) => {
    console.log(`🚀 API 요청: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ API 요청 에러:', error);
    return Promise.reject(error);
  }
);

// 응답 인터셉터 (응답 후 로깅)
apiClient.interceptors.response.use(
  (response) => {
    console.log(`✅ API 응답: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('❌ API 응답 에러:', error.response?.status, error.message);
    return Promise.reject(error);
  }
);

// Todo API 서비스 함수들
export const todoService = {
  // 전체 Todo 조회
  async getAllTodos() {
    try {
      const response = await apiClient.get('/todos');
      return {
        success: true,
        data: response.data.data,
        count: response.data.count
      };
    } catch (error) {
      console.error('Todo 조회 실패:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Todo 조회에 실패했습니다'
      };
    }
  },

  // 새 Todo 추가
  async createTodo(text) {
    try {
      const response = await apiClient.post('/todos', { text });
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('Todo 생성 실패:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Todo 생성에 실패했습니다'
      };
    }
  },

  // Todo 수정 (완료 상태 토글 또는 텍스트 수정)
  async updateTodo(id, updates) {
    try {
      const response = await apiClient.put(`/todos/${id}`, updates);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('Todo 수정 실패:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Todo 수정에 실패했습니다'
      };
    }
  },

  // Todo 삭제
  async deleteTodo(id) {
    try {
      await apiClient.delete(`/todos/${id}`);
      return {
        success: true,
        message: 'Todo가 삭제되었습니다'
      };
    } catch (error) {
      console.error('Todo 삭제 실패:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Todo 삭제에 실패했습니다'
      };
    }
  },

  // Todo 완료 상태 토글 (편의 함수)
  async toggleTodo(id, completed) {
    return this.updateTodo(id, { completed });
  }
};

export default todoService;
