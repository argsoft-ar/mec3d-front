import React from "react";
import "./Header.css";

interface HeaderProps {
  /** Main title text (plain part) */
  title: string;
  /** Highlighted text appended after title (uses --color-primary) */
  accentText?: string;
  /** Paragraph below the title */
  subtitle?: string;
  /** Optional action buttons row */
  actions?: React.ReactNode;
}

const Header = ({ title, accentText, subtitle, actions }: HeaderProps) => (
  <section className="page-header">
    <h1 className="page-header__title">
      {title}
      {accentText && (
        <>
          {" "}
          <span className="page-header__accent">{accentText}</span>
        </>
      )}
    </h1>
    {subtitle && <p className="page-header__subtitle">{subtitle}</p>}
    {actions && <div className="page-header__actions">{actions}</div>}
  </section>
);

export default Header;
