import { createClient } from "@/lib/supabase/server";
import { AddTaskForm } from "@/components/AddTaskForm";
import { TaskList } from "@/components/TaskList";
import {
  addDays,
  formatDayMonth,
  formatWeekday,
  startOfToday,
  toISODate,
} from "@/lib/dates";
import type { Entry, ItemLink, Task } from "@/lib/types";

const UPCOMING_DAYS = 6;

export default async function HomePage() {
  const today = startOfToday();
  const rangeStart = toISODate(today);
  const rangeEnd = toISODate(addDays(today, UPCOMING_DAYS));

  const supabase = await createClient();
  const [{ data: tasksData }, { data: entriesData }, { data: linksData }] = await Promise.all([
    supabase.from("tasks").select("*").gte("date", rangeStart).lte("date", rangeEnd),
    supabase.from("entries").select("*").gte("date", rangeStart).lte("date", rangeEnd),
    supabase.from("item_links").select("*").gte("date", rangeStart).lte("date", rangeEnd),
  ]);

  const tasks = (tasksData ?? []) as Task[];
  const entries = (entriesData ?? []) as Entry[];
  const links = (linksData ?? []) as ItemLink[];
  const byDate = (iso: string) => tasks.filter((t) => t.date === iso);

  const upcoming = Array.from({ length: UPCOMING_DAYS }, (_, i) => addDays(today, i + 1));

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-10 pt-2">
      <section>
        <header className="mb-4">
          <p className="text-sm font-semibold uppercase tracking-wide text-pink-500">
            {formatWeekday(today)}
          </p>
          <h1 className="text-2xl font-semibold text-ink">Hoje, {formatDayMonth(today)}</h1>
        </header>

        <div className="flex flex-col gap-4">
          <AddTaskForm date={rangeStart} />
          <TaskList tasks={byDate(rangeStart)} allTasks={tasks} allEntries={entries} allLinks={links} />
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-ink">Próximos dias</h2>
        <div className="flex flex-col gap-6">
          {upcoming.map((date) => {
            const iso = toISODate(date);
            const dayTasks = byDate(iso);
            return (
              <div key={iso}>
                <p className="mb-2 text-sm font-semibold text-ink-soft">
                  {formatWeekday(date)}, {formatDayMonth(date)}
                </p>
                <div className="flex flex-col gap-3">
                  <AddTaskForm date={iso} />
                  <TaskList
                    tasks={dayTasks}
                    allTasks={tasks}
                    allEntries={entries}
                    allLinks={links}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
