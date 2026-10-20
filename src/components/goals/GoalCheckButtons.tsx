"use client";

import { Check, X } from "lucide-react";
import { cn } from "@/lib/cn";
import type { GoalStatus } from "@/lib/goals";

export const STATUS_LABEL: Record<GoalStatus, string> = { done: "Fez", missed: "Não fez" };

// Um dia da semana na tela de Metas: toque alterna vazio -> fez -> nao fez.
export function GoalDayCell({
  status,
  applies,
  future,
  onClick,
  label,
}: {
  status: GoalStatus | null;
  applies: boolean;
  future: boolean;
  onClick: () => void;
  label: string;
}) {
  const disabled = !applies || future;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={`${label}: ${status ? STATUS_LABEL[status] : applies ? "sem marcação" : "não vale nesse dia"}`}
      title={!applies ? "Essa meta não vale nesse dia" : future ? "Esse dia ainda não chegou" : undefined}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-full border-2 transition-all duration-200 sm:h-10 sm:w-10",
        !applies && "border-dashed border-pink-100 bg-transparent",
        applies && status === null && "border-pink-200 bg-white",
        applies && status === null && !future && "hover:-translate-y-px hover:border-pink-400 hover:shadow-soft",
        applies && future && status === null && "opacity-50",
        status === "done" && "border-emerald-400 bg-emerald-400 text-white shadow-soft",
        status === "missed" && "border-red-400 bg-red-400 text-white shadow-soft",
        disabled && "cursor-default",
      )}
    >
      {status === "done" && <Check className="h-4 w-4" strokeWidth={3} />}
      {status === "missed" && <X className="h-4 w-4" strokeWidth={3} />}
    </button>
  );
}

// No painel do dia (Home): botoes explicitos de "fez" e "nao fez";
// tocar no que ja esta marcado tira a marcacao.
export function GoalStatusButtons({
  status,
  disabled,
  onChange,
}: {
  status: GoalStatus | null;
  disabled: boolean;
  onChange: (status: GoalStatus | null) => void;
}) {
  const base =
    "flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-40";
  return (
    <div className="flex shrink-0 gap-1.5">
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange(status === "done" ? null : "done")}
        aria-pressed={status === "done"}
        aria-label="Fez"
        title="Fez"
        className={cn(
          base,
          status === "done"
            ? "border-emerald-400 bg-emerald-400 text-white shadow-soft"
            : "border-emerald-200 bg-white text-emerald-400 hover:border-emerald-400",
        )}
      >
        <Check className="h-4 w-4" strokeWidth={3} />
      </button>
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange(status === "missed" ? null : "missed")}
        aria-pressed={status === "missed"}
        aria-label="Não fez"
        title="Não fez"
        className={cn(
          base,
          status === "missed"
            ? "border-red-400 bg-red-400 text-white shadow-soft"
            : "border-red-200 bg-white text-red-400 hover:border-red-400",
        )}
      >
        <X className="h-4 w-4" strokeWidth={3} />
      </button>
    </div>
  );
}
