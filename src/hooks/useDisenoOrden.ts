import { useCallback, useEffect, useState } from "react";
import { ordenFabricacionService } from "../services/orden-fabricacion.service";
import { HttpError, getErrorMessage } from "../services/http.client";
import { buildDescargaFileName } from "../utils/product.util";
import type { DisenoDeOrden } from "../interfaces";
import type { AddToast } from "../types";

export type DisenoOrdenError = "forbidden" | "notFound" | "error";

interface Resultado {
  ordenId: string;
  data: DisenoDeOrden | null;
  error: DisenoOrdenError | null;
  errorMessage: string | null;
}

interface UseDisenoOrdenReturn {
  data: DisenoDeOrden | null;
  loading: boolean;
  error: DisenoOrdenError | null;
  errorMessage: string | null;
  descargando: boolean;
  descargar: () => Promise<void>;
}

function clasificarError(error: unknown): DisenoOrdenError {
  if (error instanceof HttpError) {
    if (error.status === 403) return "forbidden";
    if (error.status === 404) return "notFound";
  }
  return "error";
}

export function useDisenoOrden(
  ordenId: string | undefined,
  addToast: AddToast,
): UseDisenoOrdenReturn {
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [descargando, setDescargando] = useState(false);

  useEffect(() => {
    if (!ordenId) return;
    const controller = new AbortController();
    ordenFabricacionService
      .getDisenoDeOrden(ordenId, controller.signal)
      .then((res) =>
        setResultado({
          ordenId,
          data: res.data ?? null,
          error: res.data ? null : "notFound",
          errorMessage: null,
        }),
      )
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        setResultado({
          ordenId,
          data: null,
          error: clasificarError(err),
          errorMessage: getErrorMessage(err, "No se pudo cargar el diseño"),
        });
      });
    return () => controller.abort();
  }, [ordenId]);

  const vigente = resultado?.ordenId === ordenId ? resultado : null;
  const data = vigente?.data ?? null;

  const descargar = useCallback(async () => {
    if (!data?.puedeDescargar) return;
    setDescargando(true);
    try {
      await ordenFabricacionService.descargarDisenoDeOrden(
        data.ordenId,
        buildDescargaFileName(data.diseno.titulo, data.diseno.formato),
      );
    } catch (err) {
      addToast(
        getErrorMessage(err, "No se pudo descargar el archivo"),
        "error",
      );
    } finally {
      setDescargando(false);
    }
  }, [data, addToast]);

  if (!ordenId)
    return {
      data: null,
      loading: false,
      error: "notFound",
      errorMessage: null,
      descargando: false,
      descargar,
    };

  return {
    data,
    loading: vigente === null,
    error: vigente?.error ?? null,
    errorMessage: vigente?.errorMessage ?? null,
    descargando,
    descargar,
  };
}
