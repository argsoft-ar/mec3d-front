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
  /** Small label rendered above the title */
  eyebrow?: string;
  /** Row rendered below title/subtitle and before actions */
  meta?: React.ReactNode;
  /** Where actions render: below the content, or to its right (stacks below on mobile) */
  actionsPlacement?: "below" | "end";
}

const Header = ({
  title,
  accentText,
  subtitle,
  actions,
  eyebrow,
  meta,
  actionsPlacement = "below",
}: HeaderProps) => {
  const content = (
    <>
      {eyebrow && <p className="page-header__eyebrow">{eyebrow}</p>}
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
      {meta && <div className="page-header__meta">{meta}</div>}
    </>
  );
  const actionsNode = actions && (
    <div className="page-header__actions">{actions}</div>
  );

  if (actionsPlacement === "end") {
    return (
      <section className="page-header page-header--actions-end">
        <div className="page-header__content">{content}</div>
        {actionsNode}
      </section>
    );
  }

  return (
    <section className="page-header">
      {content}
      {actionsNode}
    </section>
  );
};

export default Header;
