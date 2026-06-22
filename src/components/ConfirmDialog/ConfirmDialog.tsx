import React, { useEffect } from "react";
import { Trash2, AlertTriangle, Info } from "lucide-react";
import Button from "../Button/Button";
import "./ConfirmDialog.css";

export interface ConfirmDialogProps {
  readonly open: boolean;
  readonly title: string;
  readonly message: string;
  readonly confirmLabel?: string;
  readonly cancelLabel?: string;
  readonly variant?: "danger" | "warning" | "info";
  readonly loading?: boolean;
  readonly onConfirm: () => void;
  readonly onCancel: () => void;
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
      onKeyDown={(e) => e.key === "Enter" && onCancel()}
      role="presentation"
    >
      <dialog
        className={`confirm-dialog confirm-dialog--${variant}`}
        aria-labelledby={titleId}
        open
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
      </dialog>
    </div>
  );
}
