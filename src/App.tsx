import { useState } from "react";
import "./App.css";
import CustomSelect from "./components/CustomSelect";
import { useLabels } from "./hooks/useLabels";
import type { PaperKey } from "./utils/labels";
// ===================== ОСНОВНОЙ КОМПОНЕНТ =====================

function App() {
  
  const [isFontModalOpen, setIsFontModalOpen] = useState(false);
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
      paperSize,
      customWidth,
      customHeight,
    },
    actions: {
      setPaperSize,
      setCustomWidth,
      setCustomHeight,
      setMappingDraft,
      setIsMappingModalOpen,
      onUploadClick,
      onDownloadClick,
      handleConfirmMapping,
    },
  } = useLabels();
  return (
    <div className="app-root">
      <header className="app-header">
        <div className="logo">
          <span className="logo-mark">И</span>
          <span className="logo-text">Инвента</span>
        </div>
        <nav className="nav">
          <a className="nav-link active" href="#">
            Главная
          </a>
          <a className="nav-link" href="#">
            Как это работает
          </a>
          <a className="nav-link" href="#">
            Контакты
          </a>
        </nav>
        <button className="header-cta">Связаться</button>
      </header>

      <main className="hero">
        <section className="hero-content">
          <div className="hero-text">
            <p className="eyebrow">ИНВЕНТАРИЗАЦИЯ БЕЗ БОЛИ</p>
            <h1 className="hero-title">Генератор этикеток</h1>
            <p className="hero-subtitle">
              Загрузите Excel с объектами — получите готовый файл с этикетками
              и штрих-кодами. Печатаете, клеите, сканируете — инвентарный номер
              вводится автоматически.
            </p>

            <div className="paper-setup">
              <label>Размер листа:</label>

              <select
                value={paperSize}
                onChange={(e) => setPaperSize(e.target.value as PaperKey)}
              >
                <option value="A4">A4 (210×297 мм)</option>
                <option value="A5">A5 (148×210 мм)</option>
                <option value="A6">A6 (105×148 мм)</option>
                <option value="LETTER">Letter (216×279 мм)</option>
                <option value="L100x150">Label 100×150 мм</option>
                <option value="L60x30">Label 60×30 мм</option>
                <option value="CUSTOM">Custom…</option>
              </select>

              {paperSize === "CUSTOM" && (
                <div className="custom-size">
                  <label>
                    Ширина (мм):
                    <input
                      type="number"
                      value={customWidth}
                      onChange={(e) =>
                        setCustomWidth(Number(e.target.value || 0))
                      }
                    />
                  </label>

                  <label>
                    Высота (мм):
                    <input
                      type="number"
                      value={customHeight}
                      onChange={(e) =>
                        setCustomHeight(Number(e.target.value || 0))
                      }
                    />
                  </label>
                </div>
              )}
            </div>

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
                <div className="label-line label-inv">
                  инв. №410134001558
                </div>
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
      {isMappingModalOpen && (
        <div
          className="modal-backdrop"
          onClick={() => setIsMappingModalOpen(false)}
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
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
          </div>
        </div>
      )}

      {/* Попап установки шрифта */}
      {isFontModalOpen && (
        <div
          className="modal-backdrop"
          onClick={() => setIsFontModalOpen(false)}
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Как установить шрифт Code128</h2>
            <ol className="modal-list">
              <li>
                Откройте скачанный файл <b>Code128.ttf</b>.
              </li>
              <li>
                Нажмите кнопку <b>«Установить»</b> (в Windows) или добавьте
                шрифт в «Шрифты» (macOS).
              </li>
              <li>Перезапустите Excel, если он был открыт.</li>
              <li>
                Убедитесь, что в этикетках строка со штрих-кодом отображается
                полосами.
              </li>
            </ol>
            <button
              className="btn primary modal-btn"
              onClick={() => setIsFontModalOpen(false)}
            >
              Понятно
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
