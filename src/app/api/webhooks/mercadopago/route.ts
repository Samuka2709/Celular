import { NextResponse } from "next/server";
import { mercadoPagoConfigurado, supabaseServidorConfigurado } from "@/lib/env";
import { assinaturaValida, buscarPagamento } from "@/lib/mercadopago";
import { emailMudancaStatus, emailPagamentoAprovado } from "@/lib/notificacoes/email";
import { atualizarVitrine, carregarPedido } from "@/lib/pedidos";
import { supabaseServico } from "@/lib/supabase/server";

export const runtime = "nodejs";

/**
 * Webhook do Mercado Pago.
 * 1. Valida a assinatura (x-signature) com MP_WEBHOOK_SECRET
 * 2. Ignora o corpo: busca o pagamento na API do Mercado Pago pelo id
 * 3. Atualiza o pedido; as funções SQL são idempotentes (aviso repetido não baixa estoque duas vezes)
 */
export async function POST(req: Request) {
  if (!supabaseServidorConfigurado() || !mercadoPagoConfigurado()) {
    return NextResponse.json({ ok: false, erro: "não configurado" }, { status: 503 });
  }

  const url = new URL(req.url);
  let corpo: { type?: string; topic?: string; action?: string; data?: { id?: string | number } } = {};
  try {
    corpo = await req.json();
  } catch {
    // alguns avisos antigos chegam sem corpo
  }

  const tipo = url.searchParams.get("type") ?? url.searchParams.get("topic") ?? corpo.type ?? corpo.topic;
  const dataId = url.searchParams.get("data.id") ?? url.searchParams.get("id") ?? (corpo.data?.id != null ? String(corpo.data.id) : null);

  if (
    !assinaturaValida({
      xSignature: req.headers.get("x-signature"),
      xRequestId: req.headers.get("x-request-id"),
      dataId,
    })
  ) {
    console.warn("[webhook] assinatura inválida", { tipo, dataId });
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  // Só nos interessam avisos de pagamento
  if (tipo !== "payment" || !dataId) return NextResponse.json({ ok: true, ignorado: true });

  let pagamento;
  try {
    pagamento = await buscarPagamento(dataId);
  } catch (e) {
    console.error("[webhook] erro ao buscar pagamento", dataId, e);
    // 500 faz o Mercado Pago tentar de novo mais tarde
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  const orderId = pagamento.external_reference;
  if (!orderId || !/^[0-9a-f-]{36}$/i.test(orderId)) return NextResponse.json({ ok: true, ignorado: true });

  const db = supabaseServico();
  const pagamentoId = String(pagamento.id);
  const status = pagamento.status;

  try {
    switch (status) {
      case "approved": {
        const { data: resultado, error } = await db.rpc("confirmar_pagamento", {
          p_order_id: orderId,
          p_payment_id: pagamentoId,
        });
        if (error) throw error;
        atualizarVitrine();
        if (resultado !== "ja_processado") {
          const pedido = await carregarPedido(orderId);
          if (pedido) await emailPagamentoAprovado(pedido).catch((e) => console.error("[webhook] e-mail", e));
        }
        break;
      }
      case "pending":
      case "in_process":
      case "authorized": {
        // Continua aguardando (ex.: Pix gerado, boleto emitido). Só registra o id.
        await db.from("orders").update({ mp_payment_id: pagamentoId }).eq("id", orderId).is("mp_payment_id", null);
        break;
      }
      case "rejected":
      case "cancelled": {
        const { data: liberou, error } = await db.rpc("liberar_reserva", {
          p_order_id: orderId,
          p_status: "cancelado",
          p_obs: status === "rejected" ? `Pagamento recusado (${pagamento.status_detail ?? "sem detalhe"}).` : "Pagamento cancelado.",
        });
        if (error) throw error;
        if (liberou) atualizarVitrine();
        break;
      }
      case "refunded":
      case "charged_back": {
        const { data: estornou, error } = await db.rpc("estornar_pedido", {
          p_order_id: orderId,
          p_obs: status === "refunded" ? "Pagamento reembolsado no Mercado Pago." : "Chargeback (contestação) no Mercado Pago.",
        });
        if (error) throw error;
        if (estornou) {
          atualizarVitrine();
          const pedido = await carregarPedido(orderId);
          if (pedido) await emailMudancaStatus(pedido, "cancelado").catch(() => {});
        }
        break;
      }
      default:
        console.info("[webhook] status ignorado", status);
    }
  } catch (e) {
    console.error("[webhook] erro ao atualizar pedido", orderId, e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
