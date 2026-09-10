"use client";

import { useState, useTransition } from "react";
import { CalendarSync, Check, Pencil, Trash2, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { toggleTask, deleteTask, moveTask, updateTask } from "@/app/actions/tasks";
import { DatePicker } from "@/components/DatePicker";
import { LinkPicker } from "@/components/LinkPicker";
import { linkedItemsFor } from "@/lib/links";
import type { DayItem, Entry, ItemLink, Task } from "@/lib/types";

export function TaskItem({
  task,
  allTasks,
  allEntries,
  allLinks,
}: {
  task: Task;
  // Quando presentes, a tarefa ganha o botao de vincular a outras
  // tarefas/provas/anotacoes do mesmo dia (filtrado por data aqui dentro).
  allTasks?: Task[];
  allEntries?: Entry[];
  allLinks?: ItemLink[];
}) {
  const [optimisticDone, setOptimisticDone] = useState(task.done);
  const [removed, setRemoved] = useState(false);
  const [moving, setMoving] = useState(false);
  const [editing, setEditing] = useState(false);

  // O que aparece no card. Atualizamos na hora de salvar para a mudanca ser
  // imediata, sem esperar o servidor responder.
  const [title, setTitle] = useState(task.title);
  const [time, setTime] = useState(task.time?.slice(0, 5) ?? "");

  // Rascunho da edicao, para poder cancelar sem perder o valor original.
  const [draftTitle, setDraftTitle] = useState(task.title);
  const [draftTime, setDraftTime] = useState(task.time?.slice(0, 5) ?? "");

  const [, startTransition] = useTransition();

  const handleToggle = () => {
    const next = !optimisticDone;
    setOptimisticDone(next);
    startTransition(() => {
      toggleTask(task.id, next);
    });
  };

  const handleDelete = () => {
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

  const self = { type: "task" as const, id: task.id };

  const dayItems: DayItem[] | undefined =
    allTasks && allEntries
      ? [
          ...allTasks
            .filter((t) => t.date === task.date)
            .map((t) => ({ type: "task" as const, id: t.id, title: t.title })),
          ...allEntries
            .filter((e) => e.date === task.date)
            .map((e) => ({ type: "entry" as const, id: e.id, title: e.title, kind: e.kind })),
        ]
      : undefined;
  const dayLinks = allLinks?.filter((l) => l.date === task.date);
  const linked = dayItems && dayLinks ? linkedItemsFor(self, dayItems, dayLinks) : [];

  return (
    <div
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
            <input
              type="text"
              value={draftTitle}
              onChange={(e) => setDraftTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Escape" && cancelEditing()}
              autoFocus
              aria-label="Nome da tarefa"
              className="min-w-0 flex-1 basis-full rounded-xl border-2 border-pink-300 bg-white px-3 py-2 text-ink outline-none transition-colors focus:border-pink-400 sm:basis-0"
            />
            <input
              type="time"
              value={draftTime}
              onChange={(e) => setDraftTime(e.target.value)}
              onKeyDown={(e) => e.key === "Escape" && cancelEditing()}
              aria-label="Horário (opcional)"
              className="w-[6.5rem] shrink-0 rounded-xl border-2 border-pink-200 bg-white px-2 py-2 text-center text-sm text-ink outline-none transition-colors focus:border-pink-400"
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

                {dayItems && dayLinks && (
                  <LinkPicker
                    self={self}
                    date={task.date}
                    dayItems={dayItems}
                    links={dayLinks}
                    triggerClassName={cn(actionButton, hoverReveal)}
                  />
                )}

                <button
                  type="button"
                  onClick={handleDelete}
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
