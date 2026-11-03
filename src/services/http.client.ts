import type { ApiError, ApiErrorDetail } from "../interfaces";
import type { ToastType } from "../types";
import { clearSessionData, getToken } from "./session";
import { buildLoginUrl } from "../utils/redirect.util";

export const BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";

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

// Solo el 401 (token inválido/vencido) cierra la sesión; el 403 es un error de negocio
// (p. ej. "sin acceso a este recurso") y se propaga sin tocar el token. Los 401 de
// /auth/* son credenciales incorrectas, no una sesión vencida. Sin token (navegación
// anónima) no hay sesión que cerrar: el 401 se propaga sin redirigir.
async function throwHttpError(
  response: Response,
  endpoint: string,
  hadToken: boolean,
  keepSession = false,
): Promise<never> {
  if (
    response.status === 401 &&
    hadToken &&
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
  const token = getToken();

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...init.headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...init,
    headers,
  });

  if (!response.ok)
    return throwHttpError(
      response,
      endpoint,
      token !== null,
      keepSessionOnUnauthorized,
    );

  return response.json() as Promise<T>;
}

// Los endpoints de descarga responden 302 y exigen el JWT como header (un <a href>
// plano no puede enviarlo): se hace fetch manual y se dispara la descarga del blob.
export async function downloadFile(
  endpoint: string,
  fileName: string,
): Promise<void> {
  const token = getToken();

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (!response.ok) return throwHttpError(response, endpoint, token !== null);

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.URL.revokeObjectURL(url);
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
