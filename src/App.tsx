import { useState } from "react";
import "./App.css";
import CustomSelect from "./components/CustomSelect";
import Header from "./components/Header";
import { useLabels } from "./hooks/useLabels";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Modal from "./components/Modal";
// ===================== ОСНОВНОЙ КОМПОНЕНТ =====================

function App() {
  const [isFontModalOpen, setIsFontModalOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  // ===================== JSX =====================
  const {
    state: {
      isProcessing,
      downloadUrl,
      status,
      isMappingModalOpen,
      availableColumns,
      rowsBuffer,
      mappingDraft,
    },
    actions: {
      setMappingDraft,
      setIsMappingModalOpen,
      onUploadClick,
      onDownloadClick,
      handleConfirmMapping,
    },
  } = useLabels();
  return (
    <div className="app-root">
      <Header />

      <main className="hero">
        <section className="hero-content">
          <div className="hero-text">
            <p className="eyebrow">ИНВЕНТАРИЗАЦИЯ БЕЗ БОЛИ</p>
            <h1 className="hero-title">Генератор этикеток</h1>
            <p className="hero-subtitle">
              Загрузите Excel с объектами — получите готовый файл с этикетками и
              штрих-кодами. Печатаете, клеите, сканируете — инвентарный номер
              вводится автоматически.
            </p>

            <div className="hero-buttons">
              <button
                className="btn primary"
                onClick={onUploadClick}
                disabled={isProcessing}
              >
                {isProcessing ? "Обработка..." : "Загрузить файл"}
              </button>

              <button
                className="btn secondary"
                onClick={onDownloadClick}
                disabled={!downloadUrl}
              >
                Скачать файл
              </button>
            </div>

            <p className="status-text">{status}</p>
          </div>

          <div className="hero-visual">
            <div className="hero-card">
              <p className="hero-card-title">Превью этикетки</p>
              <div className="label-preview">
                <div className="label-line">Основное средство</div>
                <div className="label-line label-inv">инв. №410134001558</div>
                <div className="label-barcode">▌▌▍▍▌▍▌▌▍▌▍▍▌▌▍</div>
              </div>
              <p className="hero-card-caption">
                Штрих-код содержит инвентарный номер и считывается любым
                сканером.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Попап сопоставления колонок */}
      <Modal
        open={isMappingModalOpen}
        onClose={() => setIsMappingModalOpen(false)}
      >
        <h2 className="modal-title">Сопоставление колонок</h2>
        <p className="modal-text">
          Выберите, какие столбцы в вашей таблице соответствуют обязательным
          полям. Без этого мы не сможем правильно сформировать этикетки.
        </p>

        <div className="mapping-grid">
          <label className="mappingField">
            <span>Инвентарный номер *</span>
            <CustomSelect
              label="Инвентарный номер *"
              value={mappingDraft.inventory}
              options={availableColumns}
              onChange={(v) =>
                setMappingDraft((prev) => ({ ...prev, inventory: v }))
              }
            />
          </label>

          <label className="mappingField">
            <span>Наименование ОС *</span>
            <CustomSelect
              label="Наименование ОС *"
              value={mappingDraft.name}
              options={availableColumns}
              onChange={(v) =>
                setMappingDraft((prev) => ({ ...prev, name: v }))
              }
            />
          </label>

          <label className="mappingField">
            <span>Номер позиции (№) *</span>
            <CustomSelect
              label="Номер позиции *"
              value={mappingDraft.position}
              options={availableColumns}
              onChange={(v) =>
                setMappingDraft((prev) => ({ ...prev, position: v }))
              }
            />
          </label>
        </div>

        <div className="modal-actions">
          <button
            className="btn secondary modal-btn"
            onClick={() => setIsMappingModalOpen(false)}
          >
            Отмена
          </button>
          <button
            className="btn primary modal-btn"
            onClick={handleConfirmMapping}
            disabled={
              !rowsBuffer ||
              !mappingDraft.name ||
              !mappingDraft.inventory ||
              !mappingDraft.position
            }
          >
            Продолжить
          </button>
        </div>
      </Modal>

      {/* Страницы авторизации */}
      <Modal open={showLogin} onClose={() => setShowLogin(false)}>
        <Login onClose={() => setShowLogin(false)} />
      </Modal>

      <Modal open={showRegister} onClose={() => setShowRegister(false)}>
        <Register onClose={() => setShowRegister(false)} />
      </Modal>
    </div>
  );
}

export default App;
