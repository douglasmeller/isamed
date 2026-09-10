"use client";

import { useEffect, useRef, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { getMonthGrid, WEEKDAY_LABELS } from "@/lib/calendarGrid";
import { formatDayMonth, formatMonthYear, toISODate } from "@/lib/dates";
import { cn } from "@/lib/cn";

// Calendario proprio (paleta rosa do site) para substituir o seletor nativo
// do <input type="date">, que varia de aparencia entre navegador/SO.
export function DatePicker({
  value,
  onChange,
  className,
  placeholder = "Escolher data",
  align = "left",
  autoOpen = false,
  onClose,
}: {
  value: string;
  onChange: (date: string) => void;
  className?: string;
  placeholder?: string;
  align?: "left" | "right";
  autoOpen?: boolean;
  onClose?: () => void;
}) {
  const [open, setOpen] = useState(autoOpen);
  const baseDate = value ? new Date(`${value}T00:00:00`) : new Date();
  const [viewYear, setViewYear] = useState(baseDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(baseDate.getMonth());
  const rootRef = useRef<HTMLDivElement>(null);

  const close = () => {
    setOpen(false);
    onClose?.();
  };

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) close();
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const togglePicker = () => {
    if (!open) {
      const d = value ? new Date(`${value}T00:00:00`) : new Date();
      setViewYear(d.getFullYear());
      setViewMonth(d.getMonth());
      setOpen(true);
    } else {
      close();
    }
  };

  const days = getMonthGrid(viewYear, viewMonth);
  const monthLabel = formatMonthYear(new Date(viewYear, viewMonth, 1));

  const goPrevMonth = () => {
    const d = new Date(viewYear, viewMonth - 1, 1);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  };
  const goNextMonth = () => {
    const d = new Date(viewYear, viewMonth + 1, 1);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  };

  const pick = (iso: string) => {
    onChange(iso);
    close();
  };

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={togglePicker}
        className="flex w-full items-center justify-center gap-1.5 rounded-2xl border border-pink-200/80 bg-white px-3 py-2 text-center text-sm text-ink shadow-soft outline-none transition-all focus:border-pink-300 focus:shadow-lift"
      >
        <CalendarDays className="h-4 w-4 shrink-0 text-pink-400" />
        <span className="truncate">
          {value ? formatDayMonth(new Date(`${value}T00:00:00`)) : placeholder}
        </span>
      </button>

      {open && (
        <div
          className={cn(
            "absolute z-30 mt-2 w-64 rounded-2xl border border-pink-100 bg-white p-3 shadow-float",
            align === "right" ? "right-0" : "left-0",
          )}
        >
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-semibold capitalize text-ink">{monthLabel}</span>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={goPrevMonth}
                aria-label="Mês anterior"
                className="flex h-7 w-7 items-center justify-center rounded-lg text-ink-soft transition-colors hover:bg-pink-100 hover:text-pink-600"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={goNextMonth}
                aria-label="Próximo mês"
                className="flex h-7 w-7 items-center justify-center rounded-lg text-ink-soft transition-colors hover:bg-pink-100 hover:text-pink-600"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-0.5 text-center text-[10px] font-semibold uppercase text-ink-soft">
            {WEEKDAY_LABELS.map((label) => (
              <div key={label} className="py-1">
                {label}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-0.5">
            {days.map((day) => {
              const iso = toISODate(day);
              const inMonth = day.getMonth() === viewMonth;
              const isSelected = iso === value;
              return (
                <button
                  key={iso}
                  type="button"
                  onClick={() => pick(iso)}
                  className={cn(
                    "flex aspect-square items-center justify-center rounded-lg text-xs font-medium transition-colors",
                    !inMonth && "text-ink-soft/40",
                    inMonth && !isSelected && "text-ink hover:bg-pink-100",
                    isSelected && "bg-pink-500 text-white",
                  )}
                >
                  {day.getDate()}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
