import type React from "react";
import type { SelectOption } from "../../types";
import "../Form/Form.css";
import "./MultiSelectField.css";

interface MultiSelectFieldProps {
  label: string;
  name: string;
  options: SelectOption[];
  value: string[];
  onChange: (value: string[]) => void;
  error?: string;
  hint?: React.ReactNode;
  required?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  /** Tope de opciones seleccionables; al alcanzarlo se deshabilitan las restantes. */
  maxSelected?: number;
  loading?: boolean;
  /** Texto mostrado cuando no hay opciones disponibles. */
  emptyMessage?: string;
}

function MultiSelectField({
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
}: Readonly<MultiSelectFieldProps>) {
  const fieldId = `field-${name}`;
  const errorId = `${fieldId}-error`;
  const hintId = `${fieldId}-hint`;
  const describedBy =
    [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(" ") ||
    undefined;

  function toggle(optionValue: string) {
    onChange(
      value.includes(optionValue)
        ? value.filter((v) => v !== optionValue)
        : [...value, optionValue],
    );
  }

  const limitReached = maxSelected !== undefined && value.length >= maxSelected;

  return (
    <fieldset
      id={fieldId}
      className={`form-field multi-select${fullWidth ? " form-field--full" : ""}${error ? " form-field--error" : ""}`}
      disabled={disabled}
      aria-describedby={describedBy}
      aria-busy={loading}
    >
      <legend className="form-field__label multi-select__legend">
        {label}
        {required && (
          <span className="form-field__required" aria-hidden="true">
            {" "}
            *
          </span>
        )}
      </legend>

      {options.length === 0 ? (
        <p className="multi-select__empty">
          {loading ? "Cargando opciones..." : emptyMessage}
        </p>
      ) : (
        <div className="multi-select__options">
          {options.map((opt) => {
            const checked = value.includes(opt.value);
            return (
              <label
                key={opt.value}
                className={`multi-select__option${checked ? " multi-select__option--checked" : ""}`}
              >
                <input
                  type="checkbox"
                  className="multi-select__input"
                  name={name}
                  value={opt.value}
                  checked={checked}
                  disabled={limitReached && !checked}
                  onChange={() => toggle(opt.value)}
                />
                <span className="multi-select__chip">{opt.label}</span>
              </label>
            );
          })}
        </div>
      )}

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
    </fieldset>
  );
}

export default MultiSelectField;
