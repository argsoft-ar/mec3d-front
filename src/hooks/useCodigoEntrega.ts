import { useCallback, useState } from "react";
import { ordenFabricacionService } from "../services/orden-fabricacion.service";
import { getErrorToast } from "../services/http.client";
import type { AddToast } from "../types";

export type PasoCodigoEntrega = "cerrado" | "aviso" | "codigo";

/**
 * El backend genera un código NUEVO (e invalida el anterior) con cada POST, por eso solo
 * se pide tras confirmar el aviso, nunca al renderizar ni en polling.
 */
export function useCodigoEntrega(addToast: AddToast) {
  const [ordenId, setOrdenId] = useState<string | null>(null);
  const [paso, setPaso] = useState<PasoCodigoEntrega>("cerrado");
  const [codigo, setCodigo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const abrir = useCallback((id: string) => {
    setOrdenId(id);
    setCodigo(null);
    setPaso("aviso");
  }, []);

  const cerrar = useCallback(() => {
    setOrdenId(null);
    setCodigo(null);
    setPaso("cerrado");
  }, []);

  const generar = useCallback(async () => {
    if (!ordenId) return;
    setLoading(true);
    try {
      const res = await ordenFabricacionService.codigoEntrega(ordenId);
      setCodigo(res.data?.codigoEntrega ?? null);
      setPaso("codigo");
    } catch (error) {
      const { message, type } = getErrorToast(
        error,
        "No se pudo generar el código de entrega",
      );
      addToast(message, type);
      cerrar();
    } finally {
      setLoading(false);
    }
  }, [ordenId, addToast, cerrar]);

  return { paso, codigo, loading, abrir, generar, cerrar };
}
