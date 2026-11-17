import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { ChevronDown } from "lucide-react";
import { useDropdownDismiss } from "../../hooks/useDropdownDismiss";
import { useMultiSelectOptions } from "../../hooks/useMultiSelectOptions";
import MultiSelectDropdownPopover from "./MultiSelectDropdownPopover";
import type { MultiSelectDropdownProps } from "./MultiSelectDropdown.types";
import "../Form/Form.css";
import "./MultiSelectDropdown.css";

// Tope de opciones renderizadas para listas con miles de elementos.
const MAX_RENDERED = 200;

function joinIds(...ids: Array<string | false | undefined>): string | undefined {
  return ids.filter(Boolean).join(" ") || undefined;
}

function getDisplayText(
  value: string[],
  labels: Map<string, string>,
  placeholder: string,
  loadingOptions: boolean,
): string {
  if (value.length === 0) return loadingOptions ? "Cargando…" : placeholder;
  if (value.length === 1) return labels.get(value[0]) ?? "1 seleccionada";
  return `${value.length} seleccionadas`;
}

function MultiSelectDropdown({
  label,
  name,
  options,
  value,
  onChange,
  error,
  hint,
  required = false,
  disabled = false,
  fullWidth = false,
  maxSelected,
  loading = false,
  emptyMessage = "No hay opciones disponibles",
  placeholder = "Seleccionar…",
  searchPlaceholder = "Buscar…",
  searchable = true,
  size = "medium",
  variant = "outlined",
  className = "",
}: Readonly<MultiSelectDropdownProps>) {
  const fieldId = `field-${name}`;
  const labelId = `${fieldId}-label`;
  const valueId = `${fieldId}-value`;
  const popoverId = `${fieldId}-popover`;
  const listId = `${fieldId}-list`;
  const errorId = `${fieldId}-error`;
  const hintId = `${fieldId}-hint`;
  const describedBy = joinIds(!!error && errorId, !!hint && hintId);

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLFieldSetElement>(null);
  const isOpen = open && !disabled;

  const { visible, totalMatches, truncated, labels } = useMultiSelectOptions({
    options,
    value,
    query,
    isOpen,
    maxRendered: MAX_RENDERED,
  });
  const limitReached = maxSelected !== undefined && value.length >= maxSelected;

  const close = useCallback((returnFocus: boolean) => {
    setOpen(false);
    setQuery("");
    if (returnFocus) triggerRef.current?.focus();
  }, []);

  useDropdownDismiss(rootRef, isOpen, close);

  useEffect(() => {
    if (!isOpen) return;
    if (searchRef.current) searchRef.current.focus();
    else
      listRef.current
        ?.querySelector<HTMLInputElement>("input:not(:disabled)")
        ?.focus();
  }, [isOpen]);

  function handleTriggerKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "ArrowDown" && !isOpen) {
      event.preventDefault();
      setOpen(true);
    }
  }

  function toggleOpen() {
    if (isOpen) close(false);
    else setOpen(true);
  }

  function toggleOption(optionValue: string) {
    onChange(
      value.includes(optionValue)
        ? value.filter((v) => v !== optionValue)
        : [...value, optionValue],
    );
  }

  function clearSelection() {
    onChange([]);
    searchRef.current?.focus();
  }

  const display = getDisplayText(
    value,
    labels,
    placeholder,
    loading && options.length === 0,
  );

  const rootClass = [
    "form-field",
    "multi-select-dropdown",
    `multi-select-dropdown--${size}`,
    `multi-select-dropdown--${variant}`,
    fullWidth && "form-field--full",
    error && "form-field--error",
    isOpen && "multi-select-dropdown--open",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const valueClass = [
    "multi-select-dropdown__value",
    value.length === 0 && "multi-select-dropdown__value--placeholder",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div ref={rootRef} className={rootClass}>
      <label id={labelId} htmlFor={fieldId} className="form-field__label">
        {label}
        {required && (
          <span className="form-field__required" aria-hidden="true">
            {" "}
            *
          </span>
        )}
      </label>

      <div className="multi-select-dropdown__control">
        {/* El error se anuncia vía aria-describedby (aria-invalid no aplica a role=button). */}
        <button
          ref={triggerRef}
          id={fieldId}
          type="button"
          className="form-field__input multi-select-dropdown__trigger"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-controls={isOpen ? popoverId : undefined}
          aria-labelledby={`${labelId} ${valueId}`}
          aria-describedby={describedBy}
          aria-busy={loading}
          data-invalid={error ? true : undefined}
          disabled={disabled}
          onClick={toggleOpen}
          onKeyDown={handleTriggerKeyDown}
        >
          <span id={valueId} className={valueClass}>
            {display}
          </span>
          <ChevronDown
            size={16}
            aria-hidden="true"
            className="multi-select-dropdown__chevron"
          />
        </button>

        {isOpen && (
          <MultiSelectDropdownPopover
            id={popoverId}
            listId={listId}
            labelId={labelId}
            name={name}
            label={label}
            options={options}
            visible={visible}
            value={value}
            totalMatches={totalMatches}
            truncated={truncated}
            limitReached={limitReached}
            maxSelected={maxSelected}
            loading={loading}
            emptyMessage={emptyMessage}
            searchable={searchable}
            searchPlaceholder={searchPlaceholder}
            query={query}
            onQueryChange={setQuery}
            onToggle={toggleOption}
            onClear={clearSelection}
            searchRef={searchRef}
            listRef={listRef}
          />
        )}
      </div>

      {error && (
        <span id={errorId} className="form-field__error" role="alert">
          {error}
        </span>
      )}
      {hint && (
        <div id={hintId} className="form-field__hint">
          {hint}
        </div>
      )}
    </div>
  );
}

export default MultiSelectDropdown;
