"use client";

import { useState, useTransition } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { GoalDayCell } from "@/components/goals/GoalCheckButtons";
import { useGoalChecks } from "@/components/goals/useGoalChecks";
import {
  actionButtonClass,
  EmptyNote,
  FieldLabel,
  hoverRevealClass,
  inputClass,
  PillOption,
  primaryButtonClass,
  secondaryButtonClass,
} from "@/components/finance/ui";
import { createGoal, deleteGoal, updateGoal } from "@/app/actions/goals";
import { cn } from "@/lib/cn";
import {
  ALL_WEEKDAYS,
  goalAppliesOn,
  nextStatus,
  WEEKDAY_SHORT,
  weekdayOf,
  weekdaysLabel,
  type Goal,
  type GoalCheck,
  type GoalStatus,
} from "@/lib/goals";

const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0];

function GoalForm({
  initial,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  initial?: Goal;
  submitLabel: string;
  onSubmit: (input: { title: string; weekdays: number[] }) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [weekdays, setWeekdays] = useState<number[]>(initial?.weekdays ?? ALL_WEEKDAYS);

  const everyDay = weekdays.length === 7;
  // Com "todos os dias" ligado, tocar num dia quer dizer "so esse dia".
  const toggleDay = (d: number) =>
    setWeekdays((prev) =>
      prev.length === 7 ? [d] : prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d],
    );

  const canSubmit = title.trim().length > 0 && weekdays.length > 0;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (canSubmit) onSubmit({ title: title.trim(), weekdays });
      }}
      className="flex flex-col gap-4"
    >
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Meta (ex: Academia, Beber 2L de água...)"
        aria-label="Nome da meta"
        autoFocus
        className={inputClass}
      />
      <div className="flex flex-col gap-2">
        <FieldLabel>Quais dias</FieldLabel>
        <div className="flex flex-wrap gap-2">
          <PillOption selected={everyDay} onClick={() => setWeekdays(everyDay ? [] : ALL_WEEKDAYS)}>
            Todos os dias
          </PillOption>
          {WEEK_ORDER.map((d) => (
            <PillOption key={d} selected={!everyDay && weekdays.includes(d)} onClick={() => toggleDay(d)}>
              {WEEKDAY_SHORT[d]}
            </PillOption>
          ))}
        </div>
        {weekdays.length === 0 && (
          <span className="text-xs font-medium text-red-500">Escolha pelo menos um dia.</span>
        )}
      </div>
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCancel} className={secondaryButtonClass}>
          Cancelar
        </button>
        <button type="submit" disabled={!canSubmit} className={primaryButtonClass}>
          {submitLabel}
        </button>
      </div>
    </form>
  );
}

export function GoalsBoard({
  goals,
  checks,
  days,
  today,
}: {
  goals: Goal[];
  checks: GoalCheck[];
  days: string[]; // os 7 dias da semana exibida
  today: string;
}) {
  const [adding, setAdding] = useState(false);
  const [, startTransition] = useTransition();
  const { getStatus, setStatus } = useGoalChecks(checks);

  return (
    <div className="flex flex-col gap-4">
      {adding ? (
        <div className="rounded-2xl border border-pink-100/80 bg-white p-4 shadow-soft sm:p-5">
          <GoalForm
            submitLabel="Criar meta"
            onSubmit={(input) => {
              setAdding(false);
              startTransition(() => {
                createGoal(input);
              });
            }}
            onCancel={() => setAdding(false)}
          />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className={cn(primaryButtonClass, "flex items-center justify-center gap-1.5 self-start")}
        >
          <Plus className="h-4 w-4" strokeWidth={2.5} />
          Nova meta
        </button>
      )}

      {goals.length === 0 ? (
        <EmptyNote>Nenhuma meta ainda. Crie uma pra começar a marcar os dias.</EmptyNote>
      ) : (
        <div className="grid gap-3 xl:grid-cols-2 xl:items-start">
          {goals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              days={days}
              today={today}
              getStatus={getStatus}
              setStatus={setStatus}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function GoalCard({
  goal,
  days,
  today,
  getStatus,
  setStatus,
}: {
  goal: Goal;
  days: string[];
  today: string;
  getStatus: (goalId: string, date: string) => GoalStatus | null;
  setStatus: (goalId: string, date: string, status: GoalStatus | null) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [removed, setRemoved] = useState(false);
  const [, startTransition] = useTransition();

  if (removed) return null;

  if (editing) {
    return (
      <div className="rounded-2xl border border-pink-200 bg-white p-4 shadow-soft sm:p-5">
        <GoalForm
          initial={goal}
          submitLabel="Salvar"
          onSubmit={(input) => {
            setEditing(false);
            startTransition(() => {
              updateGoal(goal.id, input);
            });
          }}
          onCancel={() => setEditing(false)}
        />
      </div>
    );
  }

  const applicablePast = days.filter((d) => goalAppliesOn(goal, d) && d <= today);
  const doneCount = applicablePast.filter((d) => getStatus(goal.id, d) === "done").length;

  return (
    <div className="group flex flex-col gap-3 rounded-2xl border border-pink-100/80 bg-white px-3 py-3 shadow-soft transition-all duration-200 hover:border-pink-200 hover:shadow-lift sm:px-4">
      <div className="flex items-start gap-2">
        <button
          type="button"
          onClick={() => setEditing(true)}
          title="Editar meta"
          className="flex min-w-0 flex-1 flex-col text-left"
        >
          <span className="break-words font-medium text-ink">{goal.title}</span>
          <span className="text-xs font-medium text-ink-soft">
            {weekdaysLabel(goal.weekdays)}
            {applicablePast.length > 0 && ` · ${doneCount} de ${applicablePast.length} nessa semana`}
          </span>
        </button>
        <button
          type="button"
          onClick={() => setEditing(true)}
          aria-label="Editar meta"
          title="Editar meta"
          className={cn(actionButtonClass, hoverRevealClass)}
        >
          <Pencil className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => setConfirmingDelete(true)}
          aria-label="Excluir meta"
          title="Excluir meta"
          className={cn(actionButtonClass, hoverRevealClass)}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const status = getStatus(goal.id, day);
          const applies = goalAppliesOn(goal, day);
          const future = day > today;
          const label = `${WEEKDAY_SHORT[weekdayOf(day)]} ${Number(day.slice(8, 10))}`;
          return (
            <div key={day} className="flex flex-col items-center gap-1">
              <span
                className={cn(
                  "text-[10px] font-semibold uppercase",
                  day === today ? "text-pink-600" : "text-ink-soft",
                )}
              >
                {WEEKDAY_SHORT[weekdayOf(day)]}
              </span>
              <GoalDayCell
                status={status}
                applies={applies}
                future={future}
                label={label}
                onClick={() => setStatus(goal.id, day, nextStatus(status))}
              />
              <span
                className={cn(
                  "text-[10px] font-medium",
                  day === today ? "font-bold text-pink-600" : "text-ink-soft",
                )}
              >
                {Number(day.slice(8, 10))}
              </span>
            </div>
          );
        })}
      </div>

      <ConfirmDialog
        open={confirmingDelete}
        itemLabel={goal.title}
        detail="Todas as marcações dessa meta também serão apagadas."
        onConfirm={() => {
          setConfirmingDelete(false);
          setRemoved(true);
          startTransition(() => {
            deleteGoal(goal.id);
          });
        }}
        onCancel={() => setConfirmingDelete(false)}
      />
    </div>
  );
}
