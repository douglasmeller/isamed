"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { CalendarSync, Check, Pencil, Trash2, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { deleteEntry, moveEntry, updateEntry } from "@/app/actions/entries";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { DatePicker } from "@/components/DatePicker";
import { LinkPicker } from "@/components/LinkPicker";
import { formatDayMonth, formatShortDate, formatWeekday, toISODate } from "@/lib/dates";
import { isSubmitEnter } from "@/lib/keyboard";
import { linkedItemsFor, linkTargetHref } from "@/lib/links";
import { useAutoGrowTextarea } from "@/lib/useAutoGrow";
import type { DayItem, Entry, ItemLink, Task } from "@/lib/types";

export function EntryItem({
  entry,
  allTasks,
  allEntries,
  allLinks,
}: {
  entry: Entry;
  // Quando presentes, o item ganha o botao de vincular a outras
  // tarefas/provas/anotacoes (do mesmo dia ou de qualquer outro).
  allTasks?: Task[];
  allEntries?: Entry[];
  allLinks?: ItemLink[];
}) {
  const [removed, setRemoved] = useState(false);
  const [moving, setMoving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const [title, setTitle] = useState(entry.title);
  const [date, setDate] = useState(entry.date);
  const [time, setTime] = useState(entry.time?.slice(0, 5) ?? "");

  const [draftTitle, setDraftTitle] = useState(entry.title);
  const [draftDate, setDraftDate] = useState(entry.date);
  const [draftTime, setDraftTime] = useState(entry.time?.slice(0, 5) ?? "");
  const draftTitleRef = useAutoGrowTextarea(draftTitle);

  const [, startTransition] = useTransition();

  const handleDelete = () => {
    setConfirmingDelete(false);
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
    setDraftTime(time);
    setEditing(true);
  };

  const cancelEditing = () => setEditing(false);

  const saveEditing = () => {
    const trimmed = draftTitle.trim();
    if (!trimmed || !draftDate) return;

    setTitle(trimmed);
    setDate(draftDate);
    setTime(draftTime);
    setEditing(false);

    startTransition(() => {
      updateEntry(entry.id, { title: trimmed, date: draftDate, time: draftTime || null });
    });
  };

  if (removed) return null;

  const actionButton =
    "shrink-0 rounded-xl p-1.5 text-ink-soft shadow-soft transition-all hover:-translate-y-px hover:bg-pink-100 hover:text-pink-600 hover:shadow-lift active:translate-y-0";

  // Mesma lógica de revelar-no-hover das tarefas: só esconde em aparelhos com
  // mouse de verdade, para não sumir os botões em iPad/celular.
  const hoverReveal =
    "[@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100 [@media(hover:hover)]:focus-visible:opacity-100";

  const dateObj = new Date(`${date}T00:00:00`);
  const self: DayItem = { type: "entry", id: entry.id, title, date, kind: entry.kind };

  const initialDayItems: DayItem[] | undefined =
    allTasks && allEntries
      ? [
          ...allTasks
            .filter((t) => t.date === date)
            .map((t): DayItem => ({ type: "task", id: t.id, title: t.title, date: t.date })),
          ...allEntries
            .filter((e) => e.date === date)
            .map(
              (e): DayItem => ({
                type: "entry",
                id: e.id,
                title: e.title,
                date: e.date,
                kind: e.kind,
              }),
            ),
        ]
      : undefined;
  const linked = allLinks ? linkedItemsFor(self, allLinks) : [];
  const today = toISODate(new Date());

  return (
    <div
      id={`item-entry-${entry.id}`}
      className="group flex flex-col gap-1.5 rounded-2xl border border-pink-100/80 bg-white px-3 py-3 shadow-soft transition-all duration-200 hover:-translate-y-px hover:border-pink-200 hover:shadow-lift sm:px-4"
    >
      <div className="flex items-center gap-2 sm:gap-3">
        {editing ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              saveEditing();
            }}
            className="flex min-w-0 flex-1 flex-wrap items-center gap-2"
          >
            <textarea
              ref={draftTitleRef}
              rows={1}
              value={draftTitle}
              onChange={(e) => setDraftTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  cancelEditing();
                  return;
                }
                if (isSubmitEnter(e)) {
                  e.preventDefault();
                  saveEditing();
                }
              }}
              autoFocus
              aria-label="Título"
              className="min-w-0 flex-1 basis-full resize-none overflow-hidden rounded-xl border-2 border-pink-300 bg-white px-3 py-2 text-ink outline-none transition-colors focus:border-pink-400 sm:basis-0"
            />
            <DatePicker value={draftDate} onChange={setDraftDate} className="w-[9.5rem] shrink-0" />
            {entry.kind === "exam" && (
              <input
                type="time"
                value={draftTime}
                onChange={(e) => setDraftTime(e.target.value)}
                onKeyDown={(e) => e.key === "Escape" && cancelEditing()}
                aria-label="Horário (opcional)"
                className="w-[6.5rem] shrink-0 rounded-xl border-2 border-pink-200 bg-white px-2 py-2 text-center text-sm text-ink outline-none transition-colors focus:border-pink-400"
              />
            )}
            <button
              type="submit"
              disabled={!draftTitle.trim() || !draftDate}
              aria-label="Salvar"
              title="Salvar"
              className="shrink-0 rounded-xl bg-pink-500 p-1.5 text-white shadow-soft transition-all hover:-translate-y-px hover:bg-pink-600 hover:shadow-lift active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
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
            {time && (
              <span className="shrink-0 rounded-full bg-pink-100 px-2.5 py-1 text-xs font-semibold text-pink-600">
                {time}
              </span>
            )}

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

                {initialDayItems && allLinks && (
                  <LinkPicker
                    self={self}
                    initialDayItems={initialDayItems}
                    allLinks={allLinks}
                    triggerClassName={cn(actionButton, hoverReveal)}
                  />
                )}

                <button
                  type="button"
                  onClick={() => setConfirmingDelete(true)}
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
          {linked.map((item) => {
            const sameDay = item.date === date;
            return (
              <Link
                key={`${item.type}-${item.id}`}
                href={linkTargetHref(item, today)}
                title="Ir para o item vinculado"
                className="truncate rounded-full bg-pink-50 px-2 py-0.5 text-[10px] font-medium text-pink-600 transition-colors hover:bg-pink-200"
              >
                {sameDay
                  ? item.title
                  : `${item.title} (${formatShortDate(new Date(`${item.date}T00:00:00`))})`}
              </Link>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={confirmingDelete}
        itemLabel={title}
        onConfirm={handleDelete}
        onCancel={() => setConfirmingDelete(false)}
      />
    </div>
  );
}
