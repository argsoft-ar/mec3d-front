export type RolUsuario = "comprador" | "disenador" | "fabricante" | "admin";

export interface UsuarioPublico {
  id: string;
  email: string;
  rol_principal: RolUsuario;
  zona_id: number | null;
  cuenta_mercadopago: string | null;
}

export interface TokenPayload {
  id: string;
  email: string;
  rol_principal: RolUsuario;
}
