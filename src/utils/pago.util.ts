import type { FasePagoEstado } from "../hooks/usePagoEstado";
import type { EstadoPagoResponse, RetornoPago, VistaPago } from "../interfaces";
import { compraPagada } from "./estado.util";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Devuelve el id si es un UUID (evita armar rutas de API con valores arbitrarios de la URL). */
export function parseCompraId(value: string | null): string | null {
  return value !== null && UUID_REGEX.test(value) ? value : null;
}

/** Interpreta el estado real de la compra/pago; la URL de retorno de MP no interviene. */
export function resolverVistaPago(
  data: EstadoPagoResponse | null,
  fase: FasePagoEstado,
): VistaPago {
  if (fase === "error") return "error";
  if (!data) return "verificando";
  if (compraPagada(data.estadoCompra)) return "acreditado";
  if (data.estadoCompra === "reembolsada") return "reembolsado";
  if (data.estadoCompra === "cancelada") return "cancelado";
  if (data.pago?.estado === "rechazado") return "rechazado";
  if (data.pago?.estado === "reembolsado") return "reembolsado";
  if (fase === "verificando") return "verificando";
  // Pago aprobado pero compra aún sin acreditar, o polling agotado sin novedades.
  return "pendiente";
}

export const TEXTO_VISTA_PAGO: Record<
  VistaPago,
  { title: string; message: string }
> = {
  verificando: {
    title: "Verificando tu pago",
    message:
      "Estamos consultando el estado real del pago. No cierres esta página.",
  },
  acreditado: {
    title: "Pago acreditado",
    message: "Recibimos tu pago correctamente.",
  },
  pendiente: {
    title: "Pago pendiente",
    message:
      "Todavía no se acreditó el pago. Puede demorar unos minutos; podés volver a verificar más tarde.",
  },
  rechazado: {
    title: "Pago rechazado",
    message: "El pago no se completó. Podés reintentarlo cuando quieras.",
  },
  reembolsado: {
    title: "Pago reembolsado",
    message: "El pago fue reembolsado.",
  },
  cancelado: {
    title: "Compra cancelada",
    message: "La compra fue cancelada y no se cobró.",
  },
  error: {
    title: "No pudimos verificar el pago",
    message:
      "Hubo un problema al consultar el estado. Reintentá en unos instantes.",
  },
};

/** Aclaración mientras se verifica; refleja lo que informó la URL, sin darlo por cierto. */
export const HINT_RETORNO: Record<RetornoPago, string> = {
  exito: "Mercado Pago indicó que el pago se procesó; lo estamos confirmando.",
  error:
    "Mercado Pago indicó un problema con el pago; confirmamos el estado real.",
  pendiente:
    "Mercado Pago indicó que el pago está en proceso; lo seguimos verificando.",
};
