export type RolUsuario = "comprador" | "disenador" | "fabricante" | "admin";

export interface UsuarioPublico {
  id: string;
  email: string;
  rolPrincipal: RolUsuario;
  zonaId: number | null;
  cuentaMercadopago: string | null;
}

export interface TokenPayload {
  id: string;
  email: string;
  rolPrincipal: RolUsuario;
}

export interface Material {
  id: number;
  material: string;
  disponible: boolean;
}

export interface UpdateProfileDTO {
  tagline?: string;
  descripcion?: string;
  experiencia?: string;
  zonaId?: number;
  cuentaMercadopago?: string;
}

export interface PerfilCompleto {
  id: string;
  email: string;
  rolPrincipal: RolUsuario;
  zonaId: number | null;
  puntuacion: number;
  cuentaMercadopago: string | null;
  tagline: string | null;
  descripcion: string | null;
  experiencia: string | null;
  actualizadoEn: string;
  materiales: Material[];
}
