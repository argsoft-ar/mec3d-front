import { Download, PackageCheck, MessageSquare, Ban } from "lucide-react";
import Button from "../Button/Button";
import MaterialTag from "../MaterialTag/MaterialTag";
import { formatPrice } from "../../utils/format.util";
import {
  AVISO_EN_DISPUTA,
  compraPagada,
  estadoCompraVisual,
  estadoOrdenVisual,
} from "../../utils/estado.util";
import type { SolicitudFabricacionCardProps } from "./SolicitudFabricacionCard.types";
import "./SolicitudFabricacionCard.css";

const SolicitudFabricacionCard = ({
  orden,
  downloading,
  onDescargar,
  onConfirmarEntrega,
  onAbrirChat,
  onCancelar,
}: SolicitudFabricacionCardProps) => {
  // La negociación (proponer precio / cerrar trato) vive en el chat; acá solo
  // se habilitan las acciones de entrega una vez que ya hay un precio acordado.
  const hasPrecioAcordado = orden.precioAcordado !== null;
  // El fabricante recién puede cargar el código una vez que el comprador declaró
  // la entrega ("confirmada"); antes de eso no hay nada que validar todavía.
  const puedeConfirmarEntrega = orden.estado === "confirmada";
  // Con el trato cerrado, la descarga se habilita recién cuando el comprador pagó.
  const pagada = compraPagada(orden.compraEstado);
  const esperandoPago = orden.estado === "trato_cerrado" && !pagada;
  const estadoCompra = orden.compraEstado
    ? estadoCompraVisual(orden.compraEstado)
    : null;
  const puedeCancelar =
    orden.estado === "solicitado" ||
    orden.estado === "en_negociacion" ||
    orden.estado === "trato_cerrado";
  const enDisputa = orden.estado === "en_disputa";

  return (
    <article className="solicitud-card">
      <header className="solicitud-card__header">
        <h3 className="solicitud-card__title">{orden.productoTitulo}</h3>
        <span
          className={`solicitud-card__badge solicitud-card__badge--${orden.estado}`}
        >
          {estadoOrdenVisual(orden.estado).label}
        </span>
      </header>

      {enDisputa && (
        <p className="solicitud-card__note solicitud-card__note--danger" role="status">
          El comprador abrió una disputa. {AVISO_EN_DISPUTA}
        </p>
      )}

      {puedeCancelar && pagada && onCancelar && (
        <p className="solicitud-card__note">
          El comprador ya pagó: si cancelás, se le reembolsa el pago.
        </p>
      )}

      {orden.estado === "trato_cerrado" && estadoCompra && (
        <div className="solicitud-card__material">
          <span className="solicitud-card__price-label">Pago</span>
          <MaterialTag
            label={estadoCompra.label}
            variant={estadoCompra.variant}
            size="sm"
          />
        </div>
      )}

      {esperandoPago && (
        <p className="solicitud-card__note">
          Esperando el pago del comprador. Vas a poder descargar el diseño y
          confirmar la entrega cuando se acredite.
        </p>
      )}

      {orden.material && (
        <div className="solicitud-card__material">
          <span className="solicitud-card__price-label">Material</span>
          <MaterialTag label={orden.material} size="sm" />
        </div>
      )}

      <div className="solicitud-card__price">
        <span className="solicitud-card__price-label">Precio acordado</span>
        <span className="solicitud-card__price-value">
          {hasPrecioAcordado
            ? formatPrice(orden.precioAcordado as number)
            : "Sin acordar"}
        </span>
      </div>

      <div className="solicitud-card__actions">
        {hasPrecioAcordado && (
          <>
            <Button
              title="Descargar diseño"
              variant="outline"
              icon={<Download size={16} strokeWidth={2} />}
              loading={downloading}
              disabled={!pagada}
              onClick={onDescargar}
            />
            {puedeConfirmarEntrega && pagada && (
              <Button
                title="Confirmar entrega"
                variant="primary"
                icon={<PackageCheck size={16} strokeWidth={2} />}
                onClick={onConfirmarEntrega}
              />
            )}
          </>
        )}
        <Button
          title="Abrir chat"
          variant={hasPrecioAcordado ? "ghost" : "primary"}
          icon={<MessageSquare size={16} strokeWidth={2} />}
          disabled={!orden.conversacionId}
          onClick={onAbrirChat}
        />
        {puedeCancelar && onCancelar && (
          <Button
            title="Cancelar"
            variant="danger"
            icon={<Ban size={16} strokeWidth={2} />}
            onClick={onCancelar}
          />
        )}
      </div>
    </article>
  );
};

export default SolicitudFabricacionCard;
