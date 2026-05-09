import type React from "react";
import type { CardVariant } from "../../types";
import "./Card.css";

interface CardProps {
  title?: string;
  icon?: React.ReactNode;
  text?: string;
  list?: string[];
  footer?: React.ReactNode;
  children?: React.ReactNode;
  variant?: CardVariant;
  className?: string;
  onClick?: () => void;
}

function Card({
  title,
  icon,
  text,
  list,
  footer,
  children,
  variant = "default",
  className = "",
  onClick,
}: CardProps) {
  const isClickable = typeof onClick === "function";

  return (
    <div
      className={`card card--${variant}${isClickable ? " card--clickable" : ""} ${className}`.trim()}
      onClick={onClick}
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={
        isClickable
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") onClick();
            }
          : undefined
      }
    >
      {(icon || title) && (
        <div className="card__header">
          {icon && <span className="card__icon">{icon}</span>}
          {title && <h3 className="card__title">{title}</h3>}
        </div>
      )}

      {text && <p className="card__text">{text}</p>}

      {list && list.length > 0 && (
        <ul className="card__list">
          {list.map((item, index) => (
            <li key={index} className="card__list-item">
              {item}
            </li>
          ))}
        </ul>
      )}

      {children && <div className="card__body">{children}</div>}

      {footer && <div className="card__footer">{footer}</div>}
    </div>
  );
}

export default Card;
