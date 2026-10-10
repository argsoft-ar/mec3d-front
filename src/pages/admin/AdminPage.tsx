import { useCallback, useEffect, useMemo, useState } from "react";
import type React from "react";
import { BadgeCheck, RefreshCw, Scale } from "lucide-react";
import Layout from "../../components/Layout/Layout";
import Breadcrumb from "../../components/Breadcrumb/Breadcrumb";
import Header from "../../components/Header/Header";
import Button from "../../components/Button/Button";
import DataTable from "../../components/DataTable/DataTable";
import type {
  ColumnDef,
  TableAction,
} from "../../components/DataTable/DataTable.types";
import ConfirmDialog from "../../components/ConfirmDialog/ConfirmDialog";
import MotivoDialog from "../../components/MotivoDialog/MotivoDialog";
import FormField from "../../components/Form/FormField";
import MaterialTag from "../../components/MaterialTag/MaterialTag";
import ToastContainer from "../../components/Toast/ToastContainer";
import PageLoader from "../../components/PageLoader/PageLoader";
import { useToast } from "../../hooks/useToast";
import { useAdminPaginated } from "../../hooks/useAdminPaginated";
import { useMarcarPayoutPagado } from "../../hooks/useMarcarPayoutPagado";
import { useResolverDisputa } from "../../hooks/useResolverDisputa";
import { useReintentarReembolsos } from "../../hooks/useReintentarReembolsos";
import { adminService } from "../../services/admin.service";
import { marcarAdminDenegado } from "../../utils/admin-access.util";
import {
  estadoOrdenVisual,
  resolucionDisputaLabel,
  tipoMovimientoLabel,
} from "../../utils/estado.util";
import { formatCentavos, formatDateTime } from "../../utils/format.util";
import { MAX_MOTIVO_DISPUTA } from "../../interfaces";
import type {
  AdminListParams,
  DisputaEstadoFiltro,
  DisputaFila,
  EstadoOrdenFabricacion,
  PayoutPendiente,
  ResolucionDisputa,
  TipoMovimiento,
} from "../../interfaces";
import type { SelectOption } from "../../types";
import "./AdminPage.css";

const BREADCRUMB_ITEMS = [{ label: "Inicio", path: "/" }, { label: "Admin" }];

const PAYOUTS_ERROR = "No se pudieron cargar los payouts pendientes";
const DISPUTAS_ERROR = "No se pudieron cargar las disputas";

const RESOLUCION_OPTIONS: SelectOption[] = (
  ["liberar_fabricante", "reembolsar_comprador"] as ResolucionDisputa[]
).map((value) => ({ value, label: resolucionDisputaLabel(value) }));

const ESTADO_DISPUTA_OPTIONS: SelectOption[] = [
  { value: "abiertas", label: "Abiertas" },
  { value: "resueltas", label: "Resueltas" },
];

function esEstadoDisputa(value: string): value is DisputaEstadoFiltro {
  return value === "abiertas" || value === "resueltas";
}

function renderEstadoCobro(row: PayoutPendiente): React.ReactNode {
  if (row.pagable) {
    return <MaterialTag label="Pagable" variant="success" size="sm" />;
  }
  return (
    <div className="admin-page__tags">
      {row.enRetencion && row.liberableDesde && (
        <MaterialTag
          label={`En retención hasta ${formatDateTime(row.liberableDesde)}`}
          variant="warning"
          size="sm"
        />
      )}
      {row.cuentaEnCooldown && row.cuentaHabilitadaDesde && (
        <MaterialTag
          label={`Cuenta en cooldown hasta ${formatDateTime(row.cuentaHabilitadaDesde)}`}
          variant="warning"
          size="sm"
        />
      )}
      {!row.usuario.cuentaMercadopago && (
        <MaterialTag
          label="Sin cuenta configurada"
          variant="danger"
          size="sm"
        />
      )}
    </div>
  );
}

const PAYOUT_COLUMNS: ColumnDef<PayoutPendiente>[] = [
  {
    key: "vendedor",
    header: "Vendedor",
    renderCell: (_value, row) => row.usuario.email,
  },
  {
    key: "cuenta",
    header: "Cuenta de cobro",
    renderCell: (_value, row) => row.usuario.cuentaMercadopago ?? "—",
  },
  {
    key: "tipo",
    header: "Tipo",
    renderCell: (value) => tipoMovimientoLabel(value as TipoMovimiento),
  },
  {
    key: "montoCentavos",
    header: "Monto",
    align: "right",
    renderCell: (value) => formatCentavos(Number(value)),
  },
  {
    key: "pagable",
    header: "Estado de cobro",
    width: 320,
    renderCell: (_value, row) => renderEstadoCobro(row),
  },
];

