-- Notifications d'attaque (déjà appliqué sur le projet). Fonction serveur : supabase/functions/push-attack
create extension if not exists pg_net;
create table if not exists public.push_subs (endpoint text primary key, uid uuid not null, sub jsonb not null, created_at timestamptz not null default now());
alter table public.push_subs enable row level security;
create policy "mes abonnements" on public.push_subs for all to authenticated using (uid = (select auth.uid())) with check (uid = (select auth.uid()));
grant select, insert, update, delete on public.push_subs to authenticated;
create table if not exists public.push_vapid (id int primary key, pub text not null, priv text not null);
alter table public.push_vapid enable row level security;
create table if not exists public.push_sent (k text primary key, at timestamptz not null default now());
alter table public.push_sent enable row level security;
grant select, insert, update, delete on public.push_vapid, public.push_sent, public.push_subs to service_role;
grant select on public.docs to service_role;
create or replace function public.notify_attack() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.col = 'fleets' and new.data is not null and new.data->>'mission' = 'attack' and new.data->>'phase' = 'out'
     and (tg_op = 'INSERT' or old.data is null or old.data->>'phase' is distinct from 'out' or old.data->>'to' is distinct from new.data->>'to') then
    perform net.http_post(url := 'https://sbymnsyjnbkdvdjrohza.supabase.co/functions/v1/push-attack', body := jsonb_build_object('path', new.path), headers := '{"Content-Type":"application/json"}'::jsonb);
  end if;
  return new;
end $$;
create or replace trigger docs_notify_attack after insert or update on public.docs for each row execute function public.notify_attack();
