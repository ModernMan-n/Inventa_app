import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser, type AuthUser } from "../utils/auth";

export default function Login({
  onClose,
  onLogin,
}: {
  onClose: () => void;
  onLogin?: (user: AuthUser | null) => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Пожалуйста, заполните все поля");
      return;
    }
    setLoading(true);
    try {
      const user = await loginUser(email, password);
      onLogin && onLogin(user);
      onClose();
      navigate("/dashboard");
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("invalid")) {
        setError("Неверный логин или пароль");
      } else if (msg.includes("email+password")) {
        setError("Пожалуйста, заполните все поля");
      } else {
        setError("Ошибка авторизации");
      }
    } finally {
      setLoading(false);
    }
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
            <button type="submit" className="btn primary" disabled={loading}>
              {loading ? "Вход..." : "Войти"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
