import { createClient } from "@/lib/supabase/server";
import { MonthCalendar } from "@/components/MonthCalendar";
import { getMonthGrid } from "@/lib/calendarGrid";
import { toISODate } from "@/lib/dates";
import type { Task } from "@/lib/types";

export default async function CalendarioPage({ searchParams }: PageProps<"/calendario">) {
  const params = await searchParams;
  const monthParam = typeof params.month === "string" ? params.month : undefined;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [year, month] = monthParam
    ? monthParam.split("-").map(Number)
    : [today.getFullYear(), today.getMonth() + 1];

  const grid = getMonthGrid(year, month - 1);
  const rangeStart = toISODate(grid[0]);
  const rangeEnd = toISODate(grid[grid.length - 1]);

  const supabase = await createClient();
  const { data } = await supabase
    .from("tasks")
    .select("*")
    .gte("date", rangeStart)
    .lte("date", rangeEnd);

  return (
    <div className="mx-auto w-full max-w-2xl pt-2">
      <MonthCalendar
        year={year}
        month={month - 1}
        tasks={(data ?? []) as Task[]}
        todayISO={toISODate(today)}
      />
    </div>
  );
}
