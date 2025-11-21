import { useState } from "react";
import * as XLSX from "xlsx";
import ExcelJS from "exceljs";
import JsBarcode from "jsbarcode";
import "./App.css";
import CustomSelect from "./components/CustomSelect";

// ===================== ВСПОМОГАТЕЛЬНЫЕ ТИПЫ =====================

type InputRow = {
  [key: string]: unknown;
};

type ColumnMapping = {
  name: string;      // Наименование ОС
  inventory: string; // Инвентарный номер
  position: string;  // Номер позиции (№)
};

const PAPER_SIZES = {
  A4: { w: 210, h: 297 },
  A5: { w: 148, h: 210 },
  A6: { w: 105, h: 148 },
  LETTER: { w: 216, h: 279 },
  L100x150: { w: 100, h: 150 },
  L60x30: { w: 60, h: 30 },
  CUSTOM: { w: 0, h: 0 },
} as const;

type PaperKey = keyof typeof PAPER_SIZES;

// ===================== BARCODE =====================

function makeCode128(value: string) {
  const canvas = document.createElement("canvas");
  JsBarcode(canvas, value, {
    format: "CODE128",
    displayValue: false,
    margin: 0,
  });
  const dataUrl = canvas.toDataURL("image/png");
  return dataUrl.split(",")[1]; // только base64 без префикса
}

// ===================== ПОСТРОЕНИЕ ЭТИКЕТОК =====================

function buildLabelsTwoColumns(
  rows: InputRow[],
  mapping: ColumnMapping
): (string | null)[][] {
  const items: { name: string; inv: string; pos: number }[] = [];

  for (const row of rows) {
    const name = String(row[mapping.name] ?? "").trim();
    const invRaw = row[mapping.inventory];
    const inv = String(invRaw ?? "").trim();
    const posRaw = row[mapping.position];
    const pos = Number(posRaw) || 0;

    if (!name || !inv) continue;

    items.push({ name, inv, pos });
  }

  const result: (string | null)[][] = [];

  for (let i = 0; i < items.length; i += 2) {
    const left = items[i];
    const right = items[i + 1];

    // 1 строка — наименование
    result.push([left?.name ?? null, right?.name ?? null]);

    // 2 строка — инв. номер текстом
    result.push([
      left ? `инв. №${left.inv}` : null,
      right ? `инв. №${right.inv}` : null,
    ]);

    // 3 строка — сырой инв. номер (по нему рисуем картинку)
    result.push([left?.inv ?? null, right?.inv ?? null]);
  }

  return result;
}

// ===================== ОСНОВНОЙ КОМПОНЕНТ =====================

