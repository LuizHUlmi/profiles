// src/main.tsx

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
// Importe o BrowserRouter
import { BrowserRouter } from 'react-router-dom'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* Envolva o App com ele */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)