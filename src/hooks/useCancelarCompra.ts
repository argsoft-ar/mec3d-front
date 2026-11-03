import { useCallback, useState } from "react";
import { compraService } from "../services/compra.service";
import { getErrorMessage, hasErrorCode } from "../services/http.client";
import { CODIGO_COMPRA_NO_CANCELABLE } from "../interfaces";
import type { MisComprasItem } from "../interfaces";
import type { AddToast } from "../types";

/**
 * Confirma y cancela una compra pendiente de pago.
 * `onNoCancelable` se invoca con el 409 para refrescar el listado.
 */
export function useCancelarCompra(
  addToast: AddToast,
  onCancelada: (compraId: string) => void,
  onNoCancelable: () => void,
) {
  const [compra, setCompra] = useState<MisComprasItem | null>(null);
  const [cancelandoId, setCancelandoId] = useState<string | null>(null);

  const abrir = useCallback((item: MisComprasItem) => setCompra(item), []);

  const cerrar = useCallback(() => {
    if (cancelandoId === null) setCompra(null);
  }, [cancelandoId]);

  const confirmar = useCallback(async () => {
    if (!compra) return;
    setCancelandoId(compra.id);
    try {
      await compraService.cancelar(compra.id);
      addToast("Compra cancelada", "success");
      onCancelada(compra.id);
    } catch (error) {
      if (hasErrorCode(error, CODIGO_COMPRA_NO_CANCELABLE)) {
        addToast("Esta compra ya no se puede cancelar", "warning");
        onNoCancelable();
      } else {
        addToast(
          getErrorMessage(error, "No se pudo cancelar la compra"),
          "error",
        );
      }
    } finally {
      setCancelandoId(null);
      setCompra(null);
    }
  }, [compra, addToast, onCancelada, onNoCancelable]);

  return {
    abierto: compra !== null,
    tipo: compra?.tipo ?? null,
    cancelandoId,
    abrir,
    cerrar,
    confirmar,
  };
}
