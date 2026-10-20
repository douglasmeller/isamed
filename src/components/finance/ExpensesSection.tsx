"use client";

import { useState, useTransition } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { ExpenseForm } from "@/components/finance/ExpenseForm";
import {
  actionButtonClass,
  EmptyNote,
  hoverRevealClass,
  primaryButtonClass,
  secondaryButtonClass,
  SectionCard,
  Tag,
} from "@/components/finance/ui";
import {
  createExpense,
  deleteExpense,
  endRecurringExpense,
  updateExpense,
  type ExpenseInput,
} from "@/app/actions/finance";
import { cn } from "@/lib/cn";
import { formatShortDate, formatMonthYear } from "@/lib/dates";
import {
  monthToDate,
  PAYMENT_LABELS,
  type Expense,
  type ExpenseOccurrence,
  type FinanceCategory,
} from "@/lib/finance";
import { formatCents } from "@/lib/money";

function toInput(e: Expense): ExpenseInput {
  return {
    description: e.description,
    amountCents: e.amount_cents,
    date: e.date,
    categoryId: e.category_id,
    paymentMethod: e.payment_method,
    recurrence: e.recurrence,
    installments: e.installments,
  };
}

export function ExpensesSection({
  occurrences,
  categories,
  month,
  defaultDate,
  totalCents,
}: {
  occurrences: ExpenseOccurrence[];
  categories: FinanceCategory[];
  month: string;
  defaultDate: string;
  totalCents: number;
}) {
  const [adding, setAdding] = useState(false);
  const [, startTransition] = useTransition();

  const handleCreate = (input: ExpenseInput) => {
    setAdding(false);
    startTransition(() => {
      createExpense(input);
    });
  };

  return (
    <SectionCard
      title="Gastos"
      aside={<span className="text-sm font-semibold text-ink-soft">{formatCents(totalCents)}</span>}
    >
      {adding ? (
        <div className="rounded-2xl border border-pink-100 p-3 sm:p-4">
          <ExpenseForm
            categories={categories}
            defaultDate={defaultDate}
            submitLabel="Adicionar gasto"
            onSubmit={handleCreate}
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
          Novo gasto
        </button>
      )}

      {occurrences.length === 0 ? (
        <EmptyNote>Nenhum gasto nesse mês.</EmptyNote>
      ) : (
        <div className="flex flex-col gap-2">
          {occurrences.map((o) => (
            <ExpenseRow
              key={o.expense.id}
              occurrence={o}
              categories={categories}
              month={month}
              defaultDate={defaultDate}
            />
          ))}
        </div>
      )}
    </SectionCard>
  );
}

function ExpenseRow({
  occurrence,
  categories,
  month,
  defaultDate,
}: {
  occurrence: ExpenseOccurrence;
  categories: FinanceCategory[];
  month: string;
  defaultDate: string;
}) {
  const { expense } = occurrence;
  const [editing, setEditing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [removed, setRemoved] = useState(false);
  const [, startTransition] = useTransition();

  const category = categories.find((c) => c.id === expense.category_id);
  const monthLabel = formatMonthYear(monthToDate(month));

  const handleSave = (input: ExpenseInput) => {
    setEditing(false);
    startTransition(() => {
      updateExpense(expense.id, input);
    });
  };

  const handleStopRepeating = () => {
    setEditing(false);
    startTransition(() => {
      endRecurringExpense(expense.id, month);
    });
  };

  const handleDelete = () => {
    setConfirmingDelete(false);
    setRemoved(true);
    startTransition(() => {
      deleteExpense(expense.id);
    });
  };

  if (removed) return null;

  const deleteDetail =
    expense.recurrence === "installments"
      ? `Todas as ${expense.installments} parcelas serão removidas.`
      : expense.recurrence === "monthly"
        ? "Isso remove todos os meses. Pra só parar de repetir, use \"Parar de repetir\" ao editar."
        : undefined;

  if (editing) {
    return (
      <div className="rounded-2xl border border-pink-200 p-3 sm:p-4">
        <ExpenseForm
          categories={categories}
          initial={toInput(expense)}
          defaultDate={defaultDate}
          submitLabel="Salvar"
          onSubmit={handleSave}
          onCancel={() => setEditing(false)}
          extraActions={
            expense.recurrence === "monthly" && expense.end_month !== month ? (
              <button type="button" onClick={handleStopRepeating} className={secondaryButtonClass}>
                Parar de repetir depois de {monthLabel}
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
        title="Editar gasto"
        className="flex min-w-0 flex-1 flex-col gap-1 text-left"
      >
        <span className="break-words font-medium text-ink">{expense.description}</span>
        <span className="flex flex-wrap items-center gap-1">
          <span className="mr-0.5 text-xs font-semibold text-ink-soft">
            {formatShortDate(new Date(`${occurrence.date}T00:00:00`))}
          </span>
          <Tag>{category?.name ?? "Sem categoria"}</Tag>
          <Tag tone="neutral">{PAYMENT_LABELS[expense.payment_method]}</Tag>
          {expense.recurrence === "monthly" && (
            <Tag tone="neutral">
              {expense.end_month === month ? "Último mês" : "Todo mês"}
            </Tag>
          )}
          {occurrence.installmentNumber !== null && (
            <Tag tone="neutral">
              Parcela {occurrence.installmentNumber}/{expense.installments}
            </Tag>
          )}
        </span>
      </button>

      <span className="shrink-0 font-semibold text-ink">{formatCents(occurrence.amount_cents)}</span>

      <button
        type="button"
        onClick={() => setEditing(true)}
        aria-label="Editar gasto"
        title="Editar gasto"
        className={cn(actionButtonClass, hoverRevealClass)}
      >
        <Pencil className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => setConfirmingDelete(true)}
        aria-label="Excluir gasto"
        title="Excluir gasto"
        className={cn(actionButtonClass, hoverRevealClass)}
      >
        <Trash2 className="h-4 w-4" />
      </button>

      <ConfirmDialog
        open={confirmingDelete}
        itemLabel={expense.description}
        detail={deleteDetail}
        onConfirm={handleDelete}
        onCancel={() => setConfirmingDelete(false)}
      />
    </div>
  );
}
