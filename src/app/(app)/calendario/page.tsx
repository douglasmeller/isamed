import { createClient } from "@/lib/supabase/server";
import { MonthCalendar } from "@/components/MonthCalendar";
import { getMonthGrid } from "@/lib/calendarGrid";
import { startOfToday, toISODate } from "@/lib/dates";
import type { Goal, GoalCheck } from "@/lib/goals";
import type { Entry, ItemLink, OpenTask, Task } from "@/lib/types";

export default async function CalendarioPage({ searchParams }: PageProps<"/calendario">) {
  const params = await searchParams;
  const monthParam = typeof params.month === "string" ? params.month : undefined;
  const dayParam = typeof params.day === "string" ? params.day : undefined;
  const focusParam = typeof params.focus === "string" ? params.focus : undefined;

  const today = startOfToday();

  const [year, month] = monthParam
    ? monthParam.split("-").map(Number)
    : [today.getFullYear(), today.getMonth() + 1];

  const grid = getMonthGrid(year, month - 1);
  const rangeStart = toISODate(grid[0]);
  const rangeEnd = toISODate(grid[grid.length - 1]);

  const supabase = await createClient();
  const [
    { data: tasksData },
    { data: entriesData },
    { data: linksData },
    { data: openTasksData },
    { data: goalsData },
    { data: goalChecksData },
  ] = await Promise.all([
    supabase.from("tasks").select("*").gte("date", rangeStart).lte("date", rangeEnd),
    supabase.from("entries").select("*").gte("date", rangeStart).lte("date", rangeEnd),
    // Vinculo pode ser com item de outro dia/mes, entao busca todos (poucos
    // registros, escala pessoal) em vez de filtrar pelo mes exibido.
    supabase.from("item_links").select("*"),
    supabase
      .from("tasks")
      .select("id, title, created_at")
      .is("date", null)
      .order("created_at", { ascending: true }),
    supabase.from("goals").select("id, title, weekdays, created_at").order("created_at", { ascending: true }),
    supabase
      .from("goal_checks")
      .select("goal_id, date, status")
      .gte("date", rangeStart)
      .lte("date", rangeEnd),
  ]);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 pt-2 xl:max-w-6xl">
      <header>
        <h1 className="text-2xl font-semibold text-ink">Calendário</h1>
        <p className="text-sm text-ink-soft">Organize seus dias, provas e anotações num só lugar.</p>
      </header>

      {/* key: ao trocar de mes, o dia selecionado (estado local) recomeca. */}
      <MonthCalendar
        key={`${year}-${month}`}
        year={year}
        month={month - 1}
        tasks={(tasksData ?? []) as Task[]}
        entries={(entriesData ?? []) as Entry[]}
        links={(linksData ?? []) as ItemLink[]}
        openTasks={(openTasksData ?? []) as OpenTask[]}
        goals={(goalsData ?? []) as Goal[]}
        goalChecks={(goalChecksData ?? []) as GoalCheck[]}
        todayISO={toISODate(today)}
        initialSelected={dayParam}
        initialFocus={focusParam}
      />
    </div>
  );
}
