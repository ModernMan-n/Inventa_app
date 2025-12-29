import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import DataTable from "../components/DataTable";
import "./Dashboard.css";

export default function DocumentsTable() {
  const { table } = useParams<{ table: string }>();
  const [cols, setCols] = useState<Array<{ name: string; label?: string }>>([]);
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const t = table || "";

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    async function load() {
      try {
        const sres = await fetch(`/api/schema/${t}`);
        if (sres.ok) {
          const schema = await sres.json();
          if (!mounted) return;
          setCols(schema.columns || []);
        } else {
          // fallback mocks
          if (t === "mvl")
            setCols([
              { name: "id" },
              { name: "name", label: "ФИО" },
              { name: "phone" },
            ]);
          else if (t === "employees")
            setCols([
              { name: "id" },
              { name: "firstName" },
              { name: "lastName" },
            ]);
          else setCols([{ name: "id" }, { name: "title" }]);
        }

        const dres = await fetch(`/api/data/${t}`);
        if (dres.ok) {
          const data = await dres.json();
          if (!mounted) return;
          setRows(data.rows || data || []);
        } else {
          // fallback rows
          if (t === "mvl")
            setRows([
              { id: 1, name: "Иванов И.И.", phone: "+7 900 000 00 01" },
            ]);
          else if (t === "employees")
            setRows([{ id: 1, firstName: "Пётр", lastName: "Петров" }]);
          else setRows([]);
        }
      } catch (err) {
        if (t === "mvl")
          setCols([
            { name: "id" },
            { name: "name", label: "ФИО" },
            { name: "phone" },
          ]);
        if (t === "mvl")
          setRows([{ id: 1, name: "Иванов И.И.", phone: "+7 900 000 00 01" }]);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [t]);

  return (
    <div className="dashboard-root">
      <Header />

      <div className="dashboard-layout">
        <Sidebar />
        <main className="dashboard-main">
          <div className="hero-data-table-container">
            <p className="eyebrow">Документы</p>
            <h1 className="hero-title">{t || "Таблица"}</h1>
            <p className="hero-subtitle">
              Данные таблицы загружаются из БД по схеме.
            </p>
            {loading ? (
              <div>Загрузка...</div>
            ) : (
              <div
                className="hero-data-table"
                style={{ marginTop: 12, width: "100%" }}
              >
                <DataTable
                  columns={cols.length ? cols : [{ name: "id" }]}
                  rows={rows}
                  pageSize={10}
                />
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
