import { SITE } from "./site";

export function whatsappLink(mensagem: string): string {
  return `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(mensagem)}`;
}

export const mensagens = {
  geral: () => `Olá! Vim pelo site da ${SITE.nome} e gostaria de atendimento.`,
  produto: (nome: string, variacao?: string) =>
    `Olá! Tenho uma dúvida sobre o ${nome}${variacao ? ` (${variacao})` : ""}.`,
  aviseMe: (nome: string) =>
    `Olá! Quero ser avisado quando o ${nome} voltar ao estoque.`,
  pedido: (codigo: string) => `Olá! Quero falar sobre o meu pedido ${codigo}.`,
};