function App() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("Файл ещё не загружен");

  const [isFontModalOpen, setIsFontModalOpen] = useState(false);
  const [isMappingModalOpen, setIsMappingModalOpen] = useState(false);

  const [availableColumns, setAvailableColumns] = useState<string[]>([]);
  const [rowsBuffer, setRowsBuffer] = useState<InputRow[] | null>(null);
  const [mappingDraft, setMappingDraft] = useState<ColumnMapping>({
    name: "",
    inventory: "",
    position: "",
  });

  const [paperSize, setPaperSize] = useState<PaperKey>("A4");
  const [customWidth, setCustomWidth] = useState(100);
  const [customHeight, setCustomHeight] = useState(150);

  // ========== генерация Excel после сопоставления колонок ==========

  const generateWorkbook = async (rows: InputRow[], mapping: ColumnMapping) => {
    setIsProcessing(true);
    setStatus("Формируем файл с этикетками...");

    try {
      const labelsAoA = buildLabelsTwoColumns(rows, mapping);

      const wb = new ExcelJS.Workbook();
      const ws = wb.addWorksheet("Этикетки");

      // ширина двух столбцов (можешь подстроить)
      const colWidth = 25;
      ws.columns = [{ width: colWidth }, { width: colWidth }];

      // ориентация страницы (по выбранному формату)
      const isCustom = paperSize === "CUSTOM";
      const orientation = isCustom
        ? customWidth > customHeight
          ? "landscape"
          : "portrait"
        : PAPER_SIZES[paperSize].w > PAPER_SIZES[paperSize].h
        ? "landscape"
        : "portrait";

      ws.pageSetup = {
        orientation,
        fitToWidth: 1,
        fitToHeight: 0,
        margins: {
          left: 0.25,
          right: 0.25,
          top: 0.25,
          bottom: 0.25,
          header: 0.1,
          footer: 0.1,
        },
      };

      // заполняем текстом
      labelsAoA.forEach((row, rowIndex) => {
        const excelRow = ws.getRow(rowIndex + 1);
        row.forEach((value, colIndex) => {
          if (value != null) {
            excelRow.getCell(colIndex + 1).value = value;
          }
        });
      });

      // стили и картинки
      const totalRows = labelsAoA.length;
      if (totalRows > 0) {
        for (let r = 0; r < totalRows; r += 3) {
          const top = r + 1;
          const barcodeRow = r + 3;
          const leftCol = 1;
          const rightCol = 2;

          // строка под штрих-код — выше
          ws.getRow(barcodeRow).height = 60;

          for (let rr = top; rr <= barcodeRow; rr++) {
            for (let cc = leftCol; cc <= rightCol; cc++) {
              const cell = ws.getRow(rr).getCell(cc);

              const border = cell.border || {};
              if (rr === top) {
                border.top = { style: "dotted", color: { argb: "FF999999" } };
              }
              if (rr === barcodeRow) {
                border.bottom = { style: "dotted", color: { argb: "FF999999" } };
              }
              if (cc === leftCol) {
                border.left = { style: "dotted", color: { argb: "FF999999" } };
              }
              if (cc === rightCol) {
                border.right = { style: "dotted", color: { argb: "FF999999" } };
              }
              cell.border = border;

              // вставка PNG на 3-ю строку блока
              if (rr === barcodeRow) {
                const rawValue = cell.value;
                const inv =
                  typeof rawValue === "number"
                    ? String(rawValue)
                    : typeof rawValue === "string"
                    ? rawValue.trim()
                    : "";

                if (inv) {
                  const base64 = makeCode128(inv.replace(/\s/g, ""));
                  const imageId = wb.addImage({
                    base64,
                    extension: "png",
                  });

                  ws.addImage(
                    imageId,
                    {
                      tl: { col: cc - 1 + 0.15, row: rr - 1 + 0.15 },
                      ext: { width: 150, height: 45 },
                    } as any
                  );

                  cell.value = null;
                }
              }
            }
          }
        }
      }

      const buffer = await wb.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      if (downloadUrl) {
        URL.revokeObjectURL(downloadUrl);
      }

      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      setStatus("Файл сформирован. Можно скачивать ✅");
    } catch (err) {
      console.error(err);
      setStatus("Ошибка обработки файла. Проверь формат Excel.");
      setDownloadUrl(null);
    } finally {
      setIsProcessing(false);
    }
  };

  // ========== чтение файла и открытие попапа сопоставления ==========

  const handleFileChange = (file: File) => {
    setIsProcessing(true);
    setStatus("Читаем файл...");

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(
          (e.target as FileReader).result as ArrayBuffer
        );
        const workbookIn = XLSX.read(data, { type: "array" });
        const sheetName = workbookIn.SheetNames[0];
        const sheet = workbookIn.Sheets[sheetName];

        const rows = XLSX.utils.sheet_to_json<InputRow>(sheet, {
          defval: "",
        });

        if (!rows.length) {
          setStatus("Файл пустой или не удалось прочитать строки.");
          setIsProcessing(false);
          return;
        }

        // пробуем прочитать заголовки
        const headerAoA = XLSX.utils.sheet_to_json<(string | null)[]>(sheet, {
          header: 1,
          range: 0,
          blankrows: false,
        });

        const headerRow = headerAoA[0] || [];
        let columns =
          headerRow
            .map((h) => String(h ?? "").trim())
            .filter((h) => h.length > 0) || [];

        if (!columns.length) {
          columns = Object.keys(rows[0]);
        }

        setAvailableColumns(columns);
        setRowsBuffer(rows);

        // простое авто-угадывание
        const lower = columns.map((c) => c.toLowerCase());
        setMappingDraft({
          name:
            columns[
              lower.findIndex(
                (c) => c.includes("средств") || c.includes("наимен")
              )
            ] || "",
          inventory:
            columns[
              lower.findIndex(
                (c) =>
                  c.includes("инв") ||
                  c.includes("инвентар") ||
                  c.includes("inventory")
              )
            ] || "",
          position:
            columns[
              lower.findIndex(
                (c) =>
                  c === "n" ||
                  c === "№" ||
                  c.includes("пози") ||
                  c.includes("номер")
              )
            ] || "",
        });

        setIsMappingModalOpen(true);
        setStatus("Сопоставьте колонки и продолжите.");
      } catch (err) {
        console.error(err);
        setStatus("Ошибка чтения файла. Проверь формат Excel.");
      } finally {
        setIsProcessing(false);
      }
    };

    reader.onerror = () => {
      setStatus("Ошибка чтения файла");
      setIsProcessing(false);
    };

    reader.readAsArrayBuffer(file);
  };

  const onUploadClick = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".xlsx,.xls";
    input.onchange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      if (file) {
        handleFileChange(file);
      }
    };
    input.click();
  };

  const onDownloadClick = () => {
    if (!downloadUrl) return;
    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = "labels.xlsx";
    a.click();
  };

  const handleDownloadFont = () => {
    const a = document.createElement("a");
    a.href = "/code128.ttf";
    a.download = "Code128.ttf";
    a.click();
    setIsFontModalOpen(true);
  };

  const handleConfirmMapping = () => {
    if (!rowsBuffer) return;

    if (
      !mappingDraft.name ||
      !mappingDraft.inventory ||
      !mappingDraft.position
    ) {
      setStatus("Нужно сопоставить все три обязательных поля.");
      return;
    }

    setIsMappingModalOpen(false);
    generateWorkbook(rowsBuffer, mappingDraft);
  };

  // ===================== JSX =====================

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

            <div className="font-hint">
              <span>
                Для корректного отображения штрих-кодов в Excel установите
                шрифт{" "}
              </span>
              <button
                type="button"
                className="link-btn"
                onClick={handleDownloadFont}
              >
                Code128
              </button>
            </div>
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
