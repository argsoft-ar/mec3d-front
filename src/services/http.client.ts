import type { ApiError, ApiErrorDetail } from "../interfaces";
import type { ToastType } from "../types";
import { clearSessionData } from "./session";

export const BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";

export class HttpError extends Error implements ApiError {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "HttpError";
    this.status = status;
  }
}

function isErrorDetail(value: unknown): value is ApiErrorDetail {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as ApiErrorDetail).message === "string"
  );
}

// El backend responde { error, details? }; se usa ese texto para que la UI lo muestre.
async function readErrorMessage(response: Response): Promise<string> {
  const fallback = `HTTP error ${response.status}`;
  try {
    const body: unknown = await response.json();
    if (typeof body !== "object" || body === null) return fallback;
    const { error, details } = body as { error?: unknown; details?: unknown };
    if (typeof error !== "string" || !error) return fallback;
    const firstDetail = Array.isArray(details)
      ? details.find(isErrorDetail)
      : undefined;
    return firstDetail ? `${error}: ${firstDetail.message}` : error;
  } catch {
    return fallback;
  }
}

function endSession(): void {
  clearSessionData();
  window.location.href = "/login";
}

// Solo el 401 (token inválido/vencido) cierra la sesión; el 403 es un error de negocio
// (p. ej. "sin acceso a este recurso") y se propaga sin tocar el token. Los 401 de
// /auth/* son credenciales incorrectas, no una sesión vencida.
async function throwHttpError(
  response: Response,
  endpoint: string,
): Promise<never> {
  if (response.status === 401 && !endpoint.startsWith("/auth/")) endSession();
  throw new HttpError(response.status, await readErrorMessage(response));
}

export async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = localStorage.getItem("auth_token");

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) return throwHttpError(response, endpoint);

  return response.json() as Promise<T>;
}

// Los endpoints de descarga responden 302 y exigen el JWT como header (un <a href>
// plano no puede enviarlo): se hace fetch manual y se dispara la descarga del blob.
export async function downloadFile(
  endpoint: string,
  fileName: string,
): Promise<void> {
  const token = localStorage.getItem("auth_token");

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (!response.ok) return throwHttpError(response, endpoint);

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
