import type React from "react";
import ConfirmDialog from "../ConfirmDialog/ConfirmDialog";
import FormField from "../Form/FormField";
import "./MotivoDialog.css";

interface MotivoDialogProps {
  readonly open: boolean;
  readonly title: string;
  readonly message: string;
  readonly fieldLabel: string;
  readonly value: string;
  readonly onChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => void;
  readonly maxLength: number;
  readonly fieldName?: string;
  readonly placeholder?: string;
  readonly error?: string;
  readonly confirmLabel?: string;
  readonly cancelLabel?: string;
  readonly variant?: "danger" | "warning" | "info";
  readonly loading?: boolean;
  readonly confirmDisabled?: boolean;
  /** Campos extra (p. ej. un select) que se muestran sobre el texto libre. */
  readonly children?: React.ReactNode;
  readonly onConfirm: () => void;
  readonly onCancel: () => void;
}

function MotivoDialog({
  open,
  title,
  message,
  fieldLabel,
  value,
  onChange,
  maxLength,
  fieldName = "motivo",
  placeholder,
  error,
  confirmLabel,
  cancelLabel,
  variant = "warning",
  loading,
  confirmDisabled,
  children,
  onConfirm,
  onCancel,
}: MotivoDialogProps) {
  return (
    <ConfirmDialog
      open={open}
      title={title}
      message={message}
      confirmLabel={confirmLabel}
      cancelLabel={cancelLabel}
      variant={variant}
      loading={loading}
      confirmDisabled={confirmDisabled}
      onConfirm={onConfirm}
      onCancel={onCancel}
    >
      <div className="motivo-dialog__fields">
        {children}
        <FormField
          label={fieldLabel}
          name={fieldName}
          type="textarea"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          maxLength={maxLength}
          error={error}
          required
          fullWidth
          hint={
            <span className="motivo-dialog__counter">
              {value.length}/{maxLength}
            </span>
          }
        />
      </div>
    </ConfirmDialog>
  );
}

export default MotivoDialog;
