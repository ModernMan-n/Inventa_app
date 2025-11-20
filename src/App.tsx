import { useState } from "react";
import * as XLSX from "xlsx";
import "./App.css";
import ExcelJS from "exceljs";
import JsBarcode from "jsbarcode";
<<<<<<< HEAD
=======

>>>>>>> origin/main

type InputRow = {
  N?: number;
  "Основное средство"?: string;
  "Инвентарный номер"?: string | number;
  [key: string]: unknown;
};
function makeCode128(value: string) {
  const canvas = document.createElement("canvas");
  JsBarcode(canvas, value, {
    format: "CODE128",
    displayValue: false,
    margin: 0,
  });
  const dataUrl = canvas.toDataURL("image/png");
<<<<<<< HEAD
  // откусываем префикс "data:image/png;base64,"
  return dataUrl.split(",")[1];
}
=======
  return dataUrl.split(",")[1];
}
function buildLabelsTwoColumns(rows: InputRow[]): (string | null)[][] {
  const items: { name: string; inv: string }[] = [];
>>>>>>> origin/main

  for (const row of rows) {
    const name = String(row["Основное средство"] ?? "").trim();
    const invRaw = row["Инвентарный номер"];
    const inv = String(invRaw ?? "").trim();

    if (!name || !inv) continue;

    const qty = 1; // если потом добавишь "Количество" — тут можно учитывать

    for (let i = 0; i < qty; i++) {
      items.push({ name, inv });
    }
  }

  const result: (string | null)[][] = [];

  // каждая этикетка = 3 строки, раскладка в два столбца
  for (let i = 0; i < items.length; i += 2) {
    const left = items[i];
    const right = items[i + 1];

    // 1 строка — наименование
    result.push([
      left?.name ?? null,
      right?.name ?? null,
    ]);

    // 2 строка — инв. номер текстом
    result.push([
      left ? `инв. №${left.inv}` : null,
      right ? `инв. №${right.inv}` : null,
    ]);

    // 3 строка — тут храним "сырой" инв. номер для генерации картинки
    result.push([
      left?.inv ?? null,
      right?.inv ?? null,
    ]);
  }

  return result;
}
function App() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("Файл ещё не загружен");
  const [isFontModalOpen, setIsFontModalOpen] = useState(false);
  const [paperSize, setPaperSize] = useState<PaperKey>("A4");
  const [customWidth, setCustomWidth] = useState(100); // мм
  const [customHeight, setCustomHeight] = useState(150); // мм
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

  const handleFileChange = (file: File) => {
    setIsProcessing(true);
    setStatus("Обрабатываем файл...");

    const reader = new FileReader();

    reader.onload = (e) => {
      (async () => {
        try {
          // 1. Читаем исходный Excel через xlsx
          const data = new Uint8Array(
            (e.target as FileReader).result as ArrayBuffer
          );
          const workbookIn = XLSX.read(data, { type: "array" });
          const sheetName = workbookIn.SheetNames[0];
          const sheet = workbookIn.Sheets[sheetName];

          const rows = XLSX.utils.sheet_to_json<InputRow>(sheet, {
            defval: "",
          });

          // 2. Генерируем массив этикеток (3 строки × 2 столбца)
          const labelsAoA = buildLabelsTwoColumns(rows);

<<<<<<< HEAD
          // 3. Создаём новый Excel-файл через ExcelJS
          const wb = new ExcelJS.Workbook();
          const ws = wb.addWorksheet("Этикетки");
          ws.columns = [{ width: 42 }, { width: 42 }];
          // Заполняем данными
          labelsAoA.forEach((row, rowIndex) => {
            const excelRow = ws.getRow(rowIndex + 1);
            row.forEach((value, colIndex) => {
              if (value != null) {
                excelRow.getCell(colIndex + 1).value = value;
              }
            });
          });

          // 4. Стили: пунктирные рамки + шрифт Code128 24pt для строки штрих-кода
          // 4. Пунктирные рамки + вставка PNG-штрихкода
          const totalRows = labelsAoA.length;

          if (totalRows > 0) {
            // каждая этикетка = 3 строки
            for (let r = 0; r < totalRows; r += 3) {
              const top = r + 1; // 1-я строка этикетки (наименование)
              const invRow = r + 2; // 2-я строка (инв. номер текстом)
              const barcodeRow = r + 3; // 3-я строка (штрих-код-картинка)
              const leftCol = 1;
              const rightCol = 2;

              for (let rr = top; rr <= barcodeRow; rr++) {
                for (let cc = leftCol; cc <= rightCol; cc++) {
                  const cell = ws.getRow(rr).getCell(cc);

                  // Пунктирная рамка вокруг блока этикетки
                  const border = cell.border || {};
                  if (rr === top) {
                    border.top = {
                      style: "dotted",
                      color: { argb: "FF999999" },
                    };
                  }
                  if (rr === barcodeRow) {
                    border.bottom = {
                      style: "dotted",
                      color: { argb: "FF999999" },
                    };
                  }
                  if (cc === leftCol) {
                    border.left = {
                      style: "dotted",
                      color: { argb: "FF999999" },
                    };
                  }
                  if (cc === rightCol) {
                    border.right = {
                      style: "dotted",
                      color: { argb: "FF999999" },
                    };
                  }
                  cell.border = border;

                  // На строке штрих-кода вставляем PNG вместо текста
                  if (rr === barcodeRow) {
                    const rawValue = cell.value;
                    const inv =
                      typeof rawValue === "number"
                        ? String(rawValue)
                        : typeof rawValue === "string"
                        ? rawValue.trim()
                        : "";

                    if (inv) {
                      // Генерируем картинку Code128
                      const base64 = makeCode128(inv.replace(/\s/g, ""));
                      const imageId = wb.addImage({
                        base64,
                        extension: "png",
                      });

                      // ExcelJS использует 0-базный индекс строк/столбцов
                      ws.addImage(imageId, {
                        tl: { col: cc - 1 + 0.1, row: rr - 1 + 0.1 },
                        br: { col: cc - 1 + 0.9, row: rr - 1 + 0.9 },
                      });

                      // Текст можно очистить, чтобы не торчал под картинкой
                      cell.value = null;
                    }
                  }
                }
              }
            }
=======
      // 3. Создаём новый Excel-файл через ExcelJS
      const wb = new ExcelJS.Workbook();
      const ws = wb.addWorksheet("Этикетки");
      ws.columns = [
        { width: 42 },
        { width: 42 },
      ];
      // Заполняем данными
      labelsAoA.forEach((row, rowIndex) => {
  const excelRow = ws.getRow(rowIndex + 1);
  row.forEach((value, colIndex) => {
    if (value != null) {
      excelRow.getCell(colIndex + 1).value = value;
    }
  });
});

      // 4. Стили: пунктирные рамки + шрифт Code128 24pt для строки штрих-кода
      // 4. Пунктирные рамки + вставка PNG-штрихкода
const totalRows = labelsAoA.length;

if (totalRows > 0) {
  // каждая этикетка = 3 строки
  for (let r = 0; r < totalRows; r += 3) {
    const top = r + 1;        // 1-я строка этикетки (наименование)
    const invRow = r + 2;     // 2-я строка (инв. номер текстом)
    const barcodeRow = r + 3; // 3-я строка (штрих-код-картинка)
    const leftCol = 1;
    const rightCol = 2;

    for (let rr = top; rr <= barcodeRow; rr++) {
      for (let cc = leftCol; cc <= rightCol; cc++) {
        const cell = ws.getRow(rr).getCell(cc);

        // Пунктирная рамка вокруг блока этикетки
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

        // На строке штрих-кода вставляем PNG вместо текста
        if (rr === barcodeRow) {
          const rawValue = cell.value;
          const inv =
            typeof rawValue === "number"
              ? String(rawValue)
              : typeof rawValue === "string"
              ? rawValue.trim()
              : "";

          if (inv) {
            // Генерируем картинку Code128
            const base64 = makeCode128(inv.replace(/\s/g, ""));
            const imageId = wb.addImage({
              base64,
              extension: "png",
            });

            // ExcelJS использует 0-базный индекс строк/столбцов
            ws.addImage(imageId, {
              tl: { col: cc - 1 + 0.1, row: rr - 1 + 0.1 },
              br: { col: cc - 1 + 0.9, row: rr - 1 + 0.9 },
            });

            // Текст можно очистить, чтобы не торчал под картинкой
            cell.value = null;
>>>>>>> origin/main
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
<<<<<<< HEAD
      })();
    };
=======
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
  })();
};

>>>>>>> origin/main

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
    a.download = "/code128.ttf";
    a.click();

    setIsFontModalOpen(true);
  };

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
              Загрузите Excel с объектами — получите готовый файл с этикетками и
              штрих-кодами. Печатаете, клеите, сканируете — инвентарный номер
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
                      onChange={(e) => setCustomWidth(Number(e.target.value))}
                    />
                  </label>

                  <label>
                    Высота (мм):
                    <input
                      type="number"
                      value={customHeight}
                      onChange={(e) => setCustomHeight(Number(e.target.value))}
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
                Для корректного отображения штрих-кодов в Excel установите шрифт{" "}
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

<<<<<<< HEAD
function buildLabelsTwoColumns(rows: InputRow[]): (string | null)[][] {
  const items: { name: string; inv: string }[] = [];

  for (const row of rows) {
    const name = String(row["Основное средство"] ?? "").trim();
    const invRaw = row["Инвентарный номер"];
    const inv = String(invRaw ?? "").trim();

    if (!name || !inv) continue;

    const qty = 1; // если потом добавишь "Количество" — тут можно учитывать

    for (let i = 0; i < qty; i++) {
      items.push({ name, inv });
    }
  }

  const result: (string | null)[][] = [];

  // каждая этикетка = 3 строки, раскладка в два столбца
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

    // 3 строка — тут храним "сырой" инв. номер для генерации картинки
    result.push([left?.inv ?? null, right?.inv ?? null]);
  }

  return result;
}

=======
>>>>>>> origin/main
export default App;
