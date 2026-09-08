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
