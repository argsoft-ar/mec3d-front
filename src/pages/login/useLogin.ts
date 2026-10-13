import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import type { ChangeEvent, FormEvent } from "react";
import { authService } from "../../services/api";
import { clearSessionData } from "../../services/session";
import { resolvePostLoginPath } from "../../utils/redirect.util";

export type LoginForm = { email: string; password: string };

const DEFAULT_DESTINATION = "/dashboard";

export function useLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState<LoginForm>({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange =
    (field: keyof LoginForm) =>
    (
      e: ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ) =>
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { token, user } = await authService.login(
        formData.email,
        formData.password,
      );
      clearSessionData();
      localStorage.setItem("auth_token", token);
      localStorage.setItem("auth_user", JSON.stringify(user));
      navigate(resolvePostLoginPath(location.state, DEFAULT_DESTINATION), {
        replace: true,
      });
    } catch {
      setError("Credenciales inválidas. Revisá tu email y contraseña.");
    } finally {
      setLoading(false);
    }
  };

  return { formData, loading, error, handleChange, handleSubmit };
}
