import { useMemo, useState } from "react";

type Col = { name: string; label?: string };

export default function DataTable({
  columns,
  rows,
  pageSize = 10,
}: {
  columns: Col[];
  rows: any[];
  pageSize?: number;
}) {
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<{ col?: string; dir: "asc" | "desc" }>({
    col: undefined,
    dir: "asc",
  });

  const sorted = useMemo(() => {
    if (!sort.col) return rows;
    const s = [...rows].sort((a, b) => {
      const A = a[sort.col!];
      const B = b[sort.col!];
      if (A == null) return 1;
      if (B == null) return -1;
      if (A === B) return 0;
      return A > B ? 1 : -1;
    });
    if (sort.dir === "desc") s.reverse();
    return s;
  }, [rows, sort]);

  const total = Math.max(1, Math.ceil(sorted.length / pageSize));
  const visible = sorted.slice((page - 1) * pageSize, page * pageSize);

  function toggleSort(col: string) {
    setSort((s) => {
      if (s.col === col) return { col, dir: s.dir === "asc" ? "desc" : "asc" };
      return { col, dir: "asc" };
    });
    setPage(1);
  }

  return (
    <div className="data-table-card">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.name} onClick={() => toggleSort(c.name)}>
                {c.label || c.name}
                {sort.col === c.name
                  ? sort.dir === "asc"
                    ? " ▲"
                    : " ▼"
                  : null}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {visible.map((r, i) => (
            <tr key={i}>
              {columns.map((c) => (
                <td key={c.name}>{String(r[c.name] ?? "")}</td>
              ))}
            </tr>
          ))}
          {visible.length === 0 && (
            <tr>
              <td colSpan={columns.length} style={{ padding: 16 }}>
                Нет данных
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="data-table-footer">
        <div>
          Страница {page} из {total}
        </div>
        <div className="data-table-pager">
          <button
            className="btn secondary"
            onClick={() => setPage(1)}
            disabled={page === 1}
          >
            Первая
          </button>
          <button
            className="btn secondary"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Назад
          </button>
          <button
            className="btn secondary"
            onClick={() => setPage((p) => Math.min(total, p + 1))}
            disabled={page === total}
          >
            Вперёд
          </button>
          <button
            className="btn secondary"
            onClick={() => setPage(total)}
            disabled={page === total}
          >
            Последняя
          </button>
        </div>
      </div>
    </div>
  );
}
