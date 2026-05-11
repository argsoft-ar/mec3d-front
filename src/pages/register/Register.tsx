import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Form from "../../components/Form/Form";
import FormField from "../../components/Form/FormField";
import Button from "../../components/Button/Button";
import { authService } from "../../services/api";
import type { FormFieldType, SelectOption } from "../../types";
import type { RolUsuario } from "../../interfaces/user.interface";
import "./Register.css";

type RegisterForm = {
  email: string;
  password: string;
  confirmPassword: string;
  rol_principal: string;
};

type RegisterTextKeys = "email" | "password" | "confirmPassword";

const REGISTER_TEXT_FIELDS: Array<{
  label: string;
  name: RegisterTextKeys;
  type: FormFieldType;
  placeholder: string;
}> = [
  {
    label: "Email",
    name: "email",
    type: "email",
    placeholder: "tucorreo@ejemplo.com",
  },
  {
    label: "Contraseña",
    name: "password",
    type: "password",
    placeholder: "••••••••",
  },
  {
    label: "Confirmar contraseña",
    name: "confirmPassword",
    type: "password",
    placeholder: "••••••••",
  },
];

const ROL_OPTIONS: SelectOption[] = [
  { value: "comprador", label: "Comprador" },
  { value: "disenador", label: "Diseñador" },
  { value: "fabricante", label: "Fabricante" },
];

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<RegisterForm>({
    email: "",
    password: "",
    confirmPassword: "",
    rol_principal: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);

    try {
      await authService.register({
        email: formData.email,
        password: formData.password,
        rol_principal: formData.rol_principal as RolUsuario,
      });
      navigate("/login");
    } catch {
      setError("Error al registrar. Verificá los datos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* ── Left brand panel ── */}
      <div className="login-brand" aria-hidden="true">
        <div className="login-brand__blob login-brand__blob--blue" />
        <div className="login-brand__blob login-brand__blob--orange" />
        <div className="login-brand__blob login-brand__blob--purple" />
        <div className="login-brand__grid" />

        <div className="login-brand__gear login-brand__gear--1" />
        <div className="login-brand__gear login-brand__gear--2" />
        <div className="login-brand__gear login-brand__gear--3" />
        <div className="login-brand__hex login-brand__hex--1" />
        <div className="login-brand__hex login-brand__hex--2" />

        <div className="login-brand__content">
          <h1 className="login-brand__logo">MEC3D</h1>
          <p className="login-brand__tagline">
            Marketplace de piezas mecánicas 3D
          </p>
          <div className="login-brand__divider" />
          <ul className="login-brand__features">
            <li>Impresión 3D bajo demanda</li>
            <li>Piezas mecánicas certificadas</li>
            <li>Entrega rápida en todo el país</li>
          </ul>
        </div>
      </div>

      {/* ── Right form panel ── */}
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
              {REGISTER_TEXT_FIELDS.map((field, i) => (
                <div
                  key={field.name}
                  className="login-field-wrapper"
                  style={{ animationDelay: `${0.1 + i * 0.1}s` }}
                >
                  <FormField
                    label={field.label}
                    name={field.name}
                    type={field.type}
                    value={formData[field.name]}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        [field.name]: e.target.value,
                      }))
                    }
                    placeholder={field.placeholder}
                    required
                  />
                </div>
              ))}
              <div
                className="login-field-wrapper"
                style={{ animationDelay: "0.4s" }}
              >
                <FormField
                  label="Rol"
                  name="rol_principal"
                  type="select"
                  value={formData.rol_principal}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      rol_principal: e.target.value,
                    }))
                  }
                  options={ROL_OPTIONS}
                  required
                />
              </div>
              <div
                className="login-field-wrapper"
                style={{ animationDelay: "0.5s" }}
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

          <p
            className="login-register-link"
            style={{ animationDelay: "0.65s" }}
          >
            ¿Ya tenés cuenta? <Link to="/login">Iniciá sesión</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
