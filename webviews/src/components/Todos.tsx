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

const formatCreatedAt = (createdAt: number): string => {
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
  }).format(new Date(createdAt));
};

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
  const remainingCount = todos.length - completedCount;

  return (
    <div className="todos-shell">
      <header className="todos-header">
        <h1 className="todos-title">Todo List</h1>
        <p className="todos-subtitle">Simple tasks for this workspace.</p>
      </header>

      <section className="composer-card">
        <div className="add-todo-form">
          <input
            className="todo-input"
            type="text"
            placeholder="What needs to be done?"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            className="add-button"
            onClick={addTodo}
            disabled={newTodo.trim().length === 0}
          >
            Add
          </button>
        </div>
      </section>

      {error && <p className="error-message">{error}</p>}

      {todos.length > 0 && (
        <p className="summary-text">
          {todos.length} total · {completedCount} done · {remainingCount} left
        </p>
      )}

      {todos.length === 0 && !error ? (
        <section className="empty-state">
          <p className="empty-text">No tasks yet.</p>
        </section>
      ) : (
        <section className="list-card">
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
                  aria-label={todo.completed ? 'Mark task as incomplete' : 'Mark task as complete'}
                >
                  {todo.completed ? '✓' : ''}
                </button>
                <div className="todo-copy">
                  <button
                    className="todo-title-button"
                    onClick={() => toggleTodo(todo.id)}
                    title={todo.completed ? 'Mark as incomplete' : 'Mark as complete'}
                  >
                    <span className="todo-text">{todo.text}</span>
                  </button>
                  <div className="todo-meta">
                    <span className="todo-date">Created {formatCreatedAt(todo.createdAt)}</span>
                  </div>
                </div>
                <button
                  className="delete-button"
                  onClick={() => deleteTodo(todo.id)}
                  title="Delete task"
                  aria-label="Delete task"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
};
