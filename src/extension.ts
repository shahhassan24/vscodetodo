
import * as vscode from 'vscode';
import { WebviewPanel } from './WebviewPanel';
import { SidebarProvider } from './SidebarProvider';

export function activate(context: vscode.ExtensionContext) {

	console.log('Congratulations, your extension "todo-list" is now active!');

	
	const sidebarProvider = new SidebarProvider(context.extensionUri);
	context.subscriptions.push(
	  vscode.window.registerWebviewViewProvider(
		"todolist-sidebar",
		sidebarProvider
	  )
	);

	let disposable = vscode.commands.registerCommand('todo-list.helloWorld', () => {

		vscode.window.showInformationMessage('Hello World from todo list! This is for test to check if extension is running');
	});

	


	context.subscriptions.push(disposable);

	context.subscriptions.push(vscode.commands.registerCommand('todo-list.webviewPanel', () => {
		WebviewPanel.createOrShow(context.extensionUri)
	}))
}

export function deactivate() {}
