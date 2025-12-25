import { useState, useEffect } from "react";
import "./Landing.css";

import "./Home.css";
import Header from "../components/Header";

export default function Home() {
  const partners = [
    { id: 1, name: "Компания А" },
    { id: 2, name: "Компания Б" },
    { id: 3, name: "Компания В" },
    { id: 4, name: "Компания Г" },
  ];

  const [index, setIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(
      () => setIndex((i) => (i + 1) % partners.length),
      3000
    );
    return () => clearInterval(t);
  }, []);

  return (
    <div className="landing-root">
      <Header />

      <main className="landing-hero">
        <div className="hero-content">
          <h1 className="hero-title">Инвента</h1>
          <p className="hero-sub">
            Быстро создавайте и печатайте этикетки из Excel — удобство для
            инвентаризации
          </p>
          <div className="hero-cta">
            <a className="btn primary" href="/app">
              Попробовать
            </a>
            <a className="btn secondary" href="#features">
              Узнать больше
            </a>
          </div>
        </div>
      </main>

      <section id="features" className="landing-features">
        <h2>Преимущества</h2>
        <div className="features-grid">
          <div className="feature-card">
            <h3>Быстро</h3>
            <p>Загрузите Excel и получите готовые этикетки за минуты.</p>
          </div>
          <div className="feature-card">
            <h3>Удобно</h3>
            <p>Интуитивный интерфейс и шаблоны печати.</p>
          </div>
          <div className="feature-card">
            <h3>Надёжно</h3>
            <p>Штрихкоды стандарта Code128, совместимы со сканерами.</p>
          </div>
        </div>
      </section>

      <section id="partners" className="landing-partners">
        <h2>Наши партнёры</h2>
        <div className="partners-carousel">
          {partners.map((p, i) => (
            <div
              key={p.id}
              className={`partner-item ${i === index ? "active" : ""}`}
              aria-hidden={i === index ? "false" : "true"}
            >
              <div className="partner-logo">{p.name}</div>
            </div>
          ))}
        </div>
      </section>

      <footer className="landing-footer">
        <div>© {new Date().getFullYear()} Inventa — тестовый лендинг</div>
        <div className="footer-links">
          <a href="#">Политика конфиденциальности</a>
          <a href="#">Контакты</a>
        </div>
      </footer>
    </div>
  );
}
