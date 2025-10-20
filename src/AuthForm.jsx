import React, { useState } from 'react';
import { authService } from './services/authService';

function AuthForm({ onAuthSuccess, onCancel, isDarkMode }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    let result;
    if (isLogin) {
      result = await authService.signIn(email, password);
    } else {
      result = await authService.signUp(email, password);
    }

    if (result.success) {
      setMessage(isLogin ? '로그인 성공!' : '회원가입 성공! 이메일 확인 후 로그인해주세요.');
      if (isLogin) {
        onAuthSuccess(result.user);
      }
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`rounded-2xl p-8 w-full max-w-md shadow-2xl transition-all duration-300 ${
        isDarkMode 
          ? 'bg-gray-900 border border-gray-700 text-gray-100' 
          : 'bg-white border border-pink-200 text-gray-800'
      }`}>
        <div className="text-center mb-6">
          <h2 className={`text-3xl font-bold mb-2 ${
            isDarkMode ? 'text-pink-300' : 'text-pink-600'
          }`}>
            {isLogin ? '로그인' : '회원가입'}
          </h2>
          <p className={`text-sm ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            {isLogin ? '계정에 로그인하세요' : '새 계정을 만들어보세요'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              이메일
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 ${
                isDarkMode 
                  ? 'bg-gray-800 border-gray-600 text-gray-100 focus:ring-pink-500' 
                  : 'bg-gray-50 border-gray-300 text-gray-900 focus:ring-pink-400'
              }`}
              required
            />
          </div>
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              비밀번호
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 ${
                isDarkMode 
                  ? 'bg-gray-800 border-gray-600 text-gray-100 focus:ring-pink-500' 
                  : 'bg-gray-50 border-gray-300 text-gray-900 focus:ring-pink-400'
              }`}
              required
            />
          </div>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          {message && <p className="text-green-500 text-sm text-center">{message}</p>}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg font-semibold transition-all duration-300 ${
              loading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-pink-400 to-pink-600 hover:from-pink-500 hover:to-pink-700 text-white shadow-lg hover:shadow-xl'
            }`}
          >
            {loading ? '처리 중...' : (isLogin ? '로그인' : '회원가입')}
          </button>
        </form>
        <div className="mt-6 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className={`text-sm font-medium ${
              isDarkMode ? 'text-pink-300 hover:text-pink-200' : 'text-pink-600 hover:text-pink-800'
            }`}
          >
            {isLogin ? '계정이 없으신가요? 회원가입' : '이미 계정이 있으신가요? 로그인'}
          </button>
          <button
            onClick={onCancel}
            className={`ml-4 text-sm font-medium ${
              isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
}

export default AuthForm;