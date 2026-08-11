import { useCallback, useEffect, useState } from "react";
import { georefService } from "../services/georef.service";
import type { SelectOption } from "../types";

interface GeorefLevelState {
  options: SelectOption[];
  loading: boolean;
  error: string;
}

const INITIAL_LEVEL: GeorefLevelState = {
  options: [],
  loading: false,
  error: "",
};

export function useGeoref() {
  const [provincias, setProvincias] = useState<GeorefLevelState>({
    options: [],
    loading: true,
    error: "",
  });
  const [departamentos, setDepartamentos] =
    useState<GeorefLevelState>(INITIAL_LEVEL);
  const [localidades, setLocalidades] =
    useState<GeorefLevelState>(INITIAL_LEVEL);

  const [provinciaId, setProvinciaId] = useState("");
  const [departamentoId, setDepartamentoId] = useState("");
  const [localidadId, setLocalidadId] = useState("");

  useEffect(() => {
    let cancelled = false;
    georefService
      .getProvincias()
      .then((res) => {
        if (cancelled) return;
        setProvincias({
          options: (res.data ?? []).map((p) => ({
            value: p.id,
            label: p.nombre,
          })),
          loading: false,
          error: "",
        });
      })
      .catch(() => {
        if (cancelled) return;
        setProvincias({
          options: [],
          loading: false,
          error: "No se pudieron cargar las provincias.",
        });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const resetDeps = () => {
      setDepartamentos(INITIAL_LEVEL);
      setLocalidades(INITIAL_LEVEL);
      setDepartamentoId("");
      setLocalidadId("");
    };
    resetDeps();
    if (!provinciaId) return;

    let cancelled = false;
    setDepartamentos({ options: [], loading: true, error: "" });
    georefService
      .getDepartamentos(provinciaId)
      .then((res) => {
        if (cancelled) return;
        setDepartamentos({
          options: (res.data ?? []).map((d) => ({
            value: d.id,
            label: d.nombre,
          })),
          loading: false,
          error: "",
        });
      })
      .catch(() => {
        if (cancelled) return;
        setDepartamentos({
          options: [],
          loading: false,
          error: "No se pudieron cargar los departamentos.",
        });
      });
    return () => {
      cancelled = true;
    };
  }, [provinciaId]);

  useEffect(() => {
    const resetLocalidades = () => {
      setLocalidades(INITIAL_LEVEL);
      setLocalidadId("");
    };
    resetLocalidades();
    if (!provinciaId || !departamentoId) return;

    let cancelled = false;
    setLocalidades({ options: [], loading: true, error: "" });
    georefService
      .getLocalidades(provinciaId, departamentoId)
      .then((res) => {
        if (cancelled) return;
        setLocalidades({
          options: (res.data ?? []).map((l) => ({
            value: l.id,
            label: l.nombre,
          })),
          loading: false,
          error: "",
        });
      })
      .catch(() => {
        if (cancelled) return;
        setLocalidades({
          options: [],
          loading: false,
          error: "No se pudieron cargar las localidades.",
        });
      });
    return () => {
      cancelled = true;
    };
  }, [provinciaId, departamentoId]);

  const selectProvincia = useCallback((id: string) => {
    setProvinciaId(id);
  }, []);

  const selectDepartamento = useCallback((id: string) => {
    setDepartamentoId(id);
  }, []);

  const selectLocalidad = useCallback((id: string) => {
    setLocalidadId(id);
  }, []);

  return {
    provincias,
    departamentos,
    localidades,
    provinciaId,
    departamentoId,
    localidadId,
    selectProvincia,
    selectDepartamento,
    selectLocalidad,
  };
}
