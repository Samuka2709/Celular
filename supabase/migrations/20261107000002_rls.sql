-- =====================================================================
-- 2. Segurança: RLS em todas as tabelas
--    - Público (anon) só lê catálogo ativo e zonas de entrega ativas
--    - Pedidos: só administradores leem/editam. Criação de pedido acontece
--      no servidor com a service_role (que ignora RLS), nunca no navegador.
-- =====================================================================

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated, service_role;

alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.product_images enable row level security;
alter table public.delivery_zones enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.order_status_history enable row level security;
alter table public.admins enable row level security;

-- Catálogo: leitura pública do que está ativo ---------------------------
drop policy if exists "catalogo: leitura publica" on public.products;
create policy "catalogo: leitura publica" on public.products
  for select to anon, authenticated
  using (ativo or public.is_admin());

drop policy if exists "catalogo: admin escreve" on public.products;
create policy "catalogo: admin escreve" on public.products
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "variacoes: leitura publica" on public.product_variants;
create policy "variacoes: leitura publica" on public.product_variants
  for select to anon, authenticated
  using (
    public.is_admin()
    or exists (select 1 from public.products p where p.id = product_id and p.ativo)
  );

drop policy if exists "variacoes: admin escreve" on public.product_variants;
create policy "variacoes: admin escreve" on public.product_variants
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "imagens: leitura publica" on public.product_images;
create policy "imagens: leitura publica" on public.product_images
  for select to anon, authenticated
  using (
    public.is_admin()
    or exists (select 1 from public.products p where p.id = product_id and p.ativo)
  );

drop policy if exists "imagens: admin escreve" on public.product_images;
create policy "imagens: admin escreve" on public.product_images
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Entrega ---------------------------------------------------------------
drop policy if exists "entrega: leitura publica" on public.delivery_zones;
create policy "entrega: leitura publica" on public.delivery_zones
  for select to anon, authenticated
  using (ativo or public.is_admin());

drop policy if exists "entrega: admin escreve" on public.delivery_zones;
create policy "entrega: admin escreve" on public.delivery_zones
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Pedidos: nada para anon. Admin lê e edita. ----------------------------
drop policy if exists "pedidos: admin le" on public.orders;
create policy "pedidos: admin le" on public.orders
  for select to authenticated using (public.is_admin());

drop policy if exists "pedidos: admin edita" on public.orders;
create policy "pedidos: admin edita" on public.orders
  for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "itens: admin le" on public.order_items;
create policy "itens: admin le" on public.order_items
  for select to authenticated using (public.is_admin());

drop policy if exists "historico: admin le" on public.order_status_history;
create policy "historico: admin le" on public.order_status_history
  for select to authenticated using (public.is_admin());

drop policy if exists "historico: admin insere" on public.order_status_history;
create policy "historico: admin insere" on public.order_status_history
  for insert to authenticated with check (public.is_admin());

-- Admins: cada usuário só enxerga a própria linha -----------------------
drop policy if exists "admins: ve a si mesmo" on public.admins;
create policy "admins: ve a si mesmo" on public.admins
  for select to authenticated using (user_id = auth.uid());

-- Garantia extra: anon não tem nenhum privilégio nas tabelas de pedido
revoke all on public.orders, public.order_items, public.order_status_history, public.admins from anon;

-- =====================================================================
-- Storage: bucket público "produtos" para as fotos. Só admin envia/apaga.
-- =====================================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('produtos', 'produtos', true, 524288, array['image/webp', 'image/jpeg', 'image/png'])
on conflict (id) do update set public = true;

drop policy if exists "fotos: admin envia" on storage.objects;
create policy "fotos: admin envia" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'produtos' and public.is_admin());

drop policy if exists "fotos: admin altera" on storage.objects;
create policy "fotos: admin altera" on storage.objects
  for update to authenticated
  using (bucket_id = 'produtos' and public.is_admin());

drop policy if exists "fotos: admin apaga" on storage.objects;
create policy "fotos: admin apaga" on storage.objects
  for delete to authenticated
  using (bucket_id = 'produtos' and public.is_admin());
