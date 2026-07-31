import { useState } from "react";
import type React from "react";
import { Eye, EyeOff } from "lucide-react";
import type { FormFieldType, SelectOption } from "../../types";
import "./Form.css";

interface FormFieldProps {
  label: string;
  name: string;
  type?: FormFieldType;
  value: string;
  onChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => void;
  placeholder?: string;
  options?: SelectOption[];
  error?: string;
  required?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  rightElement?: React.ReactNode;
  toggleable?: boolean;
  hint?: React.ReactNode;
}

function FormField({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  options = [],
  error,
  required = false,
  disabled = false,
  fullWidth = false,
  rightElement,
  toggleable = false,
  hint,
}: FormFieldProps) {
  const fieldId = `field-${name}`;
  const errorId = `${fieldId}-error`;
  const [visible, setVisible] = useState(false);

  return (
    <div
      className={`form-field${fullWidth ? " form-field--full" : ""}${error ? " form-field--error" : ""}`}
    >
      <label className="form-field__label" htmlFor={fieldId}>
        {label}
        {required && (
          <span className="form-field__required" aria-hidden="true">
            {" "}
            *
          </span>
        )}
      </label>

      {type === "textarea" ? (
        <textarea
          id={fieldId}
          name={name}
          className="form-field__input form-field__textarea"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          rows={4}
        />
      ) : type === "select" ? (
        <select
          id={fieldId}
          name={name}
          className="form-field__input form-field__select"
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
        >
          <option value="">{placeholder ?? "Seleccioná una opción"}</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : (
        <div className="form-field__input-wrapper">
          <input
            id={fieldId}
            name={name}
            type={
              type === "password" && toggleable
                ? visible
                  ? "text"
                  : "password"
                : type
            }
            className={`form-field__input${toggleable || rightElement ? " form-field__input--has-right" : ""}`}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            aria-invalid={!!error}
            aria-describedby={error ? errorId : undefined}
          />
          {toggleable && type === "password" && (
            <button
              type="button"
              className="form-field__right-element"
              onClick={() => setVisible((v) => !v)}
              aria-label={visible ? "Ocultar contraseña" : "Ver contraseña"}
            >
              {visible ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          )}
          {rightElement && (
            <span className="form-field__right-element">{rightElement}</span>
          )}
        </div>
      )}

      {error && (
        <span id={errorId} className="form-field__error" role="alert">
          {error}
        </span>
      )}
      {hint && <div className="form-field__hint">{hint}</div>}
    </div>
  );
}

export default FormField;
