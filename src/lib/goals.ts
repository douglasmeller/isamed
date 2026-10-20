import { addDays, toISODate } from "./dates";

export type GoalStatus = "done" | "missed";

export type Goal = {
  id: string;
  title: string;
  weekdays: number[]; // 0 = domingo ... 6 = sabado
  created_at: string;
};

export type GoalCheck = {
  goal_id: string;
  date: string;
  status: GoalStatus;
};

export const ALL_WEEKDAYS = [0, 1, 2, 3, 4, 5, 6];
export const WEEKDAY_SHORT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export function weekdayOf(iso: string): number {
  return new Date(`${iso}T00:00:00`).getDay();
}

export function goalAppliesOn(goal: Goal, iso: string): boolean {
  return goal.weekdays.includes(weekdayOf(iso));
}

export function weekdaysLabel(weekdays: number[]): string {
  if (weekdays.length === 7) return "Todos os dias";
  // Comeca na segunda, que e como a gente costuma falar ("seg, qua, sex").
  const order = [1, 2, 3, 4, 5, 6, 0];
  return order
    .filter((d) => weekdays.includes(d))
    .map((d) => WEEKDAY_SHORT[d])
    .join(", ");
}

// Toque no dia: vazio -> fez -> nao fez -> vazio.
export function nextStatus(status: GoalStatus | null): GoalStatus | null {
  if (status === null) return "done";
  if (status === "done") return "missed";
  return null;
}

export function checkKey(goalId: string, date: string): string {
  return `${goalId}|${date}`;
}

export function checksToMap(checks: GoalCheck[]): Record<string, GoalStatus> {
  const map: Record<string, GoalStatus> = {};
  for (const c of checks) map[checkKey(c.goal_id, c.date)] = c.status;
  return map;
}

// Semana de domingo a sabado, igual ao calendario.
export function weekStartOf(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  return toISODate(addDays(d, -d.getDay()));
}

export function weekDates(weekStart: string): string[] {
  const start = new Date(`${weekStart}T00:00:00`);
  return Array.from({ length: 7 }, (_, i) => toISODate(addDays(start, i)));
}

export function shiftWeek(weekStart: string, weeks: number): string {
  return toISODate(addDays(new Date(`${weekStart}T00:00:00`), weeks * 7));
}

export function isValidISODate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(new Date(`${value}T00:00:00`).getTime());
}
