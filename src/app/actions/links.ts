"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { DayItem } from "@/lib/types";

type ItemRef = Pick<DayItem, "type" | "id">;

// Guarda sempre o mesmo par na mesma ordem, senao A-B e B-A contariam como
// vinculos diferentes e a constraint de unicidade nao pegaria duplicata.
function normalize(a: ItemRef, b: ItemRef): [ItemRef, ItemRef] {
  const key = (x: ItemRef) => `${x.type}:${x.id}`;
  return key(a) <= key(b) ? [a, b] : [b, a];
}

function revalidateLinked() {
  revalidatePath("/");
  revalidatePath("/calendario");
  revalidatePath("/provas");
  revalidatePath("/anotacoes");
}

export async function linkItems(date: string, a: ItemRef, b: ItemRef) {
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
      date,
      a_type: x.type,
      a_id: x.id,
      b_type: y.type,
      b_id: y.id,
    },
    { onConflict: "a_type,a_id,b_type,b_id" },
  );

  revalidateLinked();
}

export async function unlinkItems(a: ItemRef, b: ItemRef) {
  const [x, y] = normalize(a, b);

  const supabase = await createClient();
  await supabase
    .from("item_links")
    .delete()
    .match({ a_type: x.type, a_id: x.id, b_type: y.type, b_id: y.id });

  revalidateLinked();
}
