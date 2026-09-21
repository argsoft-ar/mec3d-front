import { useState, useEffect, useRef } from "react";
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
import { georefService } from "../../services/georef.service";
import { getProvinciaPrefix, getPartidoPrefix } from "../../utils/zona.util";
import type { FabricanteSugerido } from "../../interfaces";
import "./FabricanteSelection.css";

interface LocationState {
  compraId?: string;
}

async function resolveZonaLabel(zonaId: number): Promise<string> {
  const fallback = `Zona ${zonaId}`;
  try {
    const provinciaPrefix = getProvinciaPrefix(zonaId);
    if (!provinciaPrefix) return fallback;

    const provinciasRes = await georefService.getProvincias();
    const provincia = provinciasRes.data?.find((p) => p.id === provinciaPrefix);
    if (!provincia) return fallback;

    const partidoPrefix = getPartidoPrefix(zonaId);
    if (!partidoPrefix) return provincia.nombre;

    const departamentosRes =
      await georefService.getDepartamentos(provinciaPrefix);
    const departamento = departamentosRes.data?.find(
      (d) => d.id === partidoPrefix,
    );
    if (!departamento) return provincia.nombre;

    return `${departamento.nombre}, ${provincia.nombre}`;
  } catch {
    return fallback;
  }
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
  const [zonaLabels, setZonaLabels] = useState<Map<number, string>>(new Map());
  const resolvedZonasRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    if (!id) return;
    ordenFabricacionService
      .fabricantesSugeridos(id)
      .then(setFabricantes)
      .catch(() => addToast("No se pudieron cargar los fabricantes", "error"))
      .finally(() => setLoading(false));
  }, [id, addToast]);

  useEffect(() => {
    const uniqueZonaIds = Array.from(
      new Set(
        fabricantes
          .map((f) => f.zonaId)
          .filter((zonaId): zonaId is number => zonaId !== null),
      ),
    ).filter((zonaId) => !resolvedZonasRef.current.has(zonaId));

    uniqueZonaIds.forEach((zonaId) => {
      resolvedZonasRef.current.add(zonaId);
      resolveZonaLabel(zonaId).then((label) => {
        setZonaLabels((prev) => new Map(prev).set(zonaId, label));
      });
    });
  }, [fabricantes]);

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
      const ordenes = res.data ?? [];
      const primera = ordenes[0];
      if (primera) {
        navigate(`/chat/${primera.conversacionId}`, {
          state: { ordenFabricacionId: primera.id },
        });
      } else {
        navigate("/fabricacion/mis-solicitudes", {
          state: { ordenes },
        });
      }
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
            const title = f.username || f.tagline || "Fabricante";
            const showTagline =
              !!f.username && !!f.tagline && f.tagline !== f.username;
            const zonaLabel =
              f.zonaId !== null
                ? (zonaLabels.get(f.zonaId) ?? `Zona ${f.zonaId}`)
                : null;
            return (
              <Card
                key={f.id}
                variant="contact"
                title={title}
                text={showTagline ? f.tagline! : undefined}
                onClick={() => toggle(f.id)}
                className={`fabricante-selection__card${isSelected ? " fabricante-selection__card--selected" : ""}`}
                footer={
                  <>
                    <span className="fabricante-selection__stat">
                      <Star size={14} strokeWidth={2} />{" "}
                      {f.puntuacion.toFixed(1)}
                    </span>
                    {zonaLabel !== null && (
                      <span className="fabricante-selection__stat">
                        <MapPin size={14} strokeWidth={2} /> {zonaLabel}
                      </span>
                    )}
                  </>
                }
              />
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
