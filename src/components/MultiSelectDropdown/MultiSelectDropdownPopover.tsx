import type { ReactNode } from "react";
import type { MultiSelectDropdownPopoverProps } from "./MultiSelectDropdown.types";

function formatSelectedCount(count: number): string {
  return count === 1 ? "1 seleccionada" : `${count} seleccionadas`;
}

type OptionsContentProps = Pick<
  MultiSelectDropdownPopoverProps,
  | "listId"
  | "labelId"
  | "name"
  | "options"
  | "visible"
  | "value"
  | "limitReached"
  | "loading"
  | "emptyMessage"
  | "query"
  | "onToggle"
  | "listRef"
>;

function OptionsContent({
  listId,
  labelId,
  name,
  options,
  visible,
  value,
  limitReached,
  loading,
  emptyMessage,
  query,
  onToggle,
  listRef,
}: Readonly<OptionsContentProps>): ReactNode {
  if (options.length === 0)
    return (
      <p className="multi-select-dropdown__message">
        {loading ? "Cargando opciones…" : emptyMessage}
      </p>
    );
  if (visible.length === 0)
    return (
      <p className="multi-select-dropdown__message">
        Sin resultados para “{query.trim()}”.
      </p>
    );
  return (
    <fieldset
      ref={listRef}
      id={listId}
      aria-labelledby={labelId}
      className="multi-select-dropdown__list"
    >
      {visible.map((opt) => {
        const checked = value.includes(opt.value);
        return (
          <label
            key={opt.value}
            className={`multi-select-dropdown__option${checked ? " multi-select-dropdown__option--checked" : ""}`}
          >
            <input
              type="checkbox"
              className="multi-select-dropdown__checkbox"
              name={name}
              value={opt.value}
              checked={checked}
              disabled={limitReached && !checked}
              onChange={() => onToggle(opt.value)}
            />
            <span className="multi-select-dropdown__option-label">
              {opt.label}
            </span>
          </label>
        );
      })}
    </fieldset>
  );
}

/** Panel desplegable: buscador, lista de checkboxes, avisos y pie con "Limpiar". */
function MultiSelectDropdownPopover({
  id,
  label,
  searchable,
  searchPlaceholder,
  query,
  onQueryChange,
  searchRef,
  limitReached,
  maxSelected,
  visible,
  totalMatches,
  truncated,
  value,
  onClear,
  ...contentProps
}: Readonly<MultiSelectDropdownPopoverProps>) {
  return (
    <div id={id} className="multi-select-dropdown__popover">
      {searchable && (
        <div className="multi-select-dropdown__search-wrapper">
          <input
            ref={searchRef}
            type="search"
            className="form-field__input multi-select-dropdown__search"
            placeholder={searchPlaceholder}
            aria-label={`Buscar en ${label}`}
            aria-controls={contentProps.listId}
            autoComplete="off"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") e.preventDefault();
            }}
          />
        </div>
      )}

      {limitReached && (
        <output className="multi-select-dropdown__note">
          Máximo {maxSelected}
        </output>
      )}

      <OptionsContent
        {...contentProps}
        visible={visible}
        value={value}
        limitReached={limitReached}
        query={query}
      />

      {truncated && (
        <p className="multi-select-dropdown__note">
          Mostrando {visible.length} de {totalMatches}, refiná la búsqueda
        </p>
      )}

      {value.length > 0 && (
        <div className="multi-select-dropdown__footer">
          <span>{formatSelectedCount(value.length)}</span>
          <button
            type="button"
            className="multi-select-dropdown__clear"
            onClick={onClear}
          >
            Limpiar
          </button>
        </div>
      )}
    </div>
  );
}

export default MultiSelectDropdownPopover;
