-- keep_alive: tabela usada pelo GitHub Actions para evitar pausa do projeto gratuito
create table if not exists public.keep_alive (
  id        bigint generated always as identity primary key,
  pinged_at timestamptz not null default now()
);

alter table public.keep_alive enable row level security;

create policy "anon can insert" on public.keep_alive
  for insert to anon with check (true);

create policy "anon can select" on public.keep_alive
  for select to anon using (true);

create policy "anon can delete" on public.keep_alive
  for delete to anon using (true);
