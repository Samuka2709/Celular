// Leitura de dados do SERVIDOR. Com o Supabase configurado, lê do banco;
// sem ele, usa os dados de exemplo (modo demonstração).
import { PRODUCTS } from "./data/products";
import { supabaseConfigurado, supabaseServidorConfigurado } from "./env";
import { supabasePublico, supabaseServico } from "./supabase/server";
import type { ModeloVisual, OrderPublic, OrderStatus, Product } from "./types";

export { estoqueTotal, imagemDaCor, tituloStatus, variantePadrao } from "./produto";

const SELECT_PRODUTO = `
  id, slug, nome, marca, categoria, condicao, descricao, ficha_tecnica, detalhes_seminovo,
  destaque, vendas, modelo_visual, created_at,
  product_variants ( id, cor, cor_hex, armazenamento, preco, preco_antigo, preco_pix, estoque, estoque_reservado, sku, ordem ),
  product_images ( url, cor, alt, ordem )
`;

type Num = number | string | null;
export interface ProdutoRow {
  id: string;
  slug: string;
  nome: string;
  marca: string;
  categoria: Product["categoria"];
  condicao: Product["condicao"];
  descricao: string;
  ficha_tecnica: Record<string, string> | null;
  detalhes_seminovo: { saude_bateria?: number; estado?: string; acompanha?: string[]; garantia?: string } | null;
  destaque: boolean;
  vendas: number;
  modelo_visual: string | null;
  created_at: string;
  product_variants: {
    id: string;
    cor: string;
    cor_hex: string;
    armazenamento: string | null;
    preco: Num;
    preco_antigo: Num;
    preco_pix: Num;
    estoque: number;
    estoque_reservado: number;
    sku: string | null;
    ordem: number;
  }[];
  product_images: { url: string; cor: string | null; alt: string | null; ordem: number }[];
}

export function mapearProduto(r: ProdutoRow): Product {
  const n = (v: Num) => (v === null ? null : Number(v));
  return {
    id: r.id,
    slug: r.slug,
    nome: r.nome,
    marca: r.marca,
    categoria: r.categoria,
    condicao: r.condicao,
    descricao: r.descricao,
    fichaTecnica: r.ficha_tecnica ?? {},
    detalhesSeminovo: r.detalhes_seminovo
      ? {
          saudeBateria: Number(r.detalhes_seminovo.saude_bateria ?? 0),
          estado: r.detalhes_seminovo.estado ?? "",
          acompanha: r.detalhes_seminovo.acompanha ?? [],
          garantia: r.detalhes_seminovo.garantia ?? "",
        }
      : null,
    destaque: r.destaque,
    vendas: r.vendas,
    createdAt: r.created_at,
    modeloVisual: (r.modelo_visual ?? "lentes-quadrado") as ModeloVisual,
    variants: [...r.product_variants]
      .sort((a, b) => a.ordem - b.ordem)
      .map((v) => ({
        id: v.id,
        cor: v.cor,
        corHex: v.cor_hex,
        armazenamento: v.armazenamento,
        preco: n(v.preco)!,
        precoAntigo: n(v.preco_antigo),
        precoPix: n(v.preco_pix)!,
        // O site mostra só o que está livre para venda
        estoque: Math.max(0, v.estoque - v.estoque_reservado),
        sku: v.sku ?? "",
      })),
    images: [...r.product_images]
      .sort((a, b) => a.ordem - b.ordem)
      .map((i, idx) => ({
        url: i.url,
        alt: i.alt ?? `${r.nome}${i.cor ? ` na cor ${i.cor}` : ""}`,
        cor: i.cor,
        ordem: i.ordem ?? idx,
      })),
  };
}

