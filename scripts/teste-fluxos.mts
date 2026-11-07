// Testa no banco real: pagamento recusado, reserva expirada, cancelamento com estorno e esgotado.
// Uso: node --env-file=.env.local --experimental-strip-types scripts/teste-fluxos.mts
// Cria pedidos com e-mail teste-automatico@exemplo.com e apaga todos no final.
import { createClient } from "@supabase/supabase-js";

const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!, {
  auth: { persistSession: false },
});
const EMAIL = "teste-automatico@exemplo.com";
let falhas = 0;
const ok = (cond: boolean, msg: string) => {
  console.log(`${cond ? "OK  " : "FALHOU"} ${msg}`);
  if (!cond) falhas++;
};

async function variante(id: string) {
  const { data, error } = await db.from("product_variants").select("estoque, estoque_reservado").eq("id", id).single();
  if (error) throw error;
  return data;
}
async function criar(variantId: string, qtd = 1) {
  return db.rpc("criar_pedido", {
    p_pedido: { nome: "Teste Automático", email: EMAIL, whatsapp: "73999999999", tipo_entrega: "retirada", forma_pagamento: "cartao_boleto", frete: 0 },
    p_itens: [{ variant_id: variantId, quantidade: qtd }],
  });
}
async function status(id: string) {
  const { data } = await db.from("orders").select("status, reserva_ativa, estoque_baixado").eq("id", id).single();
  return data!;
}

const { data: vs } = await db.from("product_variants").select("id, estoque, estoque_reservado").gte("estoque", 2).limit(1);
const v = vs![0];
const inicio = await variante(v.id);
console.log(`Variação de teste ${v.id}: estoque ${inicio.estoque}, reservado ${inicio.estoque_reservado}\n`);

try {
  // 1. Pagamento recusado (o webhook chama liberar_reserva com "cancelado")
  const a = await criar(v.id);
  ok(!a.error, "recusado: pedido criado");
  ok((await variante(v.id)).estoque_reservado === inicio.estoque_reservado + 1, "recusado: 1 unidade reservada");
  const l1 = await db.rpc("liberar_reserva", { p_order_id: a.data.id, p_status: "cancelado", p_obs: "Teste: recusado" });
  const l2 = await db.rpc("liberar_reserva", { p_order_id: a.data.id, p_status: "cancelado", p_obs: "Teste: repetido" });
  ok(l1.data === true && l2.data === false, "recusado: libera uma vez só (aviso repetido não mexe)");
  const va = await variante(v.id);
  ok(va.estoque_reservado === inicio.estoque_reservado && va.estoque === inicio.estoque, "recusado: reserva devolvida, estoque intacto");
  ok((await status(a.data.id)).status === "cancelado", "recusado: status cancelado");

  // 2. Pix não pago: reserva vence e o pg_cron chama expirar_reservas
  const b = await criar(v.id);
  await db.from("orders").update({ reserva_expira_em: new Date(Date.now() - 60_000).toISOString() }).eq("id", b.data.id);
  const e = await db.rpc("expirar_reservas");
  ok((e.data ?? 0) >= 1, `expirado: expirar_reservas liberou ${e.data} pedido(s)`);
  ok((await status(b.data.id)).status === "expirado", "expirado: status expirado");
  ok((await variante(v.id)).estoque_reservado === inicio.estoque_reservado, "expirado: reserva devolvida");

  // 3. Pago e depois cancelado pela loja: volta ao estoque
  const c = await criar(v.id);
  const pg = await db.rpc("confirmar_pagamento", { p_order_id: c.data.id, p_payment_id: "teste-123" });
  await db.rpc("confirmar_pagamento", { p_order_id: c.data.id, p_payment_id: "teste-123" });
  const vc = await variante(v.id);
  ok(!pg.error && vc.estoque === inicio.estoque - 1, "pago: estoque baixou 1 (aviso repetido não baixa de novo)");
  ok(vc.estoque_reservado === inicio.estoque_reservado, "pago: reserva convertida em baixa");
  const cancel = await db.rpc("mudar_status", { p_order_id: c.data.id, p_status: "cancelado", p_obs: "Teste: cancelado" });
  const vc2 = await variante(v.id);
  ok(!cancel.error && vc2.estoque === inicio.estoque, "cancelado: unidade voltou ao estoque");
  ok((await status(c.data.id)).status === "cancelado", "cancelado: status cancelado");

  // 4. Esgotado: pedir mais do que existe
  const d = await criar(v.id, Math.min(10, inicio.estoque - inicio.estoque_reservado + 1));
  const disponivel = inicio.estoque - inicio.estoque_reservado;
  if (disponivel < 10) ok(!!d.error && d.error.message.includes("ESGOTADO"), "esgotado: pedido recusado com ESGOTADO");
  else console.log("--   esgotado: pulado (variação tem 10+ disponíveis)");
  if (d.data?.id) await db.rpc("liberar_reserva", { p_order_id: d.data.id, p_status: "cancelado" });
} finally {
  const { data: ped } = await db.from("orders").select("id").eq("email", EMAIL);
  const ids = (ped ?? []).map((p) => p.id);
  if (ids.length) {
    await db.from("order_status_history").delete().in("order_id", ids);
    await db.from("order_items").delete().in("order_id", ids);
    await db.from("orders").delete().in("id", ids);
  }
  const fim = await variante(v.id);
  ok(fim.estoque === inicio.estoque && fim.estoque_reservado === inicio.estoque_reservado, `limpeza: ${ids.length} pedidos de teste apagados, estoque igual ao início`);
  console.log(falhas ? `\n${falhas} falha(s)` : "\nTudo certo");
}
