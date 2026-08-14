import { useState, useEffect, useRef } from "react";
import type React from "react";
import Layout from "../../components/Layout/Layout";
import Card from "../../components/Card/Card";
import Button from "../../components/Button/Button";
import Form from "../../components/Form/Form";
import FormField from "../../components/Form/FormField";
import DesignerHeroCard from "../../components/DesignerHeroCard/DesignerHeroCard";
import ToastContainer from "../../components/Toast/ToastContainer";
import { useToast } from "../../hooks/useToast";
import { useGeoref } from "../../hooks/useGeoref";
import { usuarioService } from "../../services/usuario.service";
import { toZonaId } from "../../services/georef.service";
import type { PerfilCompleto } from "../../interfaces";
import type { SelectOption } from "../../types";
import PageLoader from "../../components/PageLoader/PageLoader";
import "./Account.css";

function deriveDisplayName(email: string): string {
  const local = email.split("@")[0];
  return local.charAt(0).toUpperCase() + local.slice(1);
}
function deriveInitials(email: string): string {
  return email.charAt(0).toUpperCase();
}

interface ProfileFieldConfig {
  label: string;
  name: keyof typeof EMPTY_PROFILE_FORM;
  type: "text" | "textarea";
  placeholder: string;
  fullWidth?: boolean;
}

const EMPTY_PROFILE_FORM = {
  tagline: "",
  descripcion: "",
  experiencia: "",
  cuentaMercadopago: "",
};

const PROFILE_TEXT_FIELDS: ProfileFieldConfig[] = [
  {
    label: "Descripción",
    name: "descripcion",
    type: "textarea",
    placeholder: "Contá quién sos y qué hacés",
    fullWidth: true,
  },
  {
    label: "Experiencia",
    name: "experiencia",
    type: "textarea",
    placeholder: "Tu experiencia en impresión 3D",
    fullWidth: true,
  },
];

interface ZonaFieldConfig {
  label: string;
  name: string;
  value: string;
  options: SelectOption[];
  onChangeFn: (id: string) => void;
  disabled: boolean;
}

function Account() {
  const { toasts, addToast, removeToast } = useToast();
  const {
    provincias,
    departamentos,
    localidades,
    provinciaId,
    departamentoId,
    localidadId,
    selectProvincia,
    selectDepartamento,
    selectLocalidad,
  } = useGeoref();

  const [profile, setProfile] = useState<PerfilCompleto | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState(EMPTY_PROFILE_FORM);
  const georefInitializedRef = useRef(false);

  useEffect(() => {
    usuarioService
      .getMyProfile()
      .then((p) => {
        georefInitializedRef.current = false;
        setProfile(p);
        setProfileForm({
          tagline: p.tagline ?? "",
          descripcion: p.descripcion ?? "",
          experiencia: p.experiencia ?? "",
          cuentaMercadopago: p.cuentaMercadopago ?? "",
        });
      })
      .catch(() => addToast("No se pudo cargar el perfil", "error"))
      .finally(() => setLoadingProfile(false));
  }, [addToast]);

  function handleProfileChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) {
    const { name, value } = e.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSaveProfile() {
    setSavingProfile(true);
    try {
      const zonaId = localidadId ? toZonaId(localidadId) : undefined;
      const updated = await usuarioService.updateProfile({
        ...profileForm,
        zonaId,
        georefLocalidadId: localidadId || undefined,
      });
      setProfile(updated);
      addToast("Perfil actualizado", "success");
    } catch {
      addToast("Error al guardar el perfil", "error");
    } finally {
      setSavingProfile(false);
    }
  }

  useEffect(() => {
    if (georefInitializedRef.current) return;
    const locId = profile?.georefLocalidadId;
    if (!locId) return;
    if (provincias.options.length === 0) return;

    const provId = locId.slice(0, 2);
    const deptId = locId.slice(0, 5);

    if (provinciaId !== provId) {
      selectProvincia(provId);
      return;
    }
    if (departamentos.options.length === 0) return;
    if (departamentoId !== deptId) {
      selectDepartamento(deptId);
      return;
    }
    if (localidades.options.length === 0) return;

    selectLocalidad(locId);
    georefInitializedRef.current = true;
  }, [
    profile,
    provincias.options,
    departamentos.options,
    localidades.options,
    provinciaId,
    departamentoId,
    selectProvincia,
    selectDepartamento,
    selectLocalidad,
  ]);

  const zonaFields: ZonaFieldConfig[] = [
    {
      label: "Provincia",
      name: "provinciaId",
      value: provinciaId,
      options: provincias.options,
      onChangeFn: selectProvincia,
      disabled: savingProfile,
    },
    {
      label: "Partido / Departamento",
      name: "departamentoId",
      value: departamentoId,
      options: departamentos.options,
      onChangeFn: selectDepartamento,
      disabled: savingProfile || !provinciaId,
    },
    {
      label: "Localidad",
      name: "localidadId",
      value: localidadId,
      options: localidades.options,
      onChangeFn: selectLocalidad,
      disabled: savingProfile || !departamentoId,
    },
  ];

  const displayName = profile ? deriveDisplayName(profile.email) : "Usuario";
  const initials = profile ? deriveInitials(profile.email) : "U";

  if (loadingProfile)
    return (
      <Layout>
        <PageLoader />
      </Layout>
    );

  return (
    <Layout>
      <div className="account">
        <Card disableHover className="account__section">
          <DesignerHeroCard
            initials={initials}
            name={displayName}
            tagline={profile?.tagline ?? profile?.email ?? ""}
            role={profile?.rolPrincipal}
            score={profile?.puntuacion}
          />
          <div className="account__profile-form">
            <Form columns={2}>
              {PROFILE_TEXT_FIELDS.map((f) => (
                <FormField
                  key={f.name}
                  label={f.label}
                  name={f.name}
                  type={f.type}
                  value={profileForm[f.name]}
                  onChange={handleProfileChange}
                  placeholder={f.placeholder}
                  fullWidth={f.fullWidth}
                  disabled={savingProfile}
                />
              ))}
              {zonaFields.map((f) => (
                <FormField
                  key={f.name}
                  label={f.label}
                  name={f.name}
                  type="select"
                  value={f.value}
                  onChange={(e) => f.onChangeFn(e.target.value)}
                  options={f.options}
                  disabled={f.disabled}
                />
              ))}
            </Form>
            <div className="account__actions">
              <Button
                title="Guardar cambios"
                variant="primary"
                type="button"
                loading={savingProfile}
                onClick={handleSaveProfile}
              />
            </div>
          </div>
        </Card>
      </div>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </Layout>
  );
}

export default Account;
