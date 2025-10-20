import React from 'react';

function TodoItem({ todo, index, onToggle, onDelete, isDarkMode = false, dragListeners }) {
  return (
    <div className={`p-4 border-2 rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-lg ${
      todo.completed 
        ? isDarkMode
          ? 'bg-gray-800/50 border-gray-600 opacity-75' 
          : 'bg-gray-50 border-gray-200 opacity-75'
        : isDarkMode
          ? 'bg-gray-800/80 border-gray-600 hover:shadow-xl hover:shadow-gray-900/30' 
          : 'bg-white border-pink-200 hover:shadow-xl hover:shadow-pink-100'
    }`}>
      <div className="flex justify-between items-start min-h-[80px] py-4">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div 
            {...dragListeners}
            className={`cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 transition-colors select-none flex-shrink-0 ${
              isDarkMode ? 'hover:text-gray-300' : 'hover:text-gray-500'
            }`}
          >
            ⋮⋮
          </div>
          <div className={`flex items-center justify-center w-10 h-10 rounded-full text-sm font-bold flex-shrink-0 ${
            todo.completed 
              ? isDarkMode
                ? 'bg-gray-600 text-gray-400'
                : 'bg-gray-300 text-gray-600'
              : isDarkMode
                ? 'bg-pink-500 text-white'
                : 'bg-pink-400 text-white'
          }`}>
            {index + 1}
          </div>
          <span className={`transition-colors text-lg font-medium break-words ${
            todo.completed 
              ? 'line-through text-gray-500' 
              : isDarkMode 
                ? 'text-gray-200' 
                : 'text-gray-800'
          }`}>
            {todo.text}
          </span>
        </div>
        <div className="flex gap-2 ml-4 pointer-events-auto flex-shrink-0 mt-2">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onToggle(todo);
            }}
            className={`px-3 py-2 text-sm font-semibold rounded-lg transition-all duration-300 pointer-events-auto shadow-md hover:shadow-lg ${
              todo.completed
                ? 'bg-blue-500 hover:bg-blue-600 text-white hover:scale-105'
                : 'bg-green-500 hover:bg-green-600 text-white hover:scale-105'
            }`}
          >
            {todo.completed ? '↩️' : '✅'}
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="px-3 py-2 text-sm font-semibold bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all duration-300 pointer-events-auto shadow-md hover:shadow-lg hover:scale-105"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
}

export default TodoItem;
