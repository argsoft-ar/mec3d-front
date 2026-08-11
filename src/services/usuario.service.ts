import { request } from "./http.client";
import type { PerfilCompleto, UpdateProfileDTO, Material } from "../interfaces";

export const usuarioService = {
  getMyProfile: () => request<PerfilCompleto>("/usuarios/perfil"),

  updateProfile: (data: UpdateProfileDTO) =>
    request<PerfilCompleto>("/usuarios/perfil", {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  setMateriales: (materiales: string[]) =>
    request<Material[]>("/usuarios/materiales", {
      method: "PUT",
      body: JSON.stringify({ materiales }),
    }),
};
