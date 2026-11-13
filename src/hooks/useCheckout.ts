import { useCallback, useState } from "react";
import { pagoService } from "../services/pago.service";
import { getErrorMessage } from "../services/http.client";
import { isTrustedCheckoutUrl } from "../utils/checkout.util";
import type { AddToast } from "../types";

/**
 * Devuelve un href de checkout reconstruido desde un URL ya validado (https, sin
 * credenciales ni puerto, host de Mercado Pago), o null si no es confiable.
 * El origen se arma con protocolo fijo + hostname validado y el path/query/hash se
 * asignan por setter, asi un pathname tipo "//evil.com" no puede cambiar el host.
 */
function toSafeCheckoutHref(
  initPoint: string | null | undefined,
): string | null {
  if (!isTrustedCheckoutUrl(initPoint)) return null;
  let parsed: URL;
  try {
    parsed = new URL(initPoint);
  } catch {
    return null;
  }
  if (parsed.protocol !== "https:") return null;
  const safe = new URL(`https://${parsed.hostname}`);
  safe.pathname = parsed.pathname;
  safe.search = parsed.search;
  safe.hash = parsed.hash;
  if (safe.origin !== parsed.origin || !isTrustedCheckoutUrl(safe.href))
    return null;
  return safe.href;
}

interface UseCheckoutReturn {
  paying: boolean;
  /** Redirige a Mercado Pago solo si la URL es confiable; devuelve si se redirigió. */
  redirigir: (initPoint: string | null | undefined) => boolean;
  /** Inicia (o reintenta) el pago de una compra pendiente y redirige al checkout. */
  pagar: (compraId: string) => Promise<boolean>;
}

export function useCheckout(addToast: AddToast): UseCheckoutReturn {
  const [paying, setPaying] = useState(false);

  const redirigir = useCallback(
    (initPoint: string | null | undefined): boolean => {
      const safeHref = toSafeCheckoutHref(initPoint);
      if (safeHref === null) {
        addToast(
          "No pudimos abrir el pago de forma segura. Reintentá desde Mis compras.",
          "error",
        );
        return false;
      }
      window.location.assign(safeHref);
      return true;
    },
    [addToast],
  );

  const pagar = useCallback(
    async (compraId: string): Promise<boolean> => {
      setPaying(true);
      try {
        const { initPoint } = await pagoService.iniciarPago(compraId);
        const redirigido = redirigir(initPoint);
        if (!redirigido) setPaying(false);
        return redirigido;
      } catch (error) {
        addToast(getErrorMessage(error, "No se pudo iniciar el pago"), "error");
        setPaying(false);
        return false;
      }
    },
    [addToast, redirigir],
  );

  return { paying, redirigir, pagar };
}
