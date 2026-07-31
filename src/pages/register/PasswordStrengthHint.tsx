import { Check, X } from "lucide-react";

interface Requirement {
  label: string;
  met: boolean;
}

function getRequirements(password: string): Requirement[] {
  return [
    { label: "Mínimo 8 caracteres", met: password.length >= 8 },
    { label: "Al menos una mayúscula", met: /[A-Z]/.test(password) },
    { label: "Al menos un número", met: /[0-9]/.test(password) },
    {
      label: "Al menos un símbolo (!@#$%^&*...)",
      met: /[^A-Za-z0-9]/.test(password),
    },
  ];
}

function getStrength(count: number): {
  width: string;
  color: string;
  label: string;
} {
  if (count === 0) return { width: "0%", color: "transparent", label: "" };
  if (count === 1) return { width: "25%", color: "#ef4444", label: "Débil" };
  if (count === 2) return { width: "50%", color: "#f97316", label: "Media" };
  if (count === 3) return { width: "75%", color: "#d4b200", label: "Fuerte" };
  return { width: "100%", color: "#22c55e", label: "Muy fuerte" };
}

interface Props {
  value: string;
}

function PasswordStrengthHint({ value }: Props) {
  const reqs = getRequirements(value);
  const metCount = reqs.filter((r) => r.met).length;
  const strength = getStrength(metCount);

  return (
    <>
      <div className="pwd-strength">
        <div className="pwd-strength__bar-track">
          <div
            className="pwd-strength__bar-fill"
            style={{ width: strength.width, backgroundColor: strength.color }}
          />
        </div>
        {strength.label && (
          <span
            className="pwd-strength__label"
            style={{ color: strength.color }}
          >
            {strength.label}
          </span>
        )}
      </div>
      <div className="pwd-requirements">
        {reqs.map((req) => (
          <div
            key={req.label}
            className={`pwd-req${req.met ? " pwd-req--met" : ""}`}
          >
            <span className="pwd-req__icon">
              {req.met ? <Check size={12} /> : <X size={12} />}
            </span>
            {req.label}
          </div>
        ))}
      </div>
    </>
  );
}

export default PasswordStrengthHint;
