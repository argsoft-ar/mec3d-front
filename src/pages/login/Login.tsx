import { useLogin } from "./useLogin";
import Form from "../../components/Form/Form";
import FormField from "../../components/Form/FormField";
import Button from "../../components/Button/Button";
import BrandPanel from "../../components/BrandPanel/BrandPanel";
import { Link } from "react-router-dom";
import type { FormFieldType, SelectOption } from "../../types";
import "./Login.css";

interface FieldDefinition {
  name: "email" | "password";
  label: string;
  type: FormFieldType;
  placeholder: string;
  toggleable?: boolean;
  options?: SelectOption[];
}

const FIELDS: FieldDefinition[] = [
  {
    name: "email",
    label: "Email",
    type: "email",
    placeholder: "tucorreo@ejemplo.com",
  },
  {
    name: "password",
    label: "Contraseña",
    type: "password",
    placeholder: "••••••••",
    toggleable: true,
  },
];

function Login() {
  const { formData, loading, error, handleChange, handleSubmit } = useLogin();

  return (
    <div className="login-page">
      <BrandPanel />

      <div className="login-panel">
        <div className="login-card">
          <div className="login-header">
            <h1 className="login-logo">MEC3D</h1>
            <p className="login-subtitle">Marketplace de piezas mecánicas</p>
          </div>

          <h2 className="login-title">Iniciá sesión</h2>

          {error && (
            <div className="login-error" role="alert">
              {error}
            </div>
          )}

          <div className="login-form-fields">
            <Form onSubmit={handleSubmit} columns={1}>
              {FIELDS.map((field, i) => (
                <div
                  key={field.name}
                  className="login-field-wrapper"
                  style={{ animationDelay: `${0.1 + i * 0.1}s` }}
                >
                  <FormField
                    label={field.label}
                    name={field.name}
                    type={field.type}
                    placeholder={field.placeholder}
                    toggleable={field.toggleable}
                    value={formData[field.name]}
                    onChange={handleChange(field.name)}
                    required
                  />
                </div>
              ))}

              <div
                className="login-field-wrapper"
                style={{ animationDelay: "0.35s" }}
              >
                <Button
                  title={loading ? "Ingresando..." : "Ingresar"}
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  loading={loading}
                />
              </div>
            </Form>
          </div>

          <p className="login-register-link" style={{ animationDelay: "0.5s" }}>
            ¿No tenés cuenta? <Link to="/register">Registrate gratis</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
