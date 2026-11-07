import { createHmac, timingSafeEqual } from "node:crypto";
import { MercadoPagoConfig, Payment, Preference } from "mercadopago";
import { env } from "./env";
import { SITE } from "./site";

function cliente() {
  return new MercadoPagoConfig({ accessToken: env.mpAccessToken, options: { timeout: 10_000 } });
}

export interface PedidoCriado {
  id: string;
  codigo: string;
  token: string;
  frete: number;
  total: number;
  reserva_expira_em: string;
  itens: { variant_id: string; titulo: string; quantidade: number; preco_unitario: number }[];
}

/** Cria a preferência do Checkout Pro com os preços que vieram do banco. */
export async function criarPreferencia(
  pedido: PedidoCriado,
  comprador: { nome: string; email: string },
  formaPagamento: "pix" | "cartao_boleto",
) {
  const base = SITE.url;
  const retorno = (pagina: string) => `${base}/pedido/${pagina}?pedido=${pedido.codigo}&t=${pedido.token}`;
  const [primeiroNome, ...resto] = comprador.nome.split(" ");

  const items = pedido.itens.map((i) => ({
    id: i.variant_id,
    title: i.titulo.slice(0, 250),
    quantity: i.quantidade,
    unit_price: Number(i.preco_unitario),
    currency_id: "BRL",
  }));
  if (pedido.frete > 0) {
    items.push({ id: "frete", title: "Entrega", quantity: 1, unit_price: Number(pedido.frete), currency_id: "BRL" });
  }

  const pref = await new Preference(cliente()).create({
    body: {
      items,
      payer: { name: primeiroNome, surname: resto.join(" "), email: comprador.email },
      external_reference: pedido.id,
      statement_descriptor: SITE.nome.slice(0, 13),
      back_urls: {
        success: retorno("sucesso"),
        pending: retorno("pendente"),
        failure: retorno("falha"),
      },
      auto_return: "approved",
      notification_url: `${base}/api/webhooks/mercadopago`,
      // A preferência expira junto com a reserva de 30 minutos
      expires: true,
      expiration_date_from: new Date().toISOString(),
      expiration_date_to: pedido.reserva_expira_em,
      date_of_expiration: pedido.reserva_expira_em,
      payment_methods:
        formaPagamento === "pix"
          ? {
              // Preço Pix: só aceita Pix
              excluded_payment_types: [{ id: "credit_card" }, { id: "debit_card" }, { id: "ticket" }, { id: "atm" }],
              installments: 1,
            }
          : {
              excluded_payment_types: [{ id: "bank_transfer" }],
              installments: SITE.parcelasSemJuros,
            },
      metadata: { codigo: pedido.codigo },
    },
  });

  if (!pref.init_point || !pref.id) throw new Error("Mercado Pago não retornou o link de pagamento");
  return { id: pref.id, url: pref.init_point };
}

export async function buscarPagamento(id: string) {
  return new Payment(cliente()).get({ id });
}

/**
 * Valida o header x-signature do webhook.
 * Formato: "ts=1704908010,v1=hash". O hash é HMAC-SHA256 do texto
 * "id:<data.id>;request-id:<x-request-id>;ts:<ts>;" com o segredo do webhook.
 */
export function assinaturaValida(params: {
  xSignature: string | null;
  xRequestId: string | null;
  dataId: string | null;
}): boolean {
  if (!env.mpWebhookSecret || !params.xSignature) return false;
  const partes = Object.fromEntries(
    params.xSignature.split(",").map((p) => {
      const [k, ...v] = p.trim().split("=");
      return [k, v.join("=")];
    }),
  );
  const ts = partes.ts;
  const v1 = partes.v1;
  if (!ts || !v1) return false;

  // Rejeita avisos muito antigos (mais de 10 minutos), contra repetição
  const tsMs = Number(ts) < 1e12 ? Number(ts) * 1000 : Number(ts);
  if (!Number.isFinite(tsMs) || Math.abs(Date.now() - tsMs) > 10 * 60_000) return false;

  let manifesto = "";
  if (params.dataId) manifesto += `id:${/^[a-z0-9]+$/i.test(params.dataId) ? params.dataId.toLowerCase() : params.dataId};`;
  if (params.xRequestId) manifesto += `request-id:${params.xRequestId};`;
  manifesto += `ts:${ts};`;

  const esperado = createHmac("sha256", env.mpWebhookSecret).update(manifesto).digest("hex");
  const a = Buffer.from(esperado, "hex");
  const b = Buffer.from(v1, "hex");
  return a.length === b.length && timingSafeEqual(a, b);
}
