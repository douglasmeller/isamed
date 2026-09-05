"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createTask(input: { title: string; date: string; time: string | null }) {
  const title = input.title.trim();
  if (!title) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("tasks").insert({
    title,
    date: input.date,
    time: input.time,
    user_id: user.id,
  });

  revalidatePath("/");
  revalidatePath("/calendario");
}

export async function toggleTask(id: string, done: boolean) {
  const supabase = await createClient();
  await supabase.from("tasks").update({ done }).eq("id", id);

  revalidatePath("/");
  revalidatePath("/calendario");
}

export async function moveTask(id: string, date: string) {
  // Espera uma data no formato YYYY-MM-DD.
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return;

  const supabase = await createClient();
  await supabase.from("tasks").update({ date }).eq("id", id);

  revalidatePath("/");
  revalidatePath("/calendario");
}

export async function deleteTask(id: string) {
  const supabase = await createClient();
  await supabase.from("tasks").delete().eq("id", id);

  revalidatePath("/");
  revalidatePath("/calendario");
}
