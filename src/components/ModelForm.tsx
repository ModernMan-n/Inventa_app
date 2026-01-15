import { useState } from "react";
import { authFetch } from "../utils/auth";

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

  function field(name: string) {
    return (
      <div style={{ marginBottom: 8 }}>
        <label style={{ display: "block", fontSize: 12 }}>{name}</label>
        <input
          value={form[name] ?? ""}
          onChange={(e) => setForm({ ...form, [name]: e.target.value })}
        />
      </div>
    );
  }

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
      <button type="submit" className="btn primary">
        Добавить
      </button>
    </form>
  );
}
