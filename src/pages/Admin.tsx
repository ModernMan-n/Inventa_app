import { useCallback, useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import ModelForm from "../components/ModelForm";
import ModelCreator from "../components/ModelCreator";
import CustomSelect from "../components/CustomSelect";
import "./Admin.css";
import "./Dashboard.css";
import {
  authFetch,
  fetchMe,
  getStoredUser,
  getToken,
  type AuthUser,
} from "../utils/auth";

const BASE_MODELS = ["Label", "User"];

export default function Admin() {
  const [model, setModel] = useState<string>("Label");
  const [models, setModels] = useState<string[]>(BASE_MODELS);
  const [modelsLoading, setModelsLoading] = useState(false);
  const [modelsError, setModelsError] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(() => getStoredUser());
  const [checking, setChecking] = useState(true);
  const refreshModels = useCallback(async (preferred?: string) => {
    setModelsLoading(true);
    setModelsError(null);
    try {
      const res = await authFetch("/api/models");
      if (!res.ok) throw new Error("Не удалось загрузить список моделей");
      const data = await res.json();
      const raw = Array.isArray(data) ? data : [];
      const dynamic = raw
        .map((name) => String(name))
        .filter((name) => name.startsWith("dyn_"))
        .map((name) => name.slice(4))
        .filter((name) => name.length > 0 && !BASE_MODELS.includes(name));
      const next = [...new Set([...BASE_MODELS, ...dynamic])];
      setModels(next);
      setModel((current) => {
        if (preferred && next.includes(preferred)) return preferred;
        return next.includes(current) ? current : next[0];
      });
    } catch (err) {
      setModels(BASE_MODELS);
      setModelsError("Не удалось загрузить модели");
    } finally {
      setModelsLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    const token = getToken();
    if (!token) {
      setChecking(false);
      return;
    }
    fetchMe(token)
      .then((u) => {
        if (!mounted) return;
        setUser(u);
        setChecking(false);
      })
      .catch(() => {
        if (mounted) setChecking(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!user) return;
    refreshModels();
  }, [user, refreshModels]);

  if (checking) {
    return (
      <div className="app-root">
        <Header />
        <main className="hero">
          <section className="hero-content">
            <div className="hero-text">
              <h1>Проверка доступа...</h1>
            </div>
          </section>
        </main>
      </div>
    );
  }

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

            <div className="admin-model-select">
              <span className="admin-model-label">Модель</span>
              <CustomSelect
                label="Модель"
                value={model}
                options={models}
                onChange={(v) => setModel(v)}
              />
              {modelsLoading && (
                <div className="status-text">Загрузка моделей...</div>
              )}
              {modelsError && <div className="status-text">{modelsError}</div>}
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
                <ModelCreator
                  onCreated={(tableName) => {
                    const preferred = tableName.startsWith("dyn_")
                      ? tableName.slice(4)
                      : tableName;
                    refreshModels(preferred);
                  }}
                />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
