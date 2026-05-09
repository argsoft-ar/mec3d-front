import React from "react";
import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react";
import type { ToastItem } from "../../types";
import "./Toast.css";

const ICONS: Record<ToastItem["type"], React.ReactNode> = {
  success: <CheckCircle size={18} strokeWidth={2} />,
  error: <XCircle size={18} strokeWidth={2} />,
  warning: <AlertTriangle size={18} strokeWidth={2} />,
  info: <Info size={18} strokeWidth={2} />,
};

interface ToastProps {
  toast: ToastItem;
  onRemove: (id: string) => void;
}

function Toast({ toast, onRemove }: ToastProps) {
  return (
    <div
      className={`toast toast--${toast.type}`}
      role="alert"
      aria-live="polite"
    >
      <span className="toast__icon" aria-hidden="true">
        {ICONS[toast.type]}
      </span>
      <p className="toast__message">{toast.message}</p>
      <button
        className="toast__close"
        onClick={() => onRemove(toast.id)}
        aria-label="Cerrar notificación"
      >
        <X size={16} strokeWidth={2} />
      </button>
    </div>
  );
}

export default Toast;
