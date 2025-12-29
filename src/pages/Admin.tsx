import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import ModelList from "../components/ModelList";
import ModelForm from "../components/ModelForm";
import ModelCreator from "../components/ModelCreator";
import "./Admin.css";
import "./Dashboard.css";

type ModelName = "User" | "Label";

export default function Admin() {
  const [model, setModel] = useState<ModelName>("Label");
  const rawUser =
    typeof window !== "undefined" ? localStorage.getItem("user") : null;
  const user = rawUser ? JSON.parse(rawUser) : null;

  if (!user) {
    return (
      <div className="app-root">
        <Header />
        <main className="hero">
          <section className="hero-content">
            <div className="hero-text">
              <h1>Вы не авторизованы</h1>
              <p>
                Доступ к этой странице возможен только для авторизованных
                пользователей.
              </p>
            </div>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-root">
      <Header />

      <div className="dashboard-layout">
        <Sidebar />

        <main className="dashboard-main">
          <div className="hero-text">
            <p className="eyebrow">Панель администратора</p>
            <h1 className="hero-title">Управление данными</h1>
            <p className="hero-subtitle">
              Добавляйте записи вручную, редактируйте и удаляйте. Выберите
              модель слева.
            </p>

            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <button
                className={`btn ${model === "Label" ? "primary" : "secondary"}`}
                onClick={() => setModel("Label")}
              >
                Label
              </button>
              <button
                className={`btn ${model === "User" ? "primary" : "secondary"}`}
                onClick={() => setModel("User")}
              >
                User
              </button>
            </div>

            <div style={{ marginTop: 18 }}>
              <ModelForm
                model={model}
                onCreated={() => {
                  /* ModelList will refresh itself */
                }}
              />
              <div style={{ marginTop: 18 }}>
                <h3 style={{ marginTop: 0 }}>Создать новую модель</h3>
                <ModelCreator />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
