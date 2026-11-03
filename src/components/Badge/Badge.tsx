import "./Badge.css";

interface BadgeProps {
  count: number;
  max?: number;
  ariaLabel?: string;
  variant?: "primary" | "danger";
  className?: string;
}

function Badge({
  count,
  max = 99,
  ariaLabel,
  variant = "danger",
  className = "",
}: BadgeProps) {
  if (count <= 0) return null;

  const display = count > max ? `${max}+` : String(count);

  return (
    <span
      className={`badge badge--${variant} ${className}`.trim()}
      aria-label={ariaLabel ?? display}
      title={ariaLabel}
      role="status"
    >
      {display}
    </span>
  );
}

export default Badge;
