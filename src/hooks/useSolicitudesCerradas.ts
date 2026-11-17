import { useCallback, useEffect, useState } from "react";
import { ordenFabricacionService } from "../services/orden-fabricacion.service";
import { getErrorMessage } from "../services/http.client";
import type { SolicitudCerrada } from "../interfaces";

interface UseSolicitudesCerradasOptions {
  enabled: boolean;
  limit?: number;
}

interface UseSolicitudesCerradasReturn {
  items: SolicitudCerrada[];
  total: number;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

interface Resultado {
  key: string;
  items: SolicitudCerrada[];
  total: number;
  error: string | null;
}

export function useSolicitudesCerradas({
  enabled,
  limit = 5,
}: UseSolicitudesCerradasOptions): UseSolicitudesCerradasReturn {
  const [reloadToken, setReloadToken] = useState(0);
  const [resultado, setResultado] = useState<Resultado | null>(null);

  const key = `${limit}|${reloadToken}`;

  useEffect(() => {
    if (!enabled) return;
    const controller = new AbortController();
    ordenFabricacionService
      .getCerradasFabricante({ page: 1, limit }, controller.signal)
      .then((res) => {
        if (controller.signal.aborted) return;
        setResultado({
          key,
          items: res.data ?? [],
          total: res.meta?.total ?? 0,
          error: null,
        });
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        setResultado({
          key,
          items: [],
          total: 0,
          error: getErrorMessage(
            err,
            "No se pudieron cargar las solicitudes cerradas",
          ),
        });
      });
    return () => controller.abort();
  }, [enabled, key, limit]);

  const refresh = useCallback(() => setReloadToken((t) => t + 1), []);

  const vigente = enabled && resultado?.key === key ? resultado : null;

  return {
    items: vigente?.items ?? [],
    total: vigente?.total ?? 0,
    loading: enabled && vigente === null,
    error: vigente?.error ?? null,
    refresh,
  };
}
