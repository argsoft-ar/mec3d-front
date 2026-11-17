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
}: Readonly<BadgeProps>) {
  if (count <= 0) return null;

  const display = count > max ? `${max}+` : String(count);

  return (
    <output
      className={`badge badge--${variant} ${className}`.trim()}
      aria-label={ariaLabel ?? display}
      title={ariaLabel}
    >
      {display}
    </output>
  );
}

export default Badge;
