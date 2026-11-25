-- Execute este script no Supabase: SQL Editor > New query > Run

create table if not exists public.obras (
  id               bigint generated always as identity primary key,
  titulo           text    not null,
  autor            text,
  tipo             text    not null default 'livro' check (tipo in ('livro', 'manga')),
  total_volumes    integer not null default 0 check (total_volumes >= 0),
  total_capitulos  integer not null default 0 check (total_capitulos >= 0),
  total_paginas    integer not null check (total_paginas > 0),
  volume_atual     integer not null default 0 check (volume_atual >= 0),
  capitulo_atual   integer not null default 0 check (capitulo_atual >= 0),
  paginas_lidas    integer not null default 0 check (paginas_lidas >= 0),
  -- Percentual calculado automaticamente pelo banco a partir das páginas lidas
  percentual       numeric(5,1) generated always as (
                     least(100, round(paginas_lidas * 100.0 / total_paginas, 1))
                   ) stored,
  criado_em        timestamptz not null default now(),
  atualizado_em    timestamptz not null default now(),
  constraint paginas_validas check (paginas_lidas <= total_paginas)
);

-- Atualiza "atualizado_em" a cada alteração
create or replace function public.set_atualizado_em()
returns trigger language plpgsql as $$
begin
  new.atualizado_em := now();
  return new;
end;
$$;

drop trigger if exists trg_obras_atualizado on public.obras;
create trigger trg_obras_atualizado
before update on public.obras
for each row execute function public.set_atualizado_em();

-- Row Level Security: liberado para a chave anon (projeto acadêmico, sem login).
alter table public.obras enable row level security;

drop policy if exists "acesso publico" on public.obras;
create policy "acesso publico" on public.obras
  for all to anon, authenticated
  using (true) with check (true);
