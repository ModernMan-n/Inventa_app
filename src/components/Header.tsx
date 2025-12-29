import { NavLink, useLocation } from "react-router-dom";
import "./Header.css";
import { useState, useRef, useEffect } from "react";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Modal from "./Modal";

export default function Menu() {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [user, setUser] = useState<{ username: string } | null>(null);
  const [openMobile, setOpenMobile] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const location = useLocation();

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
  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (raw) {
      try {
        setUser(JSON.parse(raw));
      } catch (e) {
        setUser(null);
      }
    }
  }, []);
  return (
    <header className="app-header">
      <div className="logo">
        <a href="/" className="logo-link">
          <span className="logo-mark">И</span>
          <span className="logo-text">Инвента</span>
        </a>
      </div>
      {location.pathname.startsWith("/dashboard") ||
      location.pathname.startsWith("/admin") ? null : (
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
            {user && (
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  isActive ? "nav-link active" : "nav-link"
                }
              >
                Дэшборд
              </NavLink>
            )}
            <div className="common-btn">
              {!user ? (
                <>
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
                </>
              ) : (
                <>
                  <span style={{ marginRight: 8 }}>
                    Привет, {user.username}
                  </span>
                  <button
                    className="btn secondary"
                    onClick={() => {
                      localStorage.removeItem("user");
                      setUser(null);
                    }}
                  >
                    Выйти
                  </button>
                </>
              )}
              <button className="btn secondary">
                <img src="src/icons/message.svg" alt="Связаться" />
              </button>
            </div>
          </nav>
        </div>
      )}
      {/* Страницы авторизации */}
      <Modal open={showLogin} onClose={() => setShowLogin(false)}>
        <Login
          onClose={() => setShowLogin(false)}
          onLogin={(u) => {
            setUser(u);
            setShowLogin(false);
          }}
        />
      </Modal>

      <Modal open={showRegister} onClose={() => setShowRegister(false)}>
        <Register onClose={() => setShowRegister(false)} />
      </Modal>
    </header>
  );
}
