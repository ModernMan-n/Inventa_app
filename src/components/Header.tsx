import { NavLink } from "react-router-dom";
import "./Header.css";
import { useState } from "react";
import Login from "../pages/Login";
import Register from "../pages/Register";

export default function Menu() {
  const [isFontModalOpen, setIsFontModalOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  return (
    <header className="app-header">
      <div className="logo">
        <span className="logo-mark">И</span>
        <span className="logo-text">Инвента</span>
      </div>
      <nav className="nav">
        <NavLink
          to="/"
          className={({ isActive }) =>
            isActive ? "nav-link active" : "nav-link"
          }
          end
        >
          Главная
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
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <button
          className="btn secondary blue"
          onClick={() => setShowLogin(true)}
        >
          Войти
        </button>
        <button className="btn secondary" onClick={() => setShowRegister(true)}>
          Регистрация
        </button>
        <button className="btn secondary">
          <img src="src/icons/message.svg" alt="Связаться" />
        </button>
      </div>
      {/* Страницы авторизации */}
      {showLogin && (
        <div className="modal-backdrop" onClick={() => setShowLogin(false)}>
          <Login onClose={() => setShowLogin(false)} />
        </div>
      )}

      {showRegister && (
        <div className="modal-backdrop" onClick={() => setShowRegister(false)}>
          <Register onClose={() => setShowRegister(false)} />
        </div>
      )}
    </header>
  );
}
