export type InputRow = {
  [key: string]: unknown;
};

export type ColumnMapping = {
  name: string; // Наименование ОС
  inventory: string; // Инвентарный номер
  position: string; // Номер позиции (№)
};

export const PAPER_SIZES = {
  A4: { w: 210, h: 297 },
  A5: { w: 148, h: 210 },
  A6: { w: 105, h: 148 },
  LETTER: { w: 216, h: 279 },
  L100x150: { w: 100, h: 150 },
  L60x30: { w: 60, h: 30 },
  CUSTOM: { w: 0, h: 0 },
} as const;

export type PaperKey = keyof typeof PAPER_SIZES;

export function buildLabelsTwoColumns(
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
