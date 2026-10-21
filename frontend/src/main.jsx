import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import './i18n/config';
import { DemoAuthProvider } from './context/DemoAuthContext';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <DemoAuthProvider>
        <App />
      </DemoAuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
