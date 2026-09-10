import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AddEntryForm } from "@/components/AddEntryForm";
import { EntryList } from "@/components/EntryList";
import { FocusHighlight } from "@/components/FocusHighlight";
import {
  addDays,
  formatDayMonth,
  formatWeekday,
  startOfToday,
  toISODate,
} from "@/lib/dates";
import type { Entry, ItemLink, Task } from "@/lib/types";

const DEFAULT_UPCOMING_DAYS = 6;
const MORE_DAYS_STEP = 6;

export default async function AnotacoesPage({ searchParams }: PageProps<"/anotacoes">) {
  const params = await searchParams;
  const daysParam = typeof params.days === "string" ? parseInt(params.days, 10) : NaN;
  const upcomingDays =
    Number.isFinite(daysParam) && daysParam > 0 ? daysParam : DEFAULT_UPCOMING_DAYS;
  const focusParam = typeof params.focus === "string" ? params.focus : undefined;

  const today = startOfToday();
  const rangeStart = toISODate(today);
  const rangeEnd = toISODate(addDays(today, upcomingDays));

  const supabase = await createClient();
  const [{ data: tasksData }, { data: entriesData }, { data: linksData }] = await Promise.all([
    supabase.from("tasks").select("*").gte("date", rangeStart).lte("date", rangeEnd),
    supabase.from("entries").select("*").gte("date", rangeStart).lte("date", rangeEnd),
    // Vinculo pode ser com item de outro dia, entao busca todos (poucos
    // registros, escala pessoal) em vez de filtrar pela janela exibida.
    supabase.from("item_links").select("*"),
  ]);

  const tasks = (tasksData ?? []) as Task[];
  const entries = (entriesData ?? []) as Entry[];
  const links = (linksData ?? []) as ItemLink[];
  const notesByDate = (iso: string) => entries.filter((e) => e.kind === "note" && e.date === iso);

  const upcoming = Array.from({ length: upcomingDays }, (_, i) => addDays(today, i + 1));

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-10 pt-2">
      <FocusHighlight focus={focusParam} />

      <header>
        <h1 className="text-2xl font-semibold text-ink">Anotações</h1>
        <p className="text-sm text-ink-soft">Suas observações da agenda, com data.</p>
      </header>

      <section>
        <header className="mb-4">
          <p className="text-sm font-semibold uppercase tracking-wide text-pink-500">
            {formatWeekday(today)}
          </p>
          <h2 className="text-2xl font-semibold text-ink">Hoje, {formatDayMonth(today)}</h2>
        </header>

        <div className="flex flex-col gap-4">
          <AddEntryForm kind="note" placeholder="Nova anotação..." date={rangeStart} />
          <EntryList
            entries={notesByDate(rangeStart)}
            emptyLabel="Nenhuma anotação nesse dia."
            allTasks={tasks}
            allEntries={entries}
            allLinks={links}
          />
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-ink">Próximos dias</h2>
        <div className="flex flex-col gap-6">
          {upcoming.map((date) => {
            const iso = toISODate(date);
            return (
              <div key={iso}>
                <p className="mb-2 text-sm font-semibold text-ink-soft">
                  {formatWeekday(date)}, {formatDayMonth(date)}
                </p>
                <div className="flex flex-col gap-3">
                  <AddEntryForm kind="note" placeholder="Nova anotação..." date={iso} />
                  <EntryList
                    entries={notesByDate(iso)}
                    emptyLabel="Nenhuma anotação nesse dia."
                    allTasks={tasks}
                    allEntries={entries}
                    allLinks={links}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex justify-center">
          <Link
            href={`/anotacoes?days=${upcomingDays + MORE_DAYS_STEP}`}
            className="rounded-2xl border border-pink-200/80 bg-white px-5 py-2.5 text-sm font-semibold text-pink-600 shadow-soft transition-all hover:-translate-y-px hover:bg-pink-50 hover:shadow-lift active:translate-y-0"
          >
            Ver mais dias
          </Link>
        </div>
      </section>
    </div>
  );
}
