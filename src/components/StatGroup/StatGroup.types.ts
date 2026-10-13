import type React from "react";
import type { TagVariant } from "../../types";

export interface StatItem {
  key: string;
  label: string;
  value: string;
  caption?: string;
  icon?: React.ReactNode;
  /** Etiqueta opcional junto al valor (ej. un estado). */
  badge?: { label: string; variant: TagVariant };
}

export interface StatGroupProps {
  items: StatItem[];
  className?: string;
}
