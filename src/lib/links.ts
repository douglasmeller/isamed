import { diffDays } from "./dates";
import type { DayItem, ItemLink } from "./types";

type ItemRef = Pick<DayItem, "type" | "id">;

export function areLinked(a: ItemRef, b: ItemRef, links: ItemLink[]): boolean {
  return links.some(
    (l) =>
      (l.a_type === a.type && l.a_id === a.id && l.b_type === b.type && l.b_id === b.id) ||
      (l.b_type === a.type && l.b_id === a.id && l.a_type === b.type && l.a_id === b.id),
  );
}

// Monta a lista de itens vinculados a partir dos proprios vinculos (que ja
// guardam titulo/data/tipo de cada lado) -- funciona mesmo se o item
// vinculado for de um dia que nao esta carregado na tela.
export function linkedItemsFor(self: ItemRef, links: ItemLink[]): DayItem[] {
  return links
    .filter(
      (l) =>
        (l.a_type === self.type && l.a_id === self.id) ||
        (l.b_type === self.type && l.b_id === self.id),
    )
    .map((l): DayItem => {
      const selfIsA = l.a_type === self.type && l.a_id === self.id;
      return selfIsA
        ? { type: l.b_type, id: l.b_id, title: l.b_title, date: l.b_date, kind: l.b_kind }
        : { type: l.a_type, id: l.a_id, title: l.a_title, date: l.a_date, kind: l.a_kind };
    });
}

// Leva pro lugar certo pra ver o item vinculado: a tela do proprio tipo dele
// (com dias suficientes carregados pra ele aparecer), ou o Calendario se a
// data ja passou (as outras telas so mostram hoje em diante).
export function linkTargetHref(item: DayItem, todayISO: string): string {
  const focus = `focus=${item.type}-${item.id}`;
  const diff = diffDays(todayISO, item.date);

  if (diff < 0) {
    return `/calendario?month=${item.date.slice(0, 7)}&day=${item.date}&${focus}`;
  }

  const days = Math.max(6, diff);
  if (item.type === "task") return `/tarefas-estudos?days=${days}&${focus}`;
  if (item.kind === "exam") return `/provas?days=${days}&${focus}`;
  return `/anotacoes?days=${days}&${focus}`;
}
