import { request } from "./http.client";
import type { CatalogoItem } from "../interfaces";

export const catalogoService = {
  getMateriales: (tecnologiaId?: number) =>
    request<CatalogoItem[]>(
      tecnologiaId === undefined
        ? "/catalogos/materiales"
        : `/catalogos/materiales?${new URLSearchParams({
            tecnologiaId: String(tecnologiaId),
          }).toString()}`,
    ),
  getTecnologias: () => request<CatalogoItem[]>("/catalogos/tecnologias"),
};
