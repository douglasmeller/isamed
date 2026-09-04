import { TaskItem } from "@/components/TaskItem";
import type { Task } from "@/lib/types";

export function TaskList({ tasks }: { tasks: Task[] }) {
  if (tasks.length === 0) {
    return (
      <p className="rounded-2xl border-2 border-dashed border-pink-200 px-4 py-6 text-center text-ink-soft">
        Nenhuma tarefa por aqui ainda.
      </p>
    );
  }

  const sorted = [...tasks].sort((a, b) => {
    if (a.time && b.time) return a.time.localeCompare(b.time);
    if (a.time) return -1;
    if (b.time) return 1;
    return a.created_at.localeCompare(b.created_at);
  });

  return (
    <div className="flex flex-col gap-2.5">
      {sorted.map((task) => (
        <TaskItem key={task.id} task={task} />
      ))}
    </div>
  );
}
