import { useCallback, useState } from "react";
import type React from "react";
import { adminService } from "../services/admin.service";
import { HttpError, getErrorToast } from "../services/http.client";
import { MAX_MOTIVO_DISPUTA } from "../interfaces";
import type {
  DisputaFila,
  ResolucionDisputa,
  ResolverDisputaResponse,
} from "../interfaces";
import type { AddToast } from "../types";

const RESOLUCIONES: readonly ResolucionDisputa[] = [
  "liberar_fabricante",
  "reembolsar_comprador",
];

function esResolucion(value: string): value is ResolucionDisputa {
  return (RESOLUCIONES as readonly string[]).includes(value);
}

/** Igual que el backend: la nota es obligatoria y llega hasta 1000 caracteres. */
export function validarNotaResolucion(nota: string): string | undefined {
  const limpia = nota.trim();
  if (!limpia) return "La nota es obligatoria";
  if (limpia.length > MAX_MOTIVO_DISPUTA) {
    return `La nota no puede superar los ${MAX_MOTIVO_DISPUTA} caracteres`;
  }
  return undefined;
}

function resumenResolucion(res: ResolverDisputaResponse): {
  message: string;
  type: "success" | "warning" | "info";
} {
  if (res.payoutsYaPagados > 0) {
    return {
      message: `Disputa resuelta, pero ${res.payoutsYaPagados} payout(s) ya se habían transferido y requieren recuperación manual.`,
      type: "warning",
    };
  }
  if (res.reembolso === "pendiente") {
    return {
      message:
        "Disputa resuelta. El reembolso quedó pendiente: usá \"Reintentar reembolsos pendientes\".",
      type: "warning",
    };
  }
  if (res.idempotente) {
    return {
      message: "La disputa ya estaba resuelta con esa resolución.",
      type: "info",
    };
  }
  return { message: "Disputa resuelta", type: "success" };
}

export function useResolverDisputa(addToast: AddToast, onDone: () => void) {
  const [disputa, setDisputa] = useState<DisputaFila | null>(null);
  const [resolucion, setResolucion] = useState<ResolucionDisputa | "">("");
  const [nota, setNota] = useState("");
  const [touched, setTouched] = useState(false);
  const [loading, setLoading] = useState(false);

  const abrir = useCallback((item: DisputaFila) => {
    setDisputa(item);
    setResolucion("");
    setNota("");
    setTouched(false);
  }, []);

  const cerrar = useCallback(() => setDisputa(null), []);

  const handleResolucionChange = useCallback(
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ) => {
      setResolucion(esResolucion(e.target.value) ? e.target.value : "");
    },
    [],
  );

  const handleNotaChange = useCallback(
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ) => {
      setNota(e.target.value.slice(0, MAX_MOTIVO_DISPUTA));
      setTouched(true);
    },
    [],
  );

  const notaError = validarNotaResolucion(nota);
  const invalido = resolucion === "" || notaError !== undefined;

  const enviar = useCallback(async () => {
    if (!disputa || resolucion === "" || validarNotaResolucion(nota)) {
      setTouched(true);
      return;
    }
    setLoading(true);
    try {
      const res = await adminService.resolverDisputa(disputa.ordenId, {
        resolucion,
        nota: nota.trim(),
      });
      const { message, type } = resumenResolucion(res);
      addToast(message, type, 8000);
      setDisputa(null);
      onDone();
    } catch (error) {
      const { message, type } = getErrorToast(
        error,
        "No se pudo resolver la disputa",
      );
      addToast(message, type);
      // 409: ya fue resuelta con otra resolución; se refresca la lista.
      if (error instanceof HttpError && error.status === 409) {
        setDisputa(null);
        onDone();
      }
    } finally {
      setLoading(false);
    }
  }, [disputa, resolucion, nota, addToast, onDone]);

  return {
    disputa,
    abierto: disputa !== null,
    resolucion,
    nota,
    notaError: touched ? notaError : undefined,
    invalido,
    loading,
    handleResolucionChange,
    handleNotaChange,
    abrir,
    cerrar,
    enviar,
  };
}
