import { request } from "./http.client";
import { cacheGet, cacheSet, cacheDel } from "./cache";
import type {
  PerfilCompleto,
  UpdateProfileDTO,
  Material,
  RolUsuario,
  Tecnologia,
  CatalogoItem,
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
    const data = await request<{
      id: string;
      email: string;
      rolPrincipal: RolUsuario;
      token: string;
    }>("/usuarios/rol", { method: "PATCH", body: JSON.stringify({ rol }) });
    localStorage.setItem("auth_token", data.token);
    cacheDel(PROFILE_KEY);
    const raw = localStorage.getItem("auth_user");
    if (raw) {
      const user = JSON.parse(raw) as Record<string, unknown>;
      localStorage.setItem(
        "auth_user",
        JSON.stringify({ ...user, rolPrincipal: rol }),
      );
    }
    return data;
  },

  removeFabricanteStatus: async () => {
    const result = await request<{ message: string }>("/usuarios/fabricante", {
      method: "DELETE",
    });
    cacheDel(PROFILE_KEY);
    return result;
  },

  setTecnologias: (tecnologias: string[]) =>
    request<Tecnologia[]>("/usuarios/tecnologias", {
      method: "PUT",
      body: JSON.stringify({ tecnologias }),
    }),
};

export const catalogoService = {
  getMateriales: () => request<CatalogoItem[]>("/catalogos/materiales"),
  getTecnologias: () => request<CatalogoItem[]>("/catalogos/tecnologias"),
};
