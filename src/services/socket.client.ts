import { io, type Socket } from "socket.io-client";
import { BASE_URL, request } from "./http.client";
import { onSessionCleared } from "./session";
import { trimTrailingSlashes } from "../utils/string.util";

const DEV_SOCKET_URL = "http://localhost:3000";

/**
 * El socket se conecta directo al origen del backend (Vercel no proxea WebSockets).
 * Prioridad: VITE_SOCKET_URL; si VITE_API_URL es absoluta, su origen sin el prefijo
 * /api/v1 (Socket.IO corre sobre el mismo http.Server); con API relativa, el backend
 * local en dev o el propio origen como último recurso.
 */
function resolveSocketUrl(): string {
  const explicit = import.meta.env.VITE_SOCKET_URL;
  if (explicit) return trimTrailingSlashes(explicit);
  if (/^https?:\/\//i.test(BASE_URL))
    return BASE_URL.replace(/\/api\/v1\/?$/, "");
  return import.meta.env.DEV ? DEV_SOCKET_URL : globalThis.location.origin;
}

const SOCKET_URL = resolveSocketUrl();

interface SocketAuth {
  token?: string;
}

/** JWT de vida corta (60 s) solo para el handshake; la sesión sigue en la cookie HttpOnly. */
async function fetchSocketToken(): Promise<string> {
  const { token } = await request<{ token: string }>("/auth/socket-token", {
    method: "POST",
  });
  return token;
}

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (socket) return socket;
  socket = io(SOCKET_URL, {
    // Forma callback: se invoca en cada (re)conexión, así cada handshake usa un token fresco.
    auth: (cb: (data: SocketAuth) => void) => {
      fetchSocketToken()
        .then((token) => cb({ token }))
        .catch(() => cb({}));
    },
    autoConnect: true,
  });
  return socket;
}

export function disconnectSocket(): void {
  socket?.disconnect();
  socket = null;
}

// Logout, 401 y nuevo login: el socket de la sesión anterior no debe sobrevivir.
onSessionCleared(disconnectSocket);
