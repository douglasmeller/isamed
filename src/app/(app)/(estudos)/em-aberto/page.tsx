import { createClient } from "@/lib/supabase/server";
import { AddOpenTaskForm } from "@/components/AddOpenTaskForm";
import { OpenTaskItem } from "@/components/OpenTaskItem";
import type { OpenTask } from "@/lib/types";

export default async function EmAbertoPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("tasks")
    .select("id, title, created_at")
    .is("date", null)
    .order("created_at", { ascending: true });

  const tasks = (data ?? []) as OpenTask[];

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-10 pt-2">
      <header>
        <h1 className="text-2xl font-semibold text-ink">Em aberto</h1>
        <p className="text-sm text-ink-soft">Tarefas pendentes, sem um dia definido ainda.</p>
      </header>

      <section className="flex flex-col gap-4">
        <AddOpenTaskForm />

        {tasks.length === 0 ? (
          <p className="rounded-2xl border-2 border-dashed border-pink-200 px-4 py-6 text-center text-ink-soft">
            Nenhuma tarefa em aberto.
          </p>
        ) : (
          <div className="flex flex-col gap-2.5">
            {tasks.map((task) => (
              <OpenTaskItem key={task.id} task={task} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
