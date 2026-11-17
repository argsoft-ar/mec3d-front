import { useState, useCallback } from "react";
import type { AddToast, ToastItem } from "../types";

const DEFAULT_DURATION = 4000;

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

interface UseToastReturn {
  toasts: ToastItem[];
  addToast: AddToast;
  removeToast: (id: string) => void;
}

export function useToast(): UseToastReturn {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback<AddToast>(
    (message, type, durationMs, action) => {
      const id = generateId();
      const duration = durationMs ?? DEFAULT_DURATION;
      const toast: ToastItem = { id, message, type, duration, action };

      setToasts((prev) => [...prev, toast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast],
  );

  return { toasts, addToast, removeToast };
}
