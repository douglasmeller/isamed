import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function toISODate(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

export function addDays(date: Date, days: number): Date {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

export function startOfToday(): Date {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now;
}

export function formatWeekday(date: Date): string {
  const weekday = format(date, "EEEE", { locale: ptBR });
  return weekday.charAt(0).toUpperCase() + weekday.slice(1);
}

export function formatDayMonth(date: Date): string {
  return format(date, "d 'de' MMMM", { locale: ptBR });
}

export function formatMonthYear(date: Date): string {
  const label = format(date, "MMMM yyyy", { locale: ptBR });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function isSameISODate(a: Date, b: string): boolean {
  return toISODate(a) === b;
}
