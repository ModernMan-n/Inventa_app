import { useEffect, useState } from "react";

export default function ModelList({ model }: { model: string }) {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      try {
        if (model === "Label") {
          const res = await fetch("/api/labels");
          const data = await res.json();
          setItems(data);
        } else if (model === "User") {
          // no endpoint for listing users for now — show example
          setItems([]);
        }
      } catch (e) {
        console.error(e);
      }
    }
    load();
  }, [model]);

  async function handleDelete(id: number) {
    if (!confirm("Delete?")) return;
    await fetch(`/api/labels/${id}`, { method: "DELETE" });
    setItems((s) => s.filter((i) => i.id !== id));
  }

  return (
    <div>
      <h3>Список {model}</h3>
      {items.length === 0 ? (
        <div>Нет записей</div>
      ) : (
        <div className="paper-setup">
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Title / Email</th>
                <th>Inventory</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it: any) => (
                <tr key={it.id} style={{ borderTop: "1px solid #eee" }}>
                  <td>{it.id}</td>
                  <td>{it.title ?? it.email}</td>
                  <td>{it.inventoryNo ?? "-"}</td>
                  <td>
                    {model === "Label" && (
                      <button
                        className="btn secondary"
                        onClick={() => handleDelete(it.id)}
                      >
                        Удалить
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
