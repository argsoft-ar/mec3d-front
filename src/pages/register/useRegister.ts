import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { ChangeEvent, FormEvent } from "react";
import { authService, HttpError } from "../../services/api";
import { toZonaId } from "../../services/georef.service";
import { useGeoref } from "../../hooks/useGeoref";
import { useUsernameAvailability } from "../../hooks/useUsernameAvailability";
import type { RolUsuario } from "../../interfaces/user.interface";

export type RegisterForm = {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
  rolPrincipal: string;
};

const GENERIC_ERROR = "Error al registrar. Verificá los datos.";

interface RegisterFailure {
  message: string;
  field?: "username";
}

function mapRegisterError(err: unknown): RegisterFailure {
  if (!(err instanceof HttpError)) return { message: GENERIC_ERROR };

  if (err.status === 409) {
    if (/nombre de usuario/i.test(err.message)) {
      return { message: err.message, field: "username" };
    }
    if (/email/i.test(err.message)) {
      return { message: "El email ya está registrado" };
    }
    return { message: err.message };
  }
  if (err.status === 400) {
    const [first] = err.details;
    const isUsername = first?.path.endsWith("username") ?? false;
    return {
      message: first?.message ?? err.message,
      field: isUsername ? "username" : undefined,
    };
  }
  if (err.status === 429) {
    return {
      message: "Demasiados intentos. Esperá un momento y volvé a intentar.",
    };
  }
  return { message: GENERIC_ERROR };
}

export function useRegister() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<RegisterForm>({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    rolPrincipal: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [usernameServerError, setUsernameServerError] = useState("");
  const georef = useGeoref();
  const { status: usernameStatus } = useUsernameAvailability(
    formData.username,
    "",
    authService.checkUsernameDisponible,
  );

  const handleChange =
    (field: keyof RegisterForm) =>
    (
      e: ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ) => {
      if (field === "username") setUsernameServerError("");
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setUsernameServerError("");

    if (
      usernameStatus === "taken" ||
      usernameStatus === "invalid" ||
      usernameStatus === "checking"
    ) {
      setError("Elegí un nombre de usuario válido y disponible.");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    if (!georef.localidadId) {
      setError("Seleccioná tu zona (provincia, departamento y localidad).");
      return;
    }

    setLoading(true);
    try {
      await authService.register({
        email: formData.email,
        username: formData.username.trim(),
        password: formData.password,
        rolPrincipal: formData.rolPrincipal as RolUsuario,
        zonaId: toZonaId(georef.localidadId),
        georefLocalidadId: georef.localidadId,
      });
      navigate("/login");
    } catch (err) {
      const failure = mapRegisterError(err);
      if (failure.field === "username") setUsernameServerError(failure.message);
      else setError(failure.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    loading,
    error,
    usernameStatus,
    usernameServerError,
    handleChange,
    handleSubmit,
    georef,
  };
}
