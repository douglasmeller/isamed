-- IsaMed: Financeiro (Pessoal). Valores sempre em centavos (inteiro).
-- Recorrentes/parcelados sao um lancamento so; as ocorrencias de cada mes
-- sao calculadas no app.

create table if not exists public.finance_categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null check (length(trim(name)) > 0),
  monthly_limit_cents integer check (monthly_limit_cents is null or monthly_limit_cents > 0),
  created_at timestamptz not null default now()
);

create table if not exists public.finance_expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  description text not null check (length(trim(description)) > 0),
  -- Parcelado: valor TOTAL da compra (dividido entre as parcelas).
  amount_cents integer not null check (amount_cents > 0),
  date date not null,
  category_id uuid references public.finance_categories (id) on delete set null,
  payment_method text not null check (payment_method in ('pix_debito', 'credito')),
  recurrence text not null default 'none' check (recurrence in ('none', 'monthly', 'installments')),
  installments integer check (installments is null or installments between 2 and 48),
  -- Recorrente encerrado: ultimo mes (YYYY-MM) em que ainda conta.
  end_month text check (end_month is null or end_month ~ '^\d{4}-\d{2}$'),
  created_at timestamptz not null default now(),
  check ((recurrence = 'installments') = (installments is not null))
);

create index if not exists finance_expenses_user_date_idx on public.finance_expenses (user_id, date);

create table if not exists public.finance_incomes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  description text not null check (length(trim(description)) > 0),
  amount_cents integer not null check (amount_cents > 0),
  date date not null,
  recurring boolean not null default false,
  end_month text check (end_month is null or end_month ~ '^\d{4}-\d{2}$'),
  created_at timestamptz not null default now()
);

create index if not exists finance_incomes_user_date_idx on public.finance_incomes (user_id, date);

create table if not exists public.finance_settings (
  user_id uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  card_closing_day integer check (card_closing_day between 1 and 31),
  card_due_day integer check (card_due_day between 1 and 31)
);

create table if not exists public.finance_card_bills (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  due_month text not null check (due_month ~ '^\d{4}-\d{2}$'),
  paid boolean not null default false,
  primary key (user_id, due_month)
);

create table if not exists public.finance_savings (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  month text not null check (month ~ '^\d{4}-\d{2}$'),
  amount_cents integer not null check (amount_cents > 0),
  saved boolean not null default false,
  primary key (user_id, month)
);

do $$
declare
  t text;
begin
  foreach t in array array[
    'finance_categories', 'finance_expenses', 'finance_incomes',
    'finance_settings', 'finance_card_bills', 'finance_savings'
  ]
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy %I on public.%I for select using ((select auth.uid()) = user_id)', t || '_select_own', t);
    execute format('create policy %I on public.%I for insert with check ((select auth.uid()) = user_id)', t || '_insert_own', t);
    execute format('create policy %I on public.%I for update using ((select auth.uid()) = user_id)', t || '_update_own', t);
    execute format('create policy %I on public.%I for delete using ((select auth.uid()) = user_id)', t || '_delete_own', t);
  end loop;
end $$;
