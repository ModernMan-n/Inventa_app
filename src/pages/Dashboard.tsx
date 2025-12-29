import { useState } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import "./Dashboard.css";

export default function Dashboard() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="dashboard-root">
      <Header />

      <div className="dashboard-layout">
        <Sidebar />

        <main className="dashboard-main">
          <h1>Дэшборд</h1>
          <p>Быстрые формы для создания документов и ключевой обзор.</p>

          <section className="quick-forms">
            <div className="form-card">
              <h3>Создать накладную</h3>
              <form>
                <input placeholder="Номер" />
                <input placeholder="Клиент" />
                <button className="btn primary" type="button">
                  Создать
                </button>
              </form>
            </div>

            <div className="form-card">
              <h3>Создать метку</h3>
              <form>
                <input placeholder="Название" />
                <button className="btn primary" type="button">
                  Создать
                </button>
              </form>
            </div>

            <div className="form-card">
              <h3>Быстрый экспорт</h3>
              <button className="btn secondary" type="button">
                Экспортировать
              </button>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
