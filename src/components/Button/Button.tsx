import type React from "react";
import type { ButtonVariant, ButtonSize } from "../../types";
import "./Button.css";

interface ButtonProps {
  title?: string;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  onClick?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  type?: "button" | "submit" | "reset";
  className?: string;
}

function Button({
  title,
  icon,
  iconPosition = "left",
  onClick,
  variant = "primary",
  size = "md",
  fullWidth = false,
  disabled = false,
  loading = false,
  type = "button",
  className = "",
}: ButtonProps) {
  const classes = [
    "btn",
    `btn--${variant}`,
    `btn--${size}`,
    fullWidth ? "btn--full" : "",
    loading ? "btn--loading" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading && <span className="btn__spinner" aria-hidden="true" />}
      {!loading && icon && iconPosition === "left" && (
        <span className="btn__icon btn__icon--left">{icon}</span>
      )}
      {title && <span className="btn__label">{title}</span>}
      {!loading && icon && iconPosition === "right" && (
        <span className="btn__icon btn__icon--right">{icon}</span>
      )}
    </button>
  );
}

export default Button;
