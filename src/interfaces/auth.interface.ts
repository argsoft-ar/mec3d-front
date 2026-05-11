import type { UsuarioPublico } from "./user.interface";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  token: string;
  user: UsuarioPublico;
}

export interface RegisterRequest {
  email: string;
  password: string;
  rol_principal: import("./user.interface").RolUsuario;
  zona_id?: number;
}

export interface RegisterResponse {
  message: string;
  user: Pick<UsuarioPublico, "id" | "email" | "rol_principal" | "zona_id"> & {
    creado_en: string;
  };
}
