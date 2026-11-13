import type { ApiError, ApiErrorDetail } from "../interfaces";
import type { ToastType } from "../types";
import { clearSessionData, isAuthenticated } from "./session";
import { buildLoginUrl, hasControlOrWhitespace } from "../utils/redirect.util";
import { trimTrailingSlashes } from "../utils/string.util";

// Same-origin por defecto ("/api/v1"): en dev lo atiende el proxy de Vite y en prod el
// rewrite de Vercel, así la cookie de sesión es first-party.
export const BASE_URL = import.meta.env.VITE_API_URL || "/api/v1";

// Origen y prefijo de la API resueltos una sola vez (admite VITE_API_URL relativa, p. ej. "/api/v1").
const API_BASE = new URL(BASE_URL, globalThis.location?.origin);
const API_BASE_PATH = trimTrailingSlashes(API_BASE.pathname);

/** Segmento que (decodificado) es "." / ".." o esconde un separador: lo usaria un path traversal. */
function isUnsafeSegment(segment: string): boolean {
  let decoded: string;
  try {
    decoded = decodeURIComponent(segment);
  } catch {
    return true;
  }
  return (
    decoded === "." ||
    decoded === ".." ||
    decoded.includes("/") ||
    decoded.includes("\\")
  );
}

/**
 * Convierte un endpoint relativo ("/productos/123?x=1") en la URL absoluta de la API.
 * Rechaza URLs absolutas, protocol-relative ("//host"), backslashes, espacios/control y
 * segmentos "."/".." (tambien codificados): la URL final debe quedar en el origen y
 * bajo el prefijo de BASE_URL (SSRF / API traversal del lado del cliente).
 */
function resolveApiUrl(endpoint: string): string {
  const invalid = () => new HttpError(0, "Ruta de API inválida");
  if (
    typeof endpoint !== "string" ||
    !endpoint.startsWith("/") ||
    endpoint.startsWith("//") ||
    endpoint.includes("\\") ||
    hasControlOrWhitespace(endpoint)
  )
    throw invalid();

  const pathEnd = endpoint.search(/[?#]/);
  const path = pathEnd === -1 ? endpoint : endpoint.slice(0, pathEnd);
  if (path.slice(1).split("/").some(isUnsafeSegment)) throw invalid();

  const url = new URL(`${API_BASE_PATH}${endpoint}`, API_BASE.origin);
  if (
    url.origin !== API_BASE.origin ||
    !url.pathname.startsWith(`${API_BASE_PATH}/`)
  )
    throw invalid();
  return url.href;
}

export class HttpError extends Error implements ApiError {
  readonly status: number;
  readonly details: ApiErrorDetail[];
  /** Código de negocio del backend (p. ej. "COMPRA_DUPLICADA"), si lo envió. */
  readonly code: string | null;

  constructor(
    status: number,
    message: string,
    details: ApiErrorDetail[] = [],
    code: string | null = null,
  ) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.details = details;
    this.code = code;
  }
}

function isErrorDetail(value: unknown): value is ApiErrorDetail {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as ApiErrorDetail).message === "string"
  );
}

// El backend responde { error, details?, code? }; se usa ese texto para que la UI lo muestre.
async function readErrorBody(
  response: Response,
): Promise<{
  message: string;
  details: ApiErrorDetail[];
  code: string | null;
}> {
  const fallback = {
    message: `HTTP error ${response.status}`,
    details: [],
    code: null,
  };
  try {
    const body: unknown = await response.json();
    if (typeof body !== "object" || body === null) return fallback;
    const { error, details, code } = body as {
      error?: unknown;
      details?: unknown;
      code?: unknown;
    };
    if (typeof error !== "string" || !error) return fallback;
    const validDetails = Array.isArray(details)
      ? details.filter(isErrorDetail)
      : [];
    const [firstDetail] = validDetails;
    return {
      message: firstDetail ? `${error}: ${firstDetail.message}` : error,
      details: validDetails,
      code: typeof code === "string" && code ? code : null,
    };
  } catch {
    return fallback;
  }
}

function endSession(): void {
  const { pathname, search, hash } = window.location;
  clearSessionData();
  window.location.href = buildLoginUrl(`${pathname}${search}${hash}`);
}

// Solo el 401 (cookie de sesión inválida/vencida) cierra la sesión; el 403 es un error de
// negocio (p. ej. "sin acceso a este recurso") y se propaga sin tocar la sesión. Los 401 de
// /auth/* son credenciales incorrectas, no una sesión vencida. Sin sesión local (navegación
// anónima) no hay sesión que cerrar: el 401 se propaga sin redirigir.
async function throwHttpError(
  response: Response,
  endpoint: string,
  hadSession: boolean,
  keepSession = false,
): Promise<never> {
  if (
    response.status === 401 &&
    hadSession &&
    !keepSession &&
    !endpoint.startsWith("/auth/")
  )
    endSession();
  const { message, details, code } = await readErrorBody(response);
  throw new HttpError(response.status, message, details, code);
}

export interface RequestOptions extends RequestInit {
  /** Un 401 se propaga como HttpError sin cerrar la sesión ni redirigir a /login. */
  keepSessionOnUnauthorized?: boolean;
}

export async function request<T>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  const { keepSessionOnUnauthorized, ...init } = options;
  const url = resolveApiUrl(endpoint);
  const hadSession = isAuthenticated();

  // Con FormData el browser arma el Content-Type multipart (con boundary): no se pisa.
  const isFormData = init.body instanceof FormData;
  const headers: HeadersInit = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...init.headers,
  };

  // La sesión viaja en la cookie HttpOnly: `credentials: "include"` la adjunta.
  const response = await fetch(url, {
    ...init,
    headers,
    credentials: "include",
  });

  if (!response.ok)
    return throwHttpError(
      response,
      endpoint,
      hadSession,
      keepSessionOnUnauthorized,
    );

  // 204 (p. ej. POST /auth/logout) no trae cuerpo.
  if (response.status === 204) return undefined as T;

  return response.json() as Promise<T>;
}

// Los endpoints de descarga responden 302 con autenticación requerida: se hace fetch
// manual (con la cookie de sesión) y se dispara la descarga del blob.
export async function downloadFile(
  endpoint: string,
  fileName: string,
): Promise<void> {
  const url = resolveApiUrl(endpoint);
  const hadSession = isAuthenticated();

  // same-origin (no include): la cookie llega igual a /api (same-origin) y el salto 302 a la
  // URL firmada de R2 (cross-origin) va sin credenciales; con include R2 tendría que responder
  // Access-Control-Allow-Credentials y la descarga fallaría por CORS.
  const response = await fetch(url, { credentials: "same-origin" });

  if (!response.ok) return throwHttpError(response, endpoint, hadSession);

  const blob = await response.blob();
  const blobUrl = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = blobUrl;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.URL.revokeObjectURL(blobUrl);
}

export function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof HttpError ? error.message : fallback;
}

export function isNotFoundError(error: unknown): boolean {
  return error instanceof HttpError && error.status === 404;
}

export function hasErrorCode(error: unknown, code: string): boolean {
  return error instanceof HttpError && error.code === code;
}

/** 403/409 son reglas de negocio (p. ej. "no podés cancelar con el pago acreditado"): se avisan como warning. */
export function getErrorToast(
  error: unknown,
  fallback: string,
): { message: string; type: ToastType } {
  const esNegocio =
    error instanceof HttpError &&
    (error.status === 403 || error.status === 409);
  return {
    message: getErrorMessage(error, fallback),
    type: esNegocio ? "warning" : "error",
  };
}
