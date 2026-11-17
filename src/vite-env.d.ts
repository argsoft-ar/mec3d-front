/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base de la API; same-origin ("/api/v1") para que la cookie de sesión sea first-party. */
  readonly VITE_API_URL?: string;
  /** Origen del backend para Socket.IO (conexión directa, sin proxy). */
  readonly VITE_SOCKET_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
