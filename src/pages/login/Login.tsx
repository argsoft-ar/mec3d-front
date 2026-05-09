import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Form from "../../components/Form/Form";
import FormField from "../../components/Form/FormField";
import Button from "../../components/Button/Button";
import { authService } from "../../services/api";
import type { FormFieldType } from "../../types";
import "./Login.css";

const MOCK_EMAIL = "demo@mec3d.com";
const MOCK_PASSWORD = "demo123";

type LoginForm = { email: string; password: string };

const LOGIN_FIELDS: Array<{
  label: string;
  name: keyof LoginForm;
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
];

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<LoginForm>({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Mock bypass — remove when real backend is ready
    if (formData.email === MOCK_EMAIL && formData.password === MOCK_PASSWORD) {
      localStorage.setItem("auth_token", "mock-token-demo");
      navigate("/dashboard");
      return;
    }

    try {
      const { token } = await authService.login(
        formData.email,
        formData.password,
      );
      localStorage.setItem("auth_token", token);
      navigate("/dashboard");
    } catch {
      setError("Credenciales inválidas. Revisá tu email y contraseña.");
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

          <h2 className="login-title">Iniciá sesión</h2>

          {error && (
            <div className="login-error" role="alert">
              {error}
            </div>
          )}

          <div className="login-form-fields">
            <Form onSubmit={handleSubmit} columns={1}>
              {LOGIN_FIELDS.map((field, i) => (
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

          <div className="login-demo-hint" style={{ animationDelay: "0.45s" }}>
            <strong>Demo:</strong> {MOCK_EMAIL} / {MOCK_PASSWORD}
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
