import { createClient } from "@/lib/supabase/server";
import { AddEntryForm } from "@/components/AddEntryForm";
import { EntryList } from "@/components/EntryList";
import type { Entry } from "@/lib/types";

export default async function ProvasPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("entries")
    .select("*")
    .eq("kind", "exam")
    .order("date", { ascending: true });

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 pt-2">
      <header>
        <h1 className="text-2xl font-semibold text-ink">Provas</h1>
        <p className="text-sm text-ink-soft">Organize as datas das suas provas.</p>
      </header>

      <AddEntryForm kind="exam" placeholder="Nome da prova..." />
      <EntryList entries={(data ?? []) as Entry[]} emptyLabel="Nenhuma prova marcada ainda." />
    </div>
  );
}
