import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { BrowserRouter, Route , Routes} from 'react-router-dom';

import { ThemeProvider } from './contexts/ThemeContext.jsx';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
        <ThemeProvider>
          <App />
        </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);