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
