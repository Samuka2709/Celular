-- =====================================================================
-- 3. Estoque e pedidos (funções chamadas só pelo servidor, com service_role)
--
--    disponível = estoque - estoque_reservado
--    criar pedido      -> reserva (estoque_reservado += qtd) por 30 min
--    pagamento aprovado-> baixa (estoque -= qtd, estoque_reservado -= qtd)
--    recusado/expirado -> devolve a reserva (estoque_reservado -= qtd)
--    estorno           -> devolve ao estoque (estoque += qtd)
--
-- Todas usam SELECT ... FOR UPDATE nas linhas envolvidas, então dois
-- clientes nunca levam a última unidade ao mesmo tempo, e o mesmo aviso
-- do Mercado Pago processado duas vezes não baixa o estoque duas vezes.
-- =====================================================================

-- Código curto e legível: PED-4F7K2 (sem 0/O/1/I para evitar confusão)
create or replace function public.gerar_codigo_pedido() returns text
language plpgsql as $$
declare
  alfabeto constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  cod text;
begin
  loop
    cod := 'PED-';
    for i in 1..5 loop
      cod := cod || substr(alfabeto, 1 + floor(random() * length(alfabeto))::int, 1);
    end loop;
    exit when not exists (select 1 from public.orders where codigo = cod);
  end loop;
  return cod;
end $$;

-- ---------------------------------------------------------------------
-- criar_pedido: valida estoque, reserva, grava pedido/itens/histórico.
-- Os preços vêm SEMPRE do banco; o navegador só manda variant_id e quantidade.
-- p_itens: [{ "variant_id": "...", "quantidade": 1 }]
-- ---------------------------------------------------------------------
create or replace function public.criar_pedido(p_pedido jsonb, p_itens jsonb)
returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_forma public.forma_pagamento := coalesce((p_pedido->>'forma_pagamento')::public.forma_pagamento, 'pix');
  v_frete numeric(10,2) := coalesce((p_pedido->>'frete')::numeric, 0);
  v_subtotal numeric(10,2) := 0;
  v_order_id uuid := gen_random_uuid();
  v_codigo text;
  v_token uuid := gen_random_uuid();
  v_expira timestamptz := now() + interval '30 minutes';
  v_itens jsonb := '[]'::jsonb;
  r record;
  v_preco numeric(10,2);
  v_titulo text;
  v_encontrados integer := 0;
begin
  if jsonb_typeof(p_itens) <> 'array' or jsonb_array_length(p_itens) = 0 then
    raise exception 'CARRINHO_VAZIO' using hint = 'O carrinho está vazio.';
  end if;

  -- Agrupa variações repetidas e trava as linhas em ordem fixa (evita deadlock)
  for r in
    with pedidos as (
      select (i->>'variant_id')::uuid as variant_id, sum((i->>'quantidade')::int) as qtd
      from jsonb_array_elements(p_itens) i
      group by 1
    )
    select pe.variant_id, pe.qtd, v.id as vid, v.cor, v.armazenamento, v.preco, v.preco_pix,
           v.estoque, v.estoque_reservado, p.nome, p.ativo
    from pedidos pe
    join public.product_variants v on v.id = pe.variant_id
    join public.products p on p.id = v.product_id
    order by pe.variant_id
    for update of v
  loop
    v_encontrados := v_encontrados + 1;
    if r.qtd is null or r.qtd < 1 or r.qtd > 10 then
      raise exception 'QUANTIDADE_INVALIDA' using hint = 'Quantidade inválida.';
    end if;
    if not r.ativo or (r.estoque - r.estoque_reservado) < r.qtd then
      raise exception 'ESGOTADO'
        using detail = coalesce(r.variant_id::text, ''),
              hint = format('Este item acabou de esgotar: %s', coalesce(r.nome || ' ' || r.cor, 'produto'));
    end if;

    v_preco := case when v_forma = 'pix' then r.preco_pix else r.preco end;
    v_titulo := r.nome || ' ' || r.cor || coalesce(' ' || r.armazenamento, '');
    v_subtotal := v_subtotal + v_preco * r.qtd;

    update public.product_variants
      set estoque_reservado = estoque_reservado + r.qtd
      where id = r.vid;

    v_itens := v_itens || jsonb_build_object(
      'variant_id', r.vid, 'titulo', v_titulo, 'quantidade', r.qtd, 'preco_unitario', v_preco
    );
  end loop;

  -- Alguma variação enviada não existe mais
  if v_encontrados <> (select count(distinct i->>'variant_id') from jsonb_array_elements(p_itens) i) then
    raise exception 'ESGOTADO' using hint = 'Um item do carrinho não está mais disponível.';
  end if;

  v_codigo := public.gerar_codigo_pedido();

  insert into public.orders (
    id, codigo, token_acompanhamento, nome, email, whatsapp, cpf, tipo_entrega, endereco,
    forma_pagamento, subtotal, frete, total, status, reserva_expira_em, reserva_ativa
  ) values (
    v_order_id, v_codigo, v_token,
    p_pedido->>'nome', p_pedido->>'email', p_pedido->>'whatsapp', nullif(p_pedido->>'cpf', ''),
    (p_pedido->>'tipo_entrega')::public.tipo_entrega,
    case when p_pedido->>'tipo_entrega' = 'entrega' then p_pedido->'endereco' else null end,
    v_forma, v_subtotal, v_frete, v_subtotal + v_frete, 'aguardando_pagamento', v_expira, true
  );

  insert into public.order_items (order_id, variant_id, nome_snapshot, preco_unitario, quantidade)
  select v_order_id, (i->>'variant_id')::uuid, i->>'titulo', (i->>'preco_unitario')::numeric, (i->>'quantidade')::int
  from jsonb_array_elements(v_itens) i;

  insert into public.order_status_history (order_id, status, observacao)
  values (v_order_id, 'aguardando_pagamento', 'Pedido criado. Itens reservados por 30 minutos.');

  return jsonb_build_object(
    'id', v_order_id, 'codigo', v_codigo, 'token', v_token,
    'subtotal', v_subtotal, 'frete', v_frete, 'total', v_subtotal + v_frete,
    'reserva_expira_em', v_expira, 'itens', v_itens
  );
