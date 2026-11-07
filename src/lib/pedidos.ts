// Operações de pedido no SERVIDOR (service_role).
import { revalidatePath } from "next/cache";
import type { DadosPedidoEmail } from "./notificacoes/email";
import { supabaseServico } from "./supabase/server";
import type { OrderStatus } from "./types";

export interface PedidoCompleto extends DadosPedidoEmail {
  id: string;
  status: OrderStatus;
  cpf: string | null;
  subtotal: number;
  mpPaymentId: string | null;
  criadoEm: string;
}

export async function carregarPedido(id: string): Promise<PedidoCompleto | null> {
  const { data } = await supabaseServico()
    .from("orders")
    .select("*, order_items ( nome_snapshot, quantidade, preco_unitario )")
    .eq("id", id)
    .maybeSingle();
  if (!data) return null;
  return {
    id: data.id,
    codigo: data.codigo,
    token: data.token_acompanhamento,
    nome: data.nome,
    email: data.email,
    whatsapp: data.whatsapp,
    cpf: data.cpf,
    tipoEntrega: data.tipo_entrega,
    endereco: data.endereco,
    formaPagamento: data.forma_pagamento,
    status: data.status,
    subtotal: Number(data.subtotal),
    frete: Number(data.frete),
    total: Number(data.total),
    mpPaymentId: data.mp_payment_id,
    criadoEm: data.created_at,
    itens: (data.order_items ?? []).map((i: { nome_snapshot: string; quantidade: number; preco_unitario: number | string }) => ({
      nome: i.nome_snapshot,
      quantidade: i.quantidade,
      precoUnitario: Number(i.preco_unitario),
    })),
  };
}

/** Estoque mudou: atualiza as páginas da loja na hora (sem esperar os 60 s). */
export function atualizarVitrine() {
  try {
    revalidatePath("/", "layout");
  } catch (e) {
    console.warn("[revalidate]", e);
  }
}
