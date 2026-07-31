import { useRegister } from "./useRegister";
import { Link } from "react-router-dom";
import type { ChangeEvent } from "react";
import type React from "react";
import Form from "../../components/Form/Form";
import FormField from "../../components/Form/FormField";
import Button from "../../components/Button/Button";
import BrandPanel from "../../components/BrandPanel/BrandPanel";
import PasswordStrengthHint from "./PasswordStrengthHint";
import type { FormFieldType, SelectOption } from "../../types";
import "./Register.css";

interface FieldDefinition {
  name: string;
  label: string;
  type: FormFieldType;
  value: string;
  onChange: (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => void;
  placeholder?: string;
  toggleable?: boolean;
  options?: SelectOption[];
  disabled?: boolean;
  error?: string;
  hint?: React.ReactNode;
}

const ROL_OPTIONS: SelectOption[] = [
  { value: "comprador", label: "Comprador" },
  { value: "disenador", label: "Diseñador" },
  { value: "fabricante", label: "Fabricante" },
];

function Register() {
  const { formData, loading, error, handleChange, handleSubmit, georef } =
    useRegister();

  const fields: FieldDefinition[] = [
    {
      name: "email",
      label: "Email",
      type: "email",
      placeholder: "tucorreo@ejemplo.com",
      value: formData.email,
      onChange: handleChange("email"),
    },
    {
      name: "password",
      label: "Contraseña",
      type: "password",
      placeholder: "••••••••",
      toggleable: true,
      value: formData.password,
      onChange: handleChange("password"),
      hint:
        formData.password.length > 0 ? (
          <PasswordStrengthHint value={formData.password} />
        ) : undefined,
    },
    {
      name: "confirmPassword",
      label: "Confirmar contraseña",
      type: "password",
      placeholder: "••••••••",
      toggleable: true,
      value: formData.confirmPassword,
      onChange: handleChange("confirmPassword"),
    },
    {
      name: "rolPrincipal",
      label: "Rol",
      type: "select",
      options: ROL_OPTIONS,
      value: formData.rolPrincipal,
      onChange: handleChange("rolPrincipal"),
    },
    {
      name: "provincia",
      label: "Provincia",
      type: "select",
      value: georef.provinciaId,
      onChange: (e) => georef.selectProvincia(e.target.value),
      options: georef.provincias.options,
      placeholder: georef.provincias.loading
        ? "Cargando provincias..."
        : "Seleccioná una provincia",
      error: georef.provincias.error || undefined,
      disabled: georef.provincias.loading,
    },
    {
      name: "departamento",
      label: "Departamento",
      type: "select",
      value: georef.departamentoId,
      onChange: (e) => georef.selectDepartamento(e.target.value),
      options: georef.departamentos.options,
      placeholder: georef.departamentos.loading
        ? "Cargando departamentos..."
        : "Seleccioná un departamento",
      error: georef.departamentos.error || undefined,
      disabled: !georef.provinciaId || georef.departamentos.loading,
    },
    {
      name: "localidad",
      label: "Localidad",
      type: "select",
      value: georef.localidadId,
      onChange: (e) => georef.selectLocalidad(e.target.value),
      options: georef.localidades.options,
      placeholder: georef.localidades.loading
        ? "Cargando localidades..."
        : "Seleccioná una localidad",
      error: georef.localidades.error || undefined,
      disabled: !georef.departamentoId || georef.localidades.loading,
    },
  ];

  return (
    <div className="login-page">
      <BrandPanel />

      <div className="login-panel">
        <div className="login-card">
          <div className="login-header">
            <h1 className="login-logo">MEC3D</h1>
            <p className="login-subtitle">Marketplace de piezas mecánicas</p>
          </div>

          <h2 className="login-title">Creá tu cuenta</h2>

          {error && (
            <div className="login-error" role="alert">
              {error}
            </div>
          )}

          <div className="login-form-fields">
            <Form onSubmit={handleSubmit} columns={1}>
              {fields.map((field, i) => (
                <div
                  key={field.name}
                  className="login-field-wrapper"
                  style={{ animationDelay: `${0.1 + i * 0.08}s` }}
                >
                  <FormField
                    label={field.label}
                    name={field.name}
                    type={field.type}
                    value={field.value}
                    onChange={field.onChange}
                    placeholder={field.placeholder}
                    toggleable={field.toggleable}
                    options={field.options}
                    error={field.error}
                    disabled={field.disabled}
                    hint={field.hint}
                    required
                  />
                </div>
              ))}

              <div
                className="login-field-wrapper"
                style={{ animationDelay: `${0.1 + fields.length * 0.08}s` }}
              >
                <Button
                  title={loading ? "Registrando..." : "Registrarse"}
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  loading={loading}
                />
              </div>
            </Form>
          </div>

          <p className="login-register-link">
            ¿Ya tenés cuenta? <Link to="/login">Iniciá sesión</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
