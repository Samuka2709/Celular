import { NextResponse } from "next/server";
import { mercadoPagoConfigurado, supabaseServidorConfigurado } from "@/lib/env";
import { calcularFrete } from "@/lib/frete";
import { criarPreferencia, type PedidoCriado } from "@/lib/mercadopago";
import { emailPedidoRecebido } from "@/lib/notificacoes/email";
import { atualizarVitrine } from "@/lib/pedidos";
import { ipDaRequisicao, limitar } from "@/lib/rate-limit";
import { supabaseServico } from "@/lib/supabase/server";
import { checkoutSchema } from "@/lib/validacao";

export const runtime = "nodejs";

type Resposta =
  | { ok: true; redirect: string }
  | { ok: false; erro: string; campo?: string; esgotado?: boolean };

const json = (body: Resposta, status = 200) => NextResponse.json(body, { status });

export async function POST(req: Request) {
  // 1. Rate limit: 6 pedidos a cada 10 minutos por IP
  const limite = limitar(`checkout:${ipDaRequisicao(req)}`, 6, 10 * 60_000);
  if (!limite.ok) {
    return json({ ok: false, erro: `Muitas tentativas. Tente de novo em ${Math.ceil(limite.tentarEmSeg / 60)} min.` }, 429);
  }

  // 2. Validação (Zod). Preços enviados pelo navegador são ignorados.
  let corpo: unknown;
  try {
    corpo = await req.json();
  } catch {
    return json({ ok: false, erro: "Requisição inválida." }, 400);
  }
  const parsed = checkoutSchema.safeParse(corpo);
  if (!parsed.success) {
    const primeiro = parsed.error.issues[0];
    return json({ ok: false, erro: primeiro?.message ?? "Dados inválidos.", campo: primeiro?.path.join(".") }, 400);
  }
  const d = parsed.data;

  // 3. Frete calculado no servidor
  const frete = await calcularFrete({ tipo: d.tipoEntrega, cidade: d.endereco?.cidade, bairro: d.endereco?.bairro });
  if (!frete.ok) return json({ ok: false, erro: frete.erro, campo: "endereco.cidade" }, 400);

  // Modo demonstração: sem Supabase/Mercado Pago, só simula
  if (!supabaseServidorConfigurado() || !mercadoPagoConfigurado()) {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    const codigo = "PED-" + Array.from({ length: 5 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
    return json({ ok: true, redirect: `/pedido/sucesso?pedido=${codigo}&demo=1` });
  }

  // 4. Cria pedido + reserva de estoque numa transação (função SQL com FOR UPDATE)
  const db = supabaseServico();
  const { data, error } = await db.rpc("criar_pedido", {
    p_pedido: {
      nome: d.nome,
      email: d.email,
      whatsapp: d.whatsapp,
      cpf: d.cpf || null,
      tipo_entrega: d.tipoEntrega,
      endereco: d.tipoEntrega === "entrega" ? d.endereco : null,
      forma_pagamento: d.formaPagamento,
      frete: frete.taxa,
    },
    p_itens: d.itens.map((i) => ({ variant_id: i.variantId, quantidade: i.quantidade })),
  });

  if (error) {
    if (error.message === "ESGOTADO") {
      return json({ ok: false, erro: error.hint || "Este item acabou de esgotar.", esgotado: true }, 409);
    }
    if (error.message === "QUANTIDADE_INVALIDA" || error.message === "CARRINHO_VAZIO") {
      return json({ ok: false, erro: error.hint || "Carrinho inválido." }, 400);
    }
    if (error.code === "22P02") return json({ ok: false, erro: "Um item do carrinho não existe mais.", esgotado: true }, 409);
    console.error("[checkout] criar_pedido", error);
    return json({ ok: false, erro: "Não foi possível criar o pedido. Tente de novo." }, 500);
  }

  const pedido = data as PedidoCriado;
  atualizarVitrine();

  // 5. Preferência do Mercado Pago com os preços do banco
  try {
    const pref = await criarPreferencia(pedido, { nome: d.nome, email: d.email }, d.formaPagamento);
    await db.from("orders").update({ mp_preference_id: pref.id }).eq("id", pedido.id);

    await emailPedidoRecebido({
      codigo: pedido.codigo,
      token: pedido.token,
      nome: d.nome,
      email: d.email,
      whatsapp: d.whatsapp,
      tipoEntrega: d.tipoEntrega,
      endereco: d.endereco,
      formaPagamento: d.formaPagamento,
      itens: pedido.itens.map((i) => ({ nome: i.titulo, quantidade: i.quantidade, precoUnitario: Number(i.preco_unitario) })),
      frete: Number(pedido.frete),
      total: Number(pedido.total),
    }).catch((e) => console.error("[checkout] e-mail", e));

    return json({ ok: true, redirect: pref.url });
  } catch (e) {
    // Falhou no Mercado Pago: devolve a reserva para não travar o estoque
    console.error("[checkout] Mercado Pago", e);
    await db.rpc("liberar_reserva", {
      p_order_id: pedido.id,
      p_status: "cancelado",
      p_obs: "Falha ao criar o pagamento no Mercado Pago.",
    });
    atualizarVitrine();
    return json({ ok: false, erro: "O Mercado Pago não respondeu. Seu carrinho continua salvo, tente de novo em instantes." }, 502);
  }
}
