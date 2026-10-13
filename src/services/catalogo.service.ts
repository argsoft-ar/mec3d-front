import { request } from "./http.client";
import type { CatalogoItem } from "../interfaces";

export const catalogoService = {
  getMateriales: (tecnologiaId?: number) =>
    request<CatalogoItem[]>(
      tecnologiaId === undefined
        ? "/catalogos/materiales"
        : `/catalogos/materiales?tecnologiaId=${tecnologiaId}`,
    ),
  getTecnologias: () => request<CatalogoItem[]>("/catalogos/tecnologias"),
};
