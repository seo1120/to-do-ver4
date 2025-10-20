import React, { useState, useEffect } from 'react';
import { arrayMove } from '@dnd-kit/sortable';
import TodoList from './TodoList';
import AuthForm from './AuthForm';
import starImage from '/pink-dot-star96.png';
import { todoService } from './services/todoService';
import { authService } from './services/authService';
import { breakDownTask } from './services/aiService';

function TodoApp() {
  const [todos, setTodos] = useState([]);
  const [inputText, setInputText] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'active', 'completed'
  const [searchText, setSearchText] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // AI 관련 상태
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSteps, setAiSteps] = useState([]);
  const [showAiSteps, setShowAiSteps] = useState(false);
  
  // 인증 관련 상태
  const [user, setUser] = useState(null);
  const [showAuthForm, setShowAuthForm] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  // 인증 상태 확인 및 감지
  useEffect(() => {
    // 초기 사용자 상태 확인
    const checkUser = async () => {
      const result = await authService.getCurrentUser();
      if (result.success && result.user) {
        setUser(result.user);
        console.log('✅ 사용자 로그인 상태:', result.user.email);
      } else {
        setUser(null);
        console.log('❌ 사용자 로그인되지 않음');
      }
      setAuthLoading(false);
    };

    checkUser();

    // 인증 상태 변경 감지
    const { data: { subscription } } = authService.onAuthStateChange((event, session) => {
      console.log('🔐 인증 상태 변경:', event, session?.user?.email);
      setUser(session?.user || null);
      setAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 서버에서 데이터 로드 (컴포넌트 마운트 시 한 번만)
  useEffect(() => {
    console.log('=== 컴포넌트 마운트: 서버에서 데이터 로드 시작 ===');
    
    // 다크모드 설정 로드 (로컬스토리지에서)
    const savedDarkMode = localStorage.getItem('dark-mode');
    if (savedDarkMode) {
      const darkModeValue = JSON.parse(savedDarkMode);
      setIsDarkMode(darkModeValue);
      
      // body 태그에 dark 클래스 설정
      if (darkModeValue) {
        document.body.classList.add('dark');
      } else {
        document.body.classList.remove('dark');
      }
    }
    
    // 사용자가 로그인되어 있을 때만 Todo 데이터 로드
    if (user) {
      loadTodos();
    }
  }, [user]);

  // 서버에서 Todo 데이터 로드 함수
  const loadTodos = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await todoService.getAllTodos();
      if (result.success) {
        setTodos(result.data);
        console.log('✅ 서버에서 데이터 로드 성공:', result.data);
      } else {
        setError(result.error);
        console.error('❌ 서버 데이터 로드 실패:', result.error);
      }
    } catch (error) {
      setError('서버 연결에 실패했습니다. 서버가 실행 중인지 확인해주세요.');
      console.error('❌ 서버 연결 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  // todos 상태 변경 로깅 (서버 연동으로 인해 localStorage 저장 제거)
  useEffect(() => {
    console.log('=== todos 변경됨:', todos);
    console.log('todos 길이:', todos.length);
  }, [todos]);

  // 다크모드 상태 저장 및 body 클래스 업데이트
  useEffect(() => {
    localStorage.setItem('dark-mode', JSON.stringify(isDarkMode));
    
    // body 태그에 dark 클래스 추가/제거
    if (isDarkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [isDarkMode]);

  const addTodo = async () => {
    const trimmedText = inputText.trim();
    if (trimmedText === '') {
      alert('할 일을 입력해주세요!');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await todoService.createTodo(trimmedText);
      if (result.success) {
        setTodos(prevTodos => [result.data, ...prevTodos]);
        setInputText('');
        console.log('✅ Todo 추가 성공:', result.data);
      } else {
        setError(result.error);
        alert(`Todo 추가 실패: ${result.error}`);
      }
    } catch (error) {
      setError('서버 연결에 실패했습니다.');
      alert('서버 연결에 실패했습니다. 서버가 실행 중인지 확인해주세요.');
      console.error('❌ Todo 추가 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  // AI 할 일 분해 함수
  const handleAiBreakdown = async () => {
    const trimmedText = inputText.trim();
    if (trimmedText === '') {
      alert('분해할 할 일을 입력해주세요!');
      return;
    }

    setAiLoading(true);
    setError(null);

    try {
      const result = await breakDownTask(trimmedText);
      if (result.success) {
        setAiSteps(result.steps);
        setShowAiSteps(true);
        console.log('✅ AI 분해 성공:', result.steps);
      } else {
        setError(result.error);
        alert(`AI 분해 실패: ${result.error}`);
      }
    } catch (error) {
      setError('AI 서비스 연결에 실패했습니다.');
      alert('AI 서비스 연결에 실패했습니다. 서버가 실행 중인지 확인해주세요.');
      console.error('❌ AI 분해 실패:', error);
    } finally {
      setAiLoading(false);
    }
  };

  // AI 단계를 개별 Todo로 추가하는 함수
  const addAiStepsAsTodos = async () => {
    setLoading(true);
    try {
      for (const step of aiSteps) {
        const result = await todoService.createTodo(step);
        if (result.success) {
          setTodos(prevTodos => [result.data, ...prevTodos]);
        }
      }
      setShowAiSteps(false);
      setAiSteps([]);
      setInputText('');
      console.log('✅ AI 단계들이 Todo로 추가됨');
    } catch (error) {
      console.error('❌ AI 단계 추가 실패:', error);
      alert('AI 단계 추가에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const toggleTodo = async (todoToToggle) => {
    setLoading(true);
    setError(null);

    try {
      const result = await todoService.toggleTodo(todoToToggle.id, !todoToToggle.completed);
      if (result.success) {
        setTodos(todos.map(todo => 
          todo.id === todoToToggle.id ? result.data : todo
        ));
        console.log('✅ Todo 상태 변경 성공:', result.data);
      } else {
        setError(result.error);
        alert(`Todo 상태 변경 실패: ${result.error}`);
      }
    } catch (error) {
      setError('서버 연결에 실패했습니다.');
      alert('서버 연결에 실패했습니다. 서버가 실행 중인지 확인해주세요.');
      console.error('❌ Todo 상태 변경 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteTodo = async (todoToDelete) => {
    setLoading(true);
    setError(null);

    try {
      const result = await todoService.deleteTodo(todoToDelete.id);
      if (result.success) {
        setTodos(todos.filter(todo => todo.id !== todoToDelete.id));
        console.log('✅ Todo 삭제 성공:', todoToDelete);
      } else {
        setError(result.error);
        alert(`Todo 삭제 실패: ${result.error}`);
      }
    } catch (error) {
      setError('서버 연결에 실패했습니다.');
      alert('서버 연결에 실패했습니다. 서버가 실행 중인지 확인해주세요.');
      console.error('❌ Todo 삭제 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const reorderTodos = (oldIndex, newIndex) => {
    setTodos(arrayMove(todos, oldIndex, newIndex));
  };

  // 일괄 작업 함수들
  const completeAll = async () => {
    setLoading(true);
    setError(null);

    try {
      // 모든 미완료 Todo를 완료로 변경
      const incompleteTodos = todos.filter(todo => !todo.completed);
      const updatePromises = incompleteTodos.map(todo => 
        todoService.updateTodo(todo.id, { completed: true })
      );
      
      const results = await Promise.all(updatePromises);
      const successfulUpdates = results.filter(result => result.success);
      
      if (successfulUpdates.length > 0) {
        // 성공한 업데이트들을 반영
        const updatedTodos = todos.map(todo => {
          const update = successfulUpdates.find(result => result.data.id === todo.id);
          return update ? update.data : todo;
        });
        setTodos(updatedTodos);
        console.log('✅ 모든 Todo 완료 처리 성공');
      }
    } catch (error) {
      setError('일부 Todo 완료 처리에 실패했습니다.');
      alert('일부 Todo 완료 처리에 실패했습니다.');
      console.error('❌ Todo 일괄 완료 처리 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearAllTodos = async () => {
    if (!confirm('모든 Todo를 삭제하시겠습니까?')) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 모든 Todo를 하나씩 삭제
      const deletePromises = todos.map(todo => todoService.deleteTodo(todo.id));
      await Promise.all(deletePromises);
      
      setTodos([]);
      console.log('✅ 모든 Todo 삭제 성공');
    } catch (error) {
      setError('일부 Todo 삭제에 실패했습니다.');
      alert('일부 Todo 삭제에 실패했습니다.');
      console.error('❌ Todo 일괄 삭제 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  // 인증 관련 함수들
  const handleAuthSuccess = () => {
    setShowAuthForm(false);
    // 사용자 상태는 useEffect에서 자동으로 업데이트됨
  };

  const handleLogout = async () => {
    const result = await authService.signOut();
    if (result.success) {
      setUser(null);
      setTodos([]); // 로그아웃 시 Todo 목록 초기화
      console.log('✅ 로그아웃 성공');
    } else {
      console.error('❌ 로그아웃 실패:', result.error);
    }
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  // 필터링된 할 일 목록
  const filteredTodos = todos.filter(todo => {
    // 검색 필터
    const matchesSearch = todo.text.toLowerCase().includes(searchText.toLowerCase());
    
    // 상태 필터
    if (filter === 'active') return !todo.completed && matchesSearch;
    if (filter === 'completed') return todo.completed && matchesSearch;
    return matchesSearch; // 'all'
  });

  // 통계 계산
  const totalTodos = todos.length;
  const completedTodos = todos.filter(todo => todo.completed).length;
  const pendingTodos = totalTodos - completedTodos;
  const progressPercentage = totalTodos > 0 ? Math.round((completedTodos / totalTodos) * 100) : 0;

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-gray-900 text-white' 
        : 'bg-pink-50 text-gray-900'
    }`}>
      <div className="container mx-auto p-4 md:p-8 max-w-2xl">
        <div className="mb-8">
          {/* 로그인/로그아웃 버튼 - 오른쪽 상단 고정 */}
          <div className="flex justify-end mb-4">
            <div className={`px-4 py-3 rounded-xl shadow-lg ${
              isDarkMode 
                ? 'bg-gray-800 border border-gray-700' 
                : 'bg-white border border-pink-200'
            }`}>
              {authLoading ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-pink-500"></div>
              ) : user ? (
                <div className="flex items-center gap-4">
                  <span className={`text-sm font-medium ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    안녕하세요, {user.email.split('@')[0]}님! 👋
                  </span>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm rounded-lg transition-all duration-300 hover:scale-105 shadow-lg"
                  >
                    로그아웃
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowAuthForm(true)}
                  className="px-6 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg transition-all duration-300 hover:scale-105 shadow-lg font-medium"
                >
                  로그인
                </button>
              )}
            </div>
          </div>
          
          {/* 제목 - 가운데 정렬 */}
          <div className="text-center">
            <h1 className={`text-2xl md:text-3xl font-bold flex items-center justify-center gap-3 ${
              isDarkMode ? 'text-white' : 'text-gray-600'
            }`}>
              <img 
                src={starImage} 
                alt="루미" 
                className="w-8 h-8 md:w-10 md:h-10"
              />
              루미의 Todo 리스트 ver4
            </h1>
          </div>
          <p className={`text-sm text-center ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            할 일을 관리하고 꿈을 이뤄가세요! 💕
          </p>
          
          {/* 로딩 상태 표시 */}
          {loading && (
            <div className={`mt-4 p-3 rounded-lg ${
              isDarkMode ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-50 text-blue-600'
            }`}>
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                <span className="text-sm">처리 중...</span>
              </div>
            </div>
          )}
          
          {/* 에러 메시지 표시 */}
          {error && (
            <div className={`mt-4 p-3 rounded-lg ${
              isDarkMode ? 'bg-red-900/50 text-red-300' : 'bg-red-50 text-red-600'
            }`}>
              <div className="flex items-center justify-center gap-2">
                <span>⚠️</span>
                <span className="text-sm">{error}</span>
                <button 
                  onClick={() => setError(null)}
                  className="ml-2 text-xs underline hover:no-underline"
                >
                  닫기
                </button>
              </div>
            </div>
          )}
        </div>
      
      {/* 로그인하지 않은 경우 안내 메시지 */}
      {!user && !authLoading && (
        <div className={`p-8 rounded-2xl mb-6 shadow-lg text-center ${
          isDarkMode 
            ? 'bg-gray-800/80 backdrop-blur-sm border border-gray-700' 
            : 'bg-white/80 backdrop-blur-sm border border-pink-200 shadow-pink-100'
        }`}>
          <div className="mb-6">
            <div className="text-6xl mb-4">🔐</div>
            <h2 className={`text-2xl font-bold mb-2 ${
              isDarkMode ? 'text-white' : 'text-gray-800'
            }`}>
              Todo를 시작해보세요!
            </h2>
            <p className={`text-lg ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              로그인하여 나만의 할 일을 관리하세요
            </p>
          </div>
          <button
            onClick={() => setShowAuthForm(true)}
            className="px-8 py-3 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-pink-200 hover:scale-105"
          >
            로그인 / 회원가입
          </button>
        </div>
      )}

      {/* 로그인한 사용자만 Todo 입력 폼 표시 */}
      {user && (
        <form onSubmit={(e) => {
          e.preventDefault();
          addTodo();
        }}>
        <div className={`p-6 rounded-2xl mb-6 shadow-lg ${
          isDarkMode 
            ? 'bg-gray-800/80 backdrop-blur-sm border border-gray-700' 
            : 'bg-white/80 backdrop-blur-sm border border-pink-200 shadow-pink-100'
        }`}>
          <div className="flex flex-col md:flex-row gap-4">
            <input 
              type="text" 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="✨ 새로운 할 일을 입력하세요"
              className={`flex-1 px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400 transition-all duration-300 ${
                isDarkMode 
                  ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white/90 border-pink-200 text-gray-900 placeholder-pink-400'
              }`}
              disabled={loading}
            />
            <div className="flex gap-2">
              <button 
                type="button"
                onClick={handleAiBreakdown}
                disabled={aiLoading || !inputText.trim()}
                className={`px-6 py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-blue-200 hover:scale-105 text-lg ${
                  aiLoading || !inputText.trim()
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700'
                } text-white`}
              >
                {aiLoading ? '🤖 AI 분석 중...' : '🤖 AI 분해'}
              </button>
              <button 
                type="submit"
                disabled={loading || !inputText.trim()}
                className={`px-8 py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-pink-200 hover:scale-105 text-lg ${
                  loading || !inputText.trim()
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-pink-400 to-pink-600 hover:from-pink-500 hover:to-pink-700'
                } text-white`}
              >
                {loading ? '⏳ 처리 중...' : '✨ 추가하기'}
              </button>
            </div>
          </div>
        </div>
        </form>
      )}
      
      {/* 검색 및 필터 - 로그인한 사용자만 */}
      {user && (
      <div className={`p-6 rounded-2xl mb-6 transition-all duration-300 shadow-lg ${
        isDarkMode 
          ? 'bg-gray-800/80 backdrop-blur-sm border border-gray-700' 
          : 'bg-white/80 backdrop-blur-sm border border-pink-200 shadow-pink-100'
      }`}>
        <div className="mb-4">
          <input 
            type="text"
            placeholder="🔍 할 일을 검색해보세요..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400 transition-all duration-300 ${
              isDarkMode 
                ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-400' 
                : 'bg-white/90 border-pink-200 text-gray-900 placeholder-pink-400'
            }`}
          />
        </div>
        <div className="flex flex-wrap gap-3 justify-center">
          <button 
            className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
              filter === 'all' 
                ? 'bg-gradient-to-r from-pink-300 to-pink-500 text-white shadow-lg' 
                : isDarkMode
                  ? 'bg-gray-700/50 text-gray-300 border border-gray-600 hover:bg-gray-600 hover:scale-105'
                  : 'bg-white/80 text-pink-600 border border-pink-200 hover:bg-pink-50 hover:scale-105'
            }`}
            onClick={() => setFilter('all')}
          >
            📋 전체
          </button>
          <button 
            className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
              filter === 'active' 
                ? 'bg-gradient-to-r from-pink-300 to-pink-500 text-white shadow-lg' 
                : isDarkMode
                  ? 'bg-gray-700/50 text-gray-300 border border-gray-600 hover:bg-gray-600 hover:scale-105'
                  : 'bg-white/80 text-pink-600 border border-pink-200 hover:bg-pink-50 hover:scale-105'
            }`}
            onClick={() => setFilter('active')}
          >
            ⏳ 진행중
          </button>
          <button 
            className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
              filter === 'completed' 
                ? 'bg-gradient-to-r from-pink-300 to-pink-500 text-white shadow-lg' 
                : isDarkMode
                  ? 'bg-gray-700/50 text-gray-300 border border-gray-600 hover:bg-gray-600 hover:scale-105'
                  : 'bg-white/80 text-pink-600 border border-pink-200 hover:bg-pink-50 hover:scale-105'
            }`}
            onClick={() => setFilter('completed')}
          >
            ✅ 완료
          </button>
        </div>
      </div>
      )}

      {/* 통계 및 진행률 - 로그인한 사용자만 */}
      {user && totalTodos > 0 && (
        <div className={`p-6 rounded-xl mb-6 transition-all duration-300 shadow-lg ${
          isDarkMode 
            ? 'bg-gray-800/80 backdrop-blur-sm border border-gray-700' 
            : 'bg-white/80 backdrop-blur-sm border border-pink-200 shadow-pink-100'
        }`}>
          <div className="flex flex-col md:flex-row gap-4 justify-center items-center mb-4">
            <span className={`text-sm font-medium ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>전체: {totalTodos}</span>
            <span className="text-sm font-medium text-pink-400">진행중: {pendingTodos}</span>
            <span className="text-sm font-medium text-pink-500">완료: {completedTodos}</span>
          </div>
          <div className="flex items-center gap-4">
            <div className={`flex-1 h-4 rounded-full overflow-hidden ${
              isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
            }`}>
              <div 
                className="h-full bg-pink-300 transition-all duration-300 ease-in-out"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            <span className={`text-sm font-bold min-w-[80px] ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              {progressPercentage}% 완료
            </span>
          </div>
        </div>
      )}

      {/* 일괄 작업 버튼 - 로그인한 사용자만 */}
      {user && totalTodos > 0 && (
        <div className="flex flex-col md:flex-row gap-3 justify-center mb-6">
          <button 
            onClick={completeAll} 
            className="px-6 py-3 bg-pink-300 hover:bg-pink-500 text-white rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-pink-200 hover:scale-105"
          >
            모두 완료
          </button>
          <button 
            onClick={clearAllTodos} 
            className="px-6 py-3 bg-blue-300 hover:bg-blue-500 text-white rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-pink-200 hover:scale-105"
          >
            모두 삭제
          </button>
        </div>
      )}

      {/* AI 분해 결과 표시 */}
      {user && showAiSteps && aiSteps.length > 0 && (
        <div className={`mt-6 p-6 rounded-2xl shadow-lg border-2 ${
          isDarkMode 
            ? 'bg-gray-800/80 backdrop-blur-sm border-blue-500' 
            : 'bg-blue-50/80 backdrop-blur-sm border-blue-300'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-blue-600 dark:text-blue-400">
              🤖 AI가 분해한 단계들
            </h3>
            <button
              onClick={() => setShowAiSteps(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              ✕
            </button>
          </div>
          
          <div className="space-y-3 mb-4">
            {aiSteps.map((step, index) => (
              <div key={index} className={`p-3 rounded-lg border-l-4 border-blue-400 ${
                isDarkMode ? 'bg-gray-700/50' : 'bg-white/70'
              }`}>
                <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                  {index + 1}.
                </span>
                <span className="ml-2 text-gray-800 dark:text-gray-200">
                  {step}
                </span>
              </div>
            ))}
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={addAiStepsAsTodos}
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 text-white rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-green-200 hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? '⏳ 추가 중...' : '✅ 모든 단계를 Todo로 추가'}
            </button>
            <button
              onClick={() => setShowAiSteps(false)}
              className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-semibold transition-all duration-300"
            >
              취소
            </button>
          </div>
        </div>
      )}
      
      {/* 할 일 목록 또는 빈 상태 메시지 - 로그인한 사용자만 */}
      {user && todos.length === 0 ? (
        <div className={`text-center py-12 transition-colors ${
          isDarkMode ? 'text-gray-400' : 'text-gray-500'
        }`}>
          <p className="text-lg mb-2">📝 아직 할 일이 없습니다.</p>
          <p className="text-sm">새로운 할 일을 추가해보세요!</p>
        </div>
      ) : user ? (
        <TodoList 
          todos={filteredTodos}
          onToggle={toggleTodo}
          onDelete={deleteTodo}
          onReorder={reorderTodos}
          isDarkMode={isDarkMode}
        />
      ) : null}
      </div>
      
      {/* 서버 재연결 버튼 - 작게 맨 밑에 */}
      <div className="text-center mt-8 mb-4">
        <button 
          onClick={loadTodos} 
          disabled={loading}
          className={`text-xs px-3 py-1 rounded-full transition-all duration-300 shadow-lg ${
            loading 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-pink-300 hover:bg-pink-500 hover:scale-105 hover:shadow-pink-200'
          } text-white`}
        >
          {loading ? '⏳ 연결 중...' : '🔄 서버 재연결'}
        </button>
      </div>
      
      {/* 오른쪽 하단 고정 다크모드 버튼 */}
      <button
        onClick={toggleDarkMode}
        className={`fixed bottom-6 right-6 p-4 rounded-full shadow-lg transition-all duration-300 z-50 hover:scale-110 ${
          isDarkMode 
            ? 'bg-pink-300 hover:bg-pink-500 text-white shadow-pink-200' 
            : 'bg-pink-300 hover:bg-pink-500 text-white shadow-pink-200'
        }`}
        title={isDarkMode ? '라이트 모드로 전환' : '다크 모드로 전환'}
      >
        {isDarkMode ? '☀️' : '🌙'}
      </button>

      {/* 인증 폼 모달 */}
      {showAuthForm && (
        <AuthForm 
          onAuthSuccess={handleAuthSuccess}
          onCancel={() => setShowAuthForm(false)}
          isDarkMode={isDarkMode}
        />
      )}
    </div>
  );
}

export default TodoApp;
