# Todo List for VS Code

A lightweight sidebar extension for managing project-specific todo lists directly inside VS Code.

## Features

- **Sidebar Panel** - Dedicated todo list in the activity bar, always one click away
- **Per-Project Todos** - Each workspace/folder gets its own separate todo list
- **Add Todos** - Type and press Enter (or click Add) to create tasks
- **Toggle Complete** - Click the checkbox or text to mark items done/undone
- **Delete Todos** - Hover a todo and click the delete button to remove it
- **Progress Tracking** - Visual progress bar shows completion percentage
- **Persistent Storage** - Todos are saved in VS Code's global state and survive restarts
- **Theme Support** - Fully adapts to your VS Code color theme (light, dark, high contrast)

## Usage

1. Click the **Todo List** icon in the activity bar (left sidebar)
2. Type a task in the input field and press **Enter**
3. Click a todo's checkbox to toggle completion
4. Hover and click **✕** to delete a todo

## Development

```bash
# Install dependencies
npm install

# Compile (webview + extension)
npm run compile

# Watch for changes during development
npm run watch

# Package for production
npm run package
```

## Tech Stack

- **Extension**: TypeScript, VS Code Extension API, Webpack
- **Webview UI**: React 19, TypeScript, Vite (IIFE bundle)
- **Storage**: VS Code `globalState` (per-workspace key)
