import { useMemo } from "react";
import type { SelectOption } from "../types";

interface IndexedOption {
  option: SelectOption;
  key: string;
}

interface UseMultiSelectOptionsParams {
  options: SelectOption[];
  value: string[];
  query: string;
  isOpen: boolean;
  /** Tope de opciones renderizadas (las seleccionadas no cuentan). */
  maxRendered: number;
}

interface UseMultiSelectOptionsReturn {
  /** Opciones a renderizar: seleccionadas primero y luego el resto, recortado. */
  visible: SelectOption[];
  totalMatches: number;
  truncated: boolean;
  labels: Map<string, string>;
}

function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function partitionMatches(
  indexed: IndexedOption[],
  term: string,
  value: string[],
): { selectedMatches: SelectOption[]; otherMatches: SelectOption[] } {
  const selectedMatches: SelectOption[] = [];
  const otherMatches: SelectOption[] = [];
  const selected = new Set(value);
  for (const { option, key } of indexed) {
    if (term && !key.includes(term)) continue;
    if (selected.has(option.value)) selectedMatches.push(option);
    else otherMatches.push(option);
  }
  return { selectedMatches, otherMatches };
}

/** Filtra (sin acentos) y ordena las opciones de un multiselect con búsqueda. */
export function useMultiSelectOptions({
  options,
  value,
  query,
  isOpen,
  maxRendered,
}: UseMultiSelectOptionsParams): UseMultiSelectOptionsReturn {
  const indexed = useMemo(
    () => options.map((option) => ({ option, key: normalize(option.label) })),
    [options],
  );
  const labels = useMemo(
    () => new Map(options.map((o) => [o.value, o.label])),
    [options],
  );

  const { selectedMatches, otherMatches } = useMemo(
    () =>
      isOpen
        ? partitionMatches(indexed, normalize(query.trim()), value)
        : { selectedMatches: [], otherMatches: [] },
    [indexed, query, value, isOpen],
  );

  const visible = [
    ...selectedMatches,
    ...otherMatches.slice(0, Math.max(0, maxRendered - selectedMatches.length)),
  ];
  const totalMatches = selectedMatches.length + otherMatches.length;

  return {
    visible,
    totalMatches,
    truncated: visible.length < totalMatches,
    labels,
  };
}
