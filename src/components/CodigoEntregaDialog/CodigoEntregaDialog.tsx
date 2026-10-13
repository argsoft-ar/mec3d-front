import { KeyRound } from "lucide-react";
import ConfirmDialog from "../ConfirmDialog/ConfirmDialog";
import type { PasoCodigoEntrega } from "../../hooks/useCodigoEntrega";
import "./CodigoEntregaDialog.css";

interface CodigoEntregaDialogProps {
  readonly paso: PasoCodigoEntrega;
  readonly codigo: string | null;
  readonly loading: boolean;
  readonly onGenerar: () => void;
  readonly onCerrar: () => void;
}

function CodigoEntregaDialog({
  paso,
  codigo,
  loading,
  onGenerar,
  onCerrar,
}: CodigoEntregaDialogProps) {
  if (paso === "codigo") {
    return (
      <ConfirmDialog
        open
        title="Código de entrega"
        message="Dáselo al fabricante solo cuando hayas recibido la pieza. Se muestra una sola vez: si lo perdés, generá uno nuevo."
        confirmLabel="Listo"
        variant="info"
        onConfirm={onCerrar}
        onCancel={onCerrar}
      >
        <div className="codigo-entrega__display">
          <KeyRound size={16} strokeWidth={2} />
          <span>{codigo ?? "—"}</span>
        </div>
      </ConfirmDialog>
    );
  }

  return (
    <ConfirmDialog
      open={paso === "aviso"}
      title="Generar código de entrega"
      message="Al generar un código nuevo, el anterior deja de funcionar y se reinician los intentos del fabricante."
      confirmLabel="Generar código"
      variant="warning"
      loading={loading}
      onConfirm={onGenerar}
      onCancel={onCerrar}
    />
  );
}

export default CodigoEntregaDialog;
