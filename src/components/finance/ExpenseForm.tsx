"use client";

import { useState } from "react";
import { DatePicker } from "@/components/DatePicker";
import type { ExpenseInput } from "@/app/actions/finance";
import {
  PAYMENT_LABELS,
  splitInstallments,
  type FinanceCategory,
  type PaymentMethod,
  type Recurrence,
} from "@/lib/finance";
import { centsToInput, formatCents, parseMoneyToCents } from "@/lib/money";
import {
  FieldLabel,
  inputClass,
  PillOption,
  primaryButtonClass,
  secondaryButtonClass,
} from "@/components/finance/ui";

const RECURRENCE_LABELS: Record<Recurrence, string> = {
  none: "Única",
  monthly: "Todo mês",
  installments: "Parcelado",
};

export function ExpenseForm({
  categories,
  initial,
  defaultDate,
  submitLabel,
  onSubmit,
  onCancel,
  extraActions,
}: {
  categories: FinanceCategory[];
  initial?: ExpenseInput;
  defaultDate: string;
  submitLabel: string;
  onSubmit: (input: ExpenseInput) => void;
  onCancel?: () => void;
  extraActions?: React.ReactNode;
}) {
  const [description, setDescription] = useState(initial?.description ?? "");
  const [amount, setAmount] = useState(initial ? centsToInput(initial.amountCents) : "");
  const [date, setDate] = useState(initial?.date ?? defaultDate);
  const [categoryId, setCategoryId] = useState<string | null>(initial?.categoryId ?? null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    initial?.paymentMethod ?? "pix_debito",
  );
  const [recurrence, setRecurrence] = useState<Recurrence>(initial?.recurrence ?? "none");
  const [installments, setInstallments] = useState(String(initial?.installments ?? 2));

  const cents = parseMoneyToCents(amount);
  const installmentCount = Number(installments);
  const installmentsOk =
    recurrence !== "installments" ||
    (Number.isInteger(installmentCount) && installmentCount >= 2 && installmentCount <= 48);
  const canSubmit = description.trim().length > 0 && cents !== null && installmentsOk;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || cents === null) return;
    onSubmit({
      description: description.trim(),
      amountCents: cents,
      date,
      categoryId,
      paymentMethod,
      recurrence,
      installments: recurrence === "installments" ? installmentCount : null,
    });
  };

  const dateLabel =
    recurrence === "monthly" ? "Começa em" : recurrence === "installments" ? "Data da compra" : "Data";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <input
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Descrição (ex: Mercado, Cinema...)"
        aria-label="Descrição"
        autoFocus
        className={inputClass}
      />

      <div className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1.5">
          <FieldLabel>{recurrence === "installments" ? "Valor total" : "Valor"}</FieldLabel>
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
          <FieldLabel>{dateLabel}</FieldLabel>
          <DatePicker value={date} onChange={setDate} className="w-[9.5rem]" />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <FieldLabel>Categoria</FieldLabel>
        <div className="flex flex-wrap gap-2">
          <PillOption selected={categoryId === null} onClick={() => setCategoryId(null)}>
            Sem categoria
          </PillOption>
          {categories.map((c) => (
            <PillOption key={c.id} selected={categoryId === c.id} onClick={() => setCategoryId(c.id)}>
              {c.name}
            </PillOption>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <FieldLabel>Pagamento</FieldLabel>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(PAYMENT_LABELS) as PaymentMethod[]).map((method) => (
            <PillOption
              key={method}
              selected={paymentMethod === method}
              onClick={() => setPaymentMethod(method)}
            >
              {PAYMENT_LABELS[method]}
            </PillOption>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <FieldLabel>Repetição</FieldLabel>
        <div className="flex flex-wrap items-center gap-2">
          {(Object.keys(RECURRENCE_LABELS) as Recurrence[]).map((r) => (
            <PillOption key={r} selected={recurrence === r} onClick={() => setRecurrence(r)}>
              {RECURRENCE_LABELS[r]}
            </PillOption>
          ))}
        </div>
        {recurrence === "installments" && (
          <div className="flex flex-wrap items-center gap-2">
            <input
              value={installments}
              onChange={(e) => setInstallments(e.target.value.replace(/\D/g, ""))}
              inputMode="numeric"
              aria-label="Número de parcelas"
              className={`${inputClass} w-20 text-center`}
            />
            <span className="text-sm text-ink-soft">
              {installmentsOk && cents !== null
                ? `parcelas de ${formatCents(splitInstallments(cents, installmentCount)[0])}`
                : "parcelas (de 2 a 48)"}
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2">
        {extraActions}
        {onCancel && (
          <button type="button" onClick={onCancel} className={secondaryButtonClass}>
            Cancelar
          </button>
        )}
        <button type="submit" disabled={!canSubmit} className={primaryButtonClass}>
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
