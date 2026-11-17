import { useCallback, useState } from "react";
import { useCheckout } from "./useCheckout";
import { compraService } from "../services/compra.service";
import { getErrorMessage, hasErrorCode } from "../services/http.client";
import { CODIGO_COMPRA_DUPLICADA } from "../interfaces";
import type { AddToast } from "../types";

/**
 * Crea la compra de descarga de un diseño y redirige a Mercado Pago; permite reintentar el pago si falla.
 * `onCompraDuplicada` se invoca cuando el backend responde que el diseño ya fue comprado.
 */
export function useCompraDescarga(
  addToast: AddToast,
  onCompraDuplicada?: () => void,
) {
  const { paying, redirigir, pagar } = useCheckout(addToast);
  const [processing, setProcessing] = useState(false);
  // Compra creada cuyo checkout no pudo abrirse; se puede reintentar el pago.
  const [pendingCompraId, setPendingCompraId] = useState<string | null>(null);

  const comprar = useCallback(
    async (disenoId: string) => {
      setProcessing(true);
      try {
        const { compra, initPoint } = await compraService.crear({
          disenoId,
          tipo: "descarga",
        });
        // Si se redirige, la página se descarga: el botón queda en carga hasta entonces.
        if (!redirigir(initPoint)) {
          setPendingCompraId(compra.id);
          setProcessing(false);
        }
      } catch (error) {
        if (hasErrorCode(error, CODIGO_COMPRA_DUPLICADA)) {
          addToast(getErrorMessage(error, "Ya compraste este diseño"), "info");
          onCompraDuplicada?.();
          setProcessing(false);
          return;
        }
        addToast(
          getErrorMessage(
            error,
            "No se pudo procesar la compra. Si ya se creó, pagala desde Mis compras.",
          ),
          "error",
        );
        setProcessing(false);
      }
    },
    [addToast, redirigir, onCompraDuplicada],
  );

  const reintentarPago = useCallback(async () => {
    if (pendingCompraId) await pagar(pendingCompraId);
  }, [pagar, pendingCompraId]);

  return { processing, paying, pendingCompraId, comprar, reintentarPago };
}
