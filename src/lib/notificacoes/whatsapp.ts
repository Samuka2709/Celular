// WhatsApp, versão simples: gera links wa.me com a mensagem pronta.
// Para automatizar com a API oficial (WhatsApp Cloud), troque só o corpo de sendWhatsApp.
import { formatBRL } from "../format";
import { tituloStatus } from "../produto";
import { SITE } from "../site";
import type { OrderStatus } from "../types";

/** "73988887777" -> "5573988887777" */
export function numeroInternacional(whatsapp: string) {
  const d = whatsapp.replace(/\D/g, "");
  return d.startsWith("55") && d.length >= 12 ? d : `55${d}`;
}

export function linkWhatsapp(numero: string, texto: string) {
  return `https://wa.me/${numeroInternacional(numero)}?text=${encodeURIComponent(texto)}`;
}

export function linkAcompanhamento(codigo: string, token: string) {
  return `${SITE.url}/pedido/${codigo}?t=${token}`;
}

/** Texto enviado ao cliente para cada status do pedido. */
export function mensagemStatus(p: {
  nome: string;
  codigo: string;
  token: string;
  status: OrderStatus;
  total?: number;
  tipoEntrega: "retirada" | "entrega";
}) {
  const primeiro = p.nome.split(" ")[0];
  const link = linkAcompanhamento(p.codigo, p.token);
  const corpo: Partial<Record<OrderStatus, string>> = {
    aguardando_pagamento: `recebemos seu pedido ${p.codigo} e estamos aguardando o pagamento.`,
    pago: `o pagamento do pedido ${p.codigo}${p.total ? ` (${formatBRL(p.total)})` : ""} foi aprovado. Já vamos separar seus itens.`,
    separando: `estamos separando os itens do pedido ${p.codigo}.`,
    enviado: `o pedido ${p.codigo} saiu para entrega.`,
    pronto_retirada: `o pedido ${p.codigo} está pronto para retirada na loja (${SITE.endereco}, ${SITE.horario}).`,
    entregue: `o pedido ${p.codigo} foi ${p.tipoEntrega === "retirada" ? "retirado" : "entregue"}. Obrigado pela compra!`,
    cancelado: `o pedido ${p.codigo} foi cancelado. Se tiver dúvidas, é só responder esta mensagem.`,
    expirado: `o prazo de pagamento do pedido ${p.codigo} terminou e a reserva foi liberada.`,
  };
  return `Olá, ${primeiro}! Aqui é da ${SITE.nome}: ${corpo[p.status] ?? `status do pedido ${p.codigo}: ${tituloStatus(p.status)}.`}\n\nAcompanhe: ${link}`;
}

/**
 * Envia uma mensagem de WhatsApp.
 * Hoje: só devolve o link wa.me (alguém da loja clica e envia).
 * Futuro: chamar a API do WhatsApp Cloud aqui (POST /{phone-number-id}/messages) e devolver { enviado: true }.
 */
export async function sendWhatsApp(para: string, texto: string): Promise<{ enviado: boolean; link: string }> {
  return { enviado: false, link: linkWhatsapp(para, texto) };
}
