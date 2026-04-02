import * as vscode from 'vscode';
import { SidebarProvider } from './SidebarProvider';

export function activate(context: vscode.ExtensionContext): void {
  console.log('Congratulations, your extension "todo-list" is now active!');

  const sidebarProvider = new SidebarProvider(
    context.extensionUri,
    context.globalState
  );

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      'todolist-sidebar',
      sidebarProvider
    )
  );
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
export function deactivate(): void {}