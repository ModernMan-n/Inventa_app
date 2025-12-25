import { NavLink } from "react-router-dom";
import "./Header.css";
import { useState, useRef, useEffect } from "react";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Modal from "./Modal";

export default function Menu() {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [openMobile, setOpenMobile] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (
        openMobile &&
        menuRef.current &&
        !menuRef.current.contains(e.target as Node)
      ) {
        setOpenMobile(false);
      }
    };
    document.addEventListener("click", handle);
    return () => document.removeEventListener("click", handle);
  }, [openMobile]);
  return (
    <header className="app-header">
      <div className="logo">
        <span className="logo-mark">И</span>
        <span className="logo-text">Инвента</span>
      </div>
      <div className="menu-container" ref={menuRef}>
        <button
          className="menu-toggle"
          aria-expanded={openMobile}
          onClick={() => setOpenMobile((s) => !s)}
        >
          <span className="hamburger" />
        </button>

        <nav className={`nav ${openMobile ? "open" : ""}`}>
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
          <div className="common-btn">
            <button
              className="btn secondary blue"
              onClick={() => setShowLogin(true)}
            >
              Войти
            </button>
            <button
              className="btn secondary"
              onClick={() => setShowRegister(true)}
            >
              Регистрация
            </button>
            <button className="btn secondary">
              <img src="src/icons/message.svg" alt="Связаться" />
            </button>
          </div>
        </nav>
      </div>
      {/* Страницы авторизации */}
      <Modal open={showLogin} onClose={() => setShowLogin(false)}>
        <Login onClose={() => setShowLogin(false)} />
      </Modal>

      <Modal open={showRegister} onClose={() => setShowRegister(false)}>
        <Register onClose={() => setShowRegister(false)} />
      </Modal>
    </header>
  );
}
