-- IsaMed: vinculo entre tarefas/provas/anotacoes do mesmo dia
create table if not exists public.item_links (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  date date not null,
  a_type text not null check (a_type in ('task', 'entry')),
  a_id uuid not null,
  b_type text not null check (b_type in ('task', 'entry')),
  b_id uuid not null,
  created_at timestamptz not null default now(),
  constraint item_links_unique unique (a_type, a_id, b_type, b_id)
);

create index if not exists item_links_user_date_idx on public.item_links (user_id, date);

alter table public.item_links enable row level security;

create policy "item_links_select_own" on public.item_links
  for select using ((select auth.uid()) = user_id);

create policy "item_links_insert_own" on public.item_links
  for insert with check ((select auth.uid()) = user_id);

create policy "item_links_delete_own" on public.item_links
  for delete using ((select auth.uid()) = user_id);
