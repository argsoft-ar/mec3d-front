import { Suspense, lazy } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  AlignLeft,
  ArrowLeft,
  Box,
  Clock,
  Cpu,
  Download,
  FileType,
  Gauge,
  Info,
  Layers,
  LayoutGrid,
  Ruler,
  Tag,
  Weight,
  Wrench,
} from "lucide-react";
import Layout from "../../components/Layout/Layout";
import Breadcrumb from "../../components/Breadcrumb/Breadcrumb";
import Button from "../../components/Button/Button";
import Header from "../../components/Header/Header";
import MaterialTag from "../../components/MaterialTag/MaterialTag";
import MaterialTagList from "../../components/MaterialTag/MaterialTagList";
import PageLoader from "../../components/PageLoader/PageLoader";
import SpecGrid from "../../components/SpecGrid/SpecGrid";
import ToastContainer from "../../components/Toast/ToastContainer";
import Watermark from "../../components/Watermark/Watermark";
import { useToast } from "../../hooks/useToast";
import { useDisenoOrden } from "../../hooks/useDisenoOrden";
import type { DisenoOrdenError } from "../../hooks/useDisenoOrden";
import { usePreview3D } from "../../hooks/usePreview3D";
import { estadoOrdenVisual } from "../../utils/estado.util";
import {
  esPlanoTecnico,
  formatPesoGramos,
  formatPrintHours,
} from "../../utils/product.util";
import { rutaChat } from "../../utils/redirect.util";
import type { SpecGridItem } from "../../components/SpecGrid/SpecGrid.types";
import type { DisenoOrden } from "../../interfaces";
import "./DisenoEspecificaciones.css";

const ModelViewer3D = lazy(
  () => import("../../components/ModelViewer3D/ModelViewer3D"),
);

const BREADCRUMB_ITEMS = [
  { label: "Inicio", path: "/" },
  { label: "Chat", path: "/chat" },
  { label: "Especificaciones del diseño" },
];

const ICON_PROPS = { size: 16, strokeWidth: 2 } as const;

const ERROR_MESSAGES: Record<DisenoOrdenError, string> = {
  forbidden:
    "No tenés acceso a este diseño. Solo el comprador y el fabricante de la orden pueden verlo.",
  notFound: "No encontramos la orden de fabricación o su diseño.",
  error: "No se pudo cargar el diseño. Intentá de nuevo más tarde.",
};

const AVISO_DESCARGA =
  "El archivo estará disponible para descargar una vez cerrado el trato y acreditado el pago.";

interface LocationState {
  conversacionId?: string;
}

function texto(value: string | null | undefined): string {
  return value?.trim() ?? "";
}

function buildSpecItems(diseno: DisenoOrden): SpecGridItem[] {
  const specs = diseno.especificaciones;
  return [
    {
      label: "Categoría",
      value: texto(diseno.categoria),
      icon: <Tag {...ICON_PROPS} />,
    },
    {
      label: "Tecnología",
      value: texto(diseno.tecnologia),
      icon: <Cpu {...ICON_PROPS} />,
    },
    {
      label: "Materiales",
      value:
        diseno.materiales.length > 0 ? (
          <MaterialTagList items={diseno.materiales} size="sm" />
        ) : null,
      icon: <Box {...ICON_PROPS} />,
    },
    {
      label: "Formato",
      value: texto(diseno.formato),
      icon: <FileType {...ICON_PROPS} />,
    },
    {
      label: "Peso",
      value:
        diseno.pesoGramos != null ? formatPesoGramos(diseno.pesoGramos) : "",
      icon: <Weight {...ICON_PROPS} />,
    },
    {
      label: "Dimensiones",
      value: texto(specs?.dimensiones),
      icon: <Ruler {...ICON_PROPS} />,
    },
    {
      label: "Dificultad",
      value: texto(specs?.dificultad),
      icon: <Gauge {...ICON_PROPS} />,
    },
    {
      label: "Tiempo de impresión",
      value:
        specs?.tiempoImpresion != null
          ? formatPrintHours(specs.tiempoImpresion)
          : "",
      icon: <Clock {...ICON_PROPS} />,
    },
    {
      label: "Soportes",
      value: texto(specs?.soportes),
      icon: <Wrench {...ICON_PROPS} />,
    },
    {
      label: "Layer",
      value: texto(specs?.configuracion?.layer),
      icon: <Layers {...ICON_PROPS} />,
    },
    {
      label: "Infill",
      value: texto(specs?.configuracion?.infill),
      icon: <LayoutGrid {...ICON_PROPS} />,
    },
    {
      label: "Descripción",
      value: texto(diseno.descripcion),
      icon: <AlignLeft {...ICON_PROPS} />,
    },
  ];
}

