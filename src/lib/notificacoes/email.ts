// E-mails transacionais com Resend. Templates simples e sóbrios, sem emojis.
import { Resend } from "resend";
import { emailConfigurado, env } from "../env";
import { formatBRL } from "../format";
import { SITE } from "../site";
import type { OrderStatus } from "../types";
import { linkAcompanhamento, linkWhatsapp, mensagemStatus } from "./whatsapp";

export interface DadosPedidoEmail {
  codigo: string;
  token: string;
  nome: string;
  email: string;
  whatsapp: string;
  tipoEntrega: "retirada" | "entrega";
  endereco?: { rua?: string; numero?: string; bairro?: string; cidade?: string } | null;
  itens: { nome: string; quantidade: number; precoUnitario: number }[];
  frete: number;
  total: number;
  formaPagamento?: "pix" | "cartao_boleto";
}

const esc = (t: string) =>
  t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function layout(titulo: string, conteudo: string) {
  return `<!doctype html><html lang="pt-BR"><body style="margin:0;background:#f4f4f5;font-family:Arial,Helvetica,sans-serif;color:#18181b">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:24px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:12px;overflow:hidden">
<tr><td style="background:#0b0b0d;padding:20px 24px;color:#ffffff;font-size:18px;font-weight:bold">${esc(SITE.nome)}</td></tr>
<tr><td style="height:4px;background:#ff6a00"></td></tr>
<tr><td style="padding:28px 24px">
<h1 style="margin:0 0 16px;font-size:22px;line-height:1.3">${esc(titulo)}</h1>
${conteudo}
</td></tr>
<tr><td style="padding:16px 24px;background:#fafafa;color:#71717a;font-size:12px;line-height:1.5">
${esc(SITE.nome)} · ${esc(SITE.endereco)}<br>WhatsApp ${esc(SITE.whatsappExibicao)} · ${esc(SITE.email)}
</td></tr></table></td></tr></table></body></html>`;
}

