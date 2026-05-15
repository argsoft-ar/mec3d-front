import React, { useEffect } from "react";
import { Trash2, AlertTriangle, Info } from "lucide-react";
import Button from "../Button/Button";
import "./ConfirmDialog.css";

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "info";
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const variantIcon: Record<
  NonNullable<ConfirmDialogProps["variant"]>,
  React.ReactNode
> = {
  danger: <Trash2 size={28} />,
  warning: <AlertTriangle size={28} />,
  info: <Info size={28} />,
};

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  variant = "info",
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onCancel]);

  if (!open) return null;

  const titleId = "confirm-dialog-title";

  return (
    <div
      className="confirm-dialog-overlay"
      onClick={onCancel}
      aria-hidden="true"
    >
      <div
        className={`confirm-dialog confirm-dialog--${variant}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="confirm-dialog__icon">{variantIcon[variant]}</div>
        <h2 id={titleId} className="confirm-dialog__title">
          {title}
        </h2>
        <p className="confirm-dialog__message">{message}</p>
        <div className="confirm-dialog__actions">
          <Button
            title={cancelLabel}
            variant="primary"
            onClick={onCancel}
            disabled={loading}
          />
          <Button
            title={confirmLabel}
            variant={variant === "danger" ? "danger" : "primary"}
            onClick={onConfirm}
            loading={loading}
            disabled={loading}
          />
        </div>
      </div>
    </div>
  );
}
