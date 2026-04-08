import * as vscode from 'vscode';

export interface Todo {
  id: number;
  text: string;
  completed: boolean;
  createdAt: number;
}

const WORKSPACE_TODOS_KEY = 'todos';

const getLegacyTodoKey = (workspaceUri: vscode.Uri): string => {
  return `todos-${workspaceUri.path}`;
};

export const loadTodos = async (
  workspaceUri: vscode.Uri,
  workspaceState: vscode.Memento,
  globalState: vscode.Memento
): Promise<Todo[]> => {
  const workspaceTodos = workspaceState.get<Todo[]>(WORKSPACE_TODOS_KEY);
  if (workspaceTodos) {
    return workspaceTodos;
  }

  const legacyKey = getLegacyTodoKey(workspaceUri);
  const legacyTodos = globalState.get<Todo[]>(legacyKey);
  if (!legacyTodos) {
    return [];
  }

  await workspaceState.update(WORKSPACE_TODOS_KEY, legacyTodos);
  await globalState.update(legacyKey, undefined);
  return legacyTodos;
};

export const saveTodos = async (
  workspaceState: vscode.Memento,
  todos: Todo[]
): Promise<void> => {
  await workspaceState.update(WORKSPACE_TODOS_KEY, todos);
};

export const addTodo = async (
  todos: Todo[],
  workspaceState: vscode.Memento,
  text: string
): Promise<Todo[]> => {
  const newTodo: Todo = {
    id: Date.now(),
    text,
    completed: false,
    createdAt: Date.now(),
  };
  const updatedTodos = [...todos, newTodo];
  await saveTodos(workspaceState, updatedTodos);
  return updatedTodos;
};

export const toggleTodo = async (
  todos: Todo[],
  workspaceState: vscode.Memento,
  id: number
): Promise<Todo[]> => {
  const updatedTodos = todos.map((todo) =>
    todo.id === id ? { ...todo, completed: !todo.completed } : todo
  );
  await saveTodos(workspaceState, updatedTodos);
  return updatedTodos;
};

export const deleteTodo = async (
  todos: Todo[],
  workspaceState: vscode.Memento,
  id: number
): Promise<Todo[]> => {
  const updatedTodos = todos.filter((todo) => todo.id !== id);
  await saveTodos(workspaceState, updatedTodos);
  return updatedTodos;
};
