-- IsaMed: Metas (habitos marcados por dia, verde = fez / vermelho = nao fez).

create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title text not null check (length(trim(title)) > 0),
  -- Dias da semana em que a meta vale (0 = domingo ... 6 = sabado).
  weekdays smallint[] not null default '{0,1,2,3,4,5,6}'
    check (cardinality(weekdays) between 1 and 7 and weekdays <@ '{0,1,2,3,4,5,6}'::smallint[]),
  created_at timestamptz not null default now()
);

create table if not exists public.goal_checks (
  goal_id uuid not null references public.goals (id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  date date not null,
  status text not null check (status in ('done', 'missed')),
  primary key (goal_id, date)
);

create index if not exists goal_checks_user_date_idx on public.goal_checks (user_id, date);

do $$
declare
  t text;
begin
  foreach t in array array['goals', 'goal_checks']
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy %I on public.%I for select using ((select auth.uid()) = user_id)', t || '_select_own', t);
    execute format('create policy %I on public.%I for insert with check ((select auth.uid()) = user_id)', t || '_insert_own', t);
    execute format('create policy %I on public.%I for update using ((select auth.uid()) = user_id)', t || '_update_own', t);
    execute format('create policy %I on public.%I for delete using ((select auth.uid()) = user_id)', t || '_delete_own', t);
  end loop;
end $$;
