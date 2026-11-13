import { HttpError, request } from "./http.client";
import {
  clearSessionData,
  getCurrentUser,
  isUsuarioPublico,
  purgeLegacyToken,
  saveSession,
} from "./session";
import { disconnectSocket } from "./socket.client";
import type {
  LoginResponse,
  RegisterResponse,
  RegisterRequest,
  UsuarioPublico,
} from "../interfaces";

/** GET /auth/me devuelve el usuario; se tolera también la forma envuelta `{ user }`. */
function extractUser(body: unknown): UsuarioPublico | null {
  if (isUsuarioPublico(body)) return body;
  if (typeof body === "object" && body !== null && "user" in body) {
    const { user } = body as { user: unknown };
    return isUsuarioPublico(user) ? user : null;
  }
  return null;
}

export const authService = {
  login: (email: string, password: string) =>
    request<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  register: (data: RegisterRequest) =>
    request<RegisterResponse>("/auth/registro", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  checkUsernameDisponible: (username: string) =>
    request<{ disponible: boolean }>(
      `/auth/username-disponible?username=${encodeURIComponent(username)}`,
    ),

  /** Usuario de la cookie de sesión; lanza HttpError 401 si no hay sesión válida. */
  me: async (): Promise<UsuarioPublico> => {
    const user = extractUser(await request<unknown>("/auth/me"));
    if (!user) throw new HttpError(0, "Respuesta de sesión inválida");
    return user;
  },

  /** Invalida la cookie en el backend y limpia el estado local aunque la llamada falle. */
  logout: async (): Promise<void> => {
    try {
      await request<void>("/auth/logout", {
        method: "POST",
        keepSessionOnUnauthorized: true,
      });
    } catch {
      // Sin red o sesión ya vencida: igual se cierra la sesión local.
    } finally {
      clearSessionData();
      disconnectSocket();
    }
  },
};

/**
 * Arranque: purga el JWT legado y, si hay perfil local, lo valida contra la cookie.
 * 401 => sesión local huérfana, se limpia; otros errores (red/5xx) no cierran la sesión.
 */
export async function bootstrapSession(): Promise<void> {
  purgeLegacyToken();
  if (!getCurrentUser()) return;
  try {
    const user = await authService.me();
    // Si mientras tanto se cerró sesión, no se resucita el perfil local.
    if (getCurrentUser()) saveSession(user);
  } catch (error: unknown) {
    if (error instanceof HttpError && error.status === 401) clearSessionData();
  }
}
