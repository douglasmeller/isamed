import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { CardBillSection } from "@/components/finance/CardBillSection";
import { CategoriesSection } from "@/components/finance/CategoriesSection";
import { ExpensesSection } from "@/components/finance/ExpensesSection";
import { IncomesSection } from "@/components/finance/IncomesSection";
import { SavingsSection } from "@/components/finance/SavingsSection";
import { cn } from "@/lib/cn";
import { formatMonthYear, todayISO } from "@/lib/dates";
import {
  addMonths,
  billCycleForDueMonth,
  billOccurrences,
  expenseOccurrences,
  firstDayOf,
  incomeOccurrences,
  isValidMonth,
  lastDayOf,
  monthOf,
  monthToDate,
  sumCents,
  type CardSettings,
  type Expense,
  type FinanceCategory,
  type Income,
} from "@/lib/finance";
import { formatCents } from "@/lib/money";

const navButton =
  "flex h-9 w-9 items-center justify-center rounded-xl text-ink-soft shadow-soft transition-all hover:-translate-y-px hover:bg-pink-100 hover:text-pink-600 hover:shadow-lift active:translate-y-0";

export default async function FinanceiroPage({ searchParams }: PageProps<"/financeiro">) {
  const params = await searchParams;
  const today = todayISO();
  const currentMonth = monthOf(today);
  const month =
    typeof params.month === "string" && isValidMonth(params.month) ? params.month : currentMonth;
  const monthEnd = lastDayOf(month);

  const supabase = await createClient();
  const [
    { data: categoriesData },
    { data: singleExpensesData },
    { data: seriesExpensesData },
    { data: singleIncomesData },
    { data: recurringIncomesData },
    { data: settingsData },
    { data: savingsData },
  ] = await Promise.all([
    supabase.from("finance_categories").select("*").order("created_at", { ascending: true }),
    // A fatura deste mes pode ter compras de ate dois meses antes.
    supabase
      .from("finance_expenses")
      .select("*")
      .eq("recurrence", "none")
      .gte("date", firstDayOf(addMonths(month, -2)))
      .lte("date", monthEnd),
    supabase.from("finance_expenses").select("*").neq("recurrence", "none").lte("date", monthEnd),
    supabase
      .from("finance_incomes")
      .select("*")
      .eq("recurring", false)
      .gte("date", firstDayOf(month))
      .lte("date", monthEnd),
    supabase.from("finance_incomes").select("*").eq("recurring", true).lte("date", monthEnd),
    supabase.from("finance_settings").select("card_closing_day, card_due_day").maybeSingle(),
    supabase.from("finance_savings").select("amount_cents, saved").eq("month", month).maybeSingle(),
  ]);

  const categories = (categoriesData ?? []) as FinanceCategory[];
  const expenses = [...(singleExpensesData ?? []), ...(seriesExpensesData ?? [])] as Expense[];
  const incomes = [...(singleIncomesData ?? []), ...(recurringIncomesData ?? [])] as Income[];
  const settings = settingsData as CardSettings | null;

  const monthExpenses = expenseOccurrences(expenses, month);
  const monthIncomes = incomeOccurrences(incomes, month);
  const expensesTotal = sumCents(monthExpenses);
  const incomesTotal = sumCents(monthIncomes);
  const savingsCents = (savingsData?.amount_cents as number | undefined) ?? null;
  const leftover = incomesTotal - expensesTotal - (savingsCents ?? 0);

  const spentByCategory: Record<string, number> = {};
  for (const o of monthExpenses) {
    const key = o.expense.category_id ?? "none";
    spentByCategory[key] = (spentByCategory[key] ?? 0) + o.amount_cents;
  }

  const closingDay = settings?.card_closing_day ?? null;
  const dueDay = settings?.card_due_day ?? null;
  const cycle = closingDay && dueDay ? billCycleForDueMonth(month, closingDay, dueDay) : null;
  const bill = cycle ? billOccurrences(expenses, cycle) : [];

  let billPaid = false;
  if (cycle) {
    const { data } = await supabase
      .from("finance_card_bills")
      .select("paid")
      .eq("due_month", cycle.dueMonth)
      .maybeSingle();
    billPaid = Boolean(data?.paid);
  }

  const defaultDate = month === currentMonth ? today : firstDayOf(month);

  const summary = [
    { label: "Renda", value: incomesTotal },
    { label: "Gastos", value: expensesTotal },
    { label: "Guardar", value: savingsCents ?? 0 },
  ];

  return (
    <div className="flex flex-col gap-6 pt-2">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Financeiro</h1>
          <p className="text-sm text-ink-soft">Renda, gastos e cartão do mês.</p>
        </div>
        <div className="flex items-center gap-1">
          <Link href={`/financeiro?month=${addMonths(month, -1)}`} aria-label="Mês anterior" className={navButton}>
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <span className="min-w-[9.5rem] text-center font-semibold text-ink">
            {formatMonthYear(monthToDate(month))}
          </span>
          <Link href={`/financeiro?month=${addMonths(month, 1)}`} aria-label="Próximo mês" className={navButton}>
            <ChevronRight className="h-5 w-5" />
          </Link>
        </div>
      </header>

      {/* key: ao trocar de mes, os estados locais (formularios, checks) recomecam. */}
      <div key={month} className="flex flex-col gap-6">
        <section className="rounded-2xl border border-pink-100/80 bg-white p-4 shadow-lift sm:p-5">
          <div className="grid grid-cols-3 gap-3">
            {summary.map((s) => (
              <div key={s.label} className="flex flex-col gap-0.5">
                <span className="text-xs font-semibold uppercase tracking-wide text-ink-soft">{s.label}</span>
                <span className="text-sm font-semibold text-ink sm:text-base">{formatCents(s.value)}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-baseline justify-between gap-3 border-t border-pink-100 pt-3">
            <span className="text-sm font-semibold text-ink-soft">Sobra no mês</span>
            <span className={cn("text-2xl font-semibold", leftover < 0 ? "text-red-500" : "text-pink-600")}>
              {formatCents(leftover)}
            </span>
          </div>
        </section>

        {/* Tela larga: gastos numa coluna, o resto na outra. */}
        <div className="flex flex-col gap-6 xl:grid xl:grid-cols-2 xl:items-start">
          <div className="flex flex-col gap-6">
            <ExpensesSection
              occurrences={monthExpenses}
              categories={categories}
              month={month}
              defaultDate={defaultDate}
              totalCents={expensesTotal}
            />
          </div>

          <div className="flex flex-col gap-6">
            <CategoriesSection categories={categories} spentByCategory={spentByCategory} />

            <CardBillSection
              closingDay={closingDay}
              dueDay={dueDay}
              cycle={cycle}
              occurrences={bill}
              totalCents={sumCents(bill)}
              paid={billPaid}
            />

            <IncomesSection
              occurrences={monthIncomes}
              month={month}
              defaultDate={defaultDate}
              totalCents={incomesTotal}
            />

            <SavingsSection
              month={month}
              amountCents={savingsCents}
              saved={Boolean(savingsData?.saved)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
