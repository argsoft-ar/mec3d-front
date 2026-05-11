import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import "./Breadcrumb.css";

export interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="breadcrumb" aria-label="Navegación">
      <ol className="breadcrumb__list">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={index} className="breadcrumb__item">
              {!isLast && item.path ? (
                <Link className="breadcrumb__link" to={item.path}>
                  {item.label}
                </Link>
              ) : (
                <span
                  className="breadcrumb__current"
                  aria-current={isLast ? "page" : undefined}
                >
                  {item.label}
                </span>
              )}
              {!isLast && (
                <span className="breadcrumb__separator" aria-hidden="true">
                  <ChevronRight size={14} strokeWidth={1.5} />
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default Breadcrumb;
