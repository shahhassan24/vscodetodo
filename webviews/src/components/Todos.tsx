import React, { useState, useEffect, useCallback } from 'react';

interface Todo {
  id: number;
  text: string;
  completed: boolean;
  createdAt: number;
}

interface VsCodeApi {
  postMessage: (message: unknown) => void;
}

declare global {
  interface Window {
    acquireVsCodeApi: () => VsCodeApi;
  }
}

const getVsCodeApi = (): VsCodeApi => {
  return window.acquireVsCodeApi();
};

export const Todos: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const vscode = getVsCodeApi();

    const handleMessage = (event: MessageEvent): void => {
      const message = event.data as { type: string; data?: Todo[]; error?: string };

      if (message.type === 'todos') {
        setTodos(message.data || []);
        setIsLoading(false);
      } else if (message.type === 'error') {
        console.error('Error from extension:', message.error);
        setIsLoading(false);
      }
    };

    window.addEventListener('message', handleMessage);

    vscode.postMessage({ type: 'load' });

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  const addTodo = useCallback(() => {
    if (newTodo.trim() === '') {
      return;
    }

    const vscode = getVsCodeApi();
    vscode.postMessage({
      type: 'add',
      text: newTodo.trim(),
    });
    setNewTodo('');
  }, [newTodo]);

  const toggleTodo = useCallback((id: number) => {
    const vscode = getVsCodeApi();
    vscode.postMessage({ type: 'toggle', id });
  }, []);

  const deleteTodo = useCallback((id: number) => {
    const vscode = getVsCodeApi();
    vscode.postMessage({ type: 'delete', id });
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      addTodo();
    }
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <span>Loading todos...</span>
      </div>
    );
  }

  return (
    <div className="todos-container">
      <h3 className="center-heading">Project Todos</h3>

      {todos.length === 0 ? (
        <p className="empty-message">No todos yet. Add one below!</p>
      ) : (
        <ul className="todos-list">
          {todos.map((todo) => (
            <li
              key={todo.id}
              className={`todo-item ${todo.completed ? 'completed' : ''}`}
            >
              <span
                className="todo-text"
                onClick={() => toggleTodo(todo.id)}
              >
                {todo.text}
              </span>
              <span className="todo-actions">
                <button
                  className="icon-button check-button"
                  onClick={() => toggleTodo(todo.id)}
                  title={todo.completed ? 'Mark as incomplete' : 'Mark as complete'}
                >
                  ✓
                </button>
                <button
                  className="icon-button delete-button"
                  onClick={() => deleteTodo(todo.id)}
                  title="Delete todo"
                >
                  ✕
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}

      <div className="add-todo-form">
        <input
          className="text-field-center"
          type="text"
          placeholder="Add a new todo..."
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button className="center-button" onClick={addTodo}>
          Add Todo
        </button>
      </div>

      <div className="todo-stats">
        {todos.length} todo{todos.length !== 1 ? 's' : ''} · {todos.filter((t) => t.completed).length} completed
      </div>
    </div>
  );
};