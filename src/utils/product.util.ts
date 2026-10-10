// Límites espejo de mec3d-back/src/schemas/diseno.schema.ts.
export const MIN_PRINT_HOURS = 1;
export const MAX_PRINT_HOURS = 500;
export const MIN_PRECIO_BASE = 0.01;
export const MAX_PRECIO_BASE = 10_000_000;
export const MAX_MATERIALES_POR_DISENO = 20;

export function formatPrintHours(hours: number): string {
  return `${hours} h`;
}
