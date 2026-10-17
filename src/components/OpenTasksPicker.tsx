"use client";

import { useState, useTransition } from "react";
import { CalendarPlus, ChevronDown, Inbox } from "lucide-react";
import { moveTask } from "@/app/actions/tasks";
import { cn } from "@/lib/cn";
import type { OpenTask } from "@/lib/types";

// Lista as tarefas de "Em aberto" dentro do painel de um dia do calendario;
// tocar numa delas ja coloca ela nesse dia.
export function OpenTasksPicker({ openTasks, date }: { openTasks: OpenTask[]; date: string }) {
  const [expanded, setExpanded] = useState(false);
  const [scheduledIds, setScheduledIds] = useState<Set<string>>(new Set());
  const [, startTransition] = useTransition();

  const visible = openTasks.filter((t) => !scheduledIds.has(t.id));

  const schedule = (id: string) => {
    setScheduledIds((prev) => new Set(prev).add(id));
    startTransition(() => {
      moveTask(id, date);
    });
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        className="flex items-center justify-center gap-1.5 self-start rounded-2xl border border-blue-300/70 bg-white px-4 py-2 text-sm font-semibold text-ink-soft shadow-soft transition-all hover:-translate-y-px hover:text-ink hover:shadow-lift active:translate-y-0"
      >
        <Inbox className="h-4 w-4 text-blue-400" />
        Ver tarefas em aberto
        {visible.length > 0 && (
          <span className="rounded-full bg-blue-100 px-1.5 text-xs font-semibold text-blue-500">
            {visible.length}
          </span>
        )}
        <ChevronDown className={cn("h-4 w-4 transition-transform", expanded && "rotate-180")} />
      </button>

      {expanded && (
        <div className="rounded-2xl border border-blue-300/70 bg-white p-2 shadow-soft">
          {visible.length === 0 ? (
            <p className="px-2 py-3 text-center text-sm text-ink-soft">
              Nenhuma tarefa em aberto.
            </p>
          ) : (
            <div className="flex flex-col gap-0.5">
              {visible.map((task) => (
                <button
                  key={task.id}
                  type="button"
                  onClick={() => schedule(task.id)}
                  title="Colocar nesse dia"
                  className="group flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-medium text-ink transition-colors hover:bg-blue-50"
                >
                  <span className="min-w-0 flex-1 break-words">{task.title}</span>
                  <CalendarPlus className="h-4 w-4 shrink-0 text-blue-300 transition-colors group-hover:text-blue-500" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
