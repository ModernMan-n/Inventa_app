import { useState } from "react";
import { NavLink } from "react-router-dom";
import "../pages/Dashboard.css";

export default function Sidebar({ className }: { className?: string }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`sidebar ${collapsed ? "collapsed" : ""} ${className || ""}`}
    >
      <button className="collapse-btn" onClick={() => setCollapsed((s) => !s)}>
        {collapsed ? ">" : "<"}
      </button>
      <nav className="sidebar-nav">
        <NavLink
          to="/dashboard"
          end
          className={({ isActive }) =>
            isActive ? "side-link active" : "side-link"
          }
        >
          Главная
        </NavLink>
        <NavLink
          to="/dashboard/docs"
          className={({ isActive }) =>
            isActive ? "side-link active" : "side-link"
          }
        >
          Документы
        </NavLink>
        <NavLink
          to="/admin"
          className={({ isActive }) =>
            isActive ? "side-link active" : "side-link"
          }
        >
          Админ
        </NavLink>
        <NavLink
          to="/app"
          className={({ isActive }) =>
            isActive ? "nav-link active" : "nav-link"
          }
        >
          Генерация Штрихкода
        </NavLink>
      </nav>
    </aside>
  );
}
