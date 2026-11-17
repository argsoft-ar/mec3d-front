import { FileSearch, MessageSquare, Package } from "lucide-react";
import Button from "../Button/Button";
import MaterialTag from "../MaterialTag/MaterialTag";
import { formatDateTime, formatPrice } from "../../utils/format.util";
import type { SolicitudCerradaItemProps } from "./SolicitudCerradaItem.types";
import "./SolicitudCerradaItem.css";

function SolicitudCerradaItem({
  titulo,
  imagenUrl,
  compradorUsername,
  estadoLabel,
  estadoVariant = "neutral",
  precio,
  fecha,
  onVerChat,
  onVerDiseno,
  size = "md",
  className = "",
}: Readonly<SolicitudCerradaItemProps>) {
  return (
    <article
      className={`solicitud-cerrada-item solicitud-cerrada-item--${size} ${className}`.trim()}
    >
      <div className="solicitud-cerrada-item__thumb">
        {imagenUrl ? (
          <img
            className="solicitud-cerrada-item__img"
            src={imagenUrl}
            alt=""
            loading="lazy"
          />
        ) : (
          <Package size={20} strokeWidth={1.5} aria-hidden="true" />
        )}
      </div>

      <div className="solicitud-cerrada-item__body">
        <h4 className="solicitud-cerrada-item__title" title={titulo}>
          {titulo}
        </h4>
        {compradorUsername && (
          <p className="solicitud-cerrada-item__comprador">
            Comprador: @{compradorUsername}
          </p>
        )}
        <div className="solicitud-cerrada-item__meta">
          <MaterialTag label={estadoLabel} variant={estadoVariant} size="sm" />
          {precio !== null && precio !== undefined && (
            <span className="solicitud-cerrada-item__price">
              {formatPrice(precio)}
            </span>
          )}
          {fecha && (
            <time className="solicitud-cerrada-item__date" dateTime={fecha}>
              {formatDateTime(fecha)}
            </time>
          )}
        </div>
      </div>

      {(onVerChat || onVerDiseno) && (
        <div className="solicitud-cerrada-item__actions">
          {onVerChat && (
            <Button
              title="Chat"
              variant="ghost"
              size="sm"
              icon={<MessageSquare size={14} strokeWidth={2} />}
              onClick={onVerChat}
            />
          )}
          {onVerDiseno && (
            <Button
              title="Ver diseño"
              variant="outline"
              size="sm"
              icon={<FileSearch size={14} strokeWidth={2} />}
              onClick={onVerDiseno}
            />
          )}
        </div>
      )}
    </article>
  );
}

export default SolicitudCerradaItem;
