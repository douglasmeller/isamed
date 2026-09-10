"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getMonthGrid, WEEKDAY_LABELS } from "@/lib/calendarGrid";
import { formatDayMonth, formatMonthYear, formatWeekday, toISODate } from "@/lib/dates";
import { cn } from "@/lib/cn";
import { AddTaskForm } from "@/components/AddTaskForm";
import { TaskList } from "@/components/TaskList";
import type { Entry, Task } from "@/lib/types";

export function MonthCalendar({
  year,
  month,
  tasks,
  entries,
  todayISO,
}: {
  year: number;
  month: number;
  tasks: Task[];
  entries: Entry[];
  todayISO: string;
}) {
  const days = getMonthGrid(year, month);
  const monthDate = new Date(year, month, 1);

  const currentMonthISO = todayISO.slice(0, 7);
  const gridMonthISO = `${year}-${String(month + 1).padStart(2, "0")}`;
  const [selected, setSelected] = useState<string>(
    gridMonthISO === currentMonthISO ? todayISO : toISODate(monthDate),
  );

  const tasksByDate = new Map<string, Task[]>();
  for (const task of tasks) {
    const list = tasksByDate.get(task.date) ?? [];
    list.push(task);
    tasksByDate.set(task.date, list);
  }

  const entriesByDate = new Map<string, Entry[]>();
  for (const entry of entries) {
    const list = entriesByDate.get(entry.date) ?? [];
    list.push(entry);
    entriesByDate.set(entry.date, list);
  }

  const prevMonth = new Date(year, month - 1, 1);
  const nextMonth = new Date(year, month + 1, 1);
  const selectedDate = new Date(`${selected}T00:00:00`);

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl border border-pink-100/80 bg-white p-4 shadow-lift sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-ink">{formatMonthYear(monthDate)}</h1>
          <div className="flex gap-1">
            <Link
              href={`/calendario?month=${toISODate(prevMonth).slice(0, 7)}`}
              className="flex h-9 w-9 items-center justify-center rounded-xl text-ink-soft transition-colors hover:bg-pink-100 hover:text-pink-600"
              aria-label="Mês anterior"
            >
              <ChevronLeft className="h-5 w-5" />
            </Link>
            <Link
              href={`/calendario?month=${toISODate(nextMonth).slice(0, 7)}`}
              className="flex h-9 w-9 items-center justify-center rounded-xl text-ink-soft transition-colors hover:bg-pink-100 hover:text-pink-600"
              aria-label="Próximo mês"
            >
              <ChevronRight className="h-5 w-5" />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold uppercase text-ink-soft">
          {WEEKDAY_LABELS.map((label) => (
            <div key={label} className="py-1.5">
              {label}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {days.map((day) => {
            const iso = toISODate(day);
            const inMonth = day.getMonth() === month;
            const isToday = iso === todayISO;
            const isSelected = iso === selected;
            const dayTasks = tasksByDate.get(iso) ?? [];
            const hasPending = dayTasks.some((t) => !t.done);
            const hasDone = dayTasks.some((t) => t.done);

            const dayEntries = entriesByDate.get(iso) ?? [];
            const hasExam = dayEntries.some((e) => e.kind === "exam");
            const hasNote = dayEntries.some((e) => e.kind === "note");

            return (
              <button
                key={iso}
                type="button"
                onClick={() => setSelected(iso)}
                className={cn(
                  "flex aspect-square flex-col items-center justify-center gap-1 rounded-xl text-sm font-medium transition-all duration-200",
                  !inMonth && "text-ink-soft/40",
                  inMonth && !isSelected && "text-ink hover:bg-pink-100 hover:shadow-soft",
                  isSelected && "bg-pink-500 text-white shadow-lift",
                  isToday && !isSelected && "ring-2 ring-pink-400 ring-inset",
                )}
              >
                {day.getDate()}
                <span className="flex h-1.5 flex-wrap justify-center gap-0.5">
                  {hasPending && (
                    <span
                      className={cn(
                        "h-1.5 w-1.5 rounded-full",
                        isSelected ? "bg-white" : "bg-pink-500",
                      )}
                    />
                  )}
                  {hasDone && (
                    <span
                      className={cn(
                        "h-1.5 w-1.5 rounded-full",
                        isSelected ? "bg-white/60" : "bg-pink-300",
                      )}
                    />
                  )}
                  {hasExam && (
                    <span
                      className={cn(
                        "h-1.5 w-1.5 rounded-full",
                        isSelected ? "bg-white" : "bg-purple-500",
                      )}
                    />
                  )}
                  {hasNote && (
                    <span
                      className={cn(
                        "h-1.5 w-1.5 rounded-full",
                        isSelected ? "bg-white/80" : "bg-rose-800",
                      )}
                    />
                  )}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-pink-100 pt-3 text-xs font-medium text-ink-soft">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-pink-500" />
            Tarefa pendente
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-pink-300" />
            Tarefa feita
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-purple-500" />
            Prova
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-rose-800" />
            Anotação
          </span>
        </div>
      </div>

      <div>
        <p className="mb-3 text-sm font-semibold text-ink-soft">
          {formatWeekday(selectedDate)}, {formatDayMonth(selectedDate)}
        </p>
        <div className="flex flex-col gap-3">
          <AddTaskForm date={selected} />
          <TaskList tasks={tasksByDate.get(selected) ?? []} />
        </div>
      </div>
    </div>
  );
}
