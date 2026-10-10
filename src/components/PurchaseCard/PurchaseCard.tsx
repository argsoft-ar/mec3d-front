import {
  Download,
  Hammer,
  ShieldCheck,
  Clock,
  CreditCard,
  KeyRound,
  ShieldAlert,
} from "lucide-react";
import Button from "../Button/Button";
import MaterialTag from "../MaterialTag/MaterialTag";
import { formatPrice, parseFormatTags } from "../../utils/format.util";
import {
  AVISO_EN_DISPUTA,
  compraPagada,
  estadoCompraVisual,
} from "../../utils/estado.util";
import type { PurchaseCardProps } from "./PurchaseCard.types";
import "./PurchaseCard.css";

const PurchaseCard = ({
  imageUrl,
  title,
  format,
  material,
  pricePaid,
  tipo,
  estadoCompra,
  deliveryStage,
  downloading = false,
  paying = false,
  onDownload,
  onPagar,
  onSolicitarFabricacion,
  onConfirmarEntrega,
  onGenerarCodigo,
  onAbrirDisputa,
  className = "",
}: PurchaseCardProps) => {
  const estado = estadoCompraVisual(estadoCompra);
  const pagada = compraPagada(estadoCompra);
  const pendientePago = estadoCompra === "pendiente_pago";
  const tratoCerrado = deliveryStage === "trato_cerrado";
  const puedeEntregar =
    pagada && (tratoCerrado || deliveryStage === "confirmada");

  return (
    <article className={`purchase-card ${className}`.trim()}>
      <div className="purchase-card__image-wrapper">
        <img className="purchase-card__image" src={imageUrl} alt={title} />
      </div>

      <div className="purchase-card__content">
        <div className="purchase-card__info">
          <h3 className="purchase-card__title">{title}</h3>

          <div className="purchase-card__formats">
            {parseFormatTags(format).map((tag) => (
              <span key={tag} className="purchase-card__format-chip">
                {tag}
              </span>
            ))}
            {material && <MaterialTag label={material} size="sm" />}
            <MaterialTag
              label={estado.label}
              variant={estado.variant}
              size="sm"
            />
          </div>

          <span className="purchase-card__price">
            {pricePaid === null ? "Precio a acordar" : formatPrice(pricePaid)}
          </span>
        </div>
        <div className="purchase-card__footer">
          {tipo === "descarga" && (
            <Button
              title="Descargar"
              variant="primary"
              icon={<Download size={16} strokeWidth={2} />}
              loading={downloading}
              disabled={!pagada || !onDownload}
              onClick={onDownload}
            />
          )}
          {pendientePago && onPagar && (tipo === "descarga" || tratoCerrado) && (
            <Button
              title="Pagar"
              variant={tipo === "descarga" ? "outline" : "primary"}
              icon={<CreditCard size={16} strokeWidth={2} />}
              loading={paying}
              onClick={onPagar}
            />
          )}
          {tipo === "fabricacion" &&
            pendientePago &&
            deliveryStage === "none" &&
            onSolicitarFabricacion && (
              <Button
                title="Fabricar"
                variant="outline"
                icon={<Hammer size={16} strokeWidth={2} />}
                onClick={onSolicitarFabricacion}
              />
            )}
          {deliveryStage === "completado" && (
            <span className="purchase-card__delivery-status purchase-card__delivery-status--confirmed">
              <ShieldCheck size={14} strokeWidth={2} /> Entrega confirmada
            </span>
          )}
          {deliveryStage === "confirmada" && (
            <span className="purchase-card__delivery-status purchase-card__delivery-status--pending">
              <Clock size={14} strokeWidth={2} /> Esperando validación del
              fabricante
            </span>
          )}
          {tratoCerrado && pagada && onConfirmarEntrega && (
            <Button
              title="Confirmar entrega"
              variant="outline"
              onClick={onConfirmarEntrega}
            />
          )}
          {puedeEntregar && onGenerarCodigo && (
            <Button
              title="Código de entrega"
              variant="ghost"
              icon={<KeyRound size={16} strokeWidth={2} />}
              onClick={onGenerarCodigo}
            />
          )}
          {puedeEntregar && onAbrirDisputa && (
            <Button
              title="Abrir disputa"
              variant="danger"
              icon={<ShieldAlert size={16} strokeWidth={2} />}
              onClick={onAbrirDisputa}
            />
          )}
        </div>
        {deliveryStage === "en_disputa" && (
          <p className="purchase-card__dispute-notice" role="status">
            <ShieldAlert size={14} strokeWidth={2} aria-hidden="true" />
            <span>
              <strong>En disputa.</strong> {AVISO_EN_DISPUTA}
            </span>
          </p>
        )}
      </div>
    </article>
  );
};

export default PurchaseCard;
