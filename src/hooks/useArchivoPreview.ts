import { useCallback, useEffect, useState } from "react";
import { productService } from "../services/product.service";
import { HttpError } from "../services/http.client";

// Margen para renovar antes de que la URL firmada venza del lado del servidor.
const EXPIRY_MARGIN_MS = 10_000;

export type ArchivoPreviewStatus =
  | "idle"
  | "loading"
  | "ready"
  | "unauthorized"
  | "forbidden"
  | "notFound"
  | "error";

interface ArchivoPreviewState {
  status: ArchivoPreviewStatus;
  url: string | null;
  expiresAt: number | null;
}

const LOADING: ArchivoPreviewState = {
  status: "loading",
  url: null,
  expiresAt: null,
};

function statusFromError(error: unknown): ArchivoPreviewStatus {
  if (error instanceof HttpError) {
    if (error.status === 401) return "unauthorized";
    if (error.status === 403) return "forbidden";
    if (error.status === 404) return "notFound";
  }
  return "error";
}

/** Obtiene la URL firmada del archivo 3D; sin productId queda inactivo. */
export function useArchivoPreview(productId: string | undefined) {
  const [state, setState] = useState<ArchivoPreviewState>(LOADING);
  const [ciclo, setCiclo] = useState(0);

  useEffect(() => {
    if (!productId) return;
    let cancelled = false;
    productService
      .getArchivoPreview(productId)
      .then(({ url, expiresIn }) => {
        if (cancelled) return;
        setState({
          status: "ready",
          url,
          expiresAt: expiresIn === null ? null : Date.now() + expiresIn * 1000,
        });
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setState({ status: statusFromError(error), url: null, expiresAt: null });
      });
    return () => {
      cancelled = true;
    };
  }, [productId, ciclo]);

  // Si el visor falla con una URL vencida, se pide una nueva; con una vigente no se reintenta.
  const renovarSiExpiro = useCallback(() => {
    if (state.expiresAt !== null && Date.now() >= state.expiresAt - EXPIRY_MARGIN_MS) {
      setCiclo((c) => c + 1);
    }
  }, [state.expiresAt]);

  return {
    status: productId ? state.status : ("idle" as const),
    url: productId ? state.url : null,
    renovarSiExpiro,
  };
}
