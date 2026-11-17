import { FileSearch } from "lucide-react";
import Button from "../../components/Button/Button";
import MaterialTag from "../../components/MaterialTag/MaterialTag";
import { formatPrice } from "../../utils/format.util";
import type { EstadoVisual } from "../../utils/estado.util";
import type { CompraDeOrden } from "../../hooks/useCompraDeOrden";

export const VER_DISENO_LABEL = "VER DISEÑO";

interface ThreadHeaderProps {
  productoTitulo?: string | null;
  esFabricante: boolean;
  onVerDiseno?: () => void;
}

export function ThreadHeader({
  productoTitulo,
  esFabricante,
  onVerDiseno,
}: Readonly<ThreadHeaderProps>) {
  const variant = esFabricante ? "primary" : "outline";
  return (
    <div className="chat-page__thread-header">
      {productoTitulo && (
        <h3 className="chat-page__product-title">{productoTitulo}</h3>
      )}
      {onVerDiseno && (
        <Button
          title={VER_DISENO_LABEL}
          variant={variant}
          icon={<FileSearch size={16} strokeWidth={2} />}
          onClick={onVerDiseno}
        />
      )}
    </div>
  );
}

interface DealBarProps {
  label: string;
  sinOrden: boolean;
}

export function DealBar({ label, sinOrden }: Readonly<DealBarProps>) {
  return (
    <div className="chat-page__deal-bar">
      <span>{label}</span>
      {sinOrden && (
        <span className="chat-page__deal-bar-note">
          Sin orden de fabricación asociada: no se puede aceptar un presupuesto
          desde este chat.
        </span>
      )}
    </div>
  );
}

interface PaymentPanelProps {
  estadoPago: EstadoVisual | null;
  visible: boolean;
  compra: CompraDeOrden;
  ordenFabricacionId?: string;
  esComprador: boolean;
  pagada: boolean;
  puedeDisputar: boolean;
  paying: boolean;
  onPagar: (compraId: string) => void;
  onCodigoEntrega: (ordenId: string) => void;
  onAbrirDisputa: (ordenId: string) => void;
}

/** Estado del pago y acciones posteriores al trato (pagar, código de entrega, disputa). */
export function PaymentPanel({
  estadoPago,
  visible,
  compra,
  ordenFabricacionId,
  esComprador,
  pagada,
  puedeDisputar,
  paying,
  onPagar,
  onCodigoEntrega,
  onAbrirDisputa,
}: Readonly<PaymentPanelProps>) {
  if (!estadoPago || !visible) return null;
  const compraPendienteId =
    esComprador && compra.estado === "pendiente_pago" ? compra.compraId : null;
  const ordenCodigoEntrega =
    esComprador && pagada ? ordenFabricacionId : undefined;
  const ordenDisputa = puedeDisputar ? ordenFabricacionId : undefined;
  return (
    <div className="chat-page__delivery-code">
      <MaterialTag
        label={`Pago: ${estadoPago.label}`}
        variant={estadoPago.variant}
        size="sm"
      />
      {compraPendienteId && (
        <Button
          title="Pagar"
          variant="primary"
          loading={paying}
          onClick={() => onPagar(compraPendienteId)}
        />
      )}
      {ordenCodigoEntrega && (
        <Button
          title="Código de entrega"
          variant="outline"
          onClick={() => onCodigoEntrega(ordenCodigoEntrega)}
        />
      )}
      {ordenDisputa && (
        <Button
          title="Abrir disputa"
          variant="danger"
          onClick={() => onAbrirDisputa(ordenDisputa)}
        />
      )}
    </div>
  );
}

interface NegotiationSideProps {
  presupuesto: number | null;
  ordenFabricacionId?: string;
}

interface BuyerNegotiationProps extends NegotiationSideProps {
  aceptando: boolean;
  onAceptar: () => void;
}

function BuyerNegotiation({
  presupuesto,
  ordenFabricacionId,
  aceptando,
  onAceptar,
}: Readonly<BuyerNegotiationProps>) {
  let status = "El fabricante todavía no envió un presupuesto.";
  let aceptarLabel = "Aceptar presupuesto";
  if (presupuesto != null) {
    status = `El fabricante te envió un presupuesto de ${formatPrice(presupuesto)}`;
    aceptarLabel = `Aceptar presupuesto ${formatPrice(presupuesto)}`;
  }
  return (
    <div className="chat-page__negotiation">
      <p className="chat-page__negotiation-status">{status}</p>
      <Button
        title={aceptarLabel}
        variant="primary"
        disabled={presupuesto == null || !ordenFabricacionId}
        loading={aceptando}
        onClick={onAceptar}
      />
    </div>
  );
}

interface SellerNegotiationProps extends NegotiationSideProps {
  onProponer: () => void;
}

function SellerNegotiation({
  presupuesto,
  ordenFabricacionId,
  onProponer,
}: Readonly<SellerNegotiationProps>) {
  let status = "Todavía no propusiste un precio.";
  let proponerLabel = "Proponer precio";
  if (presupuesto != null) {
    status = `Propusiste ${formatPrice(presupuesto)}. Esperando que el comprador acepte el presupuesto.`;
    proponerLabel = "Cambiar precio";
  }
  return (
    <div className="chat-page__negotiation">
      <p className="chat-page__negotiation-status">{status}</p>
      <div className="chat-page__negotiation-actions">
        <Button
          title={proponerLabel}
          variant="primary"
          disabled={!ordenFabricacionId}
          onClick={onProponer}
        />
      </div>
    </div>
  );
}

interface NegotiationPanelProps
  extends BuyerNegotiationProps, SellerNegotiationProps {
  visible: boolean;
  esComprador: boolean;
}

/** Panel de presupuesto: el comprador acepta, el fabricante propone/cambia el precio. */
export function NegotiationPanel({
  visible,
  esComprador,
  presupuesto,
  ordenFabricacionId,
  aceptando,
  onAceptar,
  onProponer,
}: Readonly<NegotiationPanelProps>) {
  if (!visible) return null;
  if (esComprador) {
    return (
      <BuyerNegotiation
        presupuesto={presupuesto}
        ordenFabricacionId={ordenFabricacionId}
        aceptando={aceptando}
        onAceptar={onAceptar}
      />
    );
  }
  return (
    <SellerNegotiation
      presupuesto={presupuesto}
      ordenFabricacionId={ordenFabricacionId}
      onProponer={onProponer}
    />
  );
}
