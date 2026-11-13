import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { bootstrapSession } from './services/auth.service'

// Valida el perfil local contra la cookie de sesión (sin bloquear el primer render).
void bootstrapSession()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
