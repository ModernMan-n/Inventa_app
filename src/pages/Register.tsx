import { useState } from "react";

export default function Register({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name || !email || !password || !confirm) {
      setError("Пожалуйста, заполните все поля");
      return;
    }
    if (password !== confirm) {
      setError("Пароли не совпадают");
      return;
    }
    // TODO: регистрация через API
    alert(`Регистрация: ${name} <${email}>`);
    onClose();
  };

  return (
    <div className="modal" onClick={(e) => e.stopPropagation()}>
      <h2 className="modal-title">Регистрация</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <label>
            Имя
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={{
                width: "100%",
                padding: 8,
                marginTop: 6,
                borderRadius: 99,
                borderColor: "#1a6dff",
              }}
            />
          </label>

          <label>
            Эл. почта
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: "100%",
                padding: 8,
                marginTop: 6,
                borderRadius: 99,
                borderColor: "#1a6dff",
              }}
            />
          </label>

          <label>
            Пароль
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: "100%",
                padding: 8,
                marginTop: 6,
                borderRadius: 99,
                borderColor: "#1a6dff",
              }}
            />
          </label>

          <label>
            Подтверждение пароля
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              style={{
                width: "100%",
                padding: 8,
                marginTop: 6,
                borderRadius: 99,
                borderColor: "#1a6dff",
              }}
            />
          </label>

          {error && (
            <div style={{ color: "#d9534f", fontSize: 13 }}>{error}</div>
          )}

          <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
            <button type="button" className="btn secondary" onClick={onClose}>
              Отмена
            </button>
            <button type="submit" className="btn primary">
              Зарегистрироваться
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
