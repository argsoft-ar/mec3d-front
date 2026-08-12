import { useState, useEffect } from "react";
import { Plus, X, Hammer } from "lucide-react";
import Card from "../Card/Card";
import Form from "../Form/Form";
import FormField from "../Form/FormField";
import Button from "../Button/Button";
import ConfirmDialog from "../ConfirmDialog/ConfirmDialog";
import {
  usuarioService,
  catalogoService,
} from "../../services/usuario.service";
import type {
  PerfilCompleto,
  RolUsuario,
  CatalogoItem,
} from "../../interfaces";
import "./FabricanteSection.css";

interface FabricanteSectionProps {
  profile: PerfilCompleto;
  onRolChange: (newRol: RolUsuario) => void;
  addToast: (
    message: string,
    type: "success" | "error" | "info" | "warning",
  ) => void;
}

function FabricanteSection({
  profile,
  onRolChange,
  addToast,
}: Readonly<FabricanteSectionProps>) {
  const [catalogoMateriales, setCatalogoMateriales] = useState<CatalogoItem[]>(
    [],
  );
  const [catalogoTecnologias, setCatalogoTecnologias] = useState<
    CatalogoItem[]
  >([]);
  const [materiales, setMateriales] = useState<string[]>(() =>
    (profile.materiales ?? []).map((m) => m.material),
  );
  const [tecnologias, setTecnologias] = useState<string[]>(() =>
    (profile.tecnologias ?? []).map((t) => t.tecnologia),
  );
  const [selectedMaterial, setSelectedMaterial] = useState("");
  const [selectedTecnologia, setSelectedTecnologia] = useState("");
  const [savingMateriales, setSavingMateriales] = useState(false);
  const [savingTecnologias, setSavingTecnologias] = useState(false);
  const [confirmFabricante, setConfirmFabricante] = useState(false);
  const [becomingFabricante, setBecomingFabricante] = useState(false);

  useEffect(() => {
    catalogoService
      .getMateriales()
      .then(setCatalogoMateriales)
      .catch(() => {});
    catalogoService
      .getTecnologias()
      .then(setCatalogoTecnologias)
      .catch(() => {});
  }, []);

  const handleBecomeFabricante = () => {
    setBecomingFabricante(true);
    usuarioService
      .changeRol("fabricante")
      .then(() => {
        addToast("¡Ahora sos fabricante!", "success");
        setConfirmFabricante(false);
        onRolChange("fabricante");
      })
      .catch(() => addToast("Error al registrarse como fabricante", "error"))
      .finally(() => setBecomingFabricante(false));
  };

  const handleAddMaterial = () => {
    if (!selectedMaterial) return;
    const updated = [...materiales, selectedMaterial];
    setSavingMateriales(true);
    usuarioService
      .setMateriales(updated)
      .then(() => {
        setMateriales(updated);
        setSelectedMaterial("");
        addToast("Material agregado", "success");
      })
      .catch(() => addToast("Error al guardar material", "error"))
      .finally(() => setSavingMateriales(false));
  };

  const handleRemoveMaterial = (nombre: string) => {
    const updated = materiales.filter((m) => m !== nombre);
    setSavingMateriales(true);
    usuarioService
      .setMateriales(updated)
      .then(() => setMateriales(updated))
      .catch(() => addToast("Error al eliminar material", "error"))
      .finally(() => setSavingMateriales(false));
  };

  const handleAddTecnologia = () => {
    if (!selectedTecnologia) return;
    const updated = [...tecnologias, selectedTecnologia];
    setSavingTecnologias(true);
    usuarioService
      .setTecnologias(updated)
      .then(() => {
        setTecnologias(updated);
        setSelectedTecnologia("");
        addToast("Tecnología agregada", "success");
      })
      .catch(() => addToast("Error al guardar tecnología", "error"))
      .finally(() => setSavingTecnologias(false));
  };

  const handleRemoveTecnologia = (nombre: string) => {
    const updated = tecnologias.filter((t) => t !== nombre);
    setSavingTecnologias(true);
    usuarioService
      .setTecnologias(updated)
      .then(() => setTecnologias(updated))
      .catch(() => addToast("Error al eliminar tecnología", "error"))
      .finally(() => setSavingTecnologias(false));
  };

  const isFabricante = profile.rolPrincipal === "fabricante";

  const materialOptions = catalogoMateriales
    .filter((m) => !materiales.includes(m.nombre))
    .map((m) => ({ value: m.nombre, label: m.nombre }));

  const tecnologiaOptions = catalogoTecnologias
    .filter((t) => !tecnologias.includes(t.nombre))
    .map((t) => ({ value: t.nombre, label: t.nombre }));

  if (!isFabricante) {
    return (
      <>
        <Card disableHover>
          <div className="fabricante-section__locked">
            <Hammer
              size={36}
              strokeWidth={1.5}
              className="fabricante-section__locked-icon"
            />
            <p className="fabricante-section__locked-text">
              Registrate como fabricante para ofrecer tus servicios de
              producción
            </p>
            <Button
              title="+ Soy fabricante"
              variant="primary"
              size="md"
              onClick={() => setConfirmFabricante(true)}
            />
          </div>
        </Card>
        <ConfirmDialog
          open={confirmFabricante}
          title="Registrarse como fabricante"
          message="¿Querés registrarte como fabricante? Podrás configurar tus materiales y tecnologías para ofrecer servicios de producción."
          confirmLabel="Sí, soy fabricante"
          variant="info"
          loading={becomingFabricante}
          onConfirm={handleBecomeFabricante}
          onCancel={() => setConfirmFabricante(false)}
        />
      </>
    );
  }

  return (
    <div className="fabricante-section">
      <Card
        disableHover
        title="Tecnologías"
        icon={<Hammer size={18} strokeWidth={1.5} />}
      >
        <div className="fabricante-section__tags">
          {tecnologias.map((t) => (
            <span key={t} className="fabricante-section__tag">
              {t}
              <button
                type="button"
                className="fabricante-section__tag-remove"
                onClick={() => handleRemoveTecnologia(t)}
                disabled={savingTecnologias}
                aria-label={`Eliminar ${t}`}
              >
                <X size={12} />
              </button>
            </span>
          ))}
          {tecnologias.length === 0 && (
            <p className="fabricante-section__empty">
              Sin tecnologías agregadas
            </p>
          )}
        </div>
        <Form>
          <div className="fabricante-section__add-row">
            <FormField
              label="Agregar tecnología"
              name="tecnologia"
              type="select"
              value={selectedTecnologia}
              onChange={(e) => setSelectedTecnologia(e.target.value)}
              options={tecnologiaOptions}
              placeholder="Seleccioná una tecnología"
              disabled={savingTecnologias || tecnologiaOptions.length === 0}
            />
            <Button
              title="Agregar tecnología"
              variant="primary"
              size="sm"
              icon={<Plus size={14} strokeWidth={2} />}
              loading={savingTecnologias}
              disabled={!selectedTecnologia}
              onClick={handleAddTecnologia}
            />
          </div>
        </Form>
      </Card>

      <Card disableHover title="Materiales">
        <div className="fabricante-section__tags">
          {materiales.map((m) => (
            <span key={m} className="fabricante-section__tag">
              {m}
              <button
                type="button"
                className="fabricante-section__tag-remove"
                onClick={() => handleRemoveMaterial(m)}
                disabled={savingMateriales}
                aria-label={`Eliminar ${m}`}
              >
                <X size={12} />
              </button>
            </span>
          ))}
          {materiales.length === 0 && (
            <p className="fabricante-section__empty">
              Sin materiales agregados
            </p>
          )}
        </div>
        <Form>
          <div className="fabricante-section__add-row">
            <FormField
              label="Agregar material"
              name="material"
              type="select"
              value={selectedMaterial}
              onChange={(e) => setSelectedMaterial(e.target.value)}
              options={materialOptions}
              placeholder="Seleccioná un material"
              disabled={savingMateriales || materialOptions.length === 0}
            />
            <Button
              title="Agregar material"
              variant="primary"
              size="sm"
              icon={<Plus size={14} strokeWidth={2} />}
              loading={savingMateriales}
              disabled={!selectedMaterial}
              onClick={handleAddMaterial}
            />
          </div>
        </Form>
      </Card>
    </div>
  );
}

export default FabricanteSection;
