import type React from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, CheckCircle, Clock, Lock } from "lucide-react";
import Layout from "../../components/Layout/Layout";
import Header from "../../components/Header/Header";
import Breadcrumb from "../../components/Breadcrumb/Breadcrumb";
import StatGroup from "../../components/StatGroup/StatGroup";
import DataTable from "../../components/DataTable/DataTable";
import type { ColumnDef } from "../../components/DataTable/DataTable.types";
import FormField from "../../components/Form/FormField";
import MaterialTag from "../../components/MaterialTag/MaterialTag";
import PageLoader from "../../components/PageLoader/PageLoader";
import Button from "../../components/Button/Button";
import { useBilletera } from "../../hooks/useBilletera";
import {
  enRetencionHasta,
  estadoMovimientoVisual,
  tipoMovimientoLabel,
} from "../../utils/estado.util";
import { formatCentavos, formatDateTime } from "../../utils/format.util";
import type {
  EstadoMovimiento,
  EstadoMovimientoFiltro,
  MovimientoBilletera,
  TipoMovimiento,
} from "../../interfaces";
import type { SelectOption } from "../../types";
import "./Billetera.css";

const BREADCRUMB_ITEMS = [
  { label: "Inicio", path: "/" },
  { label: "Mi Cuenta", path: "/account" },
  { label: "Billetera" },
];

const ESTADOS_FILTRO: EstadoMovimientoFiltro[] = [
  "retenido",
  "pendiente_payout",
  "pagado",
];

const FILTRO_OPTIONS: SelectOption[] = ESTADOS_FILTRO.map((estado) => ({
  value: estado,
  label: estadoMovimientoVisual(estado).label,
}));

const COLUMNS: ColumnDef<MovimientoBilletera>[] = [
  {
    key: "tipo",
    header: "Tipo",
    renderCell: (value) => tipoMovimientoLabel(value as TipoMovimiento),
  },
  {
    key: "estado",
    header: "Estado",
    width: 170,
    renderCell: (value) => {
      const visual = estadoMovimientoVisual(value as EstadoMovimiento);
      return (
        <MaterialTag label={visual.label} variant={visual.variant} size="sm" />
      );
    },
  },
  {
    key: "montoCentavos",
    header: "Monto",
    width: 150,
    align: "right",
    renderCell: (value) => formatCentavos(Number(value)),
  },
  {
    key: "creadoEn",
    header: "Fecha",
    width: 160,
    renderCell: (value) => formatDateTime(String(value)),
  },
  {
    key: "liberableDesde",
    header: "Disponible desde",
    width: 240,
    renderCell: (value) => {
      if (typeof value !== "string") return "—";
      if (enRetencionHasta(value)) {
        return (
          <span className="billetera__retention">
            En retención hasta {formatDateTime(value)}
          </span>
        );
      }
      return formatDateTime(value);
    },
  },
];

function Billetera() {
  const {
    data,
    error,
    loading,
    page,
    limit,
    estado,
    setPage,
    setLimit,
    setEstado,
    reload,
  } = useBilletera();

  const resumen = data?.resumen;

  function handleEstadoChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) {
    setEstado(ESTADOS_FILTRO.find((s) => s === e.target.value) ?? "");
  }

  function renderContent() {
    if (!data) {
      if (error) {
        return (
          <div className="billetera__error" role="alert">
            <p>{error}</p>
            <Button title="Reintentar" variant="outline" onClick={reload} />
          </div>
        );
      }
      return <PageLoader label="Cargando billetera..." />;
    }

    return (
      <>
        {resumen && (
          <StatGroup
            items={[
              {
                key: "retenido",
                label: "Retenido",
                value: formatCentavos(resumen.retenidoCentavos),
                caption: "A la espera de la entrega",
                icon: <Lock size={20} strokeWidth={1.5} />,
              },
              {
                key: "pendiente",
                label: "Pendiente de cobro",
                value: formatCentavos(resumen.pendientePayoutCentavos),
                caption: "Liberado, se transferirá a tu cuenta",
                icon: <Clock size={20} strokeWidth={1.5} />,
              },
              {
                key: "pagado",
                label: "Pagado",
                value: formatCentavos(resumen.pagadoCentavos),
                caption: "Ya transferido",
                icon: <CheckCircle size={20} strokeWidth={1.5} />,
              },
            ]}
          />
        )}

        {resumen && !resumen.cuentaMercadopagoConfigurada && (
          <div className="billetera__notice" role="status">
            <AlertTriangle size={18} strokeWidth={1.5} aria-hidden="true" />
            <p>
              Todavía no configuraste tu cuenta de Mercado Pago, necesaria para
              cobrar. <Link to="/account">Configurala en Mi Cuenta</Link>.
            </p>
          </div>
        )}

        {resumen?.cuentaMercadopagoEnCooldown && (
          <div className="billetera__notice" role="status">
            <Clock size={18} strokeWidth={1.5} aria-hidden="true" />
            <p>
              Tu cuenta fue actualizada; los cobros se habilitan el{" "}
              {formatDateTime(resumen.cuentaMercadopagoHabilitadaDesde)}.
            </p>
          </div>
        )}

        <p className="billetera__fees">
          Comisiones: la plataforma retiene el 10% de cada venta. Si el diseño
          se fabrica, el diseñador recibe el 3% de la ganancia del fabricante.
        </p>

        <div className="billetera__filter">
          <FormField
            label="Estado"
            name="billetera-estado"
            type="select"
            value={estado}
            onChange={handleEstadoChange}
            placeholder="Todos"
            options={FILTRO_OPTIONS}
          />
        </div>

        {error && (
          <p className="billetera__error-inline" role="alert">
            {error}
          </p>
        )}

        <div
          className={`billetera__table${loading ? " billetera__table--loading" : ""}`}
          aria-busy={loading}
        >
          <DataTable
            columns={COLUMNS}
            rows={data.data}
            pagination
            emptyMessage="Todavía no tenés movimientos."
            serverPagination={{
              page,
              rowsPerPage: limit,
              total: data.meta.total,
              onPageChange: setPage,
              onRowsPerPageChange: setLimit,
            }}
          />
        </div>
      </>
    );
  }

  return (
    <Layout>
      <Breadcrumb items={BREADCRUMB_ITEMS} />
      <Header
        title="Mi"
        accentText="Billetera"
        subtitle="Seguí tus cobros, retenciones y pagos."
      />
      <div className="billetera">{renderContent()}</div>
    </Layout>
  );
}

export default Billetera;
