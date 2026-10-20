"use client";

import { useState, useTransition } from "react";
import { Check, Pencil } from "lucide-react";
import {
  actionButtonClass,
  EmptyNote,
  FieldLabel,
  inputClass,
  primaryButtonClass,
  secondaryButtonClass,
  SectionCard,
  Tag,
} from "@/components/finance/ui";
import { saveCardSettings, setCardBillPaid } from "@/app/actions/finance";
import { cn } from "@/lib/cn";
import { formatShortDate } from "@/lib/dates";
import type { BillCycle, ExpenseOccurrence } from "@/lib/finance";
import { formatCents } from "@/lib/money";

const shortDate = (iso: string) => formatShortDate(new Date(`${iso}T00:00:00`));

function CardSettingsForm({
  initialClosing,
  initialDue,
  onDone,
}: {
  initialClosing: number | null;
  initialDue: number | null;
  onDone?: () => void;
}) {
  const [closing, setClosing] = useState(initialClosing ? String(initialClosing) : "");
  const [due, setDue] = useState(initialDue ? String(initialDue) : "");
  const [, startTransition] = useTransition();

  const valid = (v: string) => /^\d{1,2}$/.test(v) && Number(v) >= 1 && Number(v) <= 31;
  const canSubmit = valid(closing) && valid(due);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!canSubmit) return;
        startTransition(() => {
          saveCardSettings({ closingDay: Number(closing), dueDay: Number(due) });
        });
        onDone?.();
      }}
      className="flex flex-col gap-4"
    >
      <p className="text-sm text-ink-soft">
        Compras no crédito depois do fechamento entram na fatura seguinte.
      </p>
      <div className="flex flex-wrap gap-3">
        <label className="flex flex-col gap-1.5">
          <FieldLabel>Dia do fechamento</FieldLabel>
          <input
            value={closing}
            onChange={(e) => setClosing(e.target.value.replace(/\D/g, "").slice(0, 2))}
            inputMode="numeric"
            placeholder="Ex: 3"
            aria-label="Dia do fechamento"
            className={`${inputClass} w-32 text-center`}
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <FieldLabel>Dia do pagamento</FieldLabel>
          <input
            value={due}
            onChange={(e) => setDue(e.target.value.replace(/\D/g, "").slice(0, 2))}
            inputMode="numeric"
            placeholder="Ex: 10"
            aria-label="Dia do pagamento"
            className={`${inputClass} w-32 text-center`}
          />
        </label>
      </div>
      <div className="flex justify-end gap-2">
        {onDone && (
          <button type="button" onClick={onDone} className={secondaryButtonClass}>
            Cancelar
          </button>
        )}
        <button type="submit" disabled={!canSubmit} className={primaryButtonClass}>
          Salvar cartão
        </button>
      </div>
    </form>
  );
}

export function CardBillSection({
  closingDay,
  dueDay,
  cycle,
  occurrences,
  totalCents,
  paid,
}: {
  closingDay: number | null;
  dueDay: number | null;
  cycle: BillCycle | null;
  occurrences: ExpenseOccurrence[];
  totalCents: number;
  paid: boolean;
}) {
  const [editingSettings, setEditingSettings] = useState(false);
  const [optimisticPaid, setOptimisticPaid] = useState(paid);
  const [, startTransition] = useTransition();

  if (!cycle || editingSettings) {
    return (
      <SectionCard title="Fatura do cartão">
        <CardSettingsForm
          initialClosing={closingDay}
          initialDue={dueDay}
          onDone={cycle ? () => setEditingSettings(false) : undefined}
        />
      </SectionCard>
    );
  }

  const togglePaid = () => {
    const next = !optimisticPaid;
    setOptimisticPaid(next);
    startTransition(() => {
      setCardBillPaid(cycle.dueMonth, next);
    });
  };

  return (
    <SectionCard
      title="Fatura do cartão"
      aside={
        <button
          type="button"
          onClick={() => setEditingSettings(true)}
          aria-label="Editar dias do cartão"
          title="Editar dias do cartão"
          className={actionButtonClass}
        >
          <Pencil className="h-4 w-4" />
        </button>
      }
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-1">
          <span className="text-2xl font-semibold text-ink">{formatCents(totalCents)}</span>
          <span className="flex flex-wrap gap-1">
            <Tag>Vence {shortDate(cycle.dueDate)}</Tag>
            <Tag tone="neutral">Fecha {shortDate(cycle.closingDate)}</Tag>
          </span>
        </div>
        <button
          type="button"
          onClick={togglePaid}
          aria-pressed={optimisticPaid}
          className={cn(
            "flex items-center gap-1.5 rounded-2xl border px-4 py-2 text-sm font-semibold shadow-soft transition-all hover:-translate-y-px hover:shadow-lift active:translate-y-0",
            optimisticPaid
              ? "border-pink-500 bg-pink-500 text-white"
              : "border-pink-200/80 bg-white text-ink-soft hover:text-ink",
          )}
        >
          <Check className="h-4 w-4" strokeWidth={3} />
          {optimisticPaid ? "Paga" : "Marcar como paga"}
        </button>
      </div>

      {occurrences.length === 0 ? (
        <EmptyNote>Nenhuma compra no crédito nessa fatura.</EmptyNote>
      ) : (
        <div className="flex flex-col divide-y divide-pink-100">
          {occurrences.map((o) => (
            <div
              key={`${o.expense.id}-${o.date}`}
              className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0"
            >
              <span className="w-11 shrink-0 text-xs font-semibold text-ink-soft">{shortDate(o.date)}</span>
              <span className="min-w-0 flex-1 break-words text-sm font-medium text-ink">
                {o.expense.description}
                {o.installmentNumber !== null && (
                  <span className="ml-1.5 text-xs font-medium text-ink-soft">
                    {o.installmentNumber}/{o.expense.installments}
                  </span>
                )}
              </span>
              <span className="shrink-0 text-sm font-semibold text-ink">{formatCents(o.amount_cents)}</span>
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
}
