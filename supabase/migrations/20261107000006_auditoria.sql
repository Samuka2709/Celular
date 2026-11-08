-- Registro de atividades do painel: logins (certos, errados e bloqueados) e ações dos administradores.
-- Só o servidor grava (chave secreta); administradores podem ler. Ninguém edita nem apaga pelo site.

create table if not exists public.admin_log (
  id         bigint generated always as identity primary key,
  criado_em  timestamptz not null default now(),
  user_id    uuid,
  email      text,
  ip         text,
  acao       text not null,
  detalhes   jsonb not null default '{}'::jsonb
);

create index if not exists admin_log_criado_em_idx on public.admin_log (criado_em desc);
create index if not exists admin_log_acao_idx on public.admin_log (acao);

alter table public.admin_log enable row level security;

drop policy if exists "admin_log: admins leem" on public.admin_log;
create policy "admin_log: admins leem" on public.admin_log
  for select to authenticated using (public.is_admin());

revoke all on public.admin_log from anon;
revoke insert, update, delete on public.admin_log from authenticated;

-- Limpeza: apaga registros com mais de 1 ano (roda todo dia às 4h, se o pg_cron estiver ativo)
do $$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    perform cron.unschedule('limpar-admin-log') where exists (select 1 from cron.job where jobname = 'limpar-admin-log');
    perform cron.schedule('limpar-admin-log', '0 4 * * *',
      $c$delete from public.admin_log where criado_em < now() - interval '1 year'$c$);
  end if;
end $$;
