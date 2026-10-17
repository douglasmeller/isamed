"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CalendarDays, ChevronLeft, ChevronRight, type LucideIcon } from "lucide-react";
import { getMonthGrid, WEEKDAY_LABELS } from "@/lib/calendarGrid";
import { formatDayMonth, formatMonthYear, toISODate } from "@/lib/dates";
import { cn } from "@/lib/cn";
import { usePopoverPosition } from "@/lib/usePopoverPosition";

// Calendario proprio (paleta rosa do site) para substituir o seletor nativo
// do <input type="date">, que varia de aparencia entre navegador/SO.
//
// O popup roda num portal (direto no <body>), posicionado pelas coordenadas
// do botao em vez de "absolute" dentro do card -- assim ele nunca fica
// escondido atras do proximo item da lista.
export function DatePicker({
  value,
  onChange,
  className,
  placeholder = "Escolher data",
  align = "left",
  autoOpen = false,
  onClose,
  extraAction,
}: {
  value: string;
  onChange: (date: string) => void;
  className?: string;
  placeholder?: string;
  align?: "left" | "right";
  autoOpen?: boolean;
  onClose?: () => void;
  // Botao opcional no rodape do popup (ex: "Voltar para Em aberto").
  extraAction?: { label: string; icon: LucideIcon; onClick: () => void };
}) {
  const [open, setOpen] = useState(autoOpen);
  const [anchor, setAnchor] = useState<DOMRect | null>(null);
  const baseDate = value ? new Date(`${value}T00:00:00`) : new Date();
  const [viewYear, setViewYear] = useState(baseDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(baseDate.getMonth());
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const close = () => {
    setOpen(false);
    onClose?.();
  };

  const placeCoords = () => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (rect) setAnchor(rect);
  };

  usePopoverPosition(popoverRef, open ? anchor : null, align);

  // Se abrir sozinho (fluxo de "mudar de dia"), calcula a posicao assim que
  // o botao existir na tela.
  useEffect(() => {
    if (autoOpen) placeCoords();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (triggerRef.current?.contains(target) || popoverRef.current?.contains(target)) return;
      close();
    };
    // Fecha em vez de reposicionar -- mais simples do que recalcular as
    // coordenadas a cada scroll/resize. Rolar dentro do proprio popup nao conta.
    const handleScroll = (e: Event) => {
      if (popoverRef.current?.contains(e.target as Node)) return;
      close();
    };
    const handleResize = () => close();

    document.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", handleResize);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const togglePicker = () => {
    if (!open) {
      const d = value ? new Date(`${value}T00:00:00`) : new Date();
      setViewYear(d.getFullYear());
      setViewMonth(d.getMonth());
      placeCoords();
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
    <div className={cn("relative", className)}>
      <button
        ref={triggerRef}
        type="button"
        onClick={togglePicker}
        className="flex w-full items-center justify-center gap-1.5 rounded-2xl border border-pink-200/80 bg-white px-3 py-2 text-center text-sm text-ink shadow-soft outline-none transition-all hover:-translate-y-px hover:shadow-lift focus:border-pink-300 focus:shadow-lift active:translate-y-0"
      >
        <CalendarDays className="h-4 w-4 shrink-0 text-pink-400" />
        <span className="truncate">
          {value ? formatDayMonth(new Date(`${value}T00:00:00`)) : placeholder}
        </span>
      </button>

      {open &&
        anchor &&
        createPortal(
          <div
            ref={popoverRef}
            // top/left reais vem do usePopoverPosition, antes da pintura.
            style={{ position: "fixed", top: 0, left: 0 }}
            className="z-50 max-h-[calc(100dvh-16px)] w-64 overflow-y-auto rounded-2xl border border-pink-100 bg-white p-3 shadow-float"
          >
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-semibold capitalize text-ink">{monthLabel}</span>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={goPrevMonth}
                  aria-label="Mês anterior"
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-ink-soft shadow-soft transition-all hover:bg-pink-100 hover:text-pink-600 hover:shadow-lift"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={goNextMonth}
                  aria-label="Próximo mês"
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-ink-soft shadow-soft transition-all hover:bg-pink-100 hover:text-pink-600 hover:shadow-lift"
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
                      "flex aspect-square items-center justify-center rounded-lg text-xs font-medium transition-all",
                      !inMonth && "text-ink-soft/40",
                      inMonth && !isSelected && "text-ink hover:bg-pink-100 hover:shadow-soft",
                      isSelected && "bg-pink-500 text-white shadow-soft",
                    )}
                  >
                    {day.getDate()}
                  </button>
                );
              })}
            </div>

            {extraAction && (
              <div className="mt-2 border-t border-pink-100 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    extraAction.onClick();
                    close();
                  }}
                  className="flex w-full items-center justify-center gap-1.5 rounded-xl px-2 py-1.5 text-xs font-semibold text-ink-soft transition-colors hover:bg-pink-100 hover:text-pink-600"
                >
                  <extraAction.icon className="h-3.5 w-3.5" />
                  {extraAction.label}
                </button>
              </div>
            )}
          </div>,
          document.body,
        )}
    </div>
  );
}
