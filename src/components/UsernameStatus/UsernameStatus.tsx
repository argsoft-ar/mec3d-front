import { Check, X, Loader2 } from "lucide-react";
import type { UsernameAvailabilityStatus } from "../../hooks/useUsernameAvailability";
import "./UsernameStatus.css";

interface UsernameStatusProps {
  status: UsernameAvailabilityStatus;
}

export default function UsernameStatus({
  status,
}: Readonly<UsernameStatusProps>) {
  if (status === "checking") {
    return (
      <output
        className="username-status username-status--checking"
        aria-label="Comprobando disponibilidad"
      >
        <Loader2 size={16} className="username-status__spinner" />
      </output>
    );
  }
  if (status === "available") {
    return (
      <span className="username-status username-status--available">
        <Check size={16} />
      </span>
    );
  }
  if (status === "taken" || status === "invalid") {
    return (
      <span className="username-status username-status--taken">
        <X size={16} />
      </span>
    );
  }
  return null;
}
