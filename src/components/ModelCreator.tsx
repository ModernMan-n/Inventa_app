import { useState } from "react";

export default function ModelCreator() {
  const [name, setName] = useState("");
  const [columns, setColumns] = useState<Array<{ name: string; type: string }>>(
    [
      { name: "title", type: "text" },
      { name: "inventoryNo", type: "text" },
    ]
  );
  const [status, setStatus] = useState<string | null>(null);

  function updateColumn(idx: number, key: "name" | "type", value: string) {
    setColumns((s) =>
      s.map((c, i) => (i === idx ? { ...c, [key]: value } : c))
    );
  }

  function addColumn() {
    setColumns((s) => [...s, { name: "", type: "text" }]);
  }

  function removeColumn(idx: number) {
    setColumns((s) => s.filter((_, i) => i !== idx));
  }

  async function create(e: any) {
    e.preventDefault();
    setStatus(null);
    try {
      if (!name.trim()) throw new Error("Имя модели обязательно");
      const payloadCols = columns
        .map((c) => ({ name: (c.name || "").trim(), type: c.type || "text" }))
        .filter((c) => c.name.length > 0);
      if (payloadCols.length === 0)
        throw new Error("Добавьте хотя бы одну колонку");

      const res = await fetch("/api/models", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), columns: payloadCols }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || JSON.stringify(json));
      setStatus("Создано: " + json.table);
      setName("");
      setColumns([{ name: "title", type: "text" }]);
      setTimeout(() => location.reload(), 400);
    } catch (err: any) {
      setStatus(String(err.message || err));
    }
  }

  return (
    <form onSubmit={create} className="model-creator paper-setup">
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ flex: 1 }}>
          <label style={{ fontWeight: 600, fontSize: 13 }}>Имя модели</label>
          <input
            placeholder="Например: Invoice"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ width: "100%", padding: 8, marginTop: 6 }}
          />
          <div className="font-hint">
            Имя без префикса. Используйте латиницу.
          </div>
        </div>
        <div>
          <button type="button" className="btn secondary" onClick={addColumn}>
            + Добавить колонку
          </button>
        </div>
      </div>

      <div
        style={{
          marginTop: 10,
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        {columns.map((c, idx) => (
          <div
            key={idx}
            style={{ display: "flex", gap: 8, alignItems: "center" }}
          >
            <input
              placeholder="Имя колонки"
              value={c.name}
              onChange={(e) => updateColumn(idx, "name", e.target.value)}
              style={{ padding: 8, flex: 1 }}
            />
            <select
              value={c.type}
              onChange={(e) => updateColumn(idx, "type", e.target.value)}
            >
              <option value="text">text</option>
              <option value="number">number</option>
              <option value="boolean">boolean</option>
              <option value="date">date</option>
            </select>
            <button
              type="button"
              className="btn secondary"
              onClick={() => removeColumn(idx)}
            >
              Удалить
            </button>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
        <button type="submit" className="btn primary">
          Создать таблицу
        </button>
        <button
          type="button"
          className="btn secondary"
          onClick={() => {
            setName("");
            setColumns([{ name: "title", type: "text" }]);
            setStatus(null);
          }}
        >
          Сбросить
        </button>
      </div>
      {status && (
        <div className="status-text" style={{ marginTop: 8 }}>
          {status}
        </div>
      )}
    </form>
  );
}
