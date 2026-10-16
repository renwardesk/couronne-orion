-- Couronne d'Orion : à exécuter UNE fois dans Supabase → SQL Editor → New query → Run.

create table if not exists public.docs (
  path         text primary key,
  col          text not null,
  data         jsonb,
  lease_holder text,
  lease_exp    timestamptz,
  updated_at   timestamptz not null default now()
);
create index if not exists docs_col_idx on public.docs (col);

-- Sécurité : seuls les joueurs connectés lisent et écrivent.
alter table public.docs enable row level security;
drop policy if exists "joueurs connectes" on public.docs;
create policy "joueurs connectes" on public.docs
  for all to authenticated using (true) with check (true);
grant select, insert, update, delete on public.docs to authenticated;
revoke all on public.docs from anon;

-- Verrou court (évite que deux joueurs résolvent la même bataille en même temps).
create or replace function public.acquire_lease(p_path text, p_holder text, p_ttl_ms int)
returns boolean language plpgsql security invoker set search_path = public as $$
begin
  insert into public.docs (path, col, data, lease_holder, lease_exp)
  values (p_path, regexp_replace(p_path, '/[^/]+$', ''), null, p_holder, now() + make_interval(secs => p_ttl_ms / 1000.0))
  on conflict (path) do update
    set lease_holder = excluded.lease_holder, lease_exp = excluded.lease_exp
    where docs.lease_exp is null or docs.lease_exp < now() or docs.lease_holder = excluded.lease_holder;
  return found;
end $$;
revoke all on function public.acquire_lease(text, text, int) from public, anon;
grant execute on function public.acquire_lease(text, text, int) to authenticated;

-- Temps réel : diffuser les changements de la table aux joueurs.
alter table public.docs replica identity full;
do $$ begin
  alter publication supabase_realtime add table public.docs;
exception when duplicate_object then null; end $$;
