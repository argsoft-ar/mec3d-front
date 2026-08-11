import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { ChangeEvent, FormEvent } from "react";
import { authService } from "../../services/api";
import { toZonaId } from "../../services/georef.service";
import { useGeoref } from "../../hooks/useGeoref";
import type { RolUsuario } from "../../interfaces/user.interface";

export type RegisterForm = {
  email: string;
  password: string;
  confirmPassword: string;
  rolPrincipal: string;
};

export function useRegister() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<RegisterForm>({
    email: "",
    password: "",
    confirmPassword: "",
    rolPrincipal: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const georef = useGeoref();

  const handleChange =
    (field: keyof RegisterForm) =>
    (
      e: ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ) =>
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

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
        password: formData.password,
        rolPrincipal: formData.rolPrincipal as RolUsuario,
        zonaId: toZonaId(georef.localidadId),
        georefLocalidadId: georef.localidadId,
      });
      navigate("/login");
    } catch {
      setError("Error al registrar. Verificá los datos.");
    } finally {
      setLoading(false);
    }
  };

  return { formData, loading, error, handleChange, handleSubmit, georef };
}
