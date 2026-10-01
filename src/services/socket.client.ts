import { io, type Socket } from "socket.io-client";
import { BASE_URL } from "./http.client";

// El socket de chat corre en el mismo host/puerto que la API pero sin el
// prefijo /api/v1 (server.ts monta Socket.IO sobre el mismo http.Server).
const SOCKET_URL = BASE_URL.replace(/\/api\/v1\/?$/, "");

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (socket) return socket;
  const token = localStorage.getItem("auth_token");
  socket = io(SOCKET_URL, {
    auth: { token },
    autoConnect: true,
  });
  return socket;
}

export function disconnectSocket(): void {
  socket?.disconnect();
  socket = null;
}
