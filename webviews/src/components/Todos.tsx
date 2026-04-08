import { useState, useEffect, useCallback } from 'react';

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

const vscode = window.acquireVsCodeApi();

export const Todos: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleMessage = (event: MessageEvent): void => {
      const message = event.data;
      if (!message || typeof message.type !== 'string') {
        return;
      }

      if (message.type === 'todos') {
        setTodos(message.data || []);
        setIsLoading(false);
        setError(null);
      } else if (message.type === 'error') {
        setError(message.error || 'Unknown error');
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
    vscode.postMessage({ type: 'add', text: newTodo.trim() });
    setNewTodo('');
  }, [newTodo]);

  const toggleTodo = useCallback((id: number) => {
    vscode.postMessage({ type: 'toggle', id });
  }, []);

  const deleteTodo = useCallback((id: number) => {
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
        <span>Loading...</span>
      </div>
    );
  }

  const completedCount = todos.filter((t) => t.completed).length;
  const progress = todos.length > 0 ? Math.round((completedCount / todos.length) * 100) : 0;

  return (
    <div className="todos-container">
      <div className="add-todo-form">
        <input
          className="todo-input"
          type="text"
          placeholder="What needs to be done?"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button className="add-button" onClick={addTodo}>
          Add
        </button>
      </div>

      {error && <p className="error-message">{error}</p>}

      {todos.length > 0 && (
        <div className="progress-section">
          <div className="progress-info">
            <span>{completedCount}/{todos.length} done</span>
            <span>{progress}%</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      {todos.length === 0 && !error ? (
        <div className="empty-state">
          <div className="empty-icon">&#9745;</div>
          <div className="empty-text">No todos yet</div>
        </div>
      ) : (
        <ul className="todos-list">
          {todos.map((todo) => (
            <li
              key={todo.id}
              className={`todo-item ${todo.completed ? 'completed' : ''}`}
            >
              <button
                className="todo-checkbox"
                onClick={() => toggleTodo(todo.id)}
                title={todo.completed ? 'Mark as incomplete' : 'Mark as complete'}
              >
                {todo.completed ? '✓' : ''}
              </button>
              <span
                className="todo-text"
                onClick={() => toggleTodo(todo.id)}
              >
                {todo.text}
              </span>
              <button
                className="delete-button"
                onClick={() => deleteTodo(todo.id)}
                title="Delete"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
