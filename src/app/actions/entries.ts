"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { EntryKind } from "@/lib/types";

function revalidateEntries() {
  revalidatePath("/provas");
  revalidatePath("/anotacoes");
  revalidatePath("/calendario");
  revalidatePath("/tarefas-estudos");
}

export async function createEntry(kind: EntryKind, input: { title: string; date: string }) {
  const title = input.title.trim();
  if (!title || !/^\d{4}-\d{2}-\d{2}$/.test(input.date)) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("entries").insert({
    kind,
    title,
    date: input.date,
    user_id: user.id,
  });

  revalidateEntries();
}

export async function updateEntry(id: string, input: { title: string; date: string }) {
  const title = input.title.trim();
  if (!title || !/^\d{4}-\d{2}-\d{2}$/.test(input.date)) return;

  const supabase = await createClient();
  await supabase.from("entries").update({ title, date: input.date }).eq("id", id);

  revalidateEntries();
}

export async function moveEntry(id: string, date: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return;

  const supabase = await createClient();
  await supabase.from("entries").update({ date }).eq("id", id);
  // Vinculo so faz sentido entre itens do mesmo dia; ao mudar de dia, o
  // vinculo anterior deixa de valer.
  await supabase
    .from("item_links")
    .delete()
    .or(`and(a_type.eq.entry,a_id.eq.${id}),and(b_type.eq.entry,b_id.eq.${id})`);

  revalidateEntries();
}

export async function deleteEntry(id: string) {
  const supabase = await createClient();
  await supabase.from("entries").delete().eq("id", id);
  // Sem isso, o vinculo ficaria orfao apontando pra um item que nao existe mais.
  await supabase
    .from("item_links")
    .delete()
    .or(`and(a_type.eq.entry,a_id.eq.${id}),and(b_type.eq.entry,b_id.eq.${id})`);

  revalidateEntries();
}
