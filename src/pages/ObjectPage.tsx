import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./ObjectPage.css";

type Obj = {
  id: string;
  name: string;
  inventory: string;
  owner: string | null;
};

function loadObjects(): Record<string, Obj> {
  const raw =
    typeof window !== "undefined" ? localStorage.getItem("objects") : null;
  try {
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

function saveObjects(map: Record<string, Obj>) {
  localStorage.setItem("objects", JSON.stringify(map));
}

export default function ObjectPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<{ username: string } | null>(null);
  const [obj, setObj] = useState<Obj | null>(null);

  useEffect(() => {
    const raw =
      typeof window !== "undefined" ? localStorage.getItem("user") : null;
    if (raw) {
      try {
        setUser(JSON.parse(raw));
      } catch (e) {
        setUser(null);
      }
    }
  }, []);

  useEffect(() => {
    if (!id) return;
    const objs = loadObjects();
    if (objs[id]) {
      setObj(objs[id]);
    } else {
      const newObj: Obj = {
        id,
        name: `Объект ${id}`,
        inventory: `INV-${id}`,
        owner: null,
      };
      objs[id] = newObj;
      saveObjects(objs);
      setObj(newObj);
    }
  }, [id]);

  if (!id) return <div className="object-page">Неверная ссылка</div>;

  const ensureAuth = () => {
    if (!user) {
      alert("Только авторизованные пользователи могут управлять объектами");
      return false;
    }
    return true;
  };

  const handleEdit = () => {
    if (!ensureAuth()) return;
    const name = prompt("Название объекта", obj?.name || "");
    if (name == null) return;
    const map = loadObjects();
    map[id].name = name;
    saveObjects(map);
    setObj({ ...map[id] });
  };

  const handleAssign = () => {
    if (!ensureAuth()) return;
    const owner = prompt("Владелец (кому принадлежит)", obj?.owner || "");
    if (owner == null) return;
    const map = loadObjects();
    map[id].owner = owner;
    saveObjects(map);
    setObj({ ...map[id] });
  };

  const handleDecommission = () => {
    if (!ensureAuth()) return;
    if (!confirm("Отправить объект на списание?")) return;
    const map = loadObjects();
    delete map[id];
    saveObjects(map);
    navigate("/dashboard");
  };

  return (
    <div className="object-page">
      <div className="object-card">
        <h2 className="object-title">{obj?.name ?? "—"}</h2>
        <div className="object-row">
          <strong>Инвентарный номер:</strong>
          <span>{obj?.inventory ?? "—"}</span>
        </div>
        <div className="object-row">
          <strong>Владелец:</strong>
          <span>{obj?.owner ?? "Не назначен"}</span>
        </div>

        <div className="object-actions">
          <button className="btn primary" onClick={handleEdit} disabled={!user}>
            Редактировать
          </button>
          <button
            className="btn secondary"
            onClick={handleAssign}
            disabled={!user}
          >
            Назначить/Передать
          </button>
          <button
            className="btn secondary"
            onClick={() => alert("История пока недоступна")}
          >
            История
          </button>
          <button
            className="btn danger"
            onClick={handleDecommission}
            disabled={!user}
          >
            Списать
          </button>
        </div>

        {!user && (
          <div className="object-note">
            Для управления объектом войдите в систему.
          </div>
        )}
      </div>
    </div>
  );
}
