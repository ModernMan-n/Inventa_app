import { useEffect, useState } from "react";
import { authFetch } from "../utils/auth";

type Column = { name: string; type?: string };

const SYSTEM_COLUMNS = new Set(["id", "created_at", "createdAt"]);

function inputTypeFor(columnType?: string) {
  const t = (columnType || "").toLowerCase();
  if (t.includes("bool")) return "checkbox";
  if (
    t.includes("int") ||
    t.includes("numeric") ||
    t.includes("double") ||
    t.includes("real") ||
    t.includes("decimal")
  )
    return "number";
  if (t.includes("timestamp")) return "datetime-local";
  if (t.includes("date")) return "date";
  return "text";
}

function coerceValue(raw: any, columnType?: string) {
  const t = (columnType || "").toLowerCase();
  if (t.includes("bool")) return Boolean(raw);
  if (
    t.includes("int") ||
    t.includes("numeric") ||
    t.includes("double") ||
    t.includes("real") ||
    t.includes("decimal")
  ) {
    const num = Number(raw);
    return Number.isFinite(num) ? num : undefined;
  }
  return raw;
}

async function readError(res: Response) {
  try {
    const data = (await res.json()) as { error?: string; message?: string };
    return data.error || data.message || res.statusText;
  } catch (e) {
    return res.statusText;
  }
}

export default function ModelForm({
  model,
  onCreated,
}: {
  model: string;
  onCreated?: () => void;
}) {
  const [form, setForm] = useState<any>({});
  const [columns, setColumns] = useState<Column[]>([]);
  const [schemaLoading, setSchemaLoading] = useState(false);
  const [schemaError, setSchemaError] = useState<string | null>(null);
  const isDynamic = model !== "Label" && model !== "User";

  function field(name: string) {
    return (
      <div style={{ marginBottom: 8 }}>
        <label style={{ display: "block", fontSize: 12 }}>{name}</label>
        <input
          value={form[name] ?? ""}
          onChange={(e) =>
            setForm((prev: any) => ({ ...prev, [name]: e.target.value }))
          }
        />
      </div>
    );
  }

  useEffect(() => {
    setForm({});
    if (!isDynamic) {
      setColumns([]);
      setSchemaError(null);
      setSchemaLoading(false);
      return;
    }
    let mounted = true;
    async function loadSchema() {
      setSchemaLoading(true);
      setSchemaError(null);
      try {
        const res = await authFetch(`/api/schema/${model}`);
        if (!res.ok) throw new Error(await readError(res));
        const data = (await res.json()) as { columns?: Column[] };
        const raw = Array.isArray(data.columns) ? data.columns : [];
        const filtered = raw.filter((c) => !SYSTEM_COLUMNS.has(c.name));
        if (mounted) setColumns(filtered);
      } catch (err) {
        if (mounted) {
          setColumns([]);
          setSchemaError("Не удалось загрузить схему");
        }
      } finally {
        if (mounted) setSchemaLoading(false);
      }
    }
    loadSchema();
    return () => {
      mounted = false;
    };
  }, [isDynamic, model]);

  async function handleSubmit(e: any) {
    e.preventDefault();
    try {
      if (model === "Label") {
        const res = await authFetch("/api/labels", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: form.title,
            inventoryNo: form.inventoryNo,
            barcodeBase64: form.barcodeBase64 || null,
          }),
        });
        if (!res.ok) throw new Error(await readError(res));
      } else if (model === "User") {
        const res = await fetch("/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: form.email,
            password: form.password,
            name: form.name,
          }),
        });
        if (!res.ok) throw new Error(await readError(res));
      } else if (isDynamic) {
        const payload: Record<string, unknown> = {};
        columns.forEach((col) => {
          const raw = form[col.name];
          if (raw === "" || raw == null) return;
          const coerced = coerceValue(raw, col.type);
          if (coerced === undefined) return;
          payload[col.name] = coerced;
        });
        if (Object.keys(payload).length === 0) {
          alert("Заполните хотя бы одно поле");
          return;
        }
        const res = await authFetch(`/api/models/${model}/rows`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error(await readError(res));
      }
      setForm({});
      onCreated?.();
      alert("Created");
    } catch (err) {
      console.error(err);
      alert("Error");
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: 12 }}>
      {model === "Label" && (
        <>
          <div className="paper-setup">
            {field("title")}
            {field("inventoryNo")}
            {field("barcodeBase64")}
          </div>
        </>
      )}
      {model === "User" && (
        <>
          <div className="paper-setup">
            {field("email")}
            {field("password")}
            {field("name")}
          </div>
        </>
      )}
      {isDynamic && (
        <div className="paper-setup">
          {schemaLoading && <div>Загрузка полей...</div>}
          {schemaError && <div className="status-text">{schemaError}</div>}
          {!schemaLoading && !schemaError && columns.length === 0 && (
            <div>Нет доступных полей</div>
          )}
          {!schemaLoading &&
            !schemaError &&
            columns.map((col) => {
              const inputType = inputTypeFor(col.type);
              if (inputType === "checkbox") {
                return (
                  <div key={col.name} style={{ marginBottom: 8 }}>
                    <label style={{ display: "flex", gap: 8, fontSize: 12 }}>
                      <input
                        type="checkbox"
                        checked={Boolean(form[col.name])}
                        onChange={(e) =>
                          setForm((prev: any) => ({
                            ...prev,
                            [col.name]: e.target.checked,
                          }))
                        }
                      />
                      {col.name}
                    </label>
                  </div>
                );
              }
              return (
                <div key={col.name} style={{ marginBottom: 8 }}>
                  <label style={{ display: "block", fontSize: 12 }}>
                    {col.name}
                  </label>
                  <input
                    type={inputType}
                    value={form[col.name] ?? ""}
                    onChange={(e) =>
                      setForm((prev: any) => ({
                        ...prev,
                        [col.name]: e.target.value,
                      }))
                    }
                  />
                </div>
              );
            })}
        </div>
      )}
      <button type="submit" className="btn primary">
        Добавить
      </button>
    </form>
  );
}
