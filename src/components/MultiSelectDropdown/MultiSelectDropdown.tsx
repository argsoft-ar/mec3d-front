import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { ChevronDown } from "lucide-react";
import type { SelectOption } from "../../types";
import type { MultiSelectDropdownProps } from "./MultiSelectDropdown.types";
import "../Form/Form.css";
import "./MultiSelectDropdown.css";

// Tope de opciones renderizadas para listas con miles de elementos.
const MAX_RENDERED = 200;

function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
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
  const describedBy =
    [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(" ") ||
    undefined;

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const isOpen = open && !disabled;

  const indexed = useMemo(
    () => options.map((option) => ({ option, key: normalize(option.label) })),
    [options],
  );
  const labels = useMemo(
    () => new Map(options.map((o) => [o.value, o.label])),
    [options],
  );

  const { selectedMatches, otherMatches } = useMemo(() => {
    const selectedList: SelectOption[] = [];
    const otherList: SelectOption[] = [];
    if (!isOpen)
      return { selectedMatches: selectedList, otherMatches: otherList };
    const term = normalize(query.trim());
    const selected = new Set(value);
    for (const { option, key } of indexed) {
      if (term && !key.includes(term)) continue;
      if (selected.has(option.value)) selectedList.push(option);
      else otherList.push(option);
    }
    return { selectedMatches: selectedList, otherMatches: otherList };
  }, [indexed, query, value, isOpen]);

  // Las seleccionadas se muestran siempre primero y no cuentan para el recorte.
  const visible = [
    ...selectedMatches,
    ...otherMatches.slice(
      0,
      Math.max(0, MAX_RENDERED - selectedMatches.length),
    ),
  ];
  const totalMatches = selectedMatches.length + otherMatches.length;
  const truncated = visible.length < totalMatches;
  const limitReached = maxSelected !== undefined && value.length >= maxSelected;

  useEffect(() => {
    if (!isOpen) return;
    function handleOutside(event: Event) {
      if (
        event.target instanceof Node &&
        rootRef.current?.contains(event.target)
      )
        return;
      setOpen(false);
      setQuery("");
    }
    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("focusin", handleOutside);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("focusin", handleOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    if (searchRef.current) searchRef.current.focus();
    else
      listRef.current
        ?.querySelector<HTMLInputElement>("input:not(:disabled)")
        ?.focus();
  }, [isOpen]);

  function close(returnFocus: boolean) {
    setOpen(false);
    setQuery("");
    if (returnFocus) triggerRef.current?.focus();
  }

  function handleTriggerKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "ArrowDown" && !isOpen) {
      event.preventDefault();
      setOpen(true);
    }
  }

  function handleRootKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape" && isOpen) {
      event.preventDefault();
      event.stopPropagation();
      close(true);
    }
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

  let display: string;
  if (value.length === 0)
    display = loading && options.length === 0 ? "Cargando…" : placeholder;
  else if (value.length === 1)
    display = labels.get(value[0]) ?? "1 seleccionada";
  else display = `${value.length} seleccionadas`;

  const rootClass = [
    "form-field",
    "multi-select-dropdown",
    `multi-select-dropdown--${size}`,
    `multi-select-dropdown--${variant}`,
    fullWidth ? "form-field--full" : "",
    error ? "form-field--error" : "",
    isOpen ? "multi-select-dropdown--open" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  let content: ReactNode;
  if (options.length === 0)
    content = (
      <p className="multi-select-dropdown__message">
        {loading ? "Cargando opciones…" : emptyMessage}
      </p>
    );
  else if (visible.length === 0)
    content = (
      <p className="multi-select-dropdown__message">
        Sin resultados para “{query.trim()}”.
      </p>
    );
  else
    content = (
      <div
        ref={listRef}
        id={listId}
        role="group"
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
                onChange={() => toggleOption(opt.value)}
              />
              <span className="multi-select-dropdown__option-label">
                {opt.label}
              </span>
            </label>
          );
        })}
      </div>
    );

  return (
    <div ref={rootRef} className={rootClass} onKeyDown={handleRootKeyDown}>
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
          aria-invalid={error ? true : undefined}
          aria-busy={loading}
          disabled={disabled}
          onClick={() => (isOpen ? close(false) : setOpen(true))}
          onKeyDown={handleTriggerKeyDown}
        >
          <span
            id={valueId}
            className={`multi-select-dropdown__value${value.length === 0 ? " multi-select-dropdown__value--placeholder" : ""}`}
          >
            {display}
          </span>
          <ChevronDown
            size={16}
            aria-hidden="true"
            className="multi-select-dropdown__chevron"
          />
        </button>

        {isOpen && (
          <div id={popoverId} className="multi-select-dropdown__popover">
            {searchable && (
              <div className="multi-select-dropdown__search-wrapper">
                <input
                  ref={searchRef}
                  type="search"
                  className="form-field__input multi-select-dropdown__search"
                  placeholder={searchPlaceholder}
                  aria-label={`Buscar en ${label}`}
                  aria-controls={listId}
                  autoComplete="off"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") e.preventDefault();
                  }}
                />
              </div>
            )}

            {limitReached && (
              <p className="multi-select-dropdown__note" role="status">
                Máximo {maxSelected}
              </p>
            )}

            {content}

            {truncated && (
              <p className="multi-select-dropdown__note">
                Mostrando {visible.length} de {totalMatches}, refiná la búsqueda
              </p>
            )}

            {value.length > 0 && (
              <div className="multi-select-dropdown__footer">
                <span>
                  {value.length === 1
                    ? "1 seleccionada"
                    : `${value.length} seleccionadas`}
                </span>
                <button
                  type="button"
                  className="multi-select-dropdown__clear"
                  onClick={clearSelection}
                >
                  Limpiar
                </button>
              </div>
            )}
          </div>
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
