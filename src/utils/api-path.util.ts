export type ApiPathSegment = string | number;

/**
 * Tagged template para endpoints: codifica con encodeURIComponent cada valor interpolado,
 * de modo que un id con "/", "?", "#" o ".." no altere la ruta.
 * Solo para el path: los query strings se arman con URLSearchParams y se concatenan aparte.
 *
 * @example apiPath`/productos/${id}/archivo-preview`
 */
export function apiPath(
  strings: TemplateStringsArray,
  ...segments: ApiPathSegment[]
): string {
  return strings.reduce(
    (path, literal, index) =>
      index < segments.length
        ? `${path}${literal}${encodeURIComponent(String(segments[index]))}`
        : `${path}${literal}`,
    "",
  );
}
