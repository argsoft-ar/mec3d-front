export type ModelFormat = "STL" | "3MF" | "OBJ" | "STEP" | "STP";

export interface ModelViewer3DProps {
  url: string;
  format: string;
  className?: string;
}
