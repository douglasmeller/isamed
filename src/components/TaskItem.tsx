"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { CalendarSync, Check, Pencil, Trash2, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { toggleTask, deleteTask, moveTask, updateTask } from "@/app/actions/tasks";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { DatePicker } from "@/components/DatePicker";
import { LinkPicker } from "@/components/LinkPicker";
import { TimePicker } from "@/components/TimePicker";
import { formatShortDate, toISODate } from "@/lib/dates";
import { isSubmitEnter } from "@/lib/keyboard";
import { linkedItemsFor, linkTargetHref } from "@/lib/links";
import { useAutoGrowTextarea } from "@/lib/useAutoGrow";
import type { DayItem, Entry, ItemLink, Task } from "@/lib/types";

export function TaskItem({
  task,
  allTasks,
  allEntries,
  allLinks,
}: {
  task: Task;
  // Quando presentes, a tarefa ganha o botao de vincular a outras
  // tarefas/provas/anotacoes (do mesmo dia ou de qualquer outro).
  allTasks?: Task[];
  allEntries?: Entry[];
  allLinks?: ItemLink[];
}) {
  const [optimisticDone, setOptimisticDone] = useState(task.done);
  const [removed, setRemoved] = useState(false);
  const [moving, setMoving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  // O que aparece no card. Atualizamos na hora de salvar para a mudanca ser
  // imediata, sem esperar o servidor responder.
  const [title, setTitle] = useState(task.title);
  const [time, setTime] = useState(task.time?.slice(0, 5) ?? "");

  // Rascunho da edicao, para poder cancelar sem perder o valor original.
  const [draftTitle, setDraftTitle] = useState(task.title);
  const [draftTime, setDraftTime] = useState(task.time?.slice(0, 5) ?? "");
  const draftTitleRef = useAutoGrowTextarea(draftTitle);

  const [, startTransition] = useTransition();

  const handleToggle = () => {
    const next = !optimisticDone;
    setOptimisticDone(next);
    startTransition(() => {
      toggleTask(task.id, next);
    });
  };

  const handleDelete = () => {
    setConfirmingDelete(false);
    setRemoved(true);
    startTransition(() => {
      deleteTask(task.id);
    });
  };

  const handleMove = (date: string) => {
    setMoving(false);
    if (!date || date === task.date) return;

    // Sai da lista do dia atual; o dia de destino recebe a tarefa na revalidação.
    setRemoved(true);
    startTransition(() => {
      moveTask(task.id, date);
    });
  };

  const startEditing = () => {
    setDraftTitle(title);
    setDraftTime(time);
    setEditing(true);
  };

  const cancelEditing = () => setEditing(false);

  const saveEditing = () => {
    const trimmed = draftTitle.trim();
    if (!trimmed) return; // Nao deixa salvar tarefa sem nome.

    setTitle(trimmed);
    setTime(draftTime);
    setEditing(false);

    startTransition(() => {
      updateTask(task.id, { title: trimmed, time: draftTime || null });
    });
  };

  if (removed) return null;

  const actionButton =
    "shrink-0 rounded-xl p-1.5 text-ink-soft shadow-soft transition-all hover:-translate-y-px hover:bg-pink-100 hover:text-pink-600 hover:shadow-lift active:translate-y-0";

  // Em aparelhos com mouse, os botoes so aparecem ao passar por cima (visual
  // mais limpo). Onde nao existe hover de verdade (iPad, celular), ficam
  // sempre visiveis -- antes usavamos a largura da tela como criterio, o que
  // escondia os botoes no iPad, que e largo mas nao tem mouse.
  const hoverReveal =
    "[@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100 [@media(hover:hover)]:focus-visible:opacity-100";

  const self: DayItem = { type: "task", id: task.id, title, date: task.date };

  const initialDayItems: DayItem[] | undefined =
    allTasks && allEntries
      ? [
          ...allTasks
            .filter((t) => t.date === task.date)
            .map((t): DayItem => ({ type: "task", id: t.id, title: t.title, date: t.date })),
          ...allEntries
            .filter((e) => e.date === task.date)
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
      id={`item-task-${task.id}`}
      className={cn(
        "group flex flex-col gap-1.5 rounded-2xl border border-pink-100/80 bg-white px-3 py-3 shadow-soft transition-all duration-200 sm:px-4",
        // Tarefa pendente ganha relevo ao passar o mouse; concluida fica
        // rebaixada, reforcando visualmente que ja saiu da fila.
        optimisticDone
          ? "border-transparent bg-pink-50 shadow-none"
          : "hover:-translate-y-px hover:border-pink-200 hover:shadow-lift",
      )}
    >
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={handleToggle}
          aria-pressed={optimisticDone}
          aria-label={optimisticDone ? "Marcar como não feita" : "Marcar como feita"}
          className={cn(
            "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 shadow-soft transition-all duration-200 hover:-translate-y-px active:translate-y-0",
            optimisticDone
              ? "border-pink-500 bg-pink-500 text-white shadow-lift"
              : "border-pink-300 text-transparent hover:border-pink-500 hover:shadow-lift",
          )}
        >
          <Check className="h-4 w-4" strokeWidth={3} />
        </button>

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
              aria-label="Nome da tarefa"
              className="min-w-0 flex-1 basis-full resize-none overflow-hidden rounded-xl border-2 border-pink-300 bg-white px-3 py-2 text-ink outline-none transition-colors focus:border-pink-400 sm:basis-0"
            />
            <TimePicker
              value={draftTime}
              onChange={setDraftTime}
              onKeyDown={(e) => e.key === "Escape" && cancelEditing()}
              className="w-[6.5rem] shrink-0"
            />
            <button
              type="submit"
              disabled={!draftTitle.trim()}
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
              <span
                className={cn(
                  "shrink-0 rounded-full bg-pink-100 px-2.5 py-1 text-xs font-semibold text-pink-600",
                  optimisticDone && "bg-white",
                )}
              >
                {time}
              </span>
            )}

            <button
              type="button"
              onClick={startEditing}
              title="Editar tarefa"
              className={cn(
                "min-w-0 flex-1 break-words text-left font-medium text-ink transition-colors hover:text-pink-600",
                optimisticDone && "text-ink-soft line-through hover:text-ink-soft",
              )}
            >
              {title}
            </button>

            {moving ? (
              <DatePicker
                value={task.date}
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
                  aria-label="Editar tarefa"
                  title="Editar tarefa"
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
                  aria-label="Excluir tarefa"
                  title="Excluir tarefa"
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
        <div className="flex flex-wrap gap-1 pl-9">
          {linked.map((item) => {
            const sameDay = item.date === task.date;
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
