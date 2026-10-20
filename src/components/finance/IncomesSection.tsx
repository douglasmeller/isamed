"use client";

import { useState, useTransition } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { DatePicker } from "@/components/DatePicker";
import {
  actionButtonClass,
  EmptyNote,
  FieldLabel,
  hoverRevealClass,
  inputClass,
  PillOption,
  primaryButtonClass,
  secondaryButtonClass,
  SectionCard,
  Tag,
} from "@/components/finance/ui";
import {
  createIncome,
  deleteIncome,
  endRecurringIncome,
  updateIncome,
  type IncomeInput,
} from "@/app/actions/finance";
import { cn } from "@/lib/cn";
import { formatMonthYear, formatShortDate } from "@/lib/dates";
import { monthToDate, type IncomeOccurrence } from "@/lib/finance";
import { centsToInput, formatCents, parseMoneyToCents } from "@/lib/money";

function IncomeForm({
  initial,
  defaultDate,
  submitLabel,
  onSubmit,
  onCancel,
  extraActions,
}: {
  initial?: IncomeInput;
  defaultDate: string;
  submitLabel: string;
  onSubmit: (input: IncomeInput) => void;
  onCancel: () => void;
  extraActions?: React.ReactNode;
}) {
  const [description, setDescription] = useState(initial?.description ?? "");
  const [amount, setAmount] = useState(initial ? centsToInput(initial.amountCents) : "");
  const [date, setDate] = useState(initial?.date ?? defaultDate);
  const [recurring, setRecurring] = useState(initial?.recurring ?? false);

  const cents = parseMoneyToCents(amount);
  const canSubmit = description.trim().length > 0 && cents !== null;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!canSubmit || cents === null) return;
        onSubmit({ description: description.trim(), amountCents: cents, date, recurring });
      }}
      className="flex flex-col gap-4"
    >
      <input
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Descrição (ex: Salário, Bolsa...)"
        aria-label="Descrição"
        autoFocus
        className={inputClass}
      />
      <div className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1.5">
          <FieldLabel>Valor</FieldLabel>
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            inputMode="decimal"
            placeholder="0,00"
            aria-label="Valor"
            className={`${inputClass} w-36`}
          />
        </label>
        <div className="flex flex-col gap-1.5">
          <FieldLabel>{recurring ? "Começa em" : "Data"}</FieldLabel>
          <DatePicker value={date} onChange={setDate} className="w-[9.5rem]" />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <FieldLabel>Repetição</FieldLabel>
        <div className="flex flex-wrap gap-2">
          <PillOption selected={!recurring} onClick={() => setRecurring(false)}>
            Única
          </PillOption>
          <PillOption selected={recurring} onClick={() => setRecurring(true)}>
            Todo mês
          </PillOption>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-end gap-2">
        {extraActions}
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

export function IncomesSection({
  occurrences,
  month,
  defaultDate,
  totalCents,
}: {
  occurrences: IncomeOccurrence[];
  month: string;
  defaultDate: string;
  totalCents: number;
}) {
  const [adding, setAdding] = useState(false);
  const [, startTransition] = useTransition();

  return (
    <SectionCard
      title="Renda"
      aside={<span className="text-sm font-semibold text-ink-soft">{formatCents(totalCents)}</span>}
    >
      {adding ? (
        <div className="rounded-2xl border border-pink-100 p-3 sm:p-4">
          <IncomeForm
            defaultDate={defaultDate}
            submitLabel="Adicionar entrada"
            onSubmit={(input) => {
              setAdding(false);
              startTransition(() => {
                createIncome(input);
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
          Nova entrada
        </button>
      )}

      {occurrences.length === 0 ? (
        <EmptyNote>Nenhuma entrada nesse mês.</EmptyNote>
      ) : (
        <div className="flex flex-col gap-2">
          {occurrences.map((o) => (
            <IncomeRow key={o.income.id} occurrence={o} month={month} defaultDate={defaultDate} />
          ))}
        </div>
      )}
    </SectionCard>
  );
}

function IncomeRow({
  occurrence,
  month,
  defaultDate,
}: {
  occurrence: IncomeOccurrence;
  month: string;
  defaultDate: string;
}) {
  const { income } = occurrence;
  const [editing, setEditing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [removed, setRemoved] = useState(false);
  const [, startTransition] = useTransition();

  if (removed) return null;

  if (editing) {
    return (
      <div className="rounded-2xl border border-pink-200 p-3 sm:p-4">
        <IncomeForm
          initial={{
            description: income.description,
            amountCents: income.amount_cents,
            date: income.date,
            recurring: income.recurring,
          }}
          defaultDate={defaultDate}
          submitLabel="Salvar"
          onSubmit={(input) => {
            setEditing(false);
            startTransition(() => {
              updateIncome(income.id, input);
            });
          }}
          onCancel={() => setEditing(false)}
          extraActions={
            income.recurring && income.end_month !== month ? (
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  startTransition(() => {
                    endRecurringIncome(income.id, month);
                  });
                }}
                className={secondaryButtonClass}
              >
                Parar de repetir depois de {formatMonthYear(monthToDate(month))}
              </button>
            ) : undefined
          }
        />
      </div>
    );
  }

  return (
    <div className="group flex items-center gap-2 rounded-2xl border border-pink-100/80 bg-white px-3 py-3 shadow-soft transition-all duration-200 hover:-translate-y-px hover:border-pink-200 hover:shadow-lift sm:gap-3 sm:px-4">
      <button
        type="button"
        onClick={() => setEditing(true)}
        title="Editar entrada"
        className="flex min-w-0 flex-1 flex-col gap-1 text-left"
      >
        <span className="break-words font-medium text-ink">{income.description}</span>
        <span className="flex flex-wrap items-center gap-1">
          <span className="mr-0.5 text-xs font-semibold text-ink-soft">
            {formatShortDate(new Date(`${occurrence.date}T00:00:00`))}
          </span>
          {income.recurring && (
            <Tag tone="neutral">{income.end_month === month ? "Último mês" : "Todo mês"}</Tag>
          )}
        </span>
      </button>

      <span className="shrink-0 font-semibold text-ink">{formatCents(occurrence.amount_cents)}</span>

      <button
        type="button"
        onClick={() => setEditing(true)}
        aria-label="Editar entrada"
        title="Editar entrada"
        className={cn(actionButtonClass, hoverRevealClass)}
      >
        <Pencil className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => setConfirmingDelete(true)}
        aria-label="Excluir entrada"
        title="Excluir entrada"
        className={cn(actionButtonClass, hoverRevealClass)}
      >
        <Trash2 className="h-4 w-4" />
      </button>

      <ConfirmDialog
        open={confirmingDelete}
        itemLabel={income.description}
        detail={
          income.recurring
            ? "Isso remove todos os meses. Pra só parar de repetir, use \"Parar de repetir\" ao editar."
            : undefined
        }
        onConfirm={() => {
          setConfirmingDelete(false);
          setRemoved(true);
          startTransition(() => {
            deleteIncome(income.id);
          });
        }}
        onCancel={() => setConfirmingDelete(false)}
      />
    </div>
  );
}
