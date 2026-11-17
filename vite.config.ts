import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Same-origin en dev (igual que el rewrite de Vercel en prod): la cookie HttpOnly de sesión
    // queda first-party. http-proxy no reescribe el header Origin (changeOrigin solo toca Host),
    // así el backend ve Origin http://localhost:5173 para su chequeo CSRF / CORS_ORIGIN.
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: false,
      },
    },
  },
})
