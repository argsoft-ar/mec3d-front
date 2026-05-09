import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import type { NavLink } from "../../types";
import "./Navbar.css";

interface NavbarProps {
  links: NavLink[];
}

function Navbar({ links }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => setMenuOpen((prev) => !prev);
  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="navbar">
      <div className="navbar__inner">
        <Link to="/" className="navbar__brand" onClick={closeMenu}>
          <span className="navbar__logo">MEC3D</span>
        </Link>

        <button
          className={`navbar__hamburger${menuOpen ? " navbar__hamburger--open" : ""}`}
          onClick={toggleMenu}
          aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={menuOpen}
        >
          <span className="navbar__hamburger-bar" />
          <span className="navbar__hamburger-bar" />
          <span className="navbar__hamburger-bar" />
        </button>

        <nav
          className={`navbar__nav${menuOpen ? " navbar__nav--open" : ""}`}
          aria-label="Navegación principal"
        >
          <ul className="navbar__list">
            {links.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <li key={link.path} className="navbar__item">
                  <Link
                    to={link.path}
                    className={`navbar__link${isActive ? " navbar__link--active" : ""}`}
                    onClick={closeMenu}
                  >
                    {link.icon && (
                      <span className="navbar__link-icon">{link.icon}</span>
                    )}
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
