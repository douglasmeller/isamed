export type PaymentMethod = "pix_debito" | "credito";
export type Recurrence = "none" | "monthly" | "installments";

export type FinanceCategory = {
  id: string;
  name: string;
  monthly_limit_cents: number | null;
  created_at: string;
};

export type Expense = {
  id: string;
  description: string;
  amount_cents: number;
  date: string; // YYYY-MM-DD (compra / inicio da serie)
  category_id: string | null;
  payment_method: PaymentMethod;
  recurrence: Recurrence;
  installments: number | null;
  end_month: string | null; // YYYY-MM
  created_at: string;
};

export type Income = {
  id: string;
  description: string;
  amount_cents: number;
  date: string;
  recurring: boolean;
  end_month: string | null;
  created_at: string;
};

export type CardSettings = {
  card_closing_day: number | null;
  card_due_day: number | null;
};

// Uma ocorrencia concreta num mes (recorrente/parcelado viram uma por mes).
export type ExpenseOccurrence = {
  expense: Expense;
  date: string;
  amount_cents: number;
  installmentNumber: number | null; // 1-based, so pra parcelado
};

export type IncomeOccurrence = {
  income: Income;
  date: string;
  amount_cents: number;
};

export const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  pix_debito: "Pix/Débito",
  credito: "Crédito",
};

// ---- Meses (YYYY-MM) ----

export function monthOf(isoDate: string): string {
  return isoDate.slice(0, 7);
}

export function isValidMonth(month: string): boolean {
  return /^\d{4}-(0[1-9]|1[0-2])$/.test(month);
}

export function addMonths(month: string, delta: number): string {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function monthsBetween(from: string, to: string): number {
  const [fy, fm] = from.split("-").map(Number);
  const [ty, tm] = to.split("-").map(Number);
  return (ty - fy) * 12 + (tm - fm);
}

export function monthToDate(month: string): Date {
  const [y, m] = month.split("-").map(Number);
  return new Date(y, m - 1, 1);
}

function daysInMonth(month: string): number {
  const [y, m] = month.split("-").map(Number);
  return new Date(y, m, 0).getDate();
}

// Dia "d" no mes, sem estourar (dia 31 em fevereiro vira o ultimo dia).
export function dateInMonth(month: string, day: number): string {
  const clamped = Math.min(day, daysInMonth(month));
  return `${month}-${String(clamped).padStart(2, "0")}`;
}

export function firstDayOf(month: string): string {
  return `${month}-01`;
}

export function lastDayOf(month: string): string {
  return dateInMonth(month, 31);
}

// ---- Ocorrencias ----

// Divide o total em N parcelas sem perder centavo (os primeiros ficam com o resto).
export function splitInstallments(totalCents: number, count: number): number[] {
  const base = Math.floor(totalCents / count);
  const remainder = totalCents - base * count;
  return Array.from({ length: count }, (_, i) => base + (i < remainder ? 1 : 0));
}

export function expenseOccurrenceInMonth(expense: Expense, month: string): ExpenseOccurrence | null {
  const start = monthOf(expense.date);
  const offset = monthsBetween(start, month);
  if (offset < 0) return null;
  const day = Number(expense.date.slice(8, 10));

  if (expense.recurrence === "none") {
    return offset === 0
      ? { expense, date: expense.date, amount_cents: expense.amount_cents, installmentNumber: null }
      : null;
  }

  if (expense.recurrence === "monthly") {
    if (expense.end_month && month > expense.end_month) return null;
    return {
      expense,
      date: dateInMonth(month, day),
      amount_cents: expense.amount_cents,
      installmentNumber: null,
    };
  }

  const count = expense.installments ?? 1;
  if (offset >= count) return null;
  return {
    expense,
    date: dateInMonth(month, day),
    amount_cents: splitInstallments(expense.amount_cents, count)[offset],
    installmentNumber: offset + 1,
  };
}

export function expenseOccurrences(expenses: Expense[], month: string): ExpenseOccurrence[] {
  return expenses
    .map((e) => expenseOccurrenceInMonth(e, month))
    .filter((o): o is ExpenseOccurrence => o !== null)
    .sort((a, b) => a.date.localeCompare(b.date) || a.expense.created_at.localeCompare(b.expense.created_at));
}

export function incomeOccurrences(incomes: Income[], month: string): IncomeOccurrence[] {
  return incomes
    .flatMap((income): IncomeOccurrence[] => {
      const start = monthOf(income.date);
      const offset = monthsBetween(start, month);
      if (offset < 0) return [];
      if (!income.recurring) {
        return offset === 0 ? [{ income, date: income.date, amount_cents: income.amount_cents }] : [];
      }
      if (income.end_month && month > income.end_month) return [];
      const day = Number(income.date.slice(8, 10));
      return [{ income, date: dateInMonth(month, day), amount_cents: income.amount_cents }];
    })
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function sumCents(items: { amount_cents: number }[]): number {
  return items.reduce((total, item) => total + item.amount_cents, 0);
}

// ---- Fatura do cartao ----

export type BillCycle = {
  dueMonth: string;
  dueDate: string;
  closingDate: string;
  // Compras com data > startExclusive e <= closingDate entram nessa fatura.
  startExclusive: string;
};

// Fatura que vence no mes "dueMonth". Se o vencimento e depois do fechamento
// no mes (ex: fecha 3, vence 10), fecha no mesmo mes; senao (fecha 28, vence
// 5), fechou no mes anterior.
export function billCycleForDueMonth(dueMonth: string, closingDay: number, dueDay: number): BillCycle {
  const closingMonth = dueDay > closingDay ? dueMonth : addMonths(dueMonth, -1);
  return {
    dueMonth,
    dueDate: dateInMonth(dueMonth, dueDay),
    closingDate: dateInMonth(closingMonth, closingDay),
    startExclusive: dateInMonth(addMonths(closingMonth, -1), closingDay),
  };
}

export function billOccurrences(expenses: Expense[], cycle: BillCycle): ExpenseOccurrence[] {
  const credit = expenses.filter((e) => e.payment_method === "credito");
  const fromMonth = monthOf(cycle.startExclusive);
  const toMonth = monthOf(cycle.closingDate);
  const months: string[] = [];
  for (let m = fromMonth; m <= toMonth; m = addMonths(m, 1)) months.push(m);

  return months
    .flatMap((m) => expenseOccurrences(credit, m))
    .filter((o) => o.date > cycle.startExclusive && o.date <= cycle.closingDate)
    .sort((a, b) => a.date.localeCompare(b.date));
}
