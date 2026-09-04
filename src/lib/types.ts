export type Task = {
  id: string;
  user_id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time: string | null; // HH:MM:SS
  done: boolean;
  created_at: string;
};
