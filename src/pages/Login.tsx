import { useState } from "react";

export default function Login({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Пожалуйста, заполните все поля");
      return;
    }
    // TODO: подключить реальный бэкенд
    alert(`Вход: ${email}`);
    onClose();
  };

  return (
    <div className="modal" onClick={(e) => e.stopPropagation()}>
      <h2 className="modal-title">Вход</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <label>
            Эл. почта
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ width: "100%", padding: 8, marginTop: 6 }}
            />
          </label>

          <label>
            Пароль
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ width: "100%", padding: 8, marginTop: 6 }}
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
              Войти
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
