-- =====================================================================
-- 4. Taxas de entrega iniciais (Ilhéus e região)
--    Ajuste os valores depois em /admin > Entrega.
--    "on conflict do nothing": pode rodar de novo sem duplicar.
-- =====================================================================
insert into public.delivery_zones (cidade, bairro, taxa, prazo) values
  ('Ilhéus', null, 12, 'No mesmo dia para pedidos pagos até 15h'),
  ('Itabuna', null, 25, 'Em até 1 dia útil'),
  ('Uruçuca', null, 25, 'Em até 1 dia útil'),
  ('Itacaré', null, 35, 'Em até 2 dias úteis'),
  ('Una', null, 35, 'Em até 2 dias úteis'),
  ('Canavieiras', null, 35, 'Em até 2 dias úteis')
on conflict do nothing;
