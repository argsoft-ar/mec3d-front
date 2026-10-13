export type TipoCompra = "descarga" | "fabricacion";

export type EstadoCompra =
  | "pendiente_pago"
  | "pagada"
  | "completada"
  | "reembolsada"
  | "cancelada";

export type EstadoPago = "pendiente" | "aprobado" | "rechazado" | "reembolsado";

export type TipoMovimiento =
  | "retencion"
  | "comision_plataforma"
  | "regalia_disenador"
  | "pago_fabricante"
  | "pago_disenador"
  | "reembolso";

export type EstadoMovimiento =
  | "retenido"
  | "liberado"
  | "pendiente_payout"
  | "pagado"
  | "reembolsado";

/** Estados que el backend acepta como filtro en GET /usuarios/mi-billetera. */
export type EstadoMovimientoFiltro = "retenido" | "pendiente_payout" | "pagado";

export type ResultadoReembolso = "no_aplica" | "reembolsado" | "pendiente";

/** Segmento de la URL a la que vuelve Mercado Pago; solo orienta el texto inicial. */
export type RetornoPago = "exito" | "error" | "pendiente";

export interface PagoResultadoProps {
  /** Ruta de retorno de Mercado Pago; solo orienta el texto mientras se verifica. */
  variant: RetornoPago;
}

/** Estado real del pago ya interpretado para mostrarlo. */
export type VistaPago =
  | "verificando"
  | "acreditado"
  | "pendiente"
  | "rechazado"
  | "reembolsado"
  | "cancelado"
  | "error";

export interface PagoResumen {
  id: string;
  estado: EstadoPago;
  mpStatus: string | null;
  montoCentavos: number;
  moneda: string;
  reembolsoPendiente: boolean;
  creadoEn: string;
  aprobadoEn: string | null;
}

export interface EstadoPagoResponse {
  compraId: string;
  tipo: TipoCompra;
  estadoCompra: EstadoCompra;
  montoCentavos: number | null;
  moneda: string;
  /** Último intento de pago; null si todavía no se inició ninguno. */
  pago: PagoResumen | null;
}

export interface IniciarPagoResponse {
  pagoId: string;
  initPoint: string;
}

export interface MovimientoBilletera {
  id: string;
  tipo: TipoMovimiento;
  estado: EstadoMovimiento;
  montoCentavos: number;
  compraId: string;
  ordenId: string | null;
  creadoEn: string;
  liberadoEn: string | null;
  /** Desde cuándo se puede pagar el payout (retención de descargas); null si no aplica. */
  liberableDesde: string | null;
  pagadoEn: string | null;
}

export interface ResumenBilletera {
  retenidoCentavos: number;
  pendientePayoutCentavos: number;
  pagadoCentavos: number;
  cuentaMercadopagoConfigurada: boolean;
  /** Tras cambiar la cuenta no se puede cobrar a ella hasta `cuentaMercadopagoHabilitadaDesde` (24 h). */
  cuentaMercadopagoEnCooldown: boolean;
  cuentaMercadopagoHabilitadaDesde: string | null;
}

export interface BilleteraParams {
  page?: number;
  limit?: number;
  estado?: EstadoMovimientoFiltro;
}

export interface BilleteraResponse {
  data: MovimientoBilletera[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  resumen: ResumenBilletera;
}
