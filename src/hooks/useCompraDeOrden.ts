import { useCallback, useEffect, useState } from "react";
import { compraService } from "../services/compra.service";
import { ordenFabricacionService } from "../services/orden-fabricacion.service";
import type { EstadoCompra } from "../interfaces";

export interface CompraDeOrden {
  compraId: string | null;
  estado: EstadoCompra | null;
}

const SIN_COMPRA: CompraDeOrden = { compraId: null, estado: null };

/** Resuelve la compra (y su estado de pago) detrás de una orden, según el rol en el chat. */
export function useCompraDeOrden(
  ordenId: string | undefined,
  miRol: "comprador" | "fabricante" | undefined,
  enabled: boolean,
) {
  const [compra, setCompra] = useState<CompraDeOrden>(SIN_COMPRA);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    if (!enabled || !ordenId || !miRol) return;
    let cancelled = false;

    const resolver: Promise<CompraDeOrden> =
      miRol === "comprador"
        ? compraService.misCompras().then((compras) => {
            const match = compras.find((c) => c.ordenFabricacionId === ordenId);
            return match
              ? { compraId: match.id, estado: match.estado }
              : SIN_COMPRA;
          })
        : ordenFabricacionService.misSolicitudes().then((res) => {
            const match = res.data?.find((o) => o.id === ordenId);
            return match
              ? { compraId: match.compraId, estado: match.compraEstado }
              : SIN_COMPRA;
          });

    resolver
      .then((resolved) => {
        if (!cancelled) setCompra(resolved);
      })
      .catch(() => {
        if (!cancelled) setCompra(SIN_COMPRA);
      });

    return () => {
      cancelled = true;
    };
  }, [ordenId, miRol, enabled, version]);

  const refresh = useCallback(() => setVersion((v) => v + 1), []);

  return { ...compra, refresh };
}
