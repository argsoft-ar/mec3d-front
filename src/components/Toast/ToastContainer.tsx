import type { ToastItem, ToastPosition } from "../../types";
import Toast from "./Toast";
import "./Toast.css";

interface ToastContainerProps {
  toasts: ToastItem[];
  onRemove: (id: string) => void;
  position?: ToastPosition;
}

function ToastContainer({
  toasts,
  onRemove,
  position = "bottom",
}: Readonly<ToastContainerProps>) {
  if (toasts.length === 0) return null;

  return (
    <div
      className={`toast-container toast-container--${position}`}
      aria-label="Notificaciones"
    >
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
}

export default ToastContainer;
