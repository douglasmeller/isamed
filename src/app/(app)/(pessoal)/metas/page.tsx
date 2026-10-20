import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { GoalsBoard } from "@/components/goals/GoalsBoard";
import { formatDayMonth, todayISO } from "@/lib/dates";
import {
  isValidISODate,
  shiftWeek,
  weekDates,
  weekStartOf,
  type Goal,
  type GoalCheck,
} from "@/lib/goals";

const navButton =
  "flex h-9 w-9 items-center justify-center rounded-xl text-ink-soft shadow-soft transition-all hover:-translate-y-px hover:bg-pink-100 hover:text-pink-600 hover:shadow-lift active:translate-y-0";

export default async function MetasPage({ searchParams }: PageProps<"/metas">) {
  const params = await searchParams;
  const today = todayISO();
  const currentWeek = weekStartOf(today);
  const weekStart =
    typeof params.week === "string" && isValidISODate(params.week)
      ? weekStartOf(params.week)
      : currentWeek;
  const days = weekDates(weekStart);
  const weekEnd = days[6];

  const supabase = await createClient();
  const [{ data: goalsData }, { data: checksData }] = await Promise.all([
    supabase.from("goals").select("id, title, weekdays, created_at").order("created_at", { ascending: true }),
    supabase
      .from("goal_checks")
      .select("goal_id, date, status")
      .gte("date", weekStart)
      .lte("date", weekEnd),
  ]);

  const toDate = (iso: string) => new Date(`${iso}T00:00:00`);
  const weekLabel =
    weekStart === currentWeek
      ? "Esta semana"
      : `${formatDayMonth(toDate(weekStart))} – ${formatDayMonth(toDate(weekEnd))}`;

  return (
    <div className="flex flex-col gap-6 pt-2">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Metas</h1>
          <p className="text-sm text-ink-soft">Marque em cada dia se cumpriu (verde) ou não (vermelho).</p>
        </div>
        <div className="flex items-center gap-1">
          <Link href={`/metas?week=${shiftWeek(weekStart, -1)}`} aria-label="Semana anterior" className={navButton}>
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <span className="min-w-[11rem] text-center text-sm font-semibold text-ink">{weekLabel}</span>
          {/* Semanas futuras nao tem o que marcar. */}
          {weekStart < currentWeek ? (
            <Link href={`/metas?week=${shiftWeek(weekStart, 1)}`} aria-label="Próxima semana" className={navButton}>
              <ChevronRight className="h-5 w-5" />
            </Link>
          ) : (
            <span className={`${navButton} pointer-events-none opacity-30`} aria-hidden>
              <ChevronRight className="h-5 w-5" />
            </span>
          )}
        </div>
      </header>

      <GoalsBoard
        key={weekStart}
        goals={(goalsData ?? []) as Goal[]}
        checks={(checksData ?? []) as GoalCheck[]}
        days={days}
        today={today}
      />
    </div>
  );
}
