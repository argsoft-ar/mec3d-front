import { useEffect, useMemo, useRef, useState } from "react";
import { georefService } from "../services/georef.service";
import type { SelectOption } from "../types";

interface ZonaNode {
  id: string;
  nombre: string;
  parentId: string;
}

type Status = "loading" | "ready" | "error";

const ERROR_MESSAGE = "No se pudieron cargar algunas zonas. Probá de nuevo.";

function toOptions(
  nodes: ZonaNode[],
  parentNames: Map<string, string>,
  withParent: boolean,
): SelectOption[] {
  return nodes.map((n) => ({
    value: n.id,
    label: withParent
      ? `${n.nombre} (${parentNames.get(n.parentId) ?? n.parentId})`
      : n.nombre,
  }));
}

/** Opciones de provincias, departamentos y localidades para las provincias/departamentos elegidos. */
export function useZonaFilterOptions(
  provinciaIds: string[],
  departamentoIds: string[],
) {
  const [provincias, setProvincias] = useState<ZonaNode[]>([]);
  const [provinciasStatus, setProvinciasStatus] = useState<Status>("loading");
  const [departamentosByProvincia, setDepartamentosByProvincia] = useState<
    Record<string, ZonaNode[]>
  >({});
  const [localidadesByDepartamento, setLocalidadesByDepartamento] = useState<
    Record<string, ZonaNode[]>
  >({});
  const [error, setError] = useState("");
  const requested = useRef(new Set<string>());

  useEffect(() => {
    let cancelled = false;
    georefService
      .getProvincias()
      .then((res) => {
        if (cancelled) return;
        setProvincias((res.data ?? []).map((p) => ({ ...p, parentId: "" })));
        setProvinciasStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setProvinciasStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    provinciaIds.forEach((provinciaId) => {
      const key = `p:${provinciaId}`;
      if (requested.current.has(key)) return;
      requested.current.add(key);
      georefService
        .getDepartamentos(provinciaId)
        .then((res) => {
          setError("");
          setDepartamentosByProvincia((prev) => ({
            ...prev,
            [provinciaId]: (res.data ?? []).map((d) => ({
              ...d,
              parentId: provinciaId,
            })),
          }));
        })
        .catch(() => {
          requested.current.delete(key);
          setError(ERROR_MESSAGE);
        });
    });
  }, [provinciaIds]);

  const departamentoParents = useMemo(() => {
    const parents = new Map<string, string>();
    Object.values(departamentosByProvincia)
      .flat()
      .forEach((d) => parents.set(d.id, d.parentId));
    return parents;
  }, [departamentosByProvincia]);

  useEffect(() => {
    departamentoIds.forEach((departamentoId) => {
      const provinciaId = departamentoParents.get(departamentoId);
      const key = `d:${departamentoId}`;
      if (!provinciaId || requested.current.has(key)) return;
      requested.current.add(key);
      georefService
        .getLocalidades(provinciaId, departamentoId)
        .then((res) => {
          setError("");
          setLocalidadesByDepartamento((prev) => ({
            ...prev,
            [departamentoId]: (res.data ?? []).map((l) => ({
              ...l,
              parentId: departamentoId,
            })),
          }));
        })
        .catch(() => {
          requested.current.delete(key);
          setError(ERROR_MESSAGE);
        });
    });
  }, [departamentoIds, departamentoParents]);

  return useMemo(() => {
    const provinciaNames = new Map(provincias.map((p) => [p.id, p.nombre]));
    const departamentos = provinciaIds.flatMap(
      (id) => departamentosByProvincia[id] ?? [],
    );
    const departamentoNames = new Map(
      Object.values(departamentosByProvincia)
        .flat()
        .map((d) => [d.id, d.nombre]),
    );
    const localidades = departamentoIds.flatMap(
      (id) => localidadesByDepartamento[id] ?? [],
    );
    const localidadNames = new Map(
      Object.values(localidadesByDepartamento)
        .flat()
        .map((l) => [l.id, l.nombre]),
    );
    const localidadParents = new Map(
      Object.values(localidadesByDepartamento)
        .flat()
        .map((l) => [l.id, l.parentId]),
    );

    return {
      provinciaOptions: toOptions(provincias, provinciaNames, false),
      departamentoOptions: toOptions(
        departamentos,
        provinciaNames,
        provinciaIds.length > 1,
      ),
      localidadOptions: toOptions(
        localidades,
        departamentoNames,
        departamentoIds.length > 1,
      ),
      loadingProvincias: provinciasStatus === "loading",
      loadingDepartamentos: provinciaIds.some(
        (id) => !(id in departamentosByProvincia),
      ),
      loadingLocalidades: departamentoIds.some(
        (id) => !(id in localidadesByDepartamento),
      ),
      error:
        provinciasStatus === "error"
          ? "No se pudieron cargar las provincias."
          : error,
      getProvinciaNombre: (id: string) => provinciaNames.get(id) ?? id,
      getDepartamentoNombre: (id: string) => departamentoNames.get(id) ?? id,
      getLocalidadNombre: (id: string) => localidadNames.get(id) ?? id,
      getDepartamentoProvincia: (id: string) => departamentoParents.get(id),
      getLocalidadDepartamento: (id: string) => localidadParents.get(id),
    };
  }, [
    provincias,
    provinciasStatus,
    provinciaIds,
    departamentoIds,
    departamentosByProvincia,
    localidadesByDepartamento,
    departamentoParents,
    error,
  ]);
}
