import * as vscode from 'vscode';

export interface Todo {
  id: number;
  text: string;
  completed: boolean;
  createdAt: number;
}

const getTodoKey = (workspaceUri: vscode.Uri): string => {
  return `todos-${workspaceUri.path}`;
};

export const loadTodos = (workspaceUri: vscode.Uri, globalState: vscode.Memento): Todo[] => {
  const key = getTodoKey(workspaceUri);
  const todos = globalState.get<Todo[]>(key);
  return todos || [];
};

export const saveTodos = (workspaceUri: vscode.Uri, globalState: vscode.Memento, todos: Todo[]): void => {
  const key = getTodoKey(workspaceUri);
  globalState.update(key, todos);
};

export const addTodo = (
  workspaceUri: vscode.Uri,
  globalState: vscode.Memento,
  text: string
): Todo[] => {
  const todos = loadTodos(workspaceUri, globalState);
  const newTodo: Todo = {
    id: Date.now(),
    text,
    completed: false,
    createdAt: Date.now(),
  };
  const updatedTodos = [...todos, newTodo];
  saveTodos(workspaceUri, globalState, updatedTodos);
  return updatedTodos;
};

export const toggleTodo = (
  workspaceUri: vscode.Uri,
  globalState: vscode.Memento,
  id: number
): Todo[] => {
  const todos = loadTodos(workspaceUri, globalState);
  const updatedTodos = todos.map((todo) =>
    todo.id === id ? { ...todo, completed: !todo.completed } : todo
  );
  saveTodos(workspaceUri, globalState, updatedTodos);
  return updatedTodos;
};

export const deleteTodo = (
  workspaceUri: vscode.Uri,
  globalState: vscode.Memento,
  id: number
): Todo[] => {
  const todos = loadTodos(workspaceUri, globalState);
  const updatedTodos = todos.filter((todo) => todo.id !== id);
  saveTodos(workspaceUri, globalState, updatedTodos);
  return updatedTodos;
};