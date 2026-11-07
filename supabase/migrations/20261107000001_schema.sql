-- =====================================================================
-- 1. Esquema da loja: catálogo, pedidos, entrega e administradores
-- =====================================================================

create extension if not exists pgcrypto;

-- Tipos -----------------------------------------------------------------
do $$ begin
  create type public.categoria as enum ('celular', 'acessorio');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.condicao as enum ('novo', 'seminovo');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.tipo_entrega as enum ('retirada', 'entrega');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.status_pedido as enum (
    'aguardando_pagamento', 'pago', 'separando', 'enviado',
    'pronto_retirada', 'entregue', 'cancelado', 'expirado'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.forma_pagamento as enum ('pix', 'cartao_boleto');
exception when duplicate_object then null; end $$;

-- Catálogo --------------------------------------------------------------
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  nome text not null,
  marca text not null,
  categoria public.categoria not null default 'celular',
  condicao public.condicao not null default 'novo',
  descricao text not null default '',
  ficha_tecnica jsonb not null default '{}'::jsonb,
  -- { "saude_bateria": 89, "estado": "...", "acompanha": ["..."], "garantia": "..." }
  detalhes_seminovo jsonb,
  destaque boolean not null default false,
  ativo boolean not null default true,
  vendas integer not null default 0,
  modelo_visual text,
  created_at timestamptz not null default now()
);

create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  cor text not null,
  cor_hex text not null default '#26262a',
  armazenamento text,
  preco numeric(10,2) not null check (preco > 0),
  preco_antigo numeric(10,2) check (preco_antigo is null or preco_antigo > 0),
  preco_pix numeric(10,2) not null check (preco_pix > 0),
  estoque integer not null default 0 check (estoque >= 0),
  estoque_reservado integer not null default 0 check (estoque_reservado >= 0),
  sku text unique,
  ordem integer not null default 0,
  created_at timestamptz not null default now(),
  constraint reserva_menor_que_estoque check (estoque_reservado <= estoque)
);
create index if not exists product_variants_product_idx on public.product_variants(product_id);

create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  url text not null,
  -- cor da variação a que a foto pertence (null = todas as cores)
  cor text,
  alt text,
  ordem integer not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists product_images_product_idx on public.product_images(product_id);

-- Entrega ---------------------------------------------------------------
-- Taxa por cidade (bairro null) ou por bairro específico. Editável no /admin.
create table if not exists public.delivery_zones (
  id uuid primary key default gen_random_uuid(),
  cidade text not null,
  bairro text,
  taxa numeric(10,2) not null check (taxa >= 0),
  prazo text,
  ativo boolean not null default true,
  created_at timestamptz not null default now()
);
create unique index if not exists delivery_zones_unica
  on public.delivery_zones (lower(cidade), lower(coalesce(bairro, '')));

-- Pedidos ---------------------------------------------------------------
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  codigo text not null unique,
  token_acompanhamento uuid not null default gen_random_uuid(),
  nome text not null,
  email text not null,
  whatsapp text not null,
  cpf text,
  tipo_entrega public.tipo_entrega not null,
  -- { cep, rua, numero, complemento, bairro, cidade, uf }
  endereco jsonb,
  forma_pagamento public.forma_pagamento not null default 'pix',
  subtotal numeric(10,2) not null,
  frete numeric(10,2) not null default 0,
  total numeric(10,2) not null,
  status public.status_pedido not null default 'aguardando_pagamento',
  mp_preference_id text,
  mp_payment_id text,
  reserva_expira_em timestamptz,
  -- true enquanto as unidades estão em estoque_reservado
  reserva_ativa boolean not null default true,
  -- true depois que as unidades foram baixadas do estoque (pagamento aprovado)
  estoque_baixado boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists orders_status_idx on public.orders(status);
create index if not exists orders_created_idx on public.orders(created_at desc);
create index if not exists orders_expira_idx on public.orders(reserva_expira_em) where reserva_ativa;

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  variant_id uuid references public.product_variants(id) on delete set null,
  nome_snapshot text not null,
  preco_unitario numeric(10,2) not null,
  quantidade integer not null check (quantidade > 0)
);
create index if not exists order_items_order_idx on public.order_items(order_id);

create table if not exists public.order_status_history (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  status public.status_pedido not null,
  observacao text,
  created_at timestamptz not null default now()
);
create index if not exists order_status_history_order_idx on public.order_status_history(order_id, created_at);

-- Administradores -------------------------------------------------------
create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- updated_at automático em orders
create or replace function public.tocar_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists orders_updated_at on public.orders;
create trigger orders_updated_at before update on public.orders
  for each row execute function public.tocar_updated_at();
