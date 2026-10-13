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

/** Centavos enteros de ARS a "$ 1.234,56" sin pasar por flotantes. */
export function formatCentavos(centavos: number): string {
  if (!Number.isSafeInteger(centavos)) return "—";
  const sign = centavos < 0 ? "-" : "";
  const abs = Math.abs(centavos);
  const rest = abs % 100;
  const pesos = (abs - rest) / 100;
  const decimals = String(rest).padStart(2, "0");
  return `${sign}$ ${pesos.toLocaleString("es-AR")},${decimals}`;
}

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("es-AR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}
