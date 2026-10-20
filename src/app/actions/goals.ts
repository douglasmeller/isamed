"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { todayISO } from "@/lib/dates";
import { isValidISODate, type GoalStatus } from "@/lib/goals";

function revalidateGoals() {
  revalidatePath("/metas");
  revalidatePath("/calendario");
}

function cleanWeekdays(weekdays: number[]): number[] | null {
  const unique = [...new Set(weekdays)].filter((d) => Number.isInteger(d) && d >= 0 && d <= 6);
  return unique.length > 0 ? unique.sort() : null;
}

export async function createGoal(input: { title: string; weekdays: number[] }) {
  const title = input.title.trim();
  const weekdays = cleanWeekdays(input.weekdays);
  if (!title || !weekdays) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("goals").insert({ title, weekdays, user_id: user.id });
  revalidateGoals();
}

export async function updateGoal(id: string, input: { title: string; weekdays: number[] }) {
  const title = input.title.trim();
  const weekdays = cleanWeekdays(input.weekdays);
  if (!title || !weekdays) return;

  const supabase = await createClient();
  await supabase.from("goals").update({ title, weekdays }).eq("id", id);
  revalidateGoals();
}

// As marcacoes vao junto (cascade no banco).
export async function deleteGoal(id: string) {
  const supabase = await createClient();
  await supabase.from("goals").delete().eq("id", id);
  revalidateGoals();
}

// status null = tirar a marcacao do dia.
export async function setGoalCheck(goalId: string, date: string, status: GoalStatus | null) {
  // Nao da pra marcar um dia que ainda nao chegou.
  if (!isValidISODate(date) || date > todayISO()) return;
  if (status !== null && status !== "done" && status !== "missed") return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  if (status === null) {
    await supabase.from("goal_checks").delete().match({ goal_id: goalId, date });
  } else {
    await supabase
      .from("goal_checks")
      .upsert({ goal_id: goalId, date, status, user_id: user.id }, { onConflict: "goal_id,date" });
  }
  revalidateGoals();
}
