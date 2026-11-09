// Configuração da loja num lugar só. Troque estes valores pelos reais.

const WHATSAPP = process.env.NEXT_PUBLIC_LOJA_WHATSAPP || "5573998258544";

export const SITE = {
  nome: "Sua Loja", // nome provisório (demo)
  descricao: "Celulares novos e seminovos revisados em Ilhéus e região. Pague com Pix, cartão ou boleto.",
  // Somente números, com DDI e DDD. Vem da variável LOJA_WHATSAPP (ex.: 5573999999999).
  whatsapp: WHATSAPP,
  whatsappExibicao: formatarWhatsapp(WHATSAPP),
  email: "contato@lojaexemplo.com.br",
  endereco: "Rua Exemplo, 123, Centro, Ilhéus, BA",
  horario: "Seg a sex 9h às 18h, sáb 9h às 13h",
  cnpj: "00.000.000/0001-00",
  avisoTopo: "Black November | 5% off no Pix | até 10x sem juros",
  descontoPix: 0.05,
  parcelasSemJuros: 10,
  url: urlDoSite(),
  /**
   * Loja em fase de testes: bloqueia o Google e mostra aviso no checkout.
   * Para lançar, crie na Vercel a variável NEXT_PUBLIC_LOJA_EM_TESTES=false e faça um novo deploy.
   */
  emTestes: process.env.NEXT_PUBLIC_LOJA_EM_TESTES !== "false",
} as const;

/**
 * Endereço público do site (links dos e-mails, retorno do Mercado Pago, prévias de link).
 * Ordem: SITE_URL (domínio próprio) > domínio de produção da Vercel > localhost.
 */
function urlDoSite() {
  const definido = process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL;
  if (definido) return definido.replace(/\/$/, "");
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  return "http://localhost:3000";
}

/** "5573999999999" -> "(73) 99999-9999" */
function formatarWhatsapp(numero: string) {
  const d = numero.replace(/\D/g, "").replace(/^55/, "");
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return numero;
}

export const NAV = [
  { href: "/", label: "Início" },
  { href: "/celulares", label: "Celulares" },
  { href: "/acessorios", label: "Acessórios" },
  { href: "/ofertas", label: "Ofertas" },
  { href: "/contato", label: "Contato" },
] as const;
