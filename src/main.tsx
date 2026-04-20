import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import { ErrorBoundary } from './ErrorBoundary.tsx';
import './index.css';

// Automatically reload the page if Vite chunk fails to load (common after new deployments)
window.addEventListener('vite:preloadError', () => {
  window.location.reload();
});

// Polyfill for generic chunk load errors
window.addEventListener('error', (e) => {
  if (e.message?.includes('Failed to fetch dynamically imported module') || e.message?.includes('Importing a module script failed')) {
    e.preventDefault();
    window.location.reload();
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(
      function (registration) {
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
      },
      function (err) {
        console.log('ServiceWorker registration failed: ', err);
      }
    );
  });
}
