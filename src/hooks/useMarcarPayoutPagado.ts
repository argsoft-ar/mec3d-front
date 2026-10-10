import { useCallback, useState } from "react";
import type React from "react";
import { adminService } from "../services/admin.service";
import { HttpError, getErrorToast } from "../services/http.client";
import type { PayoutPendiente } from "../interfaces";
import type { AddToast } from "../types";

const MAX_REFERENCIA = 255;

/** Igual que el backend: referencia obligatoria de hasta 255 caracteres. */
export function validarReferenciaPayout(
  referencia: string,
): string | undefined {
  const limpia = referencia.trim();
  if (!limpia) return "La referencia de la transferencia es obligatoria";
  if (limpia.length > MAX_REFERENCIA) {
    return `La referencia no puede superar los ${MAX_REFERENCIA} caracteres`;
  }
  return undefined;
}

export function useMarcarPayoutPagado(addToast: AddToast, onDone: () => void) {
  const [payout, setPayout] = useState<PayoutPendiente | null>(null);
  const [referencia, setReferencia] = useState("");
  const [touched, setTouched] = useState(false);
  const [loading, setLoading] = useState(false);

  const abrir = useCallback((item: PayoutPendiente) => {
    setPayout(item);
    setReferencia("");
    setTouched(false);
  }, []);

  const cerrar = useCallback(() => setPayout(null), []);

  const handleReferenciaChange = useCallback(
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ) => {
      setReferencia(e.target.value.slice(0, MAX_REFERENCIA));
      setTouched(true);
    },
    [],
  );

  const enviar = useCallback(async () => {
    if (!payout) return;
    if (validarReferenciaPayout(referencia)) {
      setTouched(true);
      return;
    }
    setLoading(true);
    try {
      await adminService.marcarPayoutPagado(payout.id, referencia.trim());
      addToast("Payout registrado como pagado", "success");
      setPayout(null);
      onDone();
    } catch (error) {
      const { message, type } = getErrorToast(
        error,
        "No se pudo registrar el payout",
      );
      addToast(message, type);
      // 409: el payout cambió de estado (retención, cooldown o ya pagado); se refresca la lista.
      if (error instanceof HttpError && error.status === 409) {
        setPayout(null);
        onDone();
      }
    } finally {
      setLoading(false);
    }
  }, [payout, referencia, addToast, onDone]);

  return {
    payout,
    abierto: payout !== null,
    referencia,
    error: touched ? validarReferenciaPayout(referencia) : undefined,
    invalido: validarReferenciaPayout(referencia) !== undefined,
    loading,
    maxLength: MAX_REFERENCIA,
    handleReferenciaChange,
    abrir,
    cerrar,
    enviar,
  };
}
