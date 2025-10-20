import axios from 'axios';

const API_BASE_URL = 'http://localhost:3002/api';

// AI 할 일 분해 API 호출
export const breakDownTask = async (task) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/ai/generate`, {
      prompt: task
    });
    
    if (response.data.success) {
      // AI 응답을 줄바꿈으로 분리하여 배열로 변환
      const steps = response.data.text.split('\n').filter(step => step.trim() !== '');
      return {
        success: true,
        steps: steps
      };
    } else {
      throw new Error(response.data.error || 'AI 분해 실패');
    }
  } catch (error) {
    console.error('AI 서비스 오류:', error);
    return {
      success: false,
      error: error.response?.data?.error || error.message || 'AI 서비스 연결 실패'
    };
  }
};

// 서버 상태 확인
export const checkServerHealth = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/health`);
    return response.data.success;
  } catch (error) {
    console.error('서버 상태 확인 실패:', error);
    return false;
  }
};
