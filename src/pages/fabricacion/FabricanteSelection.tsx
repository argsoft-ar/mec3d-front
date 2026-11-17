import { useState, useEffect, useRef } from "react";
import {
  useParams,
  useNavigate,
  useLocation,
  Navigate,
} from "react-router-dom";
import { MapPin, Star } from "lucide-react";
import Layout from "../../components/Layout/Layout";
import Breadcrumb from "../../components/Breadcrumb/Breadcrumb";
import Header from "../../components/Header/Header";
import Card from "../../components/Card/Card";
import Button from "../../components/Button/Button";
import MaterialTag from "../../components/MaterialTag/MaterialTag";
import ToastContainer from "../../components/Toast/ToastContainer";
import PageLoader from "../../components/PageLoader/PageLoader";
import ZonaFilter from "../../components/ZonaFilter/ZonaFilter";
import type { ZonaFilterValue } from "../../components/ZonaFilter/ZonaFilter.types";
import { useToast } from "../../hooks/useToast";
import { ordenFabricacionService } from "../../services/orden-fabricacion.service";
import { productService } from "../../services/product.service";
import { georefService } from "../../services/georef.service";
import { getProvinciaPrefix, getPartidoPrefix } from "../../utils/zona.util";
import { esPlanoTecnico } from "../../utils/product.util";
import type { FabricanteSugerido } from "../../interfaces";
import "./FabricanteSelection.css";

interface LocationState {
  compraId?: string;
  material?: string | null;
}

const EMPTY_ZONA_FILTER: ZonaFilterValue = {
  provincias: [],
  departamentos: [],
  localidades: [],
};
const ZONA_FILTER_DEBOUNCE_MS = 300;

function hasZonaFilter(filter: ZonaFilterValue): boolean {
  return (
    filter.provincias.length > 0 ||
    filter.departamentos.length > 0 ||
    filter.localidades.length > 0
  );
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
  const material =
    (location.state as LocationState | null)?.material ?? undefined;

  const [fabricantes, setFabricantes] = useState<FabricanteSugerido[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = useState(false);
  const [zonaLabels, setZonaLabels] = useState<Map<number, string>>(new Map());
  const resolvedZonasRef = useRef<Set<number>>(new Set());
  const [esPlano, setEsPlano] = useState(false);
  const [zonaFilter, setZonaFilter] =
    useState<ZonaFilterValue>(EMPTY_ZONA_FILTER);
  const [appliedZonaFilter, setAppliedZonaFilter] =
    useState<ZonaFilterValue>(EMPTY_ZONA_FILTER);

  // Los planos no se fabrican: si el diseño lo es, se vuelve al detalle.
  useEffect(() => {
    if (!id) return;
    productService
      .getById(id)
      .then((product) => setEsPlano(esPlanoTecnico(product.categoria)))
      .catch(() => setEsPlano(false));
  }, [id]);

  useEffect(() => {
    if (zonaFilter === appliedZonaFilter) return;
    const timeout = setTimeout(() => {
      setLoading(true);
      setAppliedZonaFilter(zonaFilter);
    }, ZONA_FILTER_DEBOUNCE_MS);
    return () => clearTimeout(timeout);
  }, [zonaFilter, appliedZonaFilter]);

  useEffect(() => {
    if (!id || !compraId) return;
    // Abortar descarta respuestas de filtros ya reemplazados.
    const controller = new AbortController();
    ordenFabricacionService
      .fabricantesSugeridos(
        { disenoId: id, compraId, material, ...appliedZonaFilter },
        controller.signal,
      )
      .then((data) => {
        if (!controller.signal.aborted) setFabricantes(data);
      })
      .catch(() => {
        if (!controller.signal.aborted)
          addToast("No se pudieron cargar los fabricantes", "error");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [id, compraId, material, appliedZonaFilter, addToast]);

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
      void resolveZonaLabel(zonaId).then((label) => {
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

  // Las selecciones se conservan aunque el filtro de zona las oculte.
  const visibleIds = new Set(fabricantes.map((f) => f.id));
  const selectedOutOfList = loading
    ? 0
    : Array.from(selected).filter((s) => !visibleIds.has(s)).length;

  if (esPlano) return <Navigate to={`/product/${id}`} replace />;

  const renderFabricantes = () => {
    if (loading) return <PageLoader />;
    if (fabricantes.length === 0) {
      const emptyMessage = hasZonaFilter(appliedZonaFilter)
        ? "Ningún fabricante coincide con las zonas elegidas. Probá ampliar o limpiar los filtros."
        : "No encontramos fabricantes disponibles para este diseño.";
      return <p className="fabricante-selection__empty">{emptyMessage}</p>;
    }
    return (
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
    );
  };

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

      {material && (
        <div className="fabricante-selection__material">
          <span>Material elegido:</span>
          <MaterialTag label={material} />
        </div>
      )}

      <ZonaFilter
        value={zonaFilter}
        onChange={setZonaFilter}
        disabled={submitting}
        className="fabricante-selection__zona-filter"
      />

      {selected.size > 0 && (
        <p className="fabricante-selection__counter" aria-live="polite">
          {selected.size === 1
            ? "1 fabricante seleccionado"
            : `${selected.size} fabricantes seleccionados`}
          {selectedOutOfList > 0 &&
            ` (${selectedOutOfList} fuera de los filtros actuales)`}
        </p>
      )}

      {renderFabricantes()}

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
