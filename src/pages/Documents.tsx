import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import { NavLink } from "react-router-dom";
import "./Dashboard.css";

export default function Documents() {
  return (
    <div className="dashboard-root">
      <Header />

      <div className="dashboard-layout">
        <Sidebar />

        <main className="dashboard-main">
          <div className="hero-text">
            <p className="eyebrow">Документы</p>
            <h1 className="hero-title">Справочник страниц</h1>
            <p className="hero-subtitle">
              Секции с быстрым доступом к страницам.
            </p>

            <section className="docs-section">
              <h2 className="section-title">Кадры</h2>
              <ul>
                <li>
                  <NavLink to="/dashboard/docs/mvl" className="link-btn">
                    Материально ответственные лица
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/dashboard/docs/employees" className="link-btn">
                    Сотрудники
                  </NavLink>
                </li>
              </ul>
            </section>

            <section className="docs-section">
              <h2 className="section-title">Склады</h2>
              <ul>
                <li>
                  <NavLink
                    to="/dashboard/docs/organization"
                    className="link-btn"
                  >
                    Организация
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/dashboard/docs/centers" className="link-btn">
                    Центры материальной ответственности
                  </NavLink>
                </li>
              </ul>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
