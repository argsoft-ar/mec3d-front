# React + TypeScript + Vite.

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.


## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
# mec3d-front

## Configuración y autenticación

Copiá `.env.example` a `.env`:

| Variable | Dev | Producción | Descripción |
| --- | --- | --- | --- |
| `VITE_API_URL` | `/api/v1` | `/api/v1` | Base de la API, siempre same-origin. |
| `VITE_SOCKET_URL` | `http://localhost:3000` | `https://mec3d-api.onrender.com` | Origen del backend para Socket.IO. |

- **Sesión por cookie**: el backend setea la cookie HttpOnly `mec3d_session` en login/registro/cambio de rol; el front no guarda ningún JWT (solo el perfil público en `localStorage.auth_user`) y todas las requests usan `credentials: "include"`. Al arrancar se valida la sesión con `GET /auth/me`; el logout llama a `POST /auth/logout`.
- **API same-origin**: en dev, Vite proxea `/api` → `http://localhost:3000` (`vite.config.ts`, el header `Origin` llega como `http://localhost:5173` para el chequeo CSRF del backend); en producción, `vercel.json` reescribe `/api/*` → `https://mec3d-api.onrender.com/api/*`.
- **Socket.IO**: se conecta directo a `VITE_SOCKET_URL`; cada (re)conexión pide un token de 60 s a `POST /auth/socket-token` y lo envía en `auth.token`.
- **Rutas**: los segmentos dinámicos de los endpoints se codifican con el helper `apiPath` (`src/utils/api-path.util.ts`).