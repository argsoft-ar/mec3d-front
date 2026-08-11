import { request } from "./http.client";
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

export const georefService = {
  getProvincias: () => request<ApiResponse<Provincia[]>>("/georef/provincias"),

  getDepartamentos: (provinciaId: string) =>
    request<ApiResponse<Departamento[]>>(
      `/georef/provincias/${encodeURIComponent(provinciaId)}/departamentos`,
    ),

  getLocalidades: (provinciaId: string, departamentoId?: string) => {
    const params = new URLSearchParams({ provincia: provinciaId });
    if (departamentoId) params.set("departamento", departamentoId);
    return request<ApiResponse<Localidad[]>>(
      `/georef/localidades?${params.toString()}`,
    );
  },
};
