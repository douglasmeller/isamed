-- IsaMed: tabela de tarefas
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title text not null,
  date date not null,
  time time,
  done boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists tasks_user_date_idx on public.tasks (user_id, date);

alter table public.tasks enable row level security;

create policy "tasks_select_own" on public.tasks
  for select using ((select auth.uid()) = user_id);

create policy "tasks_insert_own" on public.tasks
  for insert with check ((select auth.uid()) = user_id);

create policy "tasks_update_own" on public.tasks
  for update using ((select auth.uid()) = user_id);

create policy "tasks_delete_own" on public.tasks
  for delete using ((select auth.uid()) = user_id);
