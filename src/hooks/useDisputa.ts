import { useCallback, useState } from "react";
import type React from "react";
import { ordenFabricacionService } from "../services/orden-fabricacion.service";
import { getErrorToast } from "../services/http.client";
import { MAX_MOTIVO_DISPUTA } from "../interfaces";
import type { AddToast } from "../types";

/** Valida el motivo igual que el backend (obligatorio, hasta 1000 caracteres). */
export function validarMotivoDisputa(motivo: string): string | undefined {
  const limpio = motivo.trim();
  if (!limpio) return "El motivo es obligatorio";
  if (limpio.length > MAX_MOTIVO_DISPUTA) {
    return `El motivo no puede superar los ${MAX_MOTIVO_DISPUTA} caracteres`;
  }
  return undefined;
}

export function useDisputa(
  addToast: AddToast,
  onDisputada: (ordenId: string) => void,
) {
  const [ordenId, setOrdenId] = useState<string | null>(null);
  const [motivo, setMotivo] = useState("");
  const [touched, setTouched] = useState(false);
  const [loading, setLoading] = useState(false);

  const abrir = useCallback((id: string) => {
    setOrdenId(id);
    setMotivo("");
    setTouched(false);
  }, []);

  const cerrar = useCallback(() => setOrdenId(null), []);

  const handleMotivoChange = useCallback(
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ) => {
      setMotivo(e.target.value.slice(0, MAX_MOTIVO_DISPUTA));
      setTouched(true);
    },
    [],
  );

  const error = touched ? validarMotivoDisputa(motivo) : undefined;

  const enviar = useCallback(async () => {
    if (!ordenId) return;
    if (validarMotivoDisputa(motivo)) {
      setTouched(true);
      return;
    }
    setLoading(true);
    try {
      await ordenFabricacionService.disputar(ordenId, motivo.trim());
      addToast(
        "Disputa abierta. Un administrador revisará el caso.",
        "success",
      );
      onDisputada(ordenId);
      setOrdenId(null);
    } catch (e) {
      const { message, type } = getErrorToast(e, "No se pudo abrir la disputa");
      addToast(message, type);
    } finally {
      setLoading(false);
    }
  }, [ordenId, motivo, addToast, onDisputada]);

  return {
    abierto: ordenId !== null,
    motivo,
    error,
    loading,
    invalido: validarMotivoDisputa(motivo) !== undefined,
    handleMotivoChange,
    abrir,
    cerrar,
    enviar,
  };
}
