import * as vscode from 'vscode';
import { SidebarProvider } from './SidebarProvider';

export function activate(context: vscode.ExtensionContext): void {
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

export function deactivate(): void {}
