import type { ToastItem } from "../../types";
import Toast from "./Toast";
import "./Toast.css";

interface ToastContainerProps {
  toasts: ToastItem[];
  onRemove: (id: string) => void;
}

function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="toast-container" aria-label="Notificaciones">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
}

export default ToastContainer;
