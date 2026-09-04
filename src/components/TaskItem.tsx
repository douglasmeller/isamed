"use client";

import { useState, useTransition } from "react";
import { Check, Trash2 } from "lucide-react";
import { cn } from "@/lib/cn";
import { toggleTask, deleteTask } from "@/app/actions/tasks";
import type { Task } from "@/lib/types";

export function TaskItem({ task }: { task: Task }) {
  const [optimisticDone, setOptimisticDone] = useState(task.done);
  const [removed, setRemoved] = useState(false);
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
          "flex-1 truncate font-medium text-ink",
          optimisticDone && "text-ink-soft line-through",
        )}
      >
        {task.title}
      </p>

      <button
        type="button"
        onClick={handleDelete}
        aria-label="Excluir tarefa"
        className="shrink-0 rounded-xl p-2 text-ink-soft opacity-0 transition-all hover:bg-pink-100 hover:text-pink-600 group-hover:opacity-100 focus:opacity-100"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
