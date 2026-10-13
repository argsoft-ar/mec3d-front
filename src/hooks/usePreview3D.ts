import { useCallback, useEffect, useState } from "react";
import { productService } from "../services/product.service";
import { HttpError } from "../services/http.client";

// Margen para renovar antes de que la URL firmada venza del lado del servidor.
const EXPIRY_MARGIN_MS = 10_000;

export type Preview3DStatus =
  | "idle"
  | "loading"
  | "ready"
  | "notFound"
  | "rateLimited"
  | "error";

interface Preview3DState {
  status: Preview3DStatus;
  url: string | null;
  /** Formato del archivo servido; null cuando es el original (se usa el del producto). */
  format: string | null;
  degradado: boolean;
  expiresAt: number | null;
}

interface Intento {
  ciclo: number;
  soloPublico: boolean;
}

const LOADING: Preview3DState = {
  status: "loading",
  url: null,
  format: null,
  degradado: false,
  expiresAt: null,
};

const FALLBACK_STATUSES: readonly number[] = [401, 403, 404, 429];

// Cualquier falla del original con respuesta del servidor cae al preview público.
function debeCaerAlPublico(error: unknown): boolean {
  return (
    error instanceof HttpError &&
    (FALLBACK_STATUSES.includes(error.status) || error.status >= 500)
  );
}

function errorState(error: unknown): Preview3DState {
  let status: Preview3DStatus = "error";
  if (error instanceof HttpError) {
    if (error.status === 404) status = "notFound";
    else if (error.status === 429) status = "rateLimited";
  }
  return { ...LOADING, status, degradado: true };
}

async function resolverPreview(
  productId: string,
  soloPublico: boolean,
): Promise<Preview3DState> {
  const haySesion = localStorage.getItem("auth_token") !== null;

  if (haySesion && !soloPublico) {
    try {
      const { url, expiresIn } =
        await productService.getArchivoPreview(productId);
      return {
        status: "ready",
        url,
        format: null,
        degradado: false,
        expiresAt: expiresIn === null ? null : Date.now() + expiresIn * 1000,
      };
    } catch (error: unknown) {
      if (!debeCaerAlPublico(error)) return { ...LOADING, status: "error" };
    }
  }

  try {
    const { url, expiresIn, format } =
      await productService.getPreviewPublico(productId);
    return {
      status: "ready",
      url,
      format: format.toUpperCase(),
      degradado: true,
      expiresAt: Date.now() + expiresIn * 1000,
    };
  } catch (error: unknown) {
    return errorState(error);
  }
}

/**
 * Original si hay sesión y acceso; si no, preview público degradado (`degradado: true`).
 * Sin sesión no se pide el original.
 */
export function usePreview3D(productId: string | undefined) {
  const [state, setState] = useState<Preview3DState>(LOADING);
  const [intento, setIntento] = useState<Intento>({
    ciclo: 0,
    soloPublico: false,
  });

  useEffect(() => {
    if (!productId) return;
    let cancelled = false;
    void resolverPreview(productId, intento.soloPublico).then((next) => {
      if (!cancelled) setState(next);
    });
    return () => {
      cancelled = true;
    };
  }, [productId, intento]);

  // Si el visor falla con una URL vencida, se pide una nueva; con una vigente no se reintenta.
  const renovarSiExpiro = useCallback(() => {
    if (state.expiresAt === null) return;
    if (Date.now() < state.expiresAt - EXPIRY_MARGIN_MS) return;
    setIntento((prev) => ({
      ciclo: prev.ciclo + 1,
      soloPublico: state.degradado,
    }));
  }, [state.expiresAt, state.degradado]);

  return {
    status: productId ? state.status : ("idle" as const),
    url: productId ? state.url : null,
    format: productId ? state.format : null,
    degradado: productId ? state.degradado : false,
    renovarSiExpiro,
  };
}
