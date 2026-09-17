export interface EscrowTokenRevealProps {
  /** Plaintext escrow token, shown once and never recoverable afterwards */
  token: string;
  /** Called after a successful clipboard copy */
  onCopied?: () => void;
  className?: string;
}
