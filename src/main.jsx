import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './styles/fonts.css';
import './styles/tokens.css';
import './styles/app.css';
import App from './App.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import { BASENAME } from './raiz.js';
import { precargarEnReposo } from './rutasDiferidas.js';
import { ViajeProvider } from './state.jsx';

window.addEventListener('load', precargarEnReposo, { once: true });

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <ViajeProvider>
        <BrowserRouter basename={BASENAME}>
          <App />
        </BrowserRouter>
      </ViajeProvider>
    </ErrorBoundary>
  </StrictMode>,
);