end $$;

-- ---------------------------------------------------------------------
-- liberar_reserva: devolve a reserva (recusado, cancelado ou expirado).
-- Idempotente: se a reserva já foi liberada, não faz nada.
-- ---------------------------------------------------------------------
create or replace function public.liberar_reserva(
  p_order_id uuid, p_status public.status_pedido, p_obs text default null
) returns boolean
language plpgsql security definer set search_path = public as $$
declare
  o public.orders;
  it record;
begin
  select * into o from public.orders where id = p_order_id for update;
  if not found or not o.reserva_ativa then
    return false;
  end if;

  for it in
    select oi.variant_id, oi.quantidade from public.order_items oi
    where oi.order_id = p_order_id and oi.variant_id is not null
    order by oi.variant_id
  loop
    perform 1 from public.product_variants where id = it.variant_id for update;
    update public.product_variants
      set estoque_reservado = greatest(estoque_reservado - it.quantidade, 0)
      where id = it.variant_id;
  end loop;

  update public.orders
    set reserva_ativa = false,
        status = case when status = 'aguardando_pagamento' then p_status else status end
    where id = p_order_id;

  if o.status = 'aguardando_pagamento' then
    insert into public.order_status_history (order_id, status, observacao)
    values (p_order_id, p_status, coalesce(p_obs, 'Reserva liberada.'));
  end if;
  return true;
end $$;

-- ---------------------------------------------------------------------
-- confirmar_pagamento: baixa o estoque uma única vez por pedido.
-- Retorna: 'confirmado' | 'ja_processado' | 'sem_estoque'
-- ---------------------------------------------------------------------
create or replace function public.confirmar_pagamento(p_order_id uuid, p_payment_id text)
returns text
language plpgsql security definer set search_path = public as $$
declare
  o public.orders;
  it record;
  v_falta boolean := false;
begin
  select * into o from public.orders where id = p_order_id for update;
  if not found then
    raise exception 'PEDIDO_NAO_ENCONTRADO';
  end if;

  if o.estoque_baixado or o.status in ('pago', 'separando', 'enviado', 'pronto_retirada', 'entregue') then
    update public.orders set mp_payment_id = coalesce(mp_payment_id, p_payment_id) where id = p_order_id;
    return 'ja_processado';
  end if;

  -- Reserva expirada/cancelada antes do pagamento: confere se ainda há estoque livre
  if not o.reserva_ativa then
    for it in
      select oi.variant_id, oi.quantidade, v.estoque, v.estoque_reservado
      from public.order_items oi
      join public.product_variants v on v.id = oi.variant_id
      where oi.order_id = p_order_id
      order by oi.variant_id
      for update of v
    loop
      if it.estoque - it.estoque_reservado < it.quantidade then
        v_falta := true;
      end if;
    end loop;
  end if;

  if not v_falta then
    for it in
      select oi.variant_id, oi.quantidade from public.order_items oi
      where oi.order_id = p_order_id and oi.variant_id is not null
      order by oi.variant_id
    loop
      perform 1 from public.product_variants where id = it.variant_id for update;
      update public.product_variants
        set estoque = estoque - it.quantidade,
            estoque_reservado = case when o.reserva_ativa
                                     then greatest(estoque_reservado - it.quantidade, 0)
                                     else estoque_reservado end
        where id = it.variant_id;
      update public.products p set vendas = vendas + it.quantidade
        from public.product_variants v where v.id = it.variant_id and p.id = v.product_id;
    end loop;
  end if;

  update public.orders
    set status = 'pago', mp_payment_id = p_payment_id, reserva_ativa = false,
        estoque_baixado = not v_falta
    where id = p_order_id;

  insert into public.order_status_history (order_id, status, observacao)
  values (
    p_order_id, 'pago',
    case when v_falta
      then 'ATENÇÃO: pagamento aprovado depois que a reserva expirou e não há estoque suficiente. Verifique e, se for o caso, faça o reembolso no Mercado Pago.'
      else format('Pagamento aprovado (Mercado Pago %s).', p_payment_id)
    end
  );

  return case when v_falta then 'sem_estoque' else 'confirmado' end;
