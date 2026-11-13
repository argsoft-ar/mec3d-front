/**
 * Quita todas las "/" finales sin regex (evita backtracking super-lineal de `/\/+$/`).
 *
 * @example trimTrailingSlashes("https://api.test///") // "https://api.test"
 */
export function trimTrailingSlashes(value: string): string {
  let end = value.length;
  while (end > 0 && value.endsWith("/", end)) end--;
  return value.slice(0, end);
}
