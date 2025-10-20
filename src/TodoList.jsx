import React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import TodoItem from './TodoItem';

function SortableTodoItem({ todo, index, onToggle, onDelete, isDarkMode }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: todo.id || index });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <TodoItem
        todo={todo}
        index={index}
        onToggle={onToggle}
        onDelete={onDelete}
        isDarkMode={isDarkMode}
        dragListeners={listeners}
      />
    </div>
  );
}

function TodoList({ todos, onToggle, onDelete, onReorder, isDarkMode = false }) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = todos.findIndex(todo => (todo.id || todos.indexOf(todo)) === active.id);
      const newIndex = todos.findIndex(todo => (todo.id || todos.indexOf(todo)) === over.id);
      
      onReorder(oldIndex, newIndex);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={todos.map((todo, index) => todo.id || index)} strategy={verticalListSortingStrategy}>
        <div className="grid grid-cols-1 gap-6">
          {todos.map((todo, index) => (
            <SortableTodoItem
              key={todo.id || index}
              todo={todo}
              index={index}
              onToggle={() => onToggle(todo)}
              onDelete={() => onDelete(todo)}
              isDarkMode={isDarkMode}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

export default TodoList;