import { useEffect, useMemo, useState } from "react";
import { catalogoService } from "../services/catalogo.service";
import type { CatalogoItem } from "../interfaces";
import type { SelectOption } from "../types";

interface MaterialesCargados {
  tecnologiaId: number;
  items: CatalogoItem[];
}

function toOptions(items: CatalogoItem[]): SelectOption[] {
  return items.map((item) => ({ value: item.nombre, label: item.nombre }));
}

/** Catálogo de tecnologías y materiales (filtrados por la tecnología elegida, por nombre). */
export function useCatalogoDiseno(tecnologia: string) {
  const [tecnologias, setTecnologias] = useState<CatalogoItem[]>([]);
  const [cargados, setCargados] = useState<MaterialesCargados | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    catalogoService
      .getTecnologias()
      .then(setTecnologias)
      .catch(() => setError(true));
  }, []);

  const tecnologiaId = tecnologias.find((t) => t.nombre === tecnologia)?.id;

  useEffect(() => {
    if (tecnologiaId === undefined) return;
    let cancelled = false;
    catalogoService
      .getMateriales(tecnologiaId)
      .then((items) => {
        if (!cancelled) setCargados({ tecnologiaId, items });
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [tecnologiaId]);

  const materialesActuales =
    tecnologiaId !== undefined && cargados?.tecnologiaId === tecnologiaId
      ? cargados.items
      : null;

  const tecnologiaOptions = useMemo(
    () => toOptions(tecnologias),
    [tecnologias],
  );
  const materialOptions = useMemo(
    () => toOptions(materialesActuales ?? []),
    [materialesActuales],
  );

  return {
    tecnologiaOptions,
    materialOptions,
    loadingMateriales:
      tecnologiaId !== undefined && materialesActuales === null,
    error,
  };
}
