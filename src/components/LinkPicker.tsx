"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  FileQuestion,
  Link2,
  ListChecks,
  NotebookPen,
} from "lucide-react";
import { getDayItems, linkItems, unlinkItems } from "@/app/actions/links";
import { getMonthGrid, WEEKDAY_LABELS } from "@/lib/calendarGrid";
import { cn } from "@/lib/cn";
import { addDays, formatDayMonth, formatMonthYear, toISODate } from "@/lib/dates";
import { areLinked } from "@/lib/links";
import type { DayItem, ItemLink } from "@/lib/types";

function ItemIcon({ item }: { item: DayItem }) {
  if (item.type === "task") return <ListChecks className="h-3.5 w-3.5 shrink-0" />;
  if (item.kind === "exam") return <FileQuestion className="h-3.5 w-3.5 shrink-0" />;
  return <NotebookPen className="h-3.5 w-3.5 shrink-0" />;
}

// Deixa vincular uma tarefa/prova/anotacao a outra -- do mesmo dia ou de
// qualquer outro (com as setinhas ou o calendario, la embaixo do popup).
export function LinkPicker({
  self,
  initialDayItems,
  allLinks,
  triggerClassName,
}: {
  self: DayItem;
  // Itens do proprio dia do item (evita um fetch extra ao abrir o popup).
  initialDayItems: DayItem[];
  allLinks: ItemLink[];
  triggerClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; right: number } | null>(null);
  const [viewingDate, setViewingDate] = useState(self.date);
  const [showCalendar, setShowCalendar] = useState(false);
  const [calView, setCalView] = useState(() => {
    const d = new Date(`${self.date}T00:00:00`);
    return { year: d.getFullYear(), month: d.getMonth() };
  });
  const [cache, setCache] = useState<Record<string, DayItem[]>>({ [self.date]: initialDayItems });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const close = () => setOpen(false);

  const openPicker = () => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (rect) setCoords({ top: rect.bottom + 8, right: window.innerWidth - rect.right });
    setViewingDate(self.date);
    setShowCalendar(false);
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (triggerRef.current?.contains(target) || popoverRef.current?.contains(target)) return;
      close();
    };
    // Fecha em vez de reposicionar -- mais simples do que recalcular as
    // coordenadas a cada scroll/resize.
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

  const loading = open && !cache[viewingDate];

  useEffect(() => {
    if (!open || cache[viewingDate]) return;
    let cancelled = false;
    getDayItems(viewingDate).then((items) => {
      if (cancelled) return;
      setCache((prev) => ({ ...prev, [viewingDate]: items }));
    });
    return () => {
      cancelled = true;
    };
  }, [open, viewingDate, cache]);

  const goToDate = (date: string) => {
    setViewingDate(date);
    setShowCalendar(false);
  };

  const shiftDay = (delta: number) => {
    goToDate(toISODate(addDays(new Date(`${viewingDate}T00:00:00`), delta)));
  };

  const toggleCalendar = () => {
    if (!showCalendar) {
      const d = new Date(`${viewingDate}T00:00:00`);
      setCalView({ year: d.getFullYear(), month: d.getMonth() });
    }
    setShowCalendar((v) => !v);
  };

  const isLinked = (other: Pick<DayItem, "type" | "id">) => areLinked(self, other, allLinks);

  const toggle = (other: DayItem) => {
    if (isLinked(other)) unlinkItems(self, other);
    else linkItems(self, other);
  };

  const others = (cache[viewingDate] ?? []).filter(
    (d) => !(d.type === self.type && d.id === self.id),
  );

  const viewingDateObj = new Date(`${viewingDate}T00:00:00`);
  const calDays = getMonthGrid(calView.year, calView.month);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => (open ? close() : openPicker())}
        aria-label="Vincular a outro item"
        title="Vincular a outro item"
        className={triggerClassName}
      >
        <Link2 className="h-4 w-4" />
      </button>

      {open &&
        coords &&
        createPortal(
          <div
            ref={popoverRef}
            style={{ position: "fixed", top: coords.top, right: coords.right }}
            className="z-50 w-64 rounded-2xl border border-pink-100 bg-white p-2 shadow-float"
          >
            <p className="px-2 pb-1.5 text-center text-xs font-semibold text-ink-soft">
              {formatDayMonth(viewingDateObj)}
            </p>

            <div className="max-h-48 overflow-y-auto">
              {loading ? (
                <p className="px-2 py-3 text-center text-xs text-ink-soft">Carregando...</p>
              ) : others.length === 0 ? (
                <p className="px-2 py-3 text-center text-xs text-ink-soft">
                  Nada nesse dia ainda.
                </p>
              ) : (
                <div className="flex flex-col gap-0.5">
                  {others.map((other) => {
                    const linked = isLinked(other);
                    return (
                      <button
                        key={`${other.type}-${other.id}`}
                        type="button"
                        onClick={() => toggle(other)}
                        className={cn(
                          "flex w-full items-center gap-2 rounded-xl px-2 py-1.5 text-left text-xs font-medium transition-colors hover:bg-pink-100",
                          linked ? "text-pink-600" : "text-ink",
                        )}
                      >
                        <ItemIcon item={other} />
                        <span className="min-w-0 flex-1 truncate">{other.title}</span>
                        {linked && <Check className="h-3.5 w-3.5 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="mt-2 flex items-center justify-between gap-1 border-t border-pink-100 pt-2">
              <button
                type="button"
                onClick={() => shiftDay(-1)}
                aria-label="Dia anterior"
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-ink-soft transition-colors hover:bg-pink-100 hover:text-pink-600"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={toggleCalendar}
                aria-label="Escolher outro dia"
                title="Escolher outro dia"
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors hover:bg-pink-100 hover:text-pink-600",
                  showCalendar ? "bg-pink-100 text-pink-600" : "text-ink-soft",
                )}
              >
                <Calendar className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => shiftDay(1)}
                aria-label="Próximo dia"
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-ink-soft transition-colors hover:bg-pink-100 hover:text-pink-600"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {showCalendar && (
              <div className="mt-2 border-t border-pink-100 pt-2">
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-xs font-semibold capitalize text-ink">
                    {formatMonthYear(new Date(calView.year, calView.month, 1))}
                  </span>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() =>
                        setCalView((v) => {
                          const d = new Date(v.year, v.month - 1, 1);
                          return { year: d.getFullYear(), month: d.getMonth() };
                        })
                      }
                      aria-label="Mês anterior"
                      className="flex h-6 w-6 items-center justify-center rounded-lg text-ink-soft hover:bg-pink-100 hover:text-pink-600"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setCalView((v) => {
                          const d = new Date(v.year, v.month + 1, 1);
                          return { year: d.getFullYear(), month: d.getMonth() };
                        })
                      }
                      aria-label="Próximo mês"
                      className="flex h-6 w-6 items-center justify-center rounded-lg text-ink-soft hover:bg-pink-100 hover:text-pink-600"
                    >
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-0.5 text-center text-[9px] font-semibold uppercase text-ink-soft">
                  {WEEKDAY_LABELS.map((label) => (
                    <div key={label} className="py-0.5">
                      {label}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-0.5">
                  {calDays.map((day) => {
                    const iso = toISODate(day);
                    const inMonth = day.getMonth() === calView.month;
                    const isSelected = iso === viewingDate;
                    return (
                      <button
                        key={iso}
                        type="button"
                        onClick={() => goToDate(iso)}
                        className={cn(
                          "flex aspect-square items-center justify-center rounded-md text-[11px] font-medium transition-colors",
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
          </div>,
          document.body,
        )}
    </>
  );
}
