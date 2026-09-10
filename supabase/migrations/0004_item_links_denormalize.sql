-- IsaMed: permite vincular itens de dias diferentes, guardando titulo/data/tipo
-- de cada lado direto no vinculo (evita depender do que ja esta carregado na
-- tela pra mostrar a etiqueta do item vinculado).
alter table public.item_links
  add column if not exists a_title text,
  add column if not exists a_date date,
  add column if not exists a_kind text,
  add column if not exists b_title text,
  add column if not exists b_date date,
  add column if not exists b_kind text;

update public.item_links l
set
  a_title = coalesce(
    (select title from public.tasks where id = l.a_id and l.a_type = 'task'),
    (select title from public.entries where id = l.a_id and l.a_type = 'entry')
  ),
  a_date = coalesce(
    (select date from public.tasks where id = l.a_id and l.a_type = 'task'),
    (select date from public.entries where id = l.a_id and l.a_type = 'entry'),
    l.date
  ),
  a_kind = (select kind from public.entries where id = l.a_id and l.a_type = 'entry'),
  b_title = coalesce(
    (select title from public.tasks where id = l.b_id and l.b_type = 'task'),
    (select title from public.entries where id = l.b_id and l.b_type = 'entry')
  ),
  b_date = coalesce(
    (select date from public.tasks where id = l.b_id and l.b_type = 'task'),
    (select date from public.entries where id = l.b_id and l.b_type = 'entry'),
    l.date
  ),
  b_kind = (select kind from public.entries where id = l.b_id and l.b_type = 'entry')
where a_title is null or b_title is null;

alter table public.item_links
  alter column a_title set not null,
  alter column a_date set not null,
  alter column b_title set not null,
  alter column b_date set not null;
