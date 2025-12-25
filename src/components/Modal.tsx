import { useEffect, useState } from "react";
import "../App.css";

type Props = {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  closeOnBackdrop?: boolean;
};

export default function Modal({
  open,
  onClose,
  children,
  closeOnBackdrop = true,
}: Props) {
  const [mounted, setMounted] = useState(open);
  const [state, setState] = useState<"enter" | "exit">("enter");

  useEffect(() => {
    if (open) {
      setMounted(true);
      // start enter animation
      setState("enter");
    } else if (mounted) {
      // start exit animation
      setState("exit");
      const t = setTimeout(() => setMounted(false), 300);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!mounted) return null;

  return (
    <div
      className={`modal-backdrop ${state === "enter" ? "enter" : "exit"}`}
      onClick={() => closeOnBackdrop && onClose()}
    >
      <div
        className={`${state === "enter" ? "enter" : "exit"}`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
