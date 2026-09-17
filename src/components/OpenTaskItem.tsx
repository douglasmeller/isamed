"use client";

import { useState, useTransition } from "react";
import { Check, Pencil, Trash2, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { deleteTask, moveTask, updateTask } from "@/app/actions/tasks";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { DatePicker } from "@/components/DatePicker";
import { isSubmitEnter } from "@/lib/keyboard";
import { useAutoGrowTextarea } from "@/lib/useAutoGrow";
import type { OpenTask } from "@/lib/types";

export function OpenTaskItem({ task }: { task: OpenTask }) {
  const [removed, setRemoved] = useState(false);
  const [editing, setEditing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const [title, setTitle] = useState(task.title);
  const [draftTitle, setDraftTitle] = useState(task.title);
  const draftTitleRef = useAutoGrowTextarea(draftTitle);

  const [, startTransition] = useTransition();

  const handleDelete = () => {
    setConfirmingDelete(false);
    setRemoved(true);
    startTransition(() => {
      deleteTask(task.id);
    });
  };

  // Definir um dia tira a tarefa dessa tela -- ela passa a aparecer em
  // Tarefas/Estudos (com o aviso "Em aberto ->").
  const handleSchedule = (date: string) => {
    if (!date) return;
    setRemoved(true);
    startTransition(() => {
      moveTask(task.id, date);
    });
  };

  const startEditing = () => {
    setDraftTitle(title);
    setEditing(true);
  };

  const cancelEditing = () => setEditing(false);

  const saveEditing = () => {
    const trimmed = draftTitle.trim();
    if (!trimmed) return;

    setTitle(trimmed);
    setEditing(false);

    startTransition(() => {
      updateTask(task.id, { title: trimmed, time: null });
    });
  };

  if (removed) return null;

  const actionButton =
    "shrink-0 rounded-xl p-1.5 text-ink-soft shadow-soft transition-all hover:-translate-y-px hover:bg-pink-100 hover:text-pink-600 hover:shadow-lift active:translate-y-0";
  const hoverReveal =
    "[@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100 [@media(hover:hover)]:focus-visible:opacity-100";

  return (
    <div className="group flex items-center gap-2 rounded-2xl border border-pink-100/80 bg-white px-3 py-3 shadow-soft transition-all duration-200 hover:-translate-y-px hover:border-pink-200 hover:shadow-lift sm:gap-3 sm:px-4">
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
          <button
            type="button"
            onClick={startEditing}
            title="Editar tarefa"
            className="min-w-0 flex-1 break-words text-left font-medium text-ink transition-colors hover:text-pink-600"
          >
            {title}
          </button>

          <DatePicker
            value=""
            onChange={handleSchedule}
            placeholder="Definir dia"
            className="w-[9.5rem] shrink-0"
          />

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
            onClick={() => setConfirmingDelete(true)}
            aria-label="Excluir tarefa"
            title="Excluir tarefa"
            className={cn(actionButton, hoverReveal)}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </>
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
