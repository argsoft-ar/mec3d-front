import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LogIn, LogOut, Menu, UserPlus, X } from "lucide-react";
import type { NavLink } from "../../types";
import type { LoginLocationState } from "../../interfaces";
import { authService } from "../../services/auth.service";
import Badge from "../Badge/Badge";
import Button from "../Button/Button";
import "./Navbar.css";

interface NavbarProps {
  links: NavLink[];
  isAuthenticated: boolean;
}

function Navbar({ links, isAuthenticated }: NavbarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    authService.logout();
    setIsOpen(false);
    navigate("/login");
  };

  const handleLogin = () => {
    const state: LoginLocationState = {
      from: `${location.pathname}${location.search}${location.hash}`,
    };
    setIsOpen(false);
    navigate("/login", { state });
  };

  const handleRegister = () => {
    setIsOpen(false);
    navigate("/register");
  };

  const closeDrawer = () => setIsOpen(false);

  return (
    <>
      {!isOpen && (
        <button
          className="sidebar__hamburger"
          onClick={() => setIsOpen(true)}
          aria-label="Abrir menú"
        >
          <Menu size={22} />
        </button>
      )}

      {isOpen && (
        <div
          className="sidebar__overlay"
          onClick={closeDrawer}
          aria-hidden="true"
        />
      )}

      <aside className={`sidebar${isOpen ? " sidebar--open" : ""}`}>
        <div className="sidebar__top">
          <Link to="/" className="sidebar__brand" onClick={closeDrawer}>
            <span className="sidebar__logo">MEC3D</span>
          </Link>
          <button
            className="sidebar__close"
            onClick={closeDrawer}
            aria-label="Cerrar menú"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar__nav" aria-label="Navegación principal">
          <ul className="sidebar__list">
            {links.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <li key={link.path} className="sidebar__item">
                  <Link
                    to={link.path}
                    className={`sidebar__link${isActive ? " sidebar__link--active" : ""}`}
                    onClick={closeDrawer}
                  >
                    {link.icon && (
                      <span className="sidebar__link-icon">{link.icon}</span>
                    )}
                    <span className="sidebar__link-label">{link.label}</span>
                    {link.badgeCount !== undefined && (
                      <Badge
                        count={link.badgeCount}
                        className="sidebar__link-badge"
                        ariaLabel={`${link.badgeCount} sin leer`}
                      />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="sidebar__bottom">
          {isAuthenticated ? (
            <button className="sidebar__logout" onClick={handleLogout}>
              <LogOut size={18} className="sidebar__logout-icon" />
              <span>Cerrar sesión</span>
            </button>
          ) : (
            <div className="sidebar__auth-actions">
              <Button
                title="Ingresar"
                icon={<LogIn size={18} />}
                variant="primary"
                fullWidth
                onClick={handleLogin}
              />
              <Button
                title="Registrarse"
                icon={<UserPlus size={18} />}
                variant="outline"
                fullWidth
                onClick={handleRegister}
              />
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

export default Navbar;
