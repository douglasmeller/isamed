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
    <div className="flex flex-col gap-10 pt-2">
      <header>
        <h1 className="text-2xl font-semibold text-ink">Em aberto</h1>
        <p className="text-sm text-ink-soft">Tarefas pendentes, sem um dia definido ainda.</p>
      </header>

      <section className="flex flex-col gap-4">
        {/* Em tela larga a lista vira duas colunas; o campo acompanha a primeira. */}
        <div className="xl:w-[calc(50%-0.3125rem)]">
          <AddOpenTaskForm />
        </div>

        {tasks.length === 0 ? (
          <p className="rounded-2xl border-2 border-dashed border-pink-200 px-4 py-6 text-center text-ink-soft">
            Nenhuma tarefa em aberto.
          </p>
        ) : (
          <div className="grid gap-2.5 xl:grid-cols-2 xl:items-start">
            {tasks.map((task) => (
              <OpenTaskItem key={task.id} task={task} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
