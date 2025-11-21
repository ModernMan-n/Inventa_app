import { useCallback, useState } from "react";
import * as XLSX from "xlsx";
import ExcelJS from "exceljs";
import { makeCode128 } from "../utils/barcode";
import {
  PAPER_SIZES,
  PaperKey,
  buildLabelsTwoColumns,
  ColumnMapping,
  InputRow,
} from "../utils/labels";

export function useLabels() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("Файл ещё не загружен");

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

  const generateWorkbook = useCallback(
    async (rows: InputRow[], mapping: ColumnMapping) => {
      setIsProcessing(true);
      setStatus("Формируем файл с этикетками...");

      try {
        const labelsAoA = buildLabelsTwoColumns(rows, mapping);

        const wb = new ExcelJS.Workbook();
        const ws = wb.addWorksheet("Этикетки");

        const colWidth = 25;
        ws.columns = [{ width: colWidth }, { width: colWidth }];

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

        labelsAoA.forEach((row, rowIndex) => {
          const excelRow = ws.getRow(rowIndex + 1);
          row.forEach((value, colIndex) => {
            if (value != null) {
              excelRow.getCell(colIndex + 1).value = value;
            }
          });
        });

        const totalRows = labelsAoA.length;
        if (totalRows > 0) {
          for (let r = 0; r < totalRows; r += 3) {
            const top = r + 1;
            const barcodeRow = r + 3;
            const leftCol = 1;
            const rightCol = 2;

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
    },
    [customHeight, customWidth, downloadUrl, paperSize]
  );

  const handleFileChange = useCallback((file: File) => {
    setIsProcessing(true);
    setStatus("Читаем файл...");

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array((e.target as FileReader).result as ArrayBuffer);
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
                  c === "n" || c === "№" || c.includes("пози") || c.includes("номер")
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
      setStatus("Ошибка чтеня файла");
      setIsProcessing(false);
    };

    reader.readAsArrayBuffer(file);
  }, []);

  const onUploadClick = useCallback(() => {
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
  }, [handleFileChange]);

  const onDownloadClick = useCallback(() => {
    if (!downloadUrl) return;
    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = "labels.xlsx";
    a.click();
  }, [downloadUrl]);

  const handleConfirmMapping = useCallback(() => {
    if (!rowsBuffer) return;

    if (!mappingDraft.name || !mappingDraft.inventory || !mappingDraft.position) {
      setStatus("Нужно сопоставить все три обязательных поля.");
      return;
    }

    setIsMappingModalOpen(false);
    generateWorkbook(rowsBuffer, mappingDraft);
  }, [generateWorkbook, mappingDraft, rowsBuffer]);

  return {
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
  } as const;
}