function DisenoEspecificaciones() {
  const { ordenId } = useParams<{ ordenId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { toasts, addToast, removeToast } = useToast();
  const { data, loading, error, descargando, descargar } = useDisenoOrden(
    ordenId,
    addToast,
  );
  const conversacionId = (location.state as LocationState | null)
    ?.conversacionId;

  const diseno = data?.diseno;
  const conPreview3D =
    !!diseno?.previewUrl && !esPlanoTecnico(diseno.categoria);
  const preview = usePreview3D(conPreview3D ? diseno?.id : undefined, {
    soloPublico: true,
  });

  const handleVolver = () => {
    if (conversacionId)
      navigate(rutaChat(conversacionId), {
        state: { ordenFabricacionId: ordenId },
      });
    else navigate(-1);
  };

  const volverButton = (
    <Button
      title={conversacionId ? "Volver al chat" : "Volver"}
      variant="ghost"
      icon={<ArrowLeft {...ICON_PROPS} />}
      onClick={handleVolver}
    />
  );

  if (loading)
    return (
      <Layout>
        <PageLoader label="Cargando diseño..." />
      </Layout>
    );

  if (!data || !diseno)
    return (
      <Layout>
        <Breadcrumb items={BREADCRUMB_ITEMS} />
        <div className="diseno-especificaciones__message" role="alert">
          <p>{ERROR_MESSAGES[error ?? "notFound"]}</p>
          {volverButton}
        </div>
        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </Layout>
    );

  const estado = estadoOrdenVisual(data.estado);

  return (
    <Layout>
      <Breadcrumb items={BREADCRUMB_ITEMS} />
      <div className="diseno-especificaciones">
        <Header
          eyebrow="Especificaciones del diseño"
          title={diseno.titulo}
          meta={
            <>
              <MaterialTag
                label={estado.label}
                variant={estado.variant}
                size="sm"
              />
              <span className="diseno-especificaciones__material">
                Material solicitado:{" "}
                <strong>{texto(data.material) || "Sin especificar"}</strong>
              </span>
            </>
          }
          actions={volverButton}
          actionsPlacement="end"
        />

        <section
          className={`diseno-especificaciones__media${conPreview3D ? " diseno-especificaciones__media--with-3d" : ""}`}
        >
          <div className="diseno-especificaciones__image-wrapper">
            {diseno.imagenUrl ? (
              <img
                className="diseno-especificaciones__image"
                src={diseno.imagenUrl}
                alt={diseno.titulo}
              />
            ) : (
              <p className="diseno-especificaciones__placeholder">
                Sin imagen disponible
              </p>
            )}
          </div>
          {conPreview3D && (
            <div className="diseno-especificaciones__viewer">
              {preview.status === "ready" && preview.url ? (
                <>
                  <Suspense
                    fallback={<PageLoader label="Cargando visor 3D..." />}
                  >
                    <ModelViewer3D
                      url={preview.url}
                      format={preview.format ?? diseno.formato ?? ""}
                      className="diseno-especificaciones__canvas"
                      onPreviewError={preview.renovarSiExpiro}
                    />
                  </Suspense>
                  {preview.degradado && (
                    <Watermark text="MEC3D · VISTA PREVIA" />
                  )}
                </>
              ) : preview.status === "loading" || preview.status === "idle" ? (
                <PageLoader label="Cargando visor 3D..." />
              ) : (
                <p className="diseno-especificaciones__placeholder">
                  La vista previa 3D no está disponible.
                </p>
              )}
            </div>
          )}
        </section>

        <section className="diseno-especificaciones__section">
          <h2 className="diseno-especificaciones__section-title">
            Características
          </h2>
          <SpecGrid items={buildSpecItems(diseno)} />
        </section>

        <section className="diseno-especificaciones__download">
          {data.puedeDescargar ? (
            <Button
              title="Descargar archivo"
              variant="primary"
              size="lg"
              icon={<Download {...ICON_PROPS} />}
              loading={descargando}
              onClick={() => void descargar()}
            />
          ) : (
            <p className="diseno-especificaciones__note" role="status">
              <Info {...ICON_PROPS} aria-hidden="true" />
              <span>{AVISO_DESCARGA}</span>
            </p>
          )}
        </section>
      </div>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </Layout>
  );
}

export default DisenoEspecificaciones;
