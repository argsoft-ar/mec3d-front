import { useCallback, useEffect, useState } from "react";
import { billeteraService } from "../services/billetera.service";
import { getErrorMessage } from "../services/http.client";
import type { BilleteraResponse, EstadoMovimientoFiltro } from "../interfaces";

const DEFAULT_LIMIT = 10;

interface BilleteraResult {
  key: string;
  data: BilleteraResponse | null;
  error: string | null;
}

export function useBilletera() {
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);
  const [estado, setEstadoState] = useState<EstadoMovimientoFiltro | "">("");
  const [reloadToken, setReloadToken] = useState(0);
  const [result, setResult] = useState<BilleteraResult | null>(null);

  const key = `${page}|${limit}|${estado}|${reloadToken}`;

  useEffect(() => {
    let cancelled = false;
    billeteraService
      .getMiBilletera({
        page: page + 1,
        limit,
        estado: estado || undefined,
      })
      .then((data) => {
        if (!cancelled) setResult({ key, data, error: null });
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setResult({
          key,
          data: null,
          error: getErrorMessage(error, "No se pudo cargar tu billetera"),
        });
      });
    return () => {
      cancelled = true;
    };
  }, [key, page, limit, estado]);

  const setEstado = useCallback((value: EstadoMovimientoFiltro | "") => {
    setEstadoState(value);
    setPage(0);
  }, []);

  const changeLimit = useCallback((value: number) => {
    setLimit(value);
    setPage(0);
  }, []);

  const reload = useCallback(() => setReloadToken((t) => t + 1), []);

  const current = result?.key === key ? result : null;
  // Mantiene el último resultado visible mientras se carga la página siguiente.
  const last = result?.data ?? null;

  return {
    data: current?.data ?? last,
    error: current?.error ?? null,
    loading: current === null,
    page,
    limit,
    estado,
    setPage,
    setLimit: changeLimit,
    setEstado,
    reload,
  };
}
