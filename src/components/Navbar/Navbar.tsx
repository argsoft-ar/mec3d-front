import { Link, useLocation, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import type { NavLink } from "../../types";
import { authService } from "../../services/auth.service";
import "./Navbar.css";

interface NavbarProps {
  links: NavLink[];
}

function Navbar({ links }: NavbarProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  return (
    <aside className="sidebar">
      <div className="sidebar__top">
        <Link to="/" className="sidebar__brand">
          <span className="sidebar__logo">MEC3D</span>
        </Link>
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
                >
                  {link.icon && (
                    <span className="sidebar__link-icon">{link.icon}</span>
                  )}
                  <span className="sidebar__link-label">{link.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="sidebar__bottom">
        <button className="sidebar__logout" onClick={handleLogout}>
          <LogOut size={18} className="sidebar__logout-icon" />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
}

export default Navbar;
