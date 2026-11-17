import { io, type Socket } from "socket.io-client";
import { BASE_URL, request } from "./http.client";
import { isAuthenticated, onSessionChanged, onSessionCleared } from "./session";
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

type SocketHandler = (...args: unknown[]) => void;

interface SocketSubscription {
  event: string;
  handler: SocketHandler;
}

let socket: Socket | null = null;
// Registro de listeners: sobreviven a la recreación del socket (logout/re-login del mismo usuario).
const subscriptions = new Set<SocketSubscription>();

export function getSocket(): Socket {
  if (socket) return socket;
  const instance = io(SOCKET_URL, {
    // Forma callback: se invoca en cada (re)conexión, así cada handshake usa un token fresco.
    auth: (cb: (data: SocketAuth) => void) => {
      fetchSocketToken()
        .then((token) => cb({ token }))
        .catch(() => cb({}));
    },
    autoConnect: true,
  });
  // Rechazo del middleware (sin token o token inválido): Socket.IO no reintenta solo. Se
  // descarta la instancia para que el próximo uso abra una nueva con token fresco.
  instance.on("connect_error", () => {
    if (instance.active || socket !== instance) return;
    instance.disconnect();
    socket = null;
  });
  subscriptions.forEach(({ event, handler }) => instance.on(event, handler));
  socket = instance;
  return instance;
}

/** Suscribe a un evento del socket actual y de los que se creen después; devuelve la desuscripción. */
export function onSocketEvent<T extends unknown[]>(
  event: string,
  listener: (...args: T) => void,
): () => void {
  const subscription: SocketSubscription = {
    event,
    handler: (...args) => listener(...(args as T)),
  };
  subscriptions.add(subscription);
  getSocket().on(event, subscription.handler);
  return () => {
    subscriptions.delete(subscription);
    socket?.off(event, subscription.handler);
  };
}

export function disconnectSocket(): void {
  socket?.disconnect();
  socket = null;
}

// Logout, 401 y nuevo login: el socket de la sesión anterior no debe sobrevivir.
onSessionCleared(disconnectSocket);

// Re-login sin remontar a los suscriptores: se reabre el socket para no dejarlos sin eventos.
onSessionChanged(() => {
  if (!socket && subscriptions.size > 0 && isAuthenticated()) getSocket();
});
