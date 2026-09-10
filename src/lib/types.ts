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
  created_at: string;
};

export type ItemType = "task" | "entry";

// Referencia leve a uma tarefa/prova/anotacao, usada para vincular itens do
// mesmo dia sem precisar carregar o registro inteiro.
export type DayItem = {
  type: ItemType;
  id: string;
  title: string;
  kind?: EntryKind;
};

export type ItemLink = {
  id: string;
  date: string;
  a_type: ItemType;
  a_id: string;
  b_type: ItemType;
  b_id: string;
};
