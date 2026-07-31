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
