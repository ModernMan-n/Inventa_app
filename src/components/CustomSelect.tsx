import { useState, useRef, useEffect } from "react";
import "./CustomSelect.css";

export default function CustomSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  return (
    <div className="cs-wrapper" ref={ref}>
      <div className="cs-selected" onClick={() => setOpen(!open)}>
        {value || "— Выберите столбец —"}
        <span className="cs-arrow">{open ? "▲" : "▼"}</span>
      </div>

      {open && (
        <div className="cs-options">
          {options.map((opt) => (
            <div
              key={opt}
              className={`cs-option ${opt === value ? "selected" : ""}`}
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
            >
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
