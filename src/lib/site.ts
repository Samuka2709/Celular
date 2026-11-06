// Configuração da loja num lugar só. Troque estes valores pelos reais.
export const SITE = {
  nome: "Loja Exemplo", // nome provisório
  descricao: "Celulares novos e seminovos revisados em Ilhéus e região. Pague com Pix, cartão ou boleto.",
  whatsapp: "5573999999999", // somente números, com DDI e DDD (placeholder)
  whatsappExibicao: "(73) 99999-9999",
  email: "contato@lojaexemplo.com.br",
  endereco: "Rua Exemplo, 123, Centro, Ilhéus, BA",
  horario: "Seg a sex 9h às 18h, sáb 9h às 13h",
  cnpj: "00.000.000/0001-00",
  avisoTopo: "Entrega em Ilhéus e região | 5% off no Pix",
  descontoPix: 0.05,
  parcelasSemJuros: 10,
  url: "http://localhost:3000",
} as const;

export const NAV = [
  { href: "/", label: "Início" },
  { href: "/celulares", label: "Celulares" },
  { href: "/acessorios", label: "Acessórios" },
  { href: "/ofertas", label: "Ofertas" },
  { href: "/contato", label: "Contato" },
] as const;
