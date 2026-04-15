import "../styles/layout.css";
import { NavLink } from "react-router-dom";
export default function Sidebar() {
  return (
    <div className="sidebar">
      <h2 className="logo">Workasana</h2>

      <nav className="menu">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            isActive ? "menu-item active" : "menu-item"
          }
        >
          Dashboard
        </NavLink>
        <NavLink
          to="/projects"
          className={({ isActive }) =>
            isActive ? "menu-item active" : "menu-item"
          }
        >
          Projects
        </NavLink>
        <NavLink
          to="/teams"
          className={({ isActive }) =>
            isActive ? "menu-item active" : "menu-item"
          }
        >
          Teams
        </NavLink>
        <NavLink
          to="/reports"
          className={({ isActive }) =>
            isActive ? "menu-item active" : "menu-item"
          }
        >
          Reports
        </NavLink>
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            isActive ? "menu-item active" : "menu-item"
          }
        >
          Settings
        </NavLink>
      </nav>
    </div>
  );
}
