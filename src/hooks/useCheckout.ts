import { useCallback, useState } from "react";
import { pagoService } from "../services/pago.service";
import { getErrorMessage } from "../services/http.client";
import { isTrustedCheckoutUrl } from "../utils/checkout.util";
import type { AddToast } from "../types";

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
      if (!isTrustedCheckoutUrl(initPoint)) {
        addToast(
          "No pudimos abrir el pago de forma segura. Reintentá desde Mis compras.",
          "error",
        );
        return false;
      }
      window.location.assign(initPoint);
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
