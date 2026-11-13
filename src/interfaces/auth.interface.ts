import type { UsuarioPublico, RolUsuario } from "./user.interface";

export interface LoginRequest {
  email: string;
  password: string;
}

/** State de navegación hacia /login con la ruta interna a la que volver tras autenticarse. */
export interface LoginLocationState {
  from?: string;
}

/** La sesión queda en la cookie HttpOnly `mec3d_session`; el body ya no trae token. */
export interface LoginResponse {
  message: string;
  user: UsuarioPublico;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  rolPrincipal: RolUsuario;
  zonaId?: number;
  georefLocalidadId?: string;
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
