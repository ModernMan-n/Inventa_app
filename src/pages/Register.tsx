import { useState } from "react";
import { registerUser, type AuthUser } from "../utils/auth";

export default function Register({
  onClose,
  onLogin,
}: {
  onClose: () => void;
  onLogin?: (user: AuthUser | null) => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
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
    setLoading(true);
    try {
      const user = await registerUser({ name, email, password });
      onLogin && onLogin(user);
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("user exists")) {
        setError("Пользователь уже существует");
      } else if (msg.includes("email+password")) {
        setError("Пожалуйста, заполните все поля");
      } else {
        setError("Ошибка регистрации");
      }
    } finally {
      setLoading(false);
    }
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
            <button type="submit" className="btn primary" disabled={loading}>
              {loading ? "Регистрация..." : "Зарегистрироваться"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
