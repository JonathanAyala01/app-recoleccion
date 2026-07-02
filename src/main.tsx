import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { bootstrapStorageBridge } from './lib/storageBridge';

const rootElement = document.getElementById('root');

if (rootElement) {
  void bootstrapStorageBridge().finally(() => {
    createRoot(rootElement).render(
      <StrictMode>
        <App />
      </StrictMode>,
    );
  });
}

if ('serviceWorker' in navigator && typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    const swUrl = new URL('sw.js', window.location.href).toString();
    navigator.serviceWorker.register(swUrl).catch(() => {
      // Ignore registration errors; the app still works as a web app.
    });
  });
}
