// @ts-nocheck
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { App } from './App';
import './index.css';

createRoot(document.getElementById(`root`)).render(
  <StrictMode>
    <BrowserRouter basename="/ifix-lab/">
      <App />
    </BrowserRouter>
  </StrictMode>,
);

// PWA: registra o service worker (só no site publicado).
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(() => {});
  });
}
