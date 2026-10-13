import type React from "react";

export interface TableAction<T> {
  label: string;
  icon: React.ReactNode;
  onClick: (row: T) => void;
  color?:
    | "default"
    | "primary"
    | "secondary"
    | "error"
    | "warning"
    | "info"
    | "success";
  disabled?: (row: T) => boolean;
}

export interface ColumnDef<T> {
  key: keyof T | string;
  header: string;
  width?: string | number;
  align?: "left" | "center" | "right";
  renderCell?: (value: unknown, row: T) => React.ReactNode;
  sortable?: boolean;
}

export interface FilterableField<T> {
  key: keyof T | string;
  label: string;
  options: string[];
}

/** Paginación controlada por el servidor: `page` es 0-based y `total` el conteo global. */
export interface ServerPagination {
  page: number;
  rowsPerPage: number;
  total: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rowsPerPage: number) => void;
}

export interface DataTableProps<T extends { id: string | number }> {
  columns: ColumnDef<T>[];
  rows: T[];
  actions?: TableAction<T>[];
  emptyMessage?: string;
  stickyHeader?: boolean;
  maxHeight?: number | string;
  searchable?: boolean;
  pagination?: boolean;
  rowsPerPageOptions?: number[];
  filterableFields?: FilterableField<T>[];
  /** Si se define, las filas ya vienen paginadas y la tabla no las vuelve a recortar. */
  serverPagination?: ServerPagination;
}
