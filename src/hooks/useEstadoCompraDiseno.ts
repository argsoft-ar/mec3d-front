import { useCallback, useEffect, useState } from "react";
import { useSession } from "./useSession";
import { compraService, descargarCompra } from "../services/compra.service";
import { getErrorMessage } from "../services/http.client";
import type { EstadoCompraDiseno } from "../interfaces";
import type { AddToast } from "../types";

interface UseEstadoCompraDisenoOptions {
  /** Diseñador dueño: no se consulta si es el mismo usuario que mira. */
  ownerId?: string | null;
  addToast: AddToast;
}

interface EstadoResult {
  disenoId: string;
  estado: EstadoCompraDiseno | null;
}

/** Compra de descarga del usuario para el diseño; solo consulta con sesión iniciada. */
export function useEstadoCompraDiseno(
  disenoId: string | undefined,
  { ownerId, addToast }: UseEstadoCompraDisenoOptions,
) {
  const { isAuthenticated, user } = useSession();
  const enabled =
    !!disenoId && isAuthenticated && (!ownerId || user?.id !== ownerId);
  const [result, setResult] = useState<EstadoResult | null>(null);
  const [version, setVersion] = useState(0);
  const [descargando, setDescargando] = useState(false);

  useEffect(() => {
    if (!enabled || !disenoId) return;
    let cancelled = false;
    compraService
      .getEstadoCompraDiseno(disenoId)
      .then((estado) => {
        if (!cancelled) setResult({ disenoId, estado });
      })
      .catch(() => {
        if (!cancelled) setResult({ disenoId, estado: null });
      });
    return () => {
      cancelled = true;
    };
  }, [enabled, disenoId, version]);

  const current = enabled && result?.disenoId === disenoId ? result : null;
  const estado = current?.estado ?? null;

  const refresh = useCallback(() => setVersion((v) => v + 1), []);

  const descargar = useCallback(
    async (compraId: string, fileName: string) => {
      setDescargando(true);
      try {
        await descargarCompra(compraId, fileName);
      } catch (error) {
        addToast(
          getErrorMessage(error, "Error al descargar el archivo"),
          "error",
        );
      } finally {
        setDescargando(false);
      }
    },
    [addToast],
  );

  return {
    estado,
    compraId: estado?.compraId ?? null,
    loading: enabled && current === null,
    comprado: estado?.comprado === true && estado.compraId !== null,
    pendientePago: estado?.estado === "pendiente_pago",
    refresh,
    descargar,
    descargando,
  };
}
