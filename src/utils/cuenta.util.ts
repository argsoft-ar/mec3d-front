// Mismas reglas que esCuentaMercadopagoValida del backend (utils/policy.util.ts).
const CBU_CVU_RE = /^\d{22}$/;
const ALIAS_RE = /^[a-zA-Z0-9.-]{6,20}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const MAX_CUENTA_MERCADOPAGO = 255;

export const AVISO_COOLDOWN_CUENTA =
  "Si cambiás la cuenta, los cobros a la nueva cuenta se habilitan recién 24 horas después.";

/** Vacío es válido (borra la cuenta). Devuelve el mensaje de error o undefined. */
export function validarCuentaMercadopago(valor: string): string | undefined {
  const limpio = valor.trim();
  if (!limpio) return undefined;
  if (limpio.length > MAX_CUENTA_MERCADOPAGO) {
    return `La cuenta no puede superar los ${MAX_CUENTA_MERCADOPAGO} caracteres`;
  }
  if (CBU_CVU_RE.test(limpio) || ALIAS_RE.test(limpio)) return undefined;
  if (limpio.includes("@")) {
    return EMAIL_RE.test(limpio) ? undefined : "Ingresá un email válido";
  }
  if (/^\d+$/.test(limpio)) {
    return "Un CBU/CVU debe tener exactamente 22 dígitos";
  }
  return "Ingresá un CBU/CVU de 22 dígitos, un alias (6 a 20 caracteres: letras, números, punto o guion) o un email";
}
