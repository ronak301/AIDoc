
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AppProvider } from './store';

console.log('[Index] Starting app mount...');

try {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    console.error('[Index] Root element not found!');
    throw new Error("Could not find root element to mount to");
  }

  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <AppProvider>
        <App />
      </AppProvider>
    </React.StrictMode>
  );
  console.log('[Index] App mount successful');
} catch (error) {
  console.error('[Index] Failed to mount app:', error);
}
