"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Clock, X } from "lucide-react";
import { cn } from "@/lib/cn";

// Seletor de horario proprio (paleta rosa do site), no mesmo esquema do
// DatePicker: substitui o <input type="time"> nativo (aparencia varia
// entre navegador/SO) por duas colunas rolaveis (hora/minuto) num popup
// em portal, posicionado pelas coordenadas do botao.
const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = Array.from({ length: 60 }, (_, i) => i);
const pad = (n: number) => n.toString().padStart(2, "0");

export function TimePicker({
  value,
  onChange,
  className,
  placeholder = "Horário",
  align = "left",
  onKeyDown,
}: {
  value: string; // "" | "HH:MM"
  onChange: (time: string) => void;
  className?: string;
  placeholder?: string;
  align?: "left" | "right";
  onKeyDown?: (e: React.KeyboardEvent<HTMLButtonElement>) => void;
}) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const hourListRef = useRef<HTMLDivElement>(null);
  const minuteListRef = useRef<HTMLDivElement>(null);

  const [hourStr, minuteStr] = value ? value.split(":") : [undefined, undefined];
  const hour = hourStr !== undefined ? Number(hourStr) : null;
  const minute = minuteStr !== undefined ? Number(minuteStr) : null;

  const close = () => setOpen(false);

  const placeCoords = () => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setCoords({
      top: rect.bottom + 8,
      left: align === "right" ? rect.right - 176 : rect.left,
    });
  };

  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (triggerRef.current?.contains(target) || popoverRef.current?.contains(target)) return;
      close();
    };
    // Fecha em vez de reposicionar -- mesmo padrao do DatePicker/LinkPicker.
    const handleReflow = () => close();

    document.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("scroll", handleReflow, true);
    window.addEventListener("resize", handleReflow);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("scroll", handleReflow, true);
      window.removeEventListener("resize", handleReflow);
    };
  }, [open]);

  // Ao abrir, rola as colunas ate o horario ja selecionado.
  useEffect(() => {
    if (!open) return;
    requestAnimationFrame(() => {
      hourListRef.current
        ?.querySelector('[data-selected="true"]')
        ?.scrollIntoView({ block: "center" });
      minuteListRef.current
        ?.querySelector('[data-selected="true"]')
        ?.scrollIntoView({ block: "center" });
    });
  }, [open]);

  const toggle = () => {
    if (open) {
      close();
    } else {
      placeCoords();
      setOpen(true);
    }
  };

  const pickHour = (h: number) => onChange(`${pad(h)}:${pad(minute ?? 0)}`);
  const pickMinute = (m: number) => onChange(`${pad(hour ?? 0)}:${pad(m)}`);
  const clear = () => {
    onChange("");
    close();
  };

  return (
    <div className={cn("relative", className)}>
      <button
        ref={triggerRef}
        type="button"
        onClick={toggle}
        onKeyDown={onKeyDown}
        className="flex w-full items-center justify-center gap-1.5 rounded-2xl border border-pink-200/80 bg-white px-2 py-2 text-center text-sm text-ink shadow-soft outline-none transition-all hover:-translate-y-px hover:shadow-lift focus:border-pink-300 focus:shadow-lift active:translate-y-0"
      >
        <Clock className="h-4 w-4 shrink-0 text-pink-400" />
        <span className="truncate">{value || placeholder}</span>
      </button>

      {open &&
        coords &&
        createPortal(
          <div
            ref={popoverRef}
            style={{ position: "fixed", top: coords.top, left: coords.left }}
            className="z-50 w-44 rounded-2xl border border-pink-100 bg-white p-2 shadow-float"
          >
            <div className="flex gap-1">
              <div ref={hourListRef} className="max-h-40 flex-1 overflow-y-auto">
                {HOURS.map((h) => (
                  <button
                    key={h}
                    type="button"
                    data-selected={h === hour}
                    onClick={() => pickHour(h)}
                    className={cn(
                      "flex w-full items-center justify-center rounded-lg py-1 text-sm font-medium transition-colors",
                      h === hour ? "bg-pink-500 text-white" : "text-ink hover:bg-pink-100",
                    )}
                  >
                    {pad(h)}
                  </button>
                ))}
              </div>
              <div ref={minuteListRef} className="max-h-40 flex-1 overflow-y-auto">
                {MINUTES.map((m) => (
                  <button
                    key={m}
                    type="button"
                    data-selected={m === minute}
                    onClick={() => pickMinute(m)}
                    className={cn(
                      "flex w-full items-center justify-center rounded-lg py-1 text-sm font-medium transition-colors",
                      m === minute ? "bg-pink-500 text-white" : "text-ink hover:bg-pink-100",
                    )}
                  >
                    {pad(m)}
                  </button>
                ))}
              </div>
            </div>

            {value && (
              <button
                type="button"
                onClick={clear}
                className="mt-2 flex w-full items-center justify-center gap-1 rounded-xl px-2 py-1.5 text-xs font-semibold text-ink-soft transition-colors hover:bg-pink-100 hover:text-pink-600"
              >
                <X className="h-3.5 w-3.5" />
                Limpar horário
              </button>
            )}
          </div>,
          document.body,
        )}
    </div>
  );
}
