export type Task = {
  id: string;
  user_id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time: string | null; // HH:MM:SS
  done: boolean;
  created_at: string;
};

export type EntryKind = "exam" | "note";

export type Entry = {
  id: string;
  user_id: string;
  kind: EntryKind;
  title: string;
  date: string; // YYYY-MM-DD
  time: string | null; // HH:MM:SS
  created_at: string;
};

export type ItemType = "task" | "entry";

// Referencia leve a uma tarefa/prova/anotacao, usada pra vincular itens
// (inclusive de dias diferentes) sem precisar carregar o registro inteiro.
export type DayItem = {
  type: ItemType;
  id: string;
  title: string;
  date: string;
  kind?: EntryKind;
};

// Guarda titulo/data/tipo de cada lado direto no vinculo, pra mostrar a
// etiqueta do item vinculado mesmo quando ele nao esta carregado na tela
// (por exemplo, um vinculo com um item de outro dia).
export type ItemLink = {
  id: string;
  a_type: ItemType;
  a_id: string;
  a_title: string;
  a_date: string;
  a_kind?: EntryKind;
  b_type: ItemType;
  b_id: string;
  b_title: string;
  b_date: string;
  b_kind?: EntryKind;
};