function tabelaItens(p: DadosPedidoEmail) {
  const linhas = p.itens
    .map(
      (i) =>
        `<tr><td style="padding:8px 0;border-bottom:1px solid #e4e4e7">${i.quantidade}x ${esc(i.nome)}</td><td align="right" style="padding:8px 0;border-bottom:1px solid #e4e4e7;white-space:nowrap">${formatBRL(i.precoUnitario * i.quantidade)}</td></tr>`,
    )
    .join("");
  const frete =
    p.frete > 0
      ? `<tr><td style="padding:8px 0">Entrega</td><td align="right" style="padding:8px 0">${formatBRL(p.frete)}</td></tr>`
      : "";
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;margin:16px 0">${linhas}${frete}
<tr><td style="padding:12px 0 0;font-weight:bold">Total</td><td align="right" style="padding:12px 0 0;font-weight:bold">${formatBRL(p.total)}</td></tr></table>`;
}

function botao(href: string, texto: string) {
  return `<p style="margin:24px 0"><a href="${href}" style="display:inline-block;background:#ff6a00;color:#0b0b0d;text-decoration:none;font-weight:bold;padding:12px 20px;border-radius:8px">${esc(texto)}</a></p>`;
}

function recebimento(p: DadosPedidoEmail) {
  if (p.tipoEntrega === "retirada") {
    return `<p style="font-size:14px;line-height:1.6;color:#3f3f46"><strong>Retirada na loja:</strong> ${esc(SITE.endereco)}. ${esc(SITE.horario)}.</p>`;
  }
  const e = p.endereco ?? {};
  return `<p style="font-size:14px;line-height:1.6;color:#3f3f46"><strong>Entrega:</strong> ${esc([e.rua, e.numero].filter(Boolean).join(", "))}${e.bairro ? `, ${esc(e.bairro)}` : ""}${e.cidade ? `, ${esc(e.cidade)}` : ""}.</p>`;
}

async function enviar(para: string, assunto: string, html: string) {
  if (!emailConfigurado()) {
    console.info(`[email] RESEND_API_KEY ausente. Não enviado: "${assunto}" para ${para}`);
    return;
  }
  const resend = new Resend(env.resendApiKey);
  const from = env.emailRemetente || `${SITE.nome} <onboarding@resend.dev>`;
  const { error } = await resend.emails.send({ from, to: para, subject: assunto, html });
  if (error) console.error(`[email] Falha ao enviar "${assunto}":`, error.message);
}

/** E-mail 1: pedido recebido, aguardando pagamento */
export async function emailPedidoRecebido(p: DadosPedidoEmail) {
  const link = linkAcompanhamento(p.codigo, p.token);
  const pix = p.formaPagamento === "pix";
  await enviar(
    p.email,
    `Pedido ${p.codigo} recebido`,
    layout(
      `Recebemos seu pedido ${p.codigo}`,
      `<p style="font-size:15px;line-height:1.6">Olá, ${esc(p.nome.split(" ")[0])}. Seu pedido foi registrado e os itens ficam reservados por 30 minutos enquanto aguardamos o pagamento${pix ? " via Pix" : ""}.</p>
${tabelaItens(p)}${recebimento(p)}
<p style="font-size:14px;line-height:1.6;color:#3f3f46">Se o pagamento não for concluído em 30 minutos, a reserva é liberada automaticamente.</p>
${botao(link, "Acompanhar pedido")}`,
    ),
  );
}

/** E-mail 2: pagamento aprovado (cliente) + aviso para a loja com link wa.me pronto */
export async function emailPagamentoAprovado(p: DadosPedidoEmail) {
  const link = linkAcompanhamento(p.codigo, p.token);
  await enviar(
    p.email,
    `Pagamento aprovado: pedido ${p.codigo}`,
    layout(
      "Pagamento aprovado",
      `<p style="font-size:15px;line-height:1.6">Olá, ${esc(p.nome.split(" ")[0])}. O pagamento do pedido <strong>${p.codigo}</strong> foi aprovado. Já vamos separar seus itens.</p>
${tabelaItens(p)}${recebimento(p)}${botao(link, "Acompanhar pedido")}`,
    ),
  );

  if (env.lojaEmail) {
    const wa = linkWhatsapp(
      p.whatsapp,
      mensagemStatus({ nome: p.nome, codigo: p.codigo, token: p.token, status: "pago", total: p.total, tipoEntrega: p.tipoEntrega }),
    );
    await enviar(
      env.lojaEmail,
      `Novo pedido pago: ${p.codigo} (${formatBRL(p.total)})`,
      layout(
        `Pedido ${p.codigo} pago`,
        `<p style="font-size:15px;line-height:1.6"><strong>${esc(p.nome)}</strong><br>WhatsApp ${esc(p.whatsapp)} · ${esc(p.email)}</p>
${tabelaItens(p)}${recebimento(p)}
${botao(wa, "Avisar cliente no WhatsApp")}
<p style="font-size:13px;color:#71717a">O botão abre o WhatsApp com a mensagem pronta para o cliente.</p>
${botao(`${SITE.url}/admin/pedidos`, "Abrir no painel")}`,
      ),
    );
  }
}

const TITULOS_STATUS: Partial<Record<OrderStatus, { assunto: string; titulo: string; texto: string }>> = {
  separando: { assunto: "Estamos separando seu pedido", titulo: "Separando seu pedido", texto: "Estamos conferindo e embalando os itens do seu pedido." },
  enviado: { assunto: "Seu pedido saiu para entrega", titulo: "Saiu para entrega", texto: "Seu pedido está a caminho. Fique de olho no WhatsApp." },
  pronto_retirada: {
    assunto: "Seu pedido está pronto para retirada",
    titulo: "Pronto para retirada",
    texto: `Pode vir buscar na loja: ${SITE.endereco}. ${SITE.horario}. Leve um documento com foto.`,
  },
  entregue: { assunto: "Pedido entregue", titulo: "Pedido entregue", texto: "Seu pedido foi entregue. Obrigado pela compra! Qualquer dúvida, chame no WhatsApp." },
  cancelado: { assunto: "Pedido cancelado", titulo: "Pedido cancelado", texto: "Seu pedido foi cancelado. Se houve cobrança, o valor é estornado pelo Mercado Pago." },
};

/** E-mail 3: mudança de status feita no painel */
export async function emailMudancaStatus(p: Pick<DadosPedidoEmail, "codigo" | "token" | "nome" | "email">, status: OrderStatus) {
  const t = TITULOS_STATUS[status];
  if (!t) return;
  await enviar(
    p.email,
    `${t.assunto} (${p.codigo})`,
    layout(
      t.titulo,
      `<p style="font-size:15px;line-height:1.6">Olá, ${esc(p.nome.split(" ")[0])}. ${esc(t.texto)}</p>
<p style="font-size:14px;color:#3f3f46">Pedido <strong>${p.codigo}</strong></p>
${botao(linkAcompanhamento(p.codigo, p.token), "Acompanhar pedido")}`,
    ),
  );
}
