import { request } from "./http.client";
import { cacheGet, cacheSet, cacheDel } from "./cache";
import { updateCurrentUser } from "./session";
import type {
  PerfilCompleto,
  UpdateProfileDTO,
  Material,
  RolUsuario,
  Tecnologia,
} from "../interfaces";

const PROFILE_KEY = "user:profile";
const PROFILE_TTL = 2 * 60 * 1000;

export const usuarioService = {
  getMyProfile: async () => {
    const cached = cacheGet<PerfilCompleto>(PROFILE_KEY);
    if (cached) return cached;
    const data = await request<PerfilCompleto>("/usuarios/perfil");
    cacheSet(PROFILE_KEY, data, PROFILE_TTL);
    return data;
  },

  updateProfile: async (data: UpdateProfileDTO) => {
    const result = await request<PerfilCompleto>("/usuarios/perfil", {
      method: "PUT",
      body: JSON.stringify(data),
    });
    cacheSet(PROFILE_KEY, result, PROFILE_TTL);
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
