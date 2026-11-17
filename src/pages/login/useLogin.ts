import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import type { ChangeEvent, FormEvent } from "react";
import { authService } from "../../services/api";
import { clearSessionData, saveSession } from "../../services/session";
import {
  resolvePostLoginPath,
  resolveRedirectParam,
} from "../../utils/redirect.util";

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
      const { user } = await authService.login(
        formData.email,
        formData.password,
      );
      // La cookie HttpOnly ya quedó seteada; se descarta el estado del usuario anterior.
      clearSessionData();
      saveSession(user);
      // `state.from` (navegación interna) tiene prioridad sobre `?redirect=` (cierre por 401).
      const fallback = resolveRedirectParam(
        location.search,
        DEFAULT_DESTINATION,
      );
      navigate(resolvePostLoginPath(location.state, fallback), {
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
