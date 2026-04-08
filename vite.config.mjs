import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => {
  return {
    build: {
      outDir: 'dist',
      emptyOutDir: false,
      minify: mode === 'production',
      sourcemap: true,
      lib: {
        entry: resolve(process.cwd(), 'webviews/src/index.tsx'),
        formats: ['iife'],
        name: 'TodoListWebview',
        fileName: () => 'webview.js',
      },
    },
  };
});
