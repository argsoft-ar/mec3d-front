export type ModelFormat = "STL" | "3MF" | "OBJ" | "STEP" | "STP";

export interface ModelViewer3DProps {
  readonly url: string;
  readonly format: string;
  readonly className?: string;
  readonly onPreviewError?: () => void;
  /** Reemplaza el texto de error por defecto del visor. */
  readonly errorMessage?: string;
}
