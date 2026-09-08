-- IsaMed: tabela genérica para Provas e Anotações (mesma estrutura, cores/telas diferentes)
create table if not exists public.entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  kind text not null check (kind in ('exam', 'note')),
  title text not null,
  date date not null,
  created_at timestamptz not null default now()
);

create index if not exists entries_user_kind_date_idx on public.entries (user_id, kind, date);

alter table public.entries enable row level security;

create policy "entries_select_own" on public.entries
  for select using ((select auth.uid()) = user_id);

create policy "entries_insert_own" on public.entries
  for insert with check ((select auth.uid()) = user_id);

create policy "entries_update_own" on public.entries
  for update using ((select auth.uid()) = user_id);

create policy "entries_delete_own" on public.entries
  for delete using ((select auth.uid()) = user_id);
