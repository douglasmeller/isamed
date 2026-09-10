"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { DayItem, EntryKind } from "@/lib/types";

// Guarda sempre o mesmo par na mesma ordem, senao A-B e B-A contariam como
// vinculos diferentes e a constraint de unicidade nao pegaria duplicata.
function normalize(a: DayItem, b: DayItem): [DayItem, DayItem] {
  const key = (x: DayItem) => `${x.type}:${x.id}`;
  return key(a) <= key(b) ? [a, b] : [b, a];
}

function revalidateLinked() {
  revalidatePath("/tarefas-estudos");
  revalidatePath("/calendario");
  revalidatePath("/provas");
  revalidatePath("/anotacoes");
}

export async function linkItems(a: DayItem, b: DayItem) {
  if (a.type === b.type && a.id === b.id) return;
  const [x, y] = normalize(a, b);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("item_links").upsert(
    {
      user_id: user.id,
      // Coluna antiga (nao usada mais pra filtrar, mas segue NOT NULL).
      date: x.date,
      a_type: x.type,
      a_id: x.id,
      a_title: x.title,
      a_date: x.date,
      a_kind: x.kind ?? null,
      b_type: y.type,
      b_id: y.id,
      b_title: y.title,
      b_date: y.date,
      b_kind: y.kind ?? null,
    },
    { onConflict: "a_type,a_id,b_type,b_id" },
  );

  revalidateLinked();
}

export async function unlinkItems(a: Pick<DayItem, "type" | "id">, b: Pick<DayItem, "type" | "id">) {
  const key = (x: Pick<DayItem, "type" | "id">) => `${x.type}:${x.id}`;
  const [x, y] = key(a) <= key(b) ? [a, b] : [b, a];

  const supabase = await createClient();
  await supabase
    .from("item_links")
    .delete()
    .match({ a_type: x.type, a_id: x.id, b_type: y.type, b_id: y.id });

  revalidateLinked();
}

// Busca as tarefas/provas/anotacoes de um dia especifico -- usado no popup de
// vincular quando a pessoa navega pra um dia que ainda nao foi carregado.
export async function getDayItems(date: string): Promise<DayItem[]> {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return [];

  const supabase = await createClient();
  const [{ data: tasksData }, { data: entriesData }] = await Promise.all([
    supabase.from("tasks").select("id, title, date").eq("date", date),
    supabase.from("entries").select("id, title, date, kind").eq("date", date),
  ]);

  const tasks = (tasksData ?? []) as { id: string; title: string; date: string }[];
  const entries = (entriesData ?? []) as {
    id: string;
    title: string;
    date: string;
    kind: EntryKind;
  }[];

  return [
    ...tasks.map((t): DayItem => ({ type: "task", id: t.id, title: t.title, date: t.date })),
    ...entries.map(
      (e): DayItem => ({ type: "entry", id: e.id, title: e.title, date: e.date, kind: e.kind }),
    ),
  ];
}
