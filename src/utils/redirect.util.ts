// eslint-disable-next-line no-control-regex -- los caracteres de control son justamente lo que se rechaza
const CONTROL_OR_WHITESPACE = /[\u0000-\u001f\u007f-\u009f\s]/;

/** Solo rutas internas relativas: '/x' sí; '//host', '/\host', URLs absolutas, espacios y caracteres de control no (open redirect). */
export function isSafeInternalPath(value: unknown): value is string {
  if (
    typeof value !== "string" ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\") ||
    CONTROL_OR_WHITESPACE.test(value)
  )
    return false;

  try {
    const url = new URL(value, window.location.origin);
    // "/..//host" se normaliza a "//host": react-router lo resolvería como URL protocol-relative.
    return (
      url.origin === window.location.origin && !url.pathname.startsWith("//")
    );
  } catch {
    return false;
  }
}

export function resolvePostLoginPath(state: unknown, fallback: string): string {
  if (typeof state !== "object" || state === null) return fallback;
  const { from } = state as { from?: unknown };
  return isSafeInternalPath(from) ? from : fallback;
}

export const REDIRECT_PARAM = "redirect";

/** Lee `?redirect=` (lo agrega el cierre de sesión por 401) y lo valida como ruta interna. */
export function resolveRedirectParam(search: string, fallback: string): string {
  const value = new URLSearchParams(search).get(REDIRECT_PARAM);
  return isSafeInternalPath(value) ? value : fallback;
}

export function buildLoginUrl(from: string): string {
  if (!isSafeInternalPath(from) || from.startsWith("/login")) return "/login";
  return `/login?${new URLSearchParams({ [REDIRECT_PARAM]: from }).toString()}`;
}

export const rutaDisenoOrden = (ordenId: string): string =>
  `/fabricacion/ordenes/${encodeURIComponent(ordenId)}/diseno`;

export const rutaChat = (conversacionId: string): string =>
  `/chat/${encodeURIComponent(conversacionId)}`;
