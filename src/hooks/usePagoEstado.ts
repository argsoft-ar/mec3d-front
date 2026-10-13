import { useCallback, useEffect, useState } from "react";
import { pagoService } from "../services/pago.service";
import { getErrorMessage } from "../services/http.client";
import type { EstadoPagoResponse } from "../interfaces";

const POLL_INTERVAL_MS = 3000;
const MAX_ATTEMPTS = 10;

export type FasePagoEstado = "verificando" | "resuelto" | "agotado" | "error";

interface PagoEstadoState {
  data: EstadoPagoResponse | null;
  fase: FasePagoEstado;
  errorMessage: string | null;
}

const INITIAL_STATE: PagoEstadoState = {
  data: null,
  fase: "verificando",
  errorMessage: null,
};

// Sigue pendiente mientras la compra espera pago y el último intento no fue rechazado.
function sigueEnCurso(data: EstadoPagoResponse): boolean {
  return (
    data.estadoCompra === "pendiente_pago" &&
    (data.pago === null || data.pago.estado === "pendiente")
  );
}

/** Consulta el estado real del pago con polling acotado (el redirect de MP no es fuente de verdad). */
export function usePagoEstado(compraId: string | null) {
  const [state, setState] = useState<PagoEstadoState>(INITIAL_STATE);
  const [ciclo, setCiclo] = useState(0);

  useEffect(() => {
    if (!compraId) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const consultar = async (intento: number): Promise<void> => {
      try {
        const data = await pagoService.getEstadoPago(compraId);
        if (cancelled) return;
        if (!sigueEnCurso(data)) {
          setState({ data, fase: "resuelto", errorMessage: null });
        } else if (intento >= MAX_ATTEMPTS) {
          setState({ data, fase: "agotado", errorMessage: null });
        } else {
          setState({ data, fase: "verificando", errorMessage: null });
          timer = setTimeout(() => void consultar(intento + 1), POLL_INTERVAL_MS);
        }
      } catch (error) {
        if (cancelled) return;
        setState({
          data: null,
          fase: "error",
          errorMessage: getErrorMessage(
            error,
            "No se pudo consultar el estado del pago",
          ),
        });
      }
    };

    void consultar(1);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [compraId, ciclo]);

  const reintentar = useCallback(() => {
    setState(INITIAL_STATE);
    setCiclo((c) => c + 1);
  }, []);

  return { ...state, reintentar };
}
