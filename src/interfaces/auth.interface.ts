import type { UsuarioPublico, RolUsuario } from "./user.interface";

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
  rolPrincipal: RolUsuario;
  zonaId?: number;
}

export interface RegisterResponse {
  message: string;
  user: {
    id: string;
    email: string;
    rolPrincipal: RolUsuario;
    zonaId: number | null;
    creadoEn: string;
  };
}
