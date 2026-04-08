# Todo List Extension

## Quick Test

```bash
npm run compile
NODE_ENV=production npx rollup -c
# Then press F5 in VSCode
```

## Usage

1. Open a project folder in VSCode (not this extension folder)
2. Look for "ToDo" in the left sidebar
3. Add/toggle/delete todos - they persist per project

## Storage

Uses VSCode workspaceState with key `todos-{workspacePath}`. Each project has its own list.

## Commands

| Command | Purpose |
|---------|---------|
| `npm run compile` | Build extension |
| `npx rollup -c` | Build webview (add `NODE_ENV=production` for no server) |
| `npm run watch` | Watch mode |
| `npm run lint` | Lint |