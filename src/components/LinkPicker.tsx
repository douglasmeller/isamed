"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { Check, FileQuestion, Link2, ListChecks, NotebookPen } from "lucide-react";
import { linkItems, unlinkItems } from "@/app/actions/links";
import { cn } from "@/lib/cn";
import { areLinked } from "@/lib/links";
import type { DayItem, ItemLink } from "@/lib/types";

// Mesmos icones usados na barra lateral, pra reconhecer de cara o tipo do
// item ao vincular (tarefa, prova ou anotacao).
function ItemIcon({ item }: { item: DayItem }) {
  if (item.type === "task") return <ListChecks className="h-3.5 w-3.5 shrink-0" />;
  if (item.kind === "exam") return <FileQuestion className="h-3.5 w-3.5 shrink-0" />;
  return <NotebookPen className="h-3.5 w-3.5 shrink-0" />;
}

// Deixa vincular uma tarefa/prova/anotacao a outra do mesmo dia -- por
// exemplo, ligar uma prova a uma anotacao de revisao daquele dia.
export function LinkPicker({
  self,
  date,
  dayItems,
  links,
  triggerClassName,
}: {
  self: Pick<DayItem, "type" | "id">;
  date: string;
  dayItems: DayItem[];
  links: ItemLink[];
  triggerClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  // Renderizado num portal (direto no <body>), a posicao vem das coordenadas
  // do botao em vez de "absolute" dentro do card -- assim o dropdown nunca
  // fica escondido atras do proximo card da lista.
  const [coords, setCoords] = useState<{ top: number; right: number } | null>(null);
  const [, startTransition] = useTransition();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const close = () => setOpen(false);

  const openPicker = () => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (rect) {
      setCoords({ top: rect.bottom + 8, right: window.innerWidth - rect.right });
    }
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

  const isLinked = (other: Pick<DayItem, "type" | "id">) => areLinked(self, other, links);

  const toggle = (other: DayItem) => {
    const linked = isLinked(other);
    startTransition(() => {
      if (linked) unlinkItems(self, other);
      else linkItems(date, self, other);
    });
  };

  const others = dayItems.filter((d) => !(d.type === self.type && d.id === self.id));

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => (open ? close() : openPicker())}
        aria-label="Vincular a outro item do dia"
        title="Vincular a outro item do dia"
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
            className="z-50 w-56 rounded-2xl border border-pink-100 bg-white p-2 shadow-float"
          >
            {others.length === 0 ? (
              <p className="px-2 py-1.5 text-xs text-ink-soft">Nada mais nesse dia ainda.</p>
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
          </div>,
          document.body,
        )}
    </>
  );
}