const DISPUTA_COLUMNS: ColumnDef<DisputaFila>[] = [
  {
    key: "ordenId",
    header: "Orden",
    width: 110,
    renderCell: (value) => String(value).slice(0, 8),
  },
  {
    key: "montoCentavos",
    header: "Monto",
    align: "right",
    renderCell: (value) =>
      typeof value === "number" ? formatCentavos(value) : "—",
  },
  {
    key: "estadoOrden",
    header: "Estado",
    renderCell: (value) => {
      const visual = estadoOrdenVisual(value as EstadoOrdenFabricacion);
      return (
        <MaterialTag label={visual.label} variant={visual.variant} size="sm" />
      );
    },
  },
  {
    key: "motivo",
    header: "Motivo",
    width: 320,
    renderCell: (value) =>
      typeof value === "string" ? (
        <span className="admin-page__text" title={value}>
          {value}
        </span>
      ) : (
        "—"
      ),
  },
  {
    key: "abiertaEn",
    header: "Abierta",
    width: 150,
    renderCell: (value) =>
      formatDateTime(typeof value === "string" ? value : null),
  },
  {
    key: "resolucion",
    header: "Resolución",
    width: 260,
    renderCell: (value, row) =>
      typeof value === "string" ? (
        <span className="admin-page__text" title={row.nota ?? undefined}>
          {resolucionDisputaLabel(value as ResolucionDisputa)}
          {row.nota ? `: ${row.nota}` : ""}
        </span>
      ) : (
        "Pendiente"
      ),
  },
];

