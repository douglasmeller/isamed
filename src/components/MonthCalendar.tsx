"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getMonthGrid, WEEKDAY_LABELS } from "@/lib/calendarGrid";
import { formatDayMonth, formatMonthYear, formatWeekday, toISODate } from "@/lib/dates";
import { cn } from "@/lib/cn";
import { AddTaskForm } from "@/components/AddTaskForm";
import { TaskList } from "@/components/TaskList";
import { AddEntryForm } from "@/components/AddEntryForm";
import { EntryList } from "@/components/EntryList";
import { OpenTasksPicker } from "@/components/OpenTasksPicker";
import { GoalStatusButtons } from "@/components/goals/GoalCheckButtons";
import { useGoalChecks } from "@/components/goals/useGoalChecks";
import { goalAppliesOn, type Goal, type GoalCheck } from "@/lib/goals";
import type { Entry, ItemLink, OpenTask, Task } from "@/lib/types";

export function MonthCalendar({
  year,
  month,
  tasks,
  entries,
  links,
  openTasks,
  goals,
  goalChecks,
  todayISO,
  initialSelected,
  initialFocus,
}: {
  year: number;
  month: number;
  tasks: Task[];
  entries: Entry[];
  links: ItemLink[];
  openTasks: OpenTask[];
  goals: Goal[];
  goalChecks: GoalCheck[];
  todayISO: string;
  // Vem de ?day= e ?focus= quando se chega aqui pelo link de um item
  // vinculado, pra abrir direto no dia certo e destacar o item.
  initialSelected?: string;
  initialFocus?: string;
}) {
  const days = getMonthGrid(year, month);
  const { getStatus, setStatus } = useGoalChecks(goalChecks);
  const monthDate = new Date(year, month, 1);

  const currentMonthISO = todayISO.slice(0, 7);
  const gridMonthISO = `${year}-${String(month + 1).padStart(2, "0")}`;
  const [selected, setSelected] = useState<string>(
    initialSelected ?? (gridMonthISO === currentMonthISO ? todayISO : toISODate(monthDate)),
  );

  // Rola ate o item vinculado e da um destaque rapido, so na primeira
  // renderizacao (chegando aqui por um link de "vincular").
  useEffect(() => {
    if (!initialFocus) return;
    const el = document.getElementById(`item-${initialFocus}`);
    if (!el) return;

    el.scrollIntoView({ behavior: "smooth", block: "center" });
    el.classList.add("ring-2", "ring-pink-400");
    const timeout = setTimeout(() => el.classList.remove("ring-2", "ring-pink-400"), 1800);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const selectedTasks = tasksByDate.get(selected) ?? [];
  const selectedEntries = entriesByDate.get(selected) ?? [];
  const selectedExams = selectedEntries.filter((e) => e.kind === "exam");
  const selectedNotes = selectedEntries.filter((e) => e.kind === "note");
  const selectedGoals = goals.filter((g) => goalAppliesOn(g, selected));
  const selectedIsFuture = selected > todayISO;

  return (
    // Tela larga: calendario fixo a esquerda, painel do dia rolando a direita.
    <div className="flex flex-col gap-6 xl:grid xl:grid-cols-2 xl:items-start xl:gap-10">
      <div className="rounded-2xl border border-pink-100/80 bg-white p-4 shadow-lift sm:p-6 xl:sticky xl:top-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-ink">{formatMonthYear(monthDate)}</h2>
          <div className="flex gap-1">
            <Link
              href={`/calendario?month=${toISODate(prevMonth).slice(0, 7)}`}
              className="flex h-9 w-9 items-center justify-center rounded-xl text-ink-soft shadow-soft transition-all hover:-translate-y-px hover:bg-pink-100 hover:text-pink-600 hover:shadow-lift active:translate-y-0"
              aria-label="Mês anterior"
            >
              <ChevronLeft className="h-5 w-5" />
            </Link>
            <Link
              href={`/calendario?month=${toISODate(nextMonth).slice(0, 7)}`}
              className="flex h-9 w-9 items-center justify-center rounded-xl text-ink-soft shadow-soft transition-all hover:-translate-y-px hover:bg-pink-100 hover:text-pink-600 hover:shadow-lift active:translate-y-0"
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
            const hasOpenOrigin = dayTasks.some((t) => t.was_open);

            const dayEntries = entriesByDate.get(iso) ?? [];
            const hasExam = dayEntries.some((e) => e.kind === "exam");
            const hasNote = dayEntries.some((e) => e.kind === "note");
            const goalStatuses = goals
              .filter((g) => goalAppliesOn(g, iso))
              .map((g) => getStatus(g.id, iso));
            const hasGoalDone = goalStatuses.includes("done");
            const hasGoalMissed = goalStatuses.includes("missed");

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
                {/* Com muitos tipos no mesmo dia as bolinhas quebram linha
                    no celular; min-h deixa a segunda linha crescer sem sobrepor. */}
                <span className="flex min-h-1.5 max-w-full flex-wrap justify-center gap-0.5">
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
                  {hasOpenOrigin && (
                    <span
                      className={cn(
                        "h-1.5 w-1.5 rounded-full",
                        isSelected ? "bg-white" : "bg-blue-300",
                      )}
                    />
                  )}
                  {hasGoalDone && (
                    <span
                      className={cn(
                        "h-1.5 w-1.5 rounded-full",
                        isSelected ? "bg-white" : "bg-emerald-400",
                      )}
                    />
                  )}
                  {hasGoalMissed && (
                    <span
                      className={cn(
                        "h-1.5 w-1.5 rounded-full",
                        isSelected ? "bg-white/70" : "bg-red-400",
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
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-blue-300" />
            Estava em aberto
          </span>
          {goals.length > 0 && (
            <>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Meta cumprida
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-red-400" />
                Meta não cumprida
              </span>
            </>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-8">
        <p className="text-sm font-semibold text-ink-soft">
          {formatWeekday(selectedDate)}, {formatDayMonth(selectedDate)}
        </p>

        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-ink">Tarefas</h2>
          <AddTaskForm date={selected} />
          <OpenTasksPicker openTasks={openTasks} date={selected} />
          <TaskList tasks={selectedTasks} allTasks={tasks} allEntries={entries} allLinks={links} />
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-ink">Provas</h2>
          <AddEntryForm kind="exam" placeholder="Nome da prova..." date={selected} />
          <EntryList
            entries={selectedExams}
            emptyLabel="Nenhuma prova nesse dia."
            allTasks={tasks}
            allEntries={entries}
            allLinks={links}
          />
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-ink">Anotações</h2>
          <AddEntryForm kind="note" placeholder="Nova anotação..." date={selected} />
          <EntryList
            entries={selectedNotes}
            emptyLabel="Nenhuma anotação nesse dia."
            allTasks={tasks}
            allEntries={entries}
            allLinks={links}
          />
        </section>

        {goals.length > 0 && (
          <section className="flex flex-col gap-3">
            <h2 className="text-sm font-semibold text-ink">Metas</h2>
            {selectedGoals.length === 0 ? (
              <p className="rounded-2xl border-2 border-dashed border-pink-200 px-4 py-6 text-center text-ink-soft">
                Nenhuma meta nesse dia.
              </p>
            ) : (
              <div className="flex flex-col gap-2.5">
                {selectedIsFuture && (
                  <p className="text-xs font-medium text-ink-soft">
                    Dá pra marcar quando o dia chegar.
                  </p>
                )}
                {selectedGoals.map((goal) => (
                  <div
                    key={goal.id}
                    className="flex items-center gap-3 rounded-2xl border border-pink-100/80 bg-white px-3 py-3 shadow-soft sm:px-4"
                  >
                    <span className="min-w-0 flex-1 break-words font-medium text-ink">{goal.title}</span>
                    <GoalStatusButtons
                      status={getStatus(goal.id, selected)}
                      disabled={selectedIsFuture}
                      onChange={(status) => setStatus(goal.id, selected, status)}
                    />
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