export async function getProducts(): Promise<Product[]> {
  if (!supabaseConfigurado()) return PRODUCTS;
  const { data, error } = await supabasePublico()
    .from("products")
    .select(SELECT_PRODUTO)
    .eq("ativo", true)
    .order("vendas", { ascending: false });
  if (error) throw new Error(`Erro ao carregar produtos: ${error.message}`);
  return (data as unknown as ProdutoRow[]).filter((r) => r.product_variants.length > 0).map(mapearProduto);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (!supabaseConfigurado()) return PRODUCTS.find((p) => p.slug === slug) ?? null;
  const { data, error } = await supabasePublico()
    .from("products")
    .select(SELECT_PRODUTO)
    .eq("slug", slug)
    .eq("ativo", true)
    .maybeSingle();
  if (error) throw new Error(`Erro ao carregar produto: ${error.message}`);
  const row = data as unknown as ProdutoRow | null;
  return row && row.product_variants.length ? mapearProduto(row) : null;
}

export async function getBrands(): Promise<{ marca: string; total: number }[]> {
  const mapa = new Map<string, number>();
  for (const p of await getProducts()) {
    if (p.categoria !== "celular") continue;
    mapa.set(p.marca, (mapa.get(p.marca) ?? 0) + 1);
  }
  return [...mapa.entries()].map(([marca, total]) => ({ marca, total }));
}

export async function getRelated(product: Product, limite = 4): Promise<Product[]> {
  return (await getProducts())
    .filter((p) => p.id !== product.id && p.categoria === product.categoria)
    .sort((a, b) => Number(b.marca === product.marca) - Number(a.marca === product.marca) || b.vendas - a.vendas)
    .slice(0, limite);
}

// ---------- Acompanhamento do pedido ----------

/**
 * Busca o pedido pelo código + token do link enviado por e-mail.
 * Só devolve o necessário: sem CPF, sem e-mail, endereço apenas parcial.
 */
export async function getOrderByCode(codigo: string, token?: string): Promise<OrderPublic | null> {
  if (!/^PED-[A-Z0-9]{5}$/i.test(codigo)) return null;
  if (!supabaseServidorConfigurado()) return pedidoDemonstracao(codigo);
  if (!token || !/^[0-9a-f-]{36}$/i.test(token)) return null;

  const { data, error } = await supabaseServico()
    .from("orders")
    .select(
      "codigo, status, tipo_entrega, created_at, total, endereco, order_items ( nome_snapshot, quantidade, preco_unitario ), order_status_history ( status, created_at )",
    )
    .eq("codigo", codigo.toUpperCase())
    .eq("token_acompanhamento", token)
    .maybeSingle();
  if (error || !data) return null;

  const end = data.endereco as { bairro?: string; cidade?: string } | null;
  return {
    codigo: data.codigo,
    status: data.status as OrderStatus,
    tipoEntrega: data.tipo_entrega,
    criadoEm: data.created_at,
    total: Number(data.total),
    itens: (data.order_items ?? []).map((i) => ({
      nome: i.nome_snapshot,
      variacao: "",
      quantidade: i.quantidade,
      precoUnitario: Number(i.preco_unitario),
    })),
    bairroCidade: end ? [end.bairro, end.cidade].filter(Boolean).join(", ") : null,
    historico: [...(data.order_status_history ?? [])]
      .sort((a, b) => a.created_at.localeCompare(b.created_at))
      .map((h) => ({ status: h.status as OrderStatus, data: h.created_at })),
  };
}

/** Pedido fictício usado no modo demonstração. */
function pedidoDemonstracao(codigo: string): OrderPublic {
  const agora = Date.now();
  const h = (horas: number) => new Date(agora - horas * 3600_000).toISOString();
  const entrega = codigo.toUpperCase().charCodeAt(4) % 2 === 0;
  return {
    codigo: codigo.toUpperCase(),
    status: "separando",
    tipoEntrega: entrega ? "entrega" : "retirada",
    criadoEm: h(5),
    total: 4786.96,
    itens: [
      { nome: "iPhone 15 Preto 128 GB", variacao: "", quantidade: 1, precoUnitario: 4749.05 },
      { nome: "Película de vidro 3D Transparente", variacao: "", quantidade: 1, precoUnitario: 37.91 },
    ],
    bairroCidade: entrega ? "Pontal, Ilhéus" : null,
    historico: [
      { status: "aguardando_pagamento", data: h(5) },
      { status: "pago", data: h(4.8) },
      { status: "separando", data: h(1) },
    ],
  };
}