end $$;

-- ---------------------------------------------------------------------
-- estornar_pedido: reembolso/chargeback ou cancelamento de pedido pago.
-- Devolve as unidades ao estoque (uma única vez) e marca como cancelado.
-- ---------------------------------------------------------------------
create or replace function public.estornar_pedido(p_order_id uuid, p_obs text default null)
returns boolean
language plpgsql security definer set search_path = public as $$
declare
  o public.orders;
  it record;
begin
  select * into o from public.orders where id = p_order_id for update;
  if not found then return false; end if;

  if o.reserva_ativa then
    perform public.liberar_reserva(p_order_id, 'cancelado', p_obs);
    return true;
  end if;

  if o.estoque_baixado then
    for it in
      select oi.variant_id, oi.quantidade from public.order_items oi
      where oi.order_id = p_order_id and oi.variant_id is not null
      order by oi.variant_id
    loop
      update public.product_variants set estoque = estoque + it.quantidade where id = it.variant_id;
    end loop;
  end if;

  if o.status = 'cancelado' and not o.estoque_baixado then
    return false;
  end if;

  update public.orders set status = 'cancelado', estoque_baixado = false where id = p_order_id;
  insert into public.order_status_history (order_id, status, observacao)
  values (p_order_id, 'cancelado', coalesce(p_obs, 'Pedido cancelado e itens devolvidos ao estoque.'));
  return true;
end $$;

-- ---------------------------------------------------------------------
-- mudar_status: usado pelo painel /admin (o servidor confere se é admin).
-- ---------------------------------------------------------------------
create or replace function public.mudar_status(
  p_order_id uuid, p_status public.status_pedido, p_obs text default null
) returns void
language plpgsql security definer set search_path = public as $$
declare
  o public.orders;
begin
  select * into o from public.orders where id = p_order_id for update;
  if not found then raise exception 'PEDIDO_NAO_ENCONTRADO'; end if;
  if o.status = p_status then return; end if;

  if p_status = 'cancelado' then
    perform public.estornar_pedido(p_order_id, coalesce(p_obs, 'Cancelado pela loja.'));
    return;
  end if;

  if p_status = 'pago' then
    perform public.confirmar_pagamento(p_order_id, coalesce(o.mp_payment_id, 'manual'));
    return;
  end if;

  if o.status in ('aguardando_pagamento', 'cancelado', 'expirado') then
    raise exception 'TRANSICAO_INVALIDA' using hint = 'Confirme o pagamento antes de avançar o pedido.';
  end if;

  update public.orders set status = p_status where id = p_order_id;
  insert into public.order_status_history (order_id, status, observacao)
  values (p_order_id, p_status, p_obs);
end $$;

-- ---------------------------------------------------------------------
-- expirar_reservas: chamada a cada 5 minutos pelo pg_cron
-- ---------------------------------------------------------------------
create or replace function public.expirar_reservas() returns integer
language plpgsql security definer set search_path = public as $$
declare
  r record;
  n integer := 0;
begin
  for r in
    select id from public.orders
    where reserva_ativa and status = 'aguardando_pagamento' and reserva_expira_em < now()
    order by reserva_expira_em
    limit 500
  loop
    if public.liberar_reserva(r.id, 'expirado', 'Reserva de 30 minutos expirou sem pagamento.') then
      n := n + 1;
    end if;
  end loop;
  return n;
end $$;

-- Só o servidor (service_role) pode chamar essas funções
revoke all on function public.gerar_codigo_pedido() from public, anon, authenticated;
revoke all on function public.criar_pedido(jsonb, jsonb) from public, anon, authenticated;
revoke all on function public.liberar_reserva(uuid, public.status_pedido, text) from public, anon, authenticated;
revoke all on function public.confirmar_pagamento(uuid, text) from public, anon, authenticated;
revoke all on function public.estornar_pedido(uuid, text) from public, anon, authenticated;
revoke all on function public.mudar_status(uuid, public.status_pedido, text) from public, anon, authenticated;
revoke all on function public.expirar_reservas() from public, anon, authenticated;

grant execute on function public.criar_pedido(jsonb, jsonb) to service_role;
grant execute on function public.liberar_reserva(uuid, public.status_pedido, text) to service_role;
grant execute on function public.confirmar_pagamento(uuid, text) to service_role;
grant execute on function public.estornar_pedido(uuid, text) to service_role;
grant execute on function public.mudar_status(uuid, public.status_pedido, text) to service_role;
grant execute on function public.expirar_reservas() to service_role;

-- =====================================================================
-- Job do pg_cron: expira reservas vencidas a cada 5 minutos
-- =====================================================================
create extension if not exists pg_cron;

select cron.schedule(
  'expirar-reservas',
  '*/5 * * * *',
  $$ select public.expirar_reservas(); $$
);
