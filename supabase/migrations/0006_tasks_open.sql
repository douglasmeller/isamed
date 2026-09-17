-- Tarefas "Em aberto": sem dia definido ainda. was_open marca
-- permanentemente uma tarefa que nasceu assim, mesmo depois de ganhar
-- uma data (pra mostrar o aviso "(Em aberto ->)" quando ela aparecer
-- em Tarefas/Estudos ou no Calendario).
alter table public.tasks alter column date drop not null;
alter table public.tasks add column if not exists was_open boolean not null default false;
