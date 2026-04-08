import * as vscode from 'vscode';
import { getNonce } from './helpers/getNonce';
import {
  loadTodos,
  addTodo,
  toggleTodo,
  deleteTodo,
} from './todoStorage';

export class SidebarProvider implements vscode.WebviewViewProvider {
  private readonly _extensionUri: vscode.Uri;
  private readonly _globalState: vscode.Memento;
  private _view?: vscode.WebviewView;

  constructor(extensionUri: vscode.Uri, globalState: vscode.Memento) {
    this._extensionUri = extensionUri;
    this._globalState = globalState;
  }

  public resolveWebviewView(webviewView: vscode.WebviewView): void {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri],
    };

    // Register message handler BEFORE setting HTML to avoid race conditions
    webviewView.webview.onDidReceiveMessage(async (data) => {
      await this._handleMessage(data);
    });

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);
  }

  public revive(webviewView: vscode.WebviewView): void {
    this._view = webviewView;
  }

  private async _handleMessage(
    data: unknown
  ): Promise<void> {
    const message = data as { type: string; text?: string; id?: number };

    const workspaceUri = vscode.workspace.workspaceFolders?.[0]?.uri;
    if (!workspaceUri) {
      this._view?.webview.postMessage({
        type: 'error',
        error: 'No workspace folder open',
      });
      return;
    }

    let todos;
    switch (message.type) {
      case 'load':
        todos = loadTodos(workspaceUri, this._globalState);
        this._view?.webview.postMessage({ type: 'todos', data: todos });
        break;

      case 'add':
        if (!message.text) {
          return;
        }
        todos = addTodo(workspaceUri, this._globalState, message.text);
        this._view?.webview.postMessage({ type: 'todos', data: todos });
        break;

      case 'toggle':
        if (typeof message.id !== 'number') {
          return;
        }
        todos = toggleTodo(workspaceUri, this._globalState, message.id);
        this._view?.webview.postMessage({ type: 'todos', data: todos });
        break;

      case 'delete':
        if (typeof message.id !== 'number') {
          return;
        }
        todos = deleteTodo(workspaceUri, this._globalState, message.id);
        this._view?.webview.postMessage({ type: 'todos', data: todos });
        break;

      default:
        break;
    }
  }

  private _getHtmlForWebview(webview: vscode.Webview): string {
    const nonce = getNonce();

    const styleResetUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, 'media', 'reset.css')
    );

    const styleVSCodeUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, 'media', 'vscode.css')
    );

    const styleWebviewUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, 'dist', 'webview.css')
    );

    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, 'dist', 'webview.js')
    );

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy" content="img-src ${webview.cspSource} https: data:; style-src 'unsafe-inline' ${webview.cspSource}; script-src 'nonce-${nonce}';">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="${styleResetUri}" rel="stylesheet">
  <link href="${styleVSCodeUri}" rel="stylesheet">
  <link href="${styleWebviewUri}" rel="stylesheet">
</head>
<body>
  <div id="root"><p style="padding:12px;color:#ccc;">Loading todo list...</p></div>
  <script nonce="${nonce}">
    window.onerror = function(msg, src, line, col, err) {
      document.getElementById('root').innerHTML =
        '<pre style="padding:12px;color:#f14c4c;font-size:12px;white-space:pre-wrap;">' +
        'Script error:\\n' + msg + '\\nSource: ' + src + '\\nLine: ' + line +
        (err ? '\\n' + err.stack : '') + '</pre>';
    };
  </script>
  <script nonce="${nonce}" src="${scriptUri}"></script>
</body>
</html>`;
  }
}
