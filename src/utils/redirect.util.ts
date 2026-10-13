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
    return (
      new URL(value, window.location.origin).origin === window.location.origin
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
