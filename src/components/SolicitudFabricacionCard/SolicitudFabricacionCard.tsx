import { Download, PackageCheck, MessageSquare } from "lucide-react";
import Button from "../Button/Button";
import { formatPrice } from "../../utils/format.util";
import type { SolicitudFabricacionCardProps } from "./SolicitudFabricacionCard.types";
import "./SolicitudFabricacionCard.css";

const ESTADO_LABELS: Record<string, string> = {
  solicitado: "Solicitado",
  en_negociacion: "En negociación",
  trato_cerrado: "Trato cerrado",
  confirmada: "Entrega confirmada por el comprador",
  rechazado: "Rechazado",
  cancelado: "Cancelado",
  completado: "Completado",
};

const SolicitudFabricacionCard = ({
  orden,
  downloading,
  onDescargar,
  onConfirmarEntrega,
  onAbrirChat,
}: SolicitudFabricacionCardProps) => {
  // La negociación (proponer precio / cerrar trato) vive en el chat; acá solo
  // se habilitan las acciones de entrega una vez que ya hay un precio acordado.
  const hasPrecioAcordado = orden.precioAcordado !== null;
  // El fabricante recién puede cargar el código una vez que el comprador declaró
  // la entrega ("confirmada"); antes de eso no hay nada que validar todavía.
  const puedeConfirmarEntrega = orden.estado === "confirmada";

  return (
    <article className="solicitud-card">
      <header className="solicitud-card__header">
        <h3 className="solicitud-card__title">{orden.productoTitulo}</h3>
        <span
          className={`solicitud-card__badge solicitud-card__badge--${orden.estado}`}
        >
          {ESTADO_LABELS[orden.estado] ?? orden.estado}
        </span>
      </header>

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
              onClick={onDescargar}
            />
            {puedeConfirmarEntrega && (
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
      </div>
    </article>
  );
};

export default SolicitudFabricacionCard;
