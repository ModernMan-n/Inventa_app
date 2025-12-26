import { useState } from "react";
import Header from "../components/Header";
import ModelList from "../components/ModelList";
import ModelForm from "../components/ModelForm";
import "./Admin.css";

type ModelName = "User" | "Label";

export default function Admin() {
  const [model, setModel] = useState<ModelName>("Label");

  function ModelCreator() {
    const [name, setName] = useState("");
    const [cols, setCols] = useState("title:text,inventoryNo:text");
    const [status, setStatus] = useState<string | null>(null);

    async function create(e: any) {
      e.preventDefault();
      setStatus(null);
      try {
        const columns = cols.split(",").map((p) => {
          const [n, t] = p.split(":").map((s) => s.trim());
          return { name: n, type: t || "text" };
        });
        const res = await fetch("/api/models", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, columns }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || JSON.stringify(json));
        setStatus("Created " + json.table);
        setName("");
        // reload models list UI
        setTimeout(() => location.reload(), 400);
      } catch (err: any) {
        setStatus(String(err.message || err));
      }
    }

    return (
      <form onSubmit={create} className="paper-setup">
        <label>Имя модели (без префикса)</label>
        <input value={name} onChange={(e) => setName(e.target.value)} />
        <label>Колонки (пример: title:text,inventoryNo:text)</label>
        <input value={cols} onChange={(e) => setCols(e.target.value)} />
        <div style={{ marginTop: 8 }}>
          <button type="submit" className="btn primary">
            Создать таблицу
          </button>
        </div>
        {status && <div style={{ marginTop: 8 }}>{status}</div>}
      </form>
    );
  }

  return (
    <div className="app-root">
      <Header />

      <main className="hero">
        <section className="hero-content">
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

          <div className="hero-visual">
            <div className="hero-card">
              <p className="hero-card-title">Список {model}</p>
              <ModelList model={model} />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
