import type { WatermarkProps } from "../../interfaces";
import "./Watermark.css";

// Suficiente para cubrir el área rotada incluso en pantallas grandes.
const TILE_COUNT = 400;
const TILE_INDEXES = Array.from({ length: TILE_COUNT }, (_, i) => i);

/** Marca de agua en mosaico diagonal; se posiciona sobre el contenedor relativo padre. */
function Watermark({ text, className = "" }: Readonly<WatermarkProps>) {
  return (
    <div className={`watermark ${className}`.trim()} aria-hidden="true">
      <div className="watermark__grid">
        {TILE_INDEXES.map((i) => (
          <span key={i} className="watermark__tile">
            {text}
          </span>
        ))}
      </div>
    </div>
  );
}

export default Watermark;
