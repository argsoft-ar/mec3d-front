import { useCallback, useState } from "react";
import { adminService } from "../services/admin.service";
import { getErrorToast } from "../services/http.client";
import type { AddToast } from "../types";

export function useReintentarReembolsos(addToast: AddToast) {
  const [loading, setLoading] = useState(false);

  const ejecutar = useCallback(async () => {
    setLoading(true);
    try {
      const r = await adminService.reintentarReembolsosPendientes();
      const detalle = `Intentados: ${r.intentados}, reembolsados: ${r.reembolsados}, pendientes: ${r.pendientes}.`;
      if (r.conPayoutsPagados > 0) {
        addToast(
          `${detalle} ${r.conPayoutsPagados} reembolso(s) tienen payouts ya pagados y requieren recuperación manual.`,
          "warning",
          8000,
        );
      } else {
        addToast(detalle, r.pendientes > 0 ? "warning" : "success", 6000);
      }
    } catch (error) {
      const { message, type } = getErrorToast(
        error,
        "No se pudieron reintentar los reembolsos",
      );
      addToast(message, type);
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  return { loading, ejecutar };
}
