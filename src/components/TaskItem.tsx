"use client";

import { useRef, useState, useTransition } from "react";
import { CalendarSync, Check, Trash2 } from "lucide-react";
import { cn } from "@/lib/cn";
import { toggleTask, deleteTask, moveTask } from "@/app/actions/tasks";
import type { Task } from "@/lib/types";

export function TaskItem({ task }: { task: Task }) {
  const [optimisticDone, setOptimisticDone] = useState(task.done);
  const [removed, setRemoved] = useState(false);
  const [moving, setMoving] = useState(false);
  const [, startTransition] = useTransition();
  const dateRef = useRef<HTMLInputElement>(null);

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

  const openDatePicker = () => {
    setMoving(true);
    // Abre o seletor nativo assim que o campo aparece.
    requestAnimationFrame(() => {
      dateRef.current?.focus();
      dateRef.current?.showPicker?.();
    });
  };

  if (removed) return null;

  return (
    <div
      className={cn(
        "group flex items-center gap-3 rounded-2xl border-2 border-pink-100 bg-white px-4 py-3.5 transition-colors hover:border-pink-300",
        optimisticDone && "border-transparent bg-pink-50",
      )}
    >
      <button
        type="button"
        onClick={handleToggle}
        aria-pressed={optimisticDone}
        aria-label={optimisticDone ? "Marcar como não feita" : "Marcar como feita"}
        className={cn(
          "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition-all",
          optimisticDone
            ? "border-pink-500 bg-pink-500 text-white"
            : "border-pink-300 text-transparent hover:border-pink-500",
        )}
      >
        <Check className="h-4 w-4" strokeWidth={3} />
      </button>

      {task.time && (
        <span
          className={cn(
            "shrink-0 rounded-full bg-pink-100 px-2.5 py-1 text-xs font-semibold text-pink-600",
            optimisticDone && "bg-white",
          )}
        >
          {task.time.slice(0, 5)}
        </span>
      )}

      <p
        className={cn(
          "min-w-0 flex-1 break-words font-medium text-ink",
          optimisticDone && "text-ink-soft line-through",
        )}
      >
        {task.title}
      </p>

      {moving ? (
        <input
          ref={dateRef}
          type="date"
          defaultValue={task.date}
          aria-label="Mudar para outro dia"
          onChange={(e) => handleMove(e.target.value)}
          onBlur={() => setMoving(false)}
          className="w-[9.5rem] shrink-0 rounded-xl border-2 border-pink-300 bg-white px-2 py-1.5 text-center text-sm text-ink outline-none transition-colors focus:border-pink-400"
        />
      ) : (
        <>
          <button
            type="button"
            onClick={openDatePicker}
            aria-label="Mudar para outro dia"
            title="Mudar para outro dia"
            className="shrink-0 rounded-xl p-2 text-ink-soft transition-all hover:bg-pink-100 hover:text-pink-600 focus:opacity-100 md:opacity-0 md:group-hover:opacity-100"
          >
            <CalendarSync className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={handleDelete}
            aria-label="Excluir tarefa"
            title="Excluir tarefa"
            className="shrink-0 rounded-xl p-2 text-ink-soft transition-all hover:bg-pink-100 hover:text-pink-600 focus:opacity-100 md:opacity-0 md:group-hover:opacity-100"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </>
      )}
    </div>
  );
}
