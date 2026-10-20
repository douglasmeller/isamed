"use client";

import { useState, useTransition } from "react";
import { Check, Pencil, Plus, Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import {
  actionButtonClass,
  FieldLabel,
  inputClass,
  primaryButtonClass,
  secondaryButtonClass,
  SectionCard,
} from "@/components/finance/ui";
import { saveSavingsGoal, setSavingsSaved } from "@/app/actions/finance";
import { cn } from "@/lib/cn";
import { centsToInput, formatCents, parseMoneyToCents } from "@/lib/money";

export function SavingsSection({
  month,
  amountCents,
  saved,
}: {
  month: string;
  amountCents: number | null;
  saved: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(amountCents ? centsToInput(amountCents) : "");
  const [optimisticSaved, setOptimisticSaved] = useState(saved);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [, startTransition] = useTransition();

  const cents = parseMoneyToCents(value);

  if (editing) {
    return (
      <SectionCard title="Guardar no mês">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (cents === null) return;
            setEditing(false);
            startTransition(() => {
              saveSavingsGoal(month, cents);
            });
          }}
          className="flex flex-col gap-4"
        >
          <label className="flex flex-col gap-1.5">
            <FieldLabel>Quanto quer guardar esse mês</FieldLabel>
            <input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              inputMode="decimal"
              placeholder="0,00"
              aria-label="Valor para guardar"
              autoFocus
              className={`${inputClass} w-40`}
            />
          </label>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setEditing(false)} className={secondaryButtonClass}>
              Cancelar
            </button>
            <button type="submit" disabled={cents === null} className={primaryButtonClass}>
              Salvar
            </button>
          </div>
        </form>
      </SectionCard>
    );
  }

  if (amountCents === null) {
    return (
      <SectionCard title="Guardar no mês">
        <p className="text-sm text-ink-soft">Defina quanto quer guardar nesse mês.</p>
        <button
          type="button"
          onClick={() => setEditing(true)}
          className={cn(primaryButtonClass, "flex items-center justify-center gap-1.5 self-start")}
        >
          <Plus className="h-4 w-4" strokeWidth={2.5} />
          Definir valor
        </button>
      </SectionCard>
    );
  }

  return (
    <SectionCard
      title="Guardar no mês"
      aside={
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={() => {
              setValue(centsToInput(amountCents));
              setEditing(true);
            }}
            aria-label="Editar valor para guardar"
            title="Editar"
            className={actionButtonClass}
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setConfirmingDelete(true)}
            aria-label="Excluir meta de guardar"
            title="Excluir"
            className={actionButtonClass}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      }
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-2xl font-semibold text-ink">{formatCents(amountCents)}</span>
        <button
          type="button"
          onClick={() => {
            const next = !optimisticSaved;
            setOptimisticSaved(next);
            startTransition(() => {
              setSavingsSaved(month, next);
            });
          }}
          aria-pressed={optimisticSaved}
          className={cn(
            "flex items-center gap-1.5 rounded-2xl border px-4 py-2 text-sm font-semibold shadow-soft transition-all hover:-translate-y-px hover:shadow-lift active:translate-y-0",
            optimisticSaved
              ? "border-pink-500 bg-pink-500 text-white"
              : "border-pink-200/80 bg-white text-ink-soft hover:text-ink",
          )}
        >
          <Check className="h-4 w-4" strokeWidth={3} />
          {optimisticSaved ? "Guardado" : "Marcar como guardado"}
        </button>
      </div>

      <ConfirmDialog
        open={confirmingDelete}
        itemLabel={`meta de guardar ${formatCents(amountCents)}`}
        onConfirm={() => {
          setConfirmingDelete(false);
          startTransition(() => {
            saveSavingsGoal(month, null);
          });
        }}
        onCancel={() => setConfirmingDelete(false)}
      />
    </SectionCard>
  );
}
