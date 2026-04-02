import React from 'react';
import { createRoot } from 'react-dom/client';
import { Todos } from './components/Todos';
import './components/Todos.css';

declare global {
  interface Window {
    acquireVsCodeApi: () => {
      postMessage: (message: unknown) => void;
    };
  }
}

const container = document.getElementById('root');
if (!container) {
  throw new Error('Root element not found');
}

const root = createRoot(container);
root.render(<Todos />);