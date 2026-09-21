import { useState, useEffect, useCallback } from "react";
import { chatService } from "../services/chat.service";
import type { ConversacionResumen } from "../interfaces";
import type { ToastType } from "../types";

interface UseConversacionesReturn {
  conversaciones: ConversacionResumen[];
  loading: boolean;
  refresh: () => void;
}

export function useConversaciones(
  addToast: (message: string, type: ToastType) => void,
): UseConversacionesReturn {
  const [conversaciones, setConversaciones] = useState<ConversacionResumen[]>(
    [],
  );
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    chatService
      .misConversaciones()
      .then((res) => setConversaciones(res.data ?? []))
      .catch(() =>
        addToast("No se pudieron cargar las conversaciones", "error"),
      )
      .finally(() => setLoading(false));
  }, [addToast]);

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { conversaciones, loading, refresh };
}
