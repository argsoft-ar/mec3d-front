import MultiSelectDropdown from "../MultiSelectDropdown/MultiSelectDropdown";
import MaterialTag from "../MaterialTag/MaterialTag";
import Button from "../Button/Button";
import { useZonaFilterOptions } from "../../hooks/useZonaFilterOptions";
import { MAX_CODIGOS_ZONA_FILTRO } from "../../interfaces";
import type { ZonaFilterProps } from "./ZonaFilter.types";
import "./ZonaFilter.css";

const TAG_SIZE = { small: "sm", medium: "sm", large: "md" } as const;
const BUTTON_SIZE = { small: "sm", medium: "sm", large: "md" } as const;

function ZonaFilter({
  value,
  onChange,
  disabled = false,
  title = "Filtrar por zona",
  size = "medium",
  variant = "outlined",
  className = "",
}: Readonly<ZonaFilterProps>) {
  const options = useZonaFilterOptions(value.provincias, value.departamentos);
  const hasSelection =
    value.provincias.length > 0 ||
    value.departamentos.length > 0 ||
    value.localidades.length > 0;

  function changeProvincias(provincias: string[]) {
    const departamentos = value.departamentos.filter((d) => {
      const provincia = options.getDepartamentoProvincia(d);
      return provincia !== undefined && provincias.includes(provincia);
    });
    changeDepartamentos(departamentos, provincias);
  }

  function changeDepartamentos(
    departamentos: string[],
    provincias: string[] = value.provincias,
  ) {
    const localidades = value.localidades.filter((l) => {
      const departamento = options.getLocalidadDepartamento(l);
      return departamento !== undefined && departamentos.includes(departamento);
    });
    onChange({ provincias, departamentos, localidades });
  }

  function changeLocalidades(localidades: string[]) {
    onChange({ ...value, localidades });
  }

  const chips = [
    ...value.provincias.map((id) => ({
      key: `p-${id}`,
      label: options.getProvinciaNombre(id),
      variant: "primary" as const,
      onRemove: () =>
        changeProvincias(value.provincias.filter((p) => p !== id)),
    })),
    ...value.departamentos.map((id) => ({
      key: `d-${id}`,
      label: options.getDepartamentoNombre(id),
      variant: "info" as const,
      onRemove: () =>
        changeDepartamentos(value.departamentos.filter((d) => d !== id)),
    })),
    ...value.localidades.map((id) => ({
      key: `l-${id}`,
      label: options.getLocalidadNombre(id),
      variant: "neutral" as const,
      onRemove: () =>
        changeLocalidades(value.localidades.filter((l) => l !== id)),
    })),
  ];

  return (
    <section
      className={`zona-filter zona-filter--${size} zona-filter--${variant} ${className}`.trim()}
      aria-label={title}
    >
      <div className="zona-filter__header">
        <h2 className="zona-filter__title">{title}</h2>
        {hasSelection && (
          <Button
            title="Limpiar filtros"
            variant="ghost"
            size={BUTTON_SIZE[size]}
            disabled={disabled}
            onClick={() =>
              onChange({ provincias: [], departamentos: [], localidades: [] })
            }
          />
        )}
      </div>

      {chips.length > 0 && (
        <div className="zona-filter__chips">
          {chips.map((chip) => (
            <MaterialTag
              key={chip.key}
              label={chip.label}
              variant={chip.variant}
              size={TAG_SIZE[size]}
              disabled={disabled}
              onRemove={chip.onRemove}
            />
          ))}
        </div>
      )}

      <div className="zona-filter__fields">
        <MultiSelectDropdown
          label="Provincias"
          name="zona-provincias"
          options={options.provinciaOptions}
          value={value.provincias}
          onChange={changeProvincias}
          disabled={disabled}
          loading={options.loadingProvincias}
          maxSelected={MAX_CODIGOS_ZONA_FILTRO}
          emptyMessage="No hay provincias disponibles."
          searchPlaceholder="Buscar provincia…"
          size={size}
        />
        <MultiSelectDropdown
          label="Departamentos / partidos"
          name="zona-departamentos"
          options={options.departamentoOptions}
          value={value.departamentos}
          onChange={(departamentos) => changeDepartamentos(departamentos)}
          disabled={disabled || value.provincias.length === 0}
          loading={options.loadingDepartamentos}
          maxSelected={MAX_CODIGOS_ZONA_FILTRO}
          emptyMessage="No hay departamentos para las provincias elegidas."
          placeholder={
            value.provincias.length === 0
              ? "Elegí una provincia primero"
              : undefined
          }
          searchPlaceholder="Buscar departamento…"
          size={size}
        />
        <MultiSelectDropdown
          label="Localidades"
          name="zona-localidades"
          options={options.localidadOptions}
          value={value.localidades}
          onChange={changeLocalidades}
          disabled={disabled || value.departamentos.length === 0}
          loading={options.loadingLocalidades}
          maxSelected={MAX_CODIGOS_ZONA_FILTRO}
          emptyMessage="No hay localidades para los departamentos elegidos."
          placeholder={
            value.departamentos.length === 0
              ? "Elegí un departamento primero"
              : undefined
          }
          searchPlaceholder="Buscar localidad…"
          size={size}
        />
      </div>

      <p className="zona-filter__hint">
        Departamentos y localidades son opcionales para acotar la búsqueda.
      </p>

      {options.error && (
        <p className="zona-filter__error" role="alert">
          {options.error}
        </p>
      )}
    </section>
  );
}

export default ZonaFilter;
