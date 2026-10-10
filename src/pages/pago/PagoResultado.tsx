import type React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Ban,
  CheckCircle,
  Clock,
  Loader,
  RotateCcw,
  XCircle,
} from "lucide-react";
import Layout from "../../components/Layout/Layout";
import Header from "../../components/Header/Header";
import Breadcrumb from "../../components/Breadcrumb/Breadcrumb";
import Card from "../../components/Card/Card";
import Button from "../../components/Button/Button";
import MaterialTag from "../../components/MaterialTag/MaterialTag";
import ToastContainer from "../../components/Toast/ToastContainer";
import PageLoader from "../../components/PageLoader/PageLoader";
import { usePagoEstado } from "../../hooks/usePagoEstado";
import { useCheckout } from "../../hooks/useCheckout";
import { useToast } from "../../hooks/useToast";
import { estadoCompraVisual, estadoPagoVisual } from "../../utils/estado.util";
import { formatCentavos } from "../../utils/format.util";
import {
  HINT_RETORNO,
  TEXTO_VISTA_PAGO,
  parseCompraId,
  resolverVistaPago,
} from "../../utils/pago.util";
import type { PagoResultadoProps, VistaPago } from "../../interfaces";
import type { TagVariant } from "../../types";
import "./PagoResultado.css";

const MIS_COMPRAS_PATH = "/account/purchases";
const MIS_SOLICITUDES_PATH = "/fabricacion/mis-solicitudes";

const BREADCRUMB_ITEMS = [
  { label: "Inicio", path: "/" },
  { label: "Mis Compras", path: MIS_COMPRAS_PATH },
  { label: "Resultado del pago" },
];

const VISTA_VISUAL: Record<
  VistaPago,
  { icon: React.ReactNode; variant: TagVariant }
> = {
  verificando: {
    icon: <Loader size={20} strokeWidth={1.5} />,
    variant: "info",
  },
  acreditado: {
    icon: <CheckCircle size={20} strokeWidth={1.5} />,
    variant: "success",
  },
  pendiente: {
    icon: <Clock size={20} strokeWidth={1.5} />,
    variant: "warning",
  },
  rechazado: {
    icon: <XCircle size={20} strokeWidth={1.5} />,
    variant: "danger",
  },
  reembolsado: {
    icon: <RotateCcw size={20} strokeWidth={1.5} />,
    variant: "info",
  },
  cancelado: { icon: <Ban size={20} strokeWidth={1.5} />, variant: "danger" },
  error: { icon: <XCircle size={20} strokeWidth={1.5} />, variant: "danger" },
};

function PagoResultado({ variant }: Readonly<PagoResultadoProps>) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const compraId = parseCompraId(searchParams.get("compraId"));
  const { toasts, addToast, removeToast } = useToast();
  const { data, fase, errorMessage, reintentar } = usePagoEstado(compraId);
  const { paying, pagar } = useCheckout(addToast);

  const vista: VistaPago = compraId ? resolverVistaPago(data, fase) : "error";
  const texto = TEXTO_VISTA_PAGO[vista];
  const visual = VISTA_VISUAL[vista];

  const mostrarSolicitudes = data === null || data.tipo === "fabricacion";
  const puedeVerificarDeNuevo =
    compraId !== null && (vista === "pendiente" || vista === "error");
  const puedeReintentarPago = compraId !== null && vista === "rechazado";

  function renderBody() {
    if (!compraId) {
      return (
        <p className="pago-resultado__message">
          El enlace no incluye una compra válida. Revisá el estado de tus pagos
          desde Mis compras.
        </p>
      );
    }
    return (
      <>
        {vista === "verificando" && <PageLoader label="Verificando pago..." />}
        <p className="pago-resultado__message">{texto.message}</p>
        {vista === "error" && errorMessage && (
          <p className="pago-resultado__hint">{errorMessage}</p>
        )}
        {vista === "verificando" && (
          <p className="pago-resultado__hint">{HINT_RETORNO[variant]}</p>
        )}
        {data && (
          <dl className="pago-resultado__details">
            <dt>Compra</dt>
            <dd>
              <MaterialTag
                label={estadoCompraVisual(data.estadoCompra).label}
                variant={estadoCompraVisual(data.estadoCompra).variant}
                size="sm"
              />
            </dd>
            {data.pago && (
              <>
                <dt>Último intento</dt>
                <dd>
                  <MaterialTag
                    label={estadoPagoVisual(data.pago.estado).label}
                    variant={estadoPagoVisual(data.pago.estado).variant}
                    size="sm"
                  />
                </dd>
              </>
            )}
            {data.montoCentavos !== null && data.moneda === "ARS" && (
              <>
                <dt>Monto</dt>
                <dd>{formatCentavos(data.montoCentavos)}</dd>
              </>
            )}
          </dl>
        )}
      </>
    );
  }

  return (
    <Layout>
      <Breadcrumb items={BREADCRUMB_ITEMS} />
      <Header
        title="Resultado"
        accentText="del pago"
        subtitle="Confirmamos el estado directamente con nuestro sistema."
      />

      <div className="pago-resultado">
        <Card
          icon={visual.icon}
          title={compraId ? texto.title : "Enlace inválido"}
          variant="bordered"
          disableHover
          className={`pago-resultado__card pago-resultado__card--${visual.variant}`}
          footer={
            <div className="pago-resultado__actions">
              {puedeReintentarPago && compraId && (
                <Button
                  title="Reintentar pago"
                  variant="primary"
                  loading={paying}
                  onClick={() => void pagar(compraId)}
                />
              )}
              {puedeVerificarDeNuevo && (
                <Button
                  title="Verificar de nuevo"
                  variant="secondary"
                  onClick={reintentar}
                />
              )}
              <Button
                title="Mis compras"
                variant="outline"
                onClick={() => navigate(MIS_COMPRAS_PATH)}
              />
              {mostrarSolicitudes && (
                <Button
                  title="Mis solicitudes de fabricación"
                  variant="outline"
                  onClick={() => navigate(MIS_SOLICITUDES_PATH)}
                />
              )}
            </div>
          }
        >
          {renderBody()}
        </Card>
      </div>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </Layout>
  );
}

export default PagoResultado;
