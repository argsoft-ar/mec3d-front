import { useState } from "react";
import { Copy, Check, AlertTriangle } from "lucide-react";
import type { EscrowTokenRevealProps } from "./EscrowTokenReveal.types";
import "./EscrowTokenReveal.css";

const EscrowTokenReveal = ({
  token,
  onCopied,
  className = "",
}: EscrowTokenRevealProps) => {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(token);
    setCopied(true);
    onCopied?.();
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className={`escrow-token-reveal ${className}`.trim()}>
      <div className="escrow-token-reveal__warning">
        <AlertTriangle size={18} strokeWidth={2} />
        <span>
          Guardá este código: es tu comprobante de entrega y no volverá a
          mostrarse.
        </span>
      </div>
      <div className="escrow-token-reveal__token-row">
        <code className="escrow-token-reveal__token">{token}</code>
        <button
          type="button"
          className="escrow-token-reveal__copy-btn"
          onClick={handleCopy}
          aria-label="Copiar código"
        >
          {copied ? (
            <Check size={16} strokeWidth={2} />
          ) : (
            <Copy size={16} strokeWidth={2} />
          )}
          {copied ? "Copiado" : "Copiar"}
        </button>
      </div>
    </div>
  );
};

export default EscrowTokenReveal;
