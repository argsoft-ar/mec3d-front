import { request } from "./http.client";
import { apiPath } from "../utils/api-path.util";
import { cacheDel, cacheGet, cacheSet } from "./cache";
import { sanitizeProvincias } from "../utils/cache-sanitize.util";
import type {
  ApiResponse,
  Provincia,
  Departamento,
  Localidad,
} from "../interfaces";

// Los IDs de localidad de Georef tienen 11 dígitos (BAHRA); el backend espera el código INDEC de localidad censal (primeros 8 dígitos).
export function toZonaId(localidadId: string): number {
  return Number(localidadId.length > 8 ? localidadId.slice(0, 8) : localidadId);
}

const PROVINCIAS_KEY = "georef:provincias";
const PROVINCIAS_TTL = 24 * 60 * 60 * 1000;

/** Lee las provincias cacheadas; si fueron manipuladas (forma inválida) se descartan. */
function readCachedProvincias(): ApiResponse<Provincia[]> | null {
  const cached = cacheGet<unknown>(PROVINCIAS_KEY);
  if (cached === null) return null;
  const clean = sanitizeProvincias(cached);
  if (clean === null) cacheDel(PROVINCIAS_KEY);
  return clean;
}

export const georefService = {
  getProvincias: async () => {
    const cached = readCachedProvincias();
    if (cached) return cached;
    const data = await request<ApiResponse<Provincia[]>>("/georef/provincias");
    // Solo se cachea una copia reconstruida y validada, nunca la respuesta HTTP tal cual.
    const clean = sanitizeProvincias(data);
    if (clean) cacheSet(PROVINCIAS_KEY, clean, PROVINCIAS_TTL);
    return data;
  },

  getDepartamentos: (provinciaId: string) =>
    request<ApiResponse<Departamento[]>>(
      apiPath`/georef/provincias/${provinciaId}/departamentos`,
    ),

  getLocalidades: (provinciaId: string, departamentoId?: string) => {
    const params = new URLSearchParams({ provincia: provinciaId });
    if (departamentoId) params.set("departamento", departamentoId);
    return request<ApiResponse<Localidad[]>>(
      `/georef/localidades?${params.toString()}`,
    );
  },
};
