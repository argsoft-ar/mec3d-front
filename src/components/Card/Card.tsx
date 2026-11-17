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
  disableHover?: boolean;
  bodyClassName?: string;
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
  disableHover = false,
  bodyClassName,
}: Readonly<CardProps>) {
  const isClickable = typeof onClick === "function";
  const Root = isClickable ? "button" : "div";

  return (
    <Root
      type={isClickable ? "button" : undefined}
      className={`card card--${variant}${isClickable ? " card--clickable" : ""}${disableHover ? " card--no-hover" : ""} ${className}`.trim()}
      onClick={onClick}
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
          {list.map((item) => (
            <li key={item} className="card__list-item">
              {item}
            </li>
          ))}
        </ul>
      )}

      {children && (
        <div
          className={["card__body", bodyClassName].filter(Boolean).join(" ")}
        >
          {children}
        </div>
      )}

      {footer && <div className="card__footer">{footer}</div>}
    </Root>
  );
}

export default Card;
