// Utilidades de produto e pedido sem acesso a dados (podem rodar no navegador).
import type { OrderStatus, Product, ProductVariant } from "./types";

export function estoqueTotal(p: Product): number {
  return p.variants.reduce((s, v) => s + v.estoque, 0);
}

/** Variação exibida no card: a mais barata disponível, ou a mais barata de todas. */
export function variantePadrao(p: Product): ProductVariant {
  const ordenadas = [...p.variants].sort((a, b) => a.preco - b.preco);
  return ordenadas.find((v) => v.estoque > 0) ?? ordenadas[0];
}

export function imagemDaCor(p: Product, cor: string | null) {
  return (
    p.images.find((i) => i.cor === cor && i.ordem === 0) ??
    p.images.find((i) => i.cor === cor) ??
    p.images.find((i) => i.cor === null) ??
    p.images[0] ?? { url: "/produtos/sem-foto.webp", alt: p.nome, cor: null, ordem: 0 }
  );
}

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

export const STATUS_PEDIDO = Object.keys(STATUS_TITULOS) as OrderStatus[];
