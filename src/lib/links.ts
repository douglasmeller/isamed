import type { DayItem, ItemLink } from "./types";

type ItemRef = Pick<DayItem, "type" | "id">;

export function areLinked(a: ItemRef, b: ItemRef, links: ItemLink[]): boolean {
  return links.some(
    (l) =>
      (l.a_type === a.type && l.a_id === a.id && l.b_type === b.type && l.b_id === b.id) ||
      (l.b_type === a.type && l.b_id === a.id && l.a_type === b.type && l.a_id === b.id),
  );
}

export function linkedItemsFor(self: ItemRef, dayItems: DayItem[], links: ItemLink[]): DayItem[] {
  return dayItems.filter((d) => !(d.type === self.type && d.id === self.id) && areLinked(self, d, links));
}

// Leva pro Calendario ja no dia certo, com o item vinculado destacado --
// e o unico lugar que mostra tarefas/provas/anotacoes juntas num so dia.
export function linkTargetHref(date: string, item: ItemRef): string {
  return `/calendario?month=${date.slice(0, 7)}&day=${date}&focus=${item.type}-${item.id}`;
}
