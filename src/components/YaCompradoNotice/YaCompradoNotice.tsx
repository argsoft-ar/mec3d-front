import { Link } from "react-router-dom";
import { CircleCheck, Download } from "lucide-react";
import Button from "../Button/Button";
import type { YaCompradoNoticeProps } from "./YaCompradoNotice.types";
import "./YaCompradoNotice.css";

const BUTTON_SIZE = { small: "sm", medium: "md", large: "lg" } as const;

function YaCompradoNotice({
  compraId,
  onDescargar,
  descargando = false,
  mostrarDescarga = true,
  comprasPath = "/account/purchases",
  size = "medium",
  variant = "success",
  className = "",
}: Readonly<YaCompradoNoticeProps>) {
  return (
    <div
      className={`ya-comprado-notice ya-comprado-notice--${size} ya-comprado-notice--${variant} ${className}`.trim()}
      role="status"
    >
      <p className="ya-comprado-notice__message">
        <CircleCheck
          className="ya-comprado-notice__icon"
          size={18}
          strokeWidth={2}
          aria-hidden="true"
        />
        Ya compraste este diseño
      </p>
      <div className="ya-comprado-notice__actions">
        {mostrarDescarga && (
          <Button
            title="Descargar"
            variant="primary"
            size={BUTTON_SIZE[size]}
            fullWidth
            icon={<Download size={18} strokeWidth={2} />}
            loading={descargando}
            onClick={() => onDescargar(compraId)}
          />
        )}
        <Link
          to={comprasPath}
          className={`ya-comprado-notice__link ya-comprado-notice__link--${size}`}
        >
          Ver mis compras
        </Link>
      </div>
    </div>
  );
}

export default YaCompradoNotice;
