import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login({
  onClose,
  onLogin,
}: {
  onClose: () => void;
  onLogin?: (user: { username: string } | null) => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Пожалуйста, заполните все поля");
      return;
    }
    // Простейшая локальная аутентификация для демо
    if (email === "admin" && password === "admin") {
      const user = { username: "admin" };
      localStorage.setItem("user", JSON.stringify(user));
      onLogin && onLogin(user);
      onClose();
      // Перенаправляем на дэшборд
      navigate("/dashboard");
      return;
    }
    setError("Неверный логин или пароль");
  };

  return (
    <div className="modal" onClick={(e) => e.stopPropagation()}>
      <h2 className="modal-title">Вход</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <label>
            Логин
            <input
              type="text"
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