function AdminPage() {
  const { toasts, addToast, removeToast } = useToast();
  const [estadoDisputa, setEstadoDisputa] =
    useState<DisputaEstadoFiltro>("abiertas");

  const fetchPayouts = useCallback(
    (params: AdminListParams) => adminService.listarPayoutsPendientes(params),
    [],
  );
  const fetchDisputas = useCallback(
    (params: AdminListParams) =>
      adminService.listarDisputas(params, estadoDisputa),
    [estadoDisputa],
  );

  const payouts = useAdminPaginated(fetchPayouts, "payouts", PAYOUTS_ERROR);
  const disputas = useAdminPaginated(
    fetchDisputas,
    `disputas:${estadoDisputa}`,
    DISPUTAS_ERROR,
  );

  const marcar = useMarcarPayoutPagado(addToast, payouts.reload);
  const resolver = useResolverDisputa(addToast, disputas.reload);
  const reintentar = useReintentarReembolsos(addToast);

  const forbidden = payouts.forbidden || disputas.forbidden;
  useEffect(() => {
    if (forbidden) marcarAdminDenegado();
  }, [forbidden]);

  const disputaRows = useMemo<DisputaFila[]>(
    () => (disputas.data?.data ?? []).map((d) => ({ ...d, id: d.ordenId })),
    [disputas.data],
  );

  const payoutActions: TableAction<PayoutPendiente>[] = [
    {
      label: "Marcar pagado",
      icon: <BadgeCheck size={18} strokeWidth={1.5} />,
      color: "success",
      onClick: marcar.abrir,
      disabled: (row) => !row.pagable,
    },
  ];

  const disputaActions: TableAction<DisputaFila>[] = [
    {
      label: "Resolver disputa",
      icon: <Scale size={18} strokeWidth={1.5} />,
      color: "primary",
      onClick: resolver.abrir,
      disabled: (row) => row.resolucion !== null,
    },
  ];

  function handleEstadoDisputaChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) {
    setEstadoDisputa(
      esEstadoDisputa(e.target.value) ? e.target.value : "abiertas",
    );
    disputas.resetPage();
  }

  function renderContent() {
    if (forbidden) {
      return (
        <p className="admin-page__error" role="alert">
          Tu cuenta no tiene permisos de administrador.
        </p>
      );
    }
    if (!payouts.data && !disputas.data && !payouts.error && !disputas.error) {
      return <PageLoader label="Cargando panel..." />;
    }

    return (
      <>
        <section className="admin-page__section">
          <div className="admin-page__section-header">
            <h2 className="admin-page__section-title">Payouts pendientes</h2>
          </div>
          {payouts.error && (
            <p className="admin-page__error" role="alert">
              {payouts.error}
            </p>
          )}
          <div
            className={`admin-page__table${payouts.loading ? " admin-page__table--loading" : ""}`}
            aria-busy={payouts.loading}
          >
            <DataTable
              columns={PAYOUT_COLUMNS}
              rows={payouts.data?.data ?? []}
              actions={payoutActions}
              pagination
              emptyMessage="No hay payouts pendientes."
              serverPagination={{
                page: payouts.page,
                rowsPerPage: payouts.limit,
                total: payouts.data?.meta.total ?? 0,
                onPageChange: payouts.setPage,
                onRowsPerPageChange: payouts.setLimit,
              }}
            />
          </div>
        </section>

        <section className="admin-page__section">
          <div className="admin-page__section-header">
            <h2 className="admin-page__section-title">Disputas</h2>
            <div className="admin-page__filter">
              <FormField
                label="Estado"
                name="admin-disputas-estado"
                type="select"
                value={estadoDisputa}
                onChange={handleEstadoDisputaChange}
                options={ESTADO_DISPUTA_OPTIONS}
              />
            </div>
          </div>
          {disputas.error && (
            <p className="admin-page__error" role="alert">
              {disputas.error}
            </p>
          )}
          <div
            className={`admin-page__table${disputas.loading ? " admin-page__table--loading" : ""}`}
            aria-busy={disputas.loading}
          >
            <DataTable
              columns={DISPUTA_COLUMNS}
              rows={disputaRows}
              actions={disputaActions}
              pagination
              emptyMessage={
                estadoDisputa === "abiertas"
                  ? "No hay disputas abiertas."
                  : "No hay disputas resueltas."
              }
              serverPagination={{
                page: disputas.page,
                rowsPerPage: disputas.limit,
                total: disputas.data?.meta.total ?? 0,
                onPageChange: disputas.setPage,
                onRowsPerPageChange: disputas.setLimit,
              }}
            />
          </div>
        </section>
      </>
    );
  }

  return (
    <Layout>
      <Breadcrumb items={BREADCRUMB_ITEMS} />
      <Header
        title="Panel de"
        accentText="administración"
        subtitle="Registrá payouts, resolvé disputas y reintentá reembolsos pendientes."
      />
      <div className="admin-page">
        {!forbidden && (
          <div className="admin-page__toolbar">
            <Button
              title="Reintentar reembolsos pendientes"
              variant="outline"
              icon={<RefreshCw size={16} strokeWidth={2} />}
              loading={reintentar.loading}
              onClick={reintentar.ejecutar}
            />
          </div>
        )}
        {renderContent()}
      </div>

      <ConfirmDialog
        open={marcar.abierto}
        title="Marcar payout como pagado"
        message="Confirmá que ya transferiste el monto al vendedor e ingresá la referencia de la transferencia."
        details={
          marcar.payout
            ? [
                { label: "Vendedor", value: marcar.payout.usuario.email },
                {
                  label: "Cuenta",
                  value: marcar.payout.usuario.cuentaMercadopago ?? "—",
                },
                {
                  label: "Monto",
                  value: formatCentavos(marcar.payout.montoCentavos),
                },
              ]
            : undefined
        }
        confirmLabel="Marcar pagado"
        cancelLabel="Volver"
        variant="info"
        loading={marcar.loading}
        confirmDisabled={marcar.invalido}
        onConfirm={marcar.enviar}
        onCancel={marcar.cerrar}
      >
        <FormField
          label="Referencia de la transferencia"
          name="payout-referencia"
          type="text"
          value={marcar.referencia}
          onChange={marcar.handleReferenciaChange}
          placeholder="Ej: ID de operación"
          maxLength={marcar.maxLength}
          error={marcar.error}
          required
          fullWidth
          autoComplete="off"
        />
      </ConfirmDialog>

      <MotivoDialog
        open={resolver.abierto}
        title="Resolver disputa"
        message="Elegí cómo se resuelve y dejá una nota para auditoría. La resolución mueve fondos y no se puede cambiar después."
        fieldLabel="Nota de resolución"
        fieldName="disputa-nota"
        placeholder="Explicá el criterio de la resolución"
        value={resolver.nota}
        onChange={resolver.handleNotaChange}
        maxLength={MAX_MOTIVO_DISPUTA}
        error={resolver.notaError}
        confirmLabel="Resolver"
        cancelLabel="Volver"
        variant="warning"
        loading={resolver.loading}
        confirmDisabled={resolver.invalido}
        onConfirm={resolver.enviar}
        onCancel={resolver.cerrar}
      >
        <FormField
          label="Resolución"
          name="disputa-resolucion"
          type="select"
          value={resolver.resolucion}
          onChange={resolver.handleResolucionChange}
          placeholder="Seleccioná una resolución"
          options={RESOLUCION_OPTIONS}
          required
          fullWidth
        />
      </MotivoDialog>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </Layout>
  );
}

export default AdminPage;
