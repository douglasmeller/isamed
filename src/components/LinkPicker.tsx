"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Check, Link2 } from "lucide-react";
import { linkItems, unlinkItems } from "@/app/actions/links";
import { cn } from "@/lib/cn";
import { areLinked } from "@/lib/links";
import type { DayItem, ItemLink } from "@/lib/types";

// Deixa vincular uma tarefa/prova/anotacao a outra do mesmo dia -- por
// exemplo, ligar uma prova a uma anotacao de revisao daquele dia.
export function LinkPicker({
  self,
  date,
  dayItems,
  links,
  onChanged,
  triggerClassName,
}: {
  self: Pick<DayItem, "type" | "id">;
  date: string;
  dayItems: DayItem[];
  links: ItemLink[];
  // Vinculos ficam num estado a parte no calendario (nao vem do
  // revalidatePath), entao quem usa este componente precisa recarrega-los
  // depois de uma mudanca.
  onChanged?: () => void;
  triggerClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const [, startTransition] = useTransition();
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const isLinked = (other: Pick<DayItem, "type" | "id">) => areLinked(self, other, links);

  const toggle = (other: DayItem) => {
    const linked = isLinked(other);
    startTransition(() => {
      const promise = linked ? unlinkItems(self, other) : linkItems(date, self, other);
      promise.then(() => onChanged?.());
    });
  };

  const others = dayItems.filter((d) => !(d.type === self.type && d.id === self.id));

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Vincular a outro item do dia"
        title="Vincular a outro item do dia"
        className={triggerClassName}
      >
        <Link2 className="h-4 w-4" />
      </button>

      {open && (
        <div className="absolute right-0 z-30 mt-2 w-56 rounded-2xl border border-pink-100 bg-white p-2 shadow-float">
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
                      "flex w-full items-center justify-between gap-2 rounded-xl px-2 py-1.5 text-left text-xs font-medium transition-colors hover:bg-pink-100",
                      linked ? "text-pink-600" : "text-ink",
                    )}
                  >
                    <span className="truncate">{other.title}</span>
                    {linked && <Check className="h-3.5 w-3.5 shrink-0" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
