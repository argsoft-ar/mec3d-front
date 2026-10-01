export function formatPrice(price: number): string {
  if (price === 0) return "Gratis";
  return "$ " + price.toLocaleString("es-AR");
}

export function formatDownloads(n: number): string {
  return n >= 1000
    ? `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k`
    : String(n);
}

/** Un diseño puede tener varios formatos separados por coma (ej. "STL,3MF"). */
export function parseFormatTags(format: string | null | undefined): string[] {
  if (!format) return [];
  return format
    .split(",")
    .map((f) => f.trim().toUpperCase())
    .filter(Boolean);
}
