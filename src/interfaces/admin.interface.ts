import type { TipoMovimiento } from "./pago.interface";
import type {
  DisputaItem,
  ResolucionDisputa,
} from "./orden-fabricacion.interface";

/** Fila de la tabla de disputas: DataTable exige un `id` por fila. */
export interface DisputaFila extends DisputaItem {
  id: string;
}

export interface PayoutPendiente {
  id: string;
  tipo: TipoMovimiento;
  montoCentavos: number;
  compraId: string;
  ordenId: string | null;
  liberadoEn: string | null;
  liberableDesde: string | null;
  enRetencion: boolean;
  cuentaEnCooldown: boolean;
  cuentaHabilitadaDesde: string | null;
  /** Fuera de retención, sin cooldown de cuenta y con cuenta configurada. */
  pagable: boolean;
  usuario: {
    id: string;
    email: string;
    cuentaMercadopago: string | null;
  };
}

export interface ResumenReintentoReembolsos {
  intentados: number;
  reembolsados: number;
  pendientes: number;
  conPayoutsPagados: number;
}

export interface ResolverDisputaPayload {
  resolucion: ResolucionDisputa;
  nota: string;
}

export interface AdminListParams {
  page?: number;
  limit?: number;
}
