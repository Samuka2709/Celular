// Serviço de dados. Hoje lê os dados de exemplo; no backend, troque o corpo
// destas funções por consultas ao Supabase mantendo as mesmas assinaturas.
import { PRODUCTS } from "./data/products";
import type { OrderPublic, OrderStatus, Product, ProductVariant } from "./types";

export async function getProducts(): Promise<Product[]> {
  return PRODUCTS;
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  return PRODUCTS.find((p) => p.slug === slug) ?? null;
}

export async function getBrands(): Promise<{ marca: string; total: number }[]> {
  const mapa = new Map<string, number>();
  for (const p of PRODUCTS) {
    if (p.categoria !== "celular") continue;
    mapa.set(p.marca, (mapa.get(p.marca) ?? 0) + 1);
  }
  return [...mapa.entries()].map(([marca, total]) => ({ marca, total }));
}

export async function getRelated(product: Product, limite = 4): Promise<Product[]> {
  return PRODUCTS.filter((p) => p.id !== product.id && p.categoria === product.categoria)
    .sort((a, b) => Number(b.marca === product.marca) - Number(a.marca === product.marca) || b.vendas - a.vendas)
    .slice(0, limite);
}

// ---------- Utilidades de produto (puras, usadas no cliente também) ----------

export function estoqueTotal(p: Product): number {
  return p.variants.reduce((s, v) => s + v.estoque, 0);
}

/** Variação exibida no card: a mais barata disponível, ou a mais barata de todas. */
export function variantePadrao(p: Product): ProductVariant {
  const ordenadas = [...p.variants].sort((a, b) => a.preco - b.preco);
  return ordenadas.find((v) => v.estoque > 0) ?? ordenadas[0];
}

export function imagemDaCor(p: Product, cor: string | null) {
  return p.images.find((i) => i.cor === cor && i.ordem === 0) ?? p.images[0];
}

// ---------- Pedido (mock) ----------

const STATUS_TITULOS: Record<OrderStatus, string> = {
  aguardando_pagamento: "Aguardando pagamento",
  pago: "Pagamento aprovado",
  separando: "Separando",
  enviado: "Saiu para entrega",
  pronto_retirada: "Pronto para retirada",
  entregue: "Entregue",
  cancelado: "Cancelado",
  expirado: "Expirado",
};

export function tituloStatus(s: OrderStatus) {
  return STATUS_TITULOS[s];
}

/** Pedido de exemplo para a página de acompanhamento. */
export async function getOrderByCode(codigo: string): Promise<OrderPublic | null> {
  if (!/^PED-[A-Z0-9]{5}$/i.test(codigo)) return null;
  const agora = Date.now();
  const h = (horas: number) => new Date(agora - horas * 3600_000).toISOString();
  const entrega = codigo.toUpperCase().charCodeAt(4) % 2 === 0;
  return {
    codigo: codigo.toUpperCase(),
    status: "separando",
    tipoEntrega: entrega ? "entrega" : "retirada",
    criadoEm: h(5),
    total: 4778.05,
    itens: [
      { nome: "iPhone 15", variacao: "Preto, 128 GB", quantidade: 1, precoUnitario: 4749.05 },
      { nome: "Película de vidro 3D", variacao: "Transparente", quantidade: 1, precoUnitario: 37.91 },
    ],
    bairroCidade: entrega ? "Pontal, Ilhéus" : null,
    historico: [
      { status: "aguardando_pagamento", data: h(5) },
      { status: "pago", data: h(4.8) },
      { status: "separando", data: h(1) },
    ],
  };
}

export function gerarCodigoPedido(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 5; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return `PED-${s}`;
}

/** Frete isolado para trocar depois (tabela por bairro/cidade ou Melhor Envio). */
export function calcularFrete(tipo: "retirada" | "entrega", cidade?: string): number | null {
  if (tipo === "retirada") return 0;
  if (!cidade) return null;
  const c = cidade.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
  if (c === "ilheus") return 12;
  if (["itabuna", "uruçuca", "urucuca", "itacare", "una", "canavieiras"].includes(c)) return 25;
  return 35;
}
