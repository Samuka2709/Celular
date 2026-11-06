// Tipos espelham as tabelas planejadas para o Supabase (products, product_variants,
// product_images, orders). Ao ligar o backend, basta mapear as linhas para estes tipos.

export type Categoria = "celular" | "acessorio";
export type Condicao = "novo" | "seminovo";

/** Estilo do desenho gerado para as imagens de exemplo (some quando houver fotos reais). */
export type ModeloVisual =
  | "lentes-quadrado"
  | "lentes-coluna"
  | "lentes-circulo"
  | "lentes-barra"
  | "capa"
  | "carregador"
  | "fone"
  | "cabo"
  | "pelicula"
  | "powerbank";

export interface ProductVariant {
  id: string;
  cor: string;
  corHex: string;
  armazenamento: string | null;
  preco: number;
  precoAntigo: number | null;
  precoPix: number;
  /** Já descontado o estoque reservado: disponível = estoque - estoque_reservado */
  estoque: number;
  sku: string;
}

export interface ProductImage {
  url: string;
  alt: string;
  /** Cor da variação a que a foto pertence (null = vale para todas) */
  cor: string | null;
  ordem: number;
}

export interface DetalhesSeminovo {
  saudeBateria: number;
  estado: string;
  acompanha: string[];
  garantia: string;
}

export interface Product {
  id: string;
  slug: string;
  nome: string;
  marca: string;
  categoria: Categoria;
  condicao: Condicao;
  descricao: string;
  fichaTecnica: Record<string, string>;
  detalhesSeminovo: DetalhesSeminovo | null;
  destaque: boolean;
  /** Usado para "Mais vendidos" */
  vendas: number;
  createdAt: string;
  modeloVisual: ModeloVisual;
  variants: ProductVariant[];
  images: ProductImage[];
}

export type OrderStatus =
  | "aguardando_pagamento"
  | "pago"
  | "separando"
  | "enviado"
  | "pronto_retirada"
  | "entregue"
  | "cancelado"
  | "expirado";

export interface OrderTimelineStep {
  key: string;
  titulo: string;
  descricao?: string;
  data: string | null;
}

export interface OrderPublic {
  codigo: string;
  status: OrderStatus;
  tipoEntrega: "retirada" | "entrega";
  criadoEm: string;
  total: number;
  itens: { nome: string; variacao: string; quantidade: number; precoUnitario: number }[];
  bairroCidade: string | null;
  historico: { status: OrderStatus; data: string }[];
}
