import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { MapPin, Star } from "lucide-react";
import Layout from "../../components/Layout/Layout";
import Breadcrumb from "../../components/Breadcrumb/Breadcrumb";
import Header from "../../components/Header/Header";
import Card from "../../components/Card/Card";
import Button from "../../components/Button/Button";
import ToastContainer from "../../components/Toast/ToastContainer";
import PageLoader from "../../components/PageLoader/PageLoader";
import { useToast } from "../../hooks/useToast";
import { ordenFabricacionService } from "../../services/orden-fabricacion.service";
import type { FabricanteSugerido } from "../../interfaces";
import "./FabricanteSelection.css";

interface LocationState {
  compraId?: string;
}

function FabricanteSelection() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { toasts, addToast, removeToast } = useToast();
  const compraId = (location.state as LocationState | null)?.compraId;

  const [fabricantes, setFabricantes] = useState<FabricanteSugerido[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    ordenFabricacionService
      .fabricantesSugeridos(id)
      .then(setFabricantes)
      .catch(() => addToast("No se pudieron cargar los fabricantes", "error"))
      .finally(() => setLoading(false));
  }, [id, addToast]);

  function toggle(fabricanteId: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(fabricanteId)) next.delete(fabricanteId);
      else next.add(fabricanteId);
      return next;
    });
  }

  async function handleSubmit() {
    if (!compraId || selected.size === 0) return;
    setSubmitting(true);
    try {
      const res = await ordenFabricacionService.crear(
        compraId,
        Array.from(selected),
      );
      navigate("/fabricacion/mis-solicitudes", {
        state: { ordenes: res.data },
      });
    } catch {
      addToast("No se pudieron solicitar las cotizaciones", "error");
    } finally {
      setSubmitting(false);
    }
  }

  const breadcrumbItems = [
    { label: "Inicio", path: "/" },
    { label: "Explorar", path: "/explore" },
    { label: "Elegir fabricante" },
  ];

  if (!compraId) {
    return (
      <Layout>
        <Breadcrumb items={breadcrumbItems} />
        <p className="fabricante-selection__error">
          No se encontró la compra asociada. Volvé a iniciar la compra desde el
          producto.
        </p>
        <Button
          title="Volver al producto"
          variant="primary"
          onClick={() => navigate(`/product/${id}/purchase`)}
        />
      </Layout>
    );
  }

  return (
    <Layout>
      <Breadcrumb items={breadcrumbItems} />
      <Header
        title="Elegí"
        accentText="fabricantes"
        subtitle="Seleccioná uno o más fabricantes para pedir presupuesto."
      />

      {loading ? (
        <PageLoader />
      ) : fabricantes.length === 0 ? (
        <p className="fabricante-selection__empty">
          No encontramos fabricantes disponibles para este diseño.
        </p>
      ) : (
        <div className="fabricante-selection__grid">
          {fabricantes.map((f) => {
            const isSelected = selected.has(f.id);
            return (
              <Card
                key={f.id}
                variant={isSelected ? "elevated" : "default"}
                onClick={() => toggle(f.id)}
                className={`fabricante-selection__card${isSelected ? " fabricante-selection__card--selected" : ""}`}
              >
                <h3 className="fabricante-selection__card-title">
                  {f.tagline || "Fabricante"}
                </h3>
                <span className="fabricante-selection__stat">
                  <Star size={14} strokeWidth={2} /> {f.puntuacion.toFixed(1)}
                </span>
                {f.zonaId !== null && (
                  <span className="fabricante-selection__stat">
                    <MapPin size={14} strokeWidth={2} /> Zona {f.zonaId}
                  </span>
                )}
              </Card>
            );
          })}
        </div>
      )}

      <div className="fabricante-selection__actions">
        <Button
          title={`Solicitar cotización (${selected.size})`}
          variant="primary"
          disabled={selected.size === 0}
          loading={submitting}
          onClick={handleSubmit}
        />
      </div>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </Layout>
  );
}

export default FabricanteSelection;
