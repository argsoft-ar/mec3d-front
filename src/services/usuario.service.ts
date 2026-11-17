import { request } from "./http.client";
import { cacheGet, cacheSet, cacheDel } from "./cache";
import { updateCurrentUser } from "./session";
import { sanitizePerfilCompleto } from "../utils/cache-sanitize.util";
import type {
  PerfilCompleto,
  UpdateProfileDTO,
  Material,
  RolUsuario,
  Tecnologia,
} from "../interfaces";

const PROFILE_KEY = "user:profile";
const PROFILE_TTL = 2 * 60 * 1000;

/** Lee el perfil cacheado; si fue manipulado (forma inválida) se descarta. */
function readCachedProfile(): PerfilCompleto | null {
  const cached = cacheGet<unknown>(PROFILE_KEY);
  if (cached === null) return null;
  const clean = sanitizePerfilCompleto(cached);
  if (clean === null) cacheDel(PROFILE_KEY);
  return clean;
}

/** Cachea solo una copia reconstruida con los campos conocidos; si la forma no es válida, no cachea. */
function cacheProfile(perfil: unknown): void {
  const clean = sanitizePerfilCompleto(perfil);
  if (clean === null) {
    cacheDel(PROFILE_KEY);
    return;
  }
  cacheSet(PROFILE_KEY, clean, PROFILE_TTL);
}

export const usuarioService = {
  getMyProfile: async () => {
    const cached = readCachedProfile();
    if (cached) return cached;
    const data = await request<PerfilCompleto>("/usuarios/perfil");
    cacheProfile(data);
    return data;
  },

  updateProfile: async (data: UpdateProfileDTO) => {
    const result = await request<PerfilCompleto>("/usuarios/perfil", {
      method: "PUT",
      body: JSON.stringify(data),
    });
    cacheProfile(result);
    return result;
  },

  checkUsernameDisponible: (username: string) =>
    request<{ disponible: boolean }>(
      `/usuarios/username-disponible?username=${encodeURIComponent(username)}`,
    ),

  setMateriales: (materiales: string[]) =>
    request<Material[]>("/usuarios/materiales", {
      method: "PUT",
      body: JSON.stringify({ materiales }),
    }),

  changeRol: async (rol: RolUsuario) => {
    // El backend renueva la cookie de sesión con el rol nuevo; el body ya no trae token.
    const data = await request<{
      id: string;
      email: string;
      rolPrincipal: RolUsuario;
    }>("/usuarios/rol", { method: "PATCH", body: JSON.stringify({ rol }) });
    cacheDel(PROFILE_KEY);
    updateCurrentUser({ rolPrincipal: rol });
    return data;
  },

  removeFabricanteStatus: async () => {
    const result = await request<{ message: string }>("/usuarios/fabricante", {
      method: "DELETE",
    });
    cacheDel(PROFILE_KEY);
    // El backend renueva la cookie con rol comprador: se sincroniza el perfil local.
    updateCurrentUser({ rolPrincipal: "comprador" });
    return result;
  },

  setTecnologias: (tecnologias: string[]) =>
    request<Tecnologia[]>("/usuarios/tecnologias", {
      method: "PUT",
      body: JSON.stringify({ tecnologias }),
    }),
};
