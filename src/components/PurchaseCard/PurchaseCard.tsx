import { Download, Hammer, ShieldCheck, Clock } from "lucide-react";
import Button from "../Button/Button";
import { formatPrice, parseFormatTags } from "../../utils/format.util";
import type { PurchaseCardProps } from "./PurchaseCard.types";
import "./PurchaseCard.css";

const PurchaseCard = ({
  imageUrl,
  title,
  format,
  pricePaid,
  deliveryStage,
  downloading = false,
  onDownload,
  onSolicitarFabricacion,
  onConfirmarEntrega,
  className = "",
}: PurchaseCardProps) => (
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
        </div>

        <span className="purchase-card__price">{formatPrice(pricePaid)}</span>
      </div>
      <div className="purchase-card__footer">
        <Button
          title="Descargar"
          variant="primary"
          icon={<Download size={16} strokeWidth={2} />}
          loading={downloading}
          onClick={onDownload}
        />
        {deliveryStage === "none" && onSolicitarFabricacion && (
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
        {deliveryStage === "trato_cerrado" && onConfirmarEntrega && (
          <Button
            title="Confirmar entrega"
            variant="outline"
            onClick={onConfirmarEntrega}
          />
        )}
      </div>
    </div>
  </article>
);

export default PurchaseCard;
