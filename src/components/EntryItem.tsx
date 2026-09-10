"use client";

import { useState, useTransition } from "react";
import { CalendarSync, Check, Pencil, Trash2, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { deleteEntry, moveEntry, updateEntry } from "@/app/actions/entries";
import { DatePicker } from "@/components/DatePicker";
import { LinkPicker } from "@/components/LinkPicker";
import { formatDayMonth, formatWeekday } from "@/lib/dates";
import { linkedItemsFor } from "@/lib/links";
import type { DayItem, Entry, ItemLink } from "@/lib/types";

export function EntryItem({
  entry,
  dayItems,
  links,
  onLinksChange,
}: {
  entry: Entry;
  // Presentes so quando renderizado dentro do painel do dia no calendario,
  // onde da pra ver (e vincular a) as outras tarefas/provas/anotacoes do dia.
  dayItems?: DayItem[];
  links?: ItemLink[];
  onLinksChange?: () => void;
}) {
  const [removed, setRemoved] = useState(false);
  const [moving, setMoving] = useState(false);
  const [editing, setEditing] = useState(false);

  const [title, setTitle] = useState(entry.title);
  const [date, setDate] = useState(entry.date);

  const [draftTitle, setDraftTitle] = useState(entry.title);
  const [draftDate, setDraftDate] = useState(entry.date);

  const [, startTransition] = useTransition();

  const handleDelete = () => {
    setRemoved(true);
    startTransition(() => {
      deleteEntry(entry.id);
    });
  };

  const handleMove = (newDate: string) => {
    setMoving(false);
    if (!newDate || newDate === date) return;

    setDate(newDate);
    startTransition(() => {
      moveEntry(entry.id, newDate);
    });
  };

  const startEditing = () => {
    setDraftTitle(title);
    setDraftDate(date);
    setEditing(true);
  };

  const cancelEditing = () => setEditing(false);

  const saveEditing = () => {
    const trimmed = draftTitle.trim();
    if (!trimmed || !draftDate) return;

    setTitle(trimmed);
    setDate(draftDate);
    setEditing(false);

    startTransition(() => {
      updateEntry(entry.id, { title: trimmed, date: draftDate });
    });
  };

  if (removed) return null;

  const actionButton =
    "shrink-0 rounded-xl p-1.5 text-ink-soft transition-colors hover:bg-pink-100 hover:text-pink-600";

  // Mesma lógica de revelar-no-hover das tarefas: só esconde em aparelhos com
  // mouse de verdade, para não sumir os botões em iPad/celular.
  const hoverReveal =
    "[@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100 [@media(hover:hover)]:focus-visible:opacity-100";

  const dateObj = new Date(`${date}T00:00:00`);
  const self = { type: "entry" as const, id: entry.id };
  const linked = dayItems && links ? linkedItemsFor(self, dayItems, links) : [];

  return (
    <div className="group flex flex-col gap-1.5 rounded-2xl border border-pink-100/80 bg-white px-3 py-3 shadow-soft transition-all duration-200 hover:-translate-y-px hover:border-pink-200 hover:shadow-lift sm:px-4">
      <div className="flex items-center gap-2 sm:gap-3">
        {editing ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              saveEditing();
            }}
            className="flex min-w-0 flex-1 flex-wrap items-center gap-2"
          >
            <input
              type="text"
              value={draftTitle}
              onChange={(e) => setDraftTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Escape" && cancelEditing()}
              autoFocus
              aria-label="Título"
              className="min-w-0 flex-1 basis-full rounded-xl border-2 border-pink-300 bg-white px-3 py-2 text-ink outline-none transition-colors focus:border-pink-400 sm:basis-0"
            />
            <DatePicker value={draftDate} onChange={setDraftDate} className="w-[9.5rem] shrink-0" />
            <button
              type="submit"
              disabled={!draftTitle.trim() || !draftDate}
              aria-label="Salvar"
              title="Salvar"
              className="shrink-0 rounded-xl bg-pink-500 p-1.5 text-white shadow-soft transition-all hover:bg-pink-600 hover:shadow-lift disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
            >
              <Check className="h-4 w-4" strokeWidth={2.5} />
            </button>
            <button
              type="button"
              onClick={cancelEditing}
              aria-label="Cancelar"
              title="Cancelar"
              className={actionButton}
            >
              <X className="h-4 w-4" />
            </button>
          </form>
        ) : (
          <>
            <button
              type="button"
              onClick={startEditing}
              title="Editar"
              className="min-w-0 flex-1 text-left"
            >
              <span className="block break-words font-medium text-ink transition-colors hover:text-pink-600">
                {title}
              </span>
              <span className="text-xs font-semibold text-ink-soft">
                {formatWeekday(dateObj)}, {formatDayMonth(dateObj)}
              </span>
            </button>

            {moving ? (
              <DatePicker
                value={date}
                onChange={handleMove}
                onClose={() => setMoving(false)}
                autoOpen
                align="right"
                className="w-[9.5rem] shrink-0"
              />
            ) : (
              <>
                <button
                  type="button"
                  onClick={startEditing}
                  aria-label="Editar"
                  title="Editar"
                  className={cn(actionButton, hoverReveal)}
                >
                  <Pencil className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={() => setMoving(true)}
                  aria-label="Mudar para outro dia"
                  title="Mudar para outro dia"
                  className={cn(actionButton, hoverReveal)}
                >
                  <CalendarSync className="h-4 w-4" />
                </button>

                {dayItems && links && (
                  <LinkPicker
                    self={self}
                    date={date}
                    dayItems={dayItems}
                    links={links}
                    onChanged={onLinksChange}
                    triggerClassName={cn(actionButton, hoverReveal)}
                  />
                )}

                <button
                  type="button"
                  onClick={handleDelete}
                  aria-label="Excluir"
                  title="Excluir"
                  className={cn(actionButton, hoverReveal)}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </>
            )}
          </>
        )}
      </div>

      {linked.length > 0 && (
        <div className="flex flex-wrap gap-1 pl-0.5">
          {linked.map((item) => (
            <span
              key={`${item.type}-${item.id}`}
              className="truncate rounded-full bg-pink-50 px-2 py-0.5 text-[10px] font-medium text-pink-600"
            >
              {item.title}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
