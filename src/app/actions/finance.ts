"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isValidMonth, type PaymentMethod, type Recurrence } from "@/lib/finance";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function revalidateFinance() {
  revalidatePath("/financeiro");
}

function validCents(cents: number | null): cents is number {
  return typeof cents === "number" && Number.isInteger(cents) && cents > 0 && cents < 2_000_000_000;
}

async function getUserClient() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

// ---- Categorias ----

export async function createCategory(input: { name: string; limitCents: number | null }) {
  const name = input.name.trim();
  if (!name) return;
  if (input.limitCents !== null && !validCents(input.limitCents)) return;

  const { supabase, user } = await getUserClient();
  if (!user) return;
  await supabase
    .from("finance_categories")
    .insert({ name, monthly_limit_cents: input.limitCents, user_id: user.id });
  revalidateFinance();
}

export async function updateCategory(id: string, input: { name: string; limitCents: number | null }) {
  const name = input.name.trim();
  if (!name) return;
  if (input.limitCents !== null && !validCents(input.limitCents)) return;

  const { supabase } = await getUserClient();
  await supabase
    .from("finance_categories")
    .update({ name, monthly_limit_cents: input.limitCents })
    .eq("id", id);
  revalidateFinance();
}

// Os gastos da categoria ficam, so passam a "Sem categoria".
export async function deleteCategory(id: string) {
  const { supabase } = await getUserClient();
  await supabase.from("finance_categories").delete().eq("id", id);
  revalidateFinance();
}

// ---- Gastos ----

export type ExpenseInput = {
  description: string;
  amountCents: number;
  date: string;
  categoryId: string | null;
  paymentMethod: PaymentMethod;
  recurrence: Recurrence;
  installments: number | null;
};

function cleanExpense(input: ExpenseInput) {
  const description = input.description.trim();
  if (!description || !validCents(input.amountCents) || !ISO_DATE.test(input.date)) return null;
  if (input.paymentMethod !== "pix_debito" && input.paymentMethod !== "credito") return null;
  if (!["none", "monthly", "installments"].includes(input.recurrence)) return null;

  const installments = input.recurrence === "installments" ? input.installments : null;
  if (
    input.recurrence === "installments" &&
    (!Number.isInteger(installments) || installments! < 2 || installments! > 48)
  ) {
    return null;
  }

  return {
    description,
    amount_cents: input.amountCents,
    date: input.date,
    category_id: input.categoryId,
    payment_method: input.paymentMethod,
    recurrence: input.recurrence,
    installments,
  };
}

export async function createExpense(input: ExpenseInput) {
  const row = cleanExpense(input);
  if (!row) return;
  const { supabase, user } = await getUserClient();
  if (!user) return;
  await supabase.from("finance_expenses").insert({ ...row, user_id: user.id });
  revalidateFinance();
}

// Editar vale pra serie toda (todos os meses de um recorrente/parcelado).
export async function updateExpense(id: string, input: ExpenseInput) {
  const row = cleanExpense(input);
  if (!row) return;
  const { supabase } = await getUserClient();
  // Mudar o tipo de recorrencia zera um encerramento antigo.
  await supabase
    .from("finance_expenses")
    .update({ ...row, end_month: row.recurrence === "monthly" ? undefined : null })
    .eq("id", id);
  revalidateFinance();
}

export async function deleteExpense(id: string) {
  const { supabase } = await getUserClient();
  await supabase.from("finance_expenses").delete().eq("id", id);
  revalidateFinance();
}

// Recorrente continua contando ate "lastMonth" e para de repetir depois.
export async function endRecurringExpense(id: string, lastMonth: string) {
  if (!isValidMonth(lastMonth)) return;
  const { supabase } = await getUserClient();
  await supabase.from("finance_expenses").update({ end_month: lastMonth }).eq("id", id);
  revalidateFinance();
}

// ---- Renda ----

export type IncomeInput = {
  description: string;
  amountCents: number;
  date: string;
  recurring: boolean;
};

function cleanIncome(input: IncomeInput) {
  const description = input.description.trim();
  if (!description || !validCents(input.amountCents) || !ISO_DATE.test(input.date)) return null;
  return {
    description,
    amount_cents: input.amountCents,
    date: input.date,
    recurring: Boolean(input.recurring),
  };
}

export async function createIncome(input: IncomeInput) {
  const row = cleanIncome(input);
  if (!row) return;
  const { supabase, user } = await getUserClient();
  if (!user) return;
  await supabase.from("finance_incomes").insert({ ...row, user_id: user.id });
  revalidateFinance();
}

export async function updateIncome(id: string, input: IncomeInput) {
  const row = cleanIncome(input);
  if (!row) return;
  const { supabase } = await getUserClient();
  await supabase
    .from("finance_incomes")
    .update({ ...row, end_month: row.recurring ? undefined : null })
    .eq("id", id);
  revalidateFinance();
}

export async function deleteIncome(id: string) {
  const { supabase } = await getUserClient();
  await supabase.from("finance_incomes").delete().eq("id", id);
  revalidateFinance();
}

export async function endRecurringIncome(id: string, lastMonth: string) {
  if (!isValidMonth(lastMonth)) return;
  const { supabase } = await getUserClient();
  await supabase.from("finance_incomes").update({ end_month: lastMonth }).eq("id", id);
  revalidateFinance();
}

// ---- Cartao ----

export async function saveCardSettings(input: { closingDay: number; dueDay: number }) {
  const ok = (d: number) => Number.isInteger(d) && d >= 1 && d <= 31;
  if (!ok(input.closingDay) || !ok(input.dueDay)) return;

  const { supabase, user } = await getUserClient();
  if (!user) return;
  await supabase.from("finance_settings").upsert({
    user_id: user.id,
    card_closing_day: input.closingDay,
    card_due_day: input.dueDay,
  });
  revalidateFinance();
}

export async function setCardBillPaid(dueMonth: string, paid: boolean) {
  if (!isValidMonth(dueMonth)) return;
  const { supabase, user } = await getUserClient();
  if (!user) return;
  await supabase
    .from("finance_card_bills")
    .upsert({ user_id: user.id, due_month: dueMonth, paid });
  revalidateFinance();
}

// ---- Guardar ----

// amountCents null = tirar a meta do mes.
export async function saveSavingsGoal(month: string, amountCents: number | null) {
  if (!isValidMonth(month)) return;
  const { supabase, user } = await getUserClient();
  if (!user) return;

  if (amountCents === null) {
    await supabase.from("finance_savings").delete().match({ user_id: user.id, month });
  } else {
    if (!validCents(amountCents)) return;
    await supabase
      .from("finance_savings")
      .upsert({ user_id: user.id, month, amount_cents: amountCents }, { onConflict: "user_id,month" });
  }
  revalidateFinance();
}

export async function setSavingsSaved(month: string, saved: boolean) {
  if (!isValidMonth(month)) return;
  const { supabase, user } = await getUserClient();
  if (!user) return;
  await supabase.from("finance_savings").update({ saved }).match({ user_id: user.id, month });
  revalidateFinance();
}
