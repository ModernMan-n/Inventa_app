import { useState } from "react";

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
        await fetch("/api/labels", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: form.title,
            inventoryNo: form.inventoryNo,
            barcodeBase64: form.barcodeBase64 || null,
          }),
        });
      } else if (model === "User") {
        await fetch("/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: form.email,
            password: form.password,
            name: form.name,
          }),
        });
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
