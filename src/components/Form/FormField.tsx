import { useState } from "react";
import type React from "react";
import { Eye, EyeOff, CheckCircle } from "lucide-react";
import type { FormFieldType, SelectOption } from "../../types";
import Button from "../Button/Button";
import "./Form.css";

interface FormFieldProps {
  label: string;
  name: string;
  type?: FormFieldType;
  value?: string;
  onChange?: (
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
  accept?: string;
  fileInputRef?: React.RefObject<HTMLInputElement | null>;
  onFileChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileName?: string;
  fileSelected?: boolean;
}

function FormField({
  label,
  name,
  type = "text",
  value = "",
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
  accept,
  fileInputRef,
  onFileChange,
  fileName,
  fileSelected = false,
}: Readonly<FormFieldProps>) {
  const fieldId = `field-${name}`;
  const errorId = `${fieldId}-error`;
  const [visible, setVisible] = useState(false);

  function getInputType() {
    if (type === "password" && toggleable) {
      return visible ? "text" : "password";
    }
    return type;
  }

  function renderField() {
    if (type === "file") {
      return (
        <div className="form-field__file">
          <input
            id={fieldId}
            name={name}
            type="file"
            accept={accept}
            ref={fileInputRef}
            onChange={onFileChange}
            style={{ display: "none" }}
            aria-invalid={!!error}
            aria-describedby={error ? errorId : undefined}
          />
          <Button
            title={`Subir ${label}`}
            variant="primary"
            type="button"
            disabled={disabled}
            onClick={() => fileInputRef?.current?.click()}
          />
          {fileSelected && (
            <div className="form-field__file-success">
              <CheckCircle
                size={18}
                className="form-field__file-success-icon"
              />
              <span className="form-field__file-success-text">
                {fileName || "Archivo cargado"}
              </span>
            </div>
          )}
        </div>
      );
    }
    if (type === "textarea") {
      return (
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
      );
    }
    if (type === "select") {
      return (
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
      );
    }
    return (
      <div className="form-field__input-wrapper">
        <input
          id={fieldId}
          name={name}
          type={getInputType()}
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
    );
  }

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

      {renderField()}

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
