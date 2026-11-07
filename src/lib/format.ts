import { SITE } from "./site";

const brl = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 2,
});

/** 1299 -> "R$ 1.299,00" */
export function formatBRL(valor: number): string {
  return brl.format(valor).replace(/ /g, " ");
}

/** 1299 -> "1.299,00" (sem o símbolo) */
export function formatValor(valor: number): string {
  return formatBRL(valor).replace("R$", "").trim();
}

export function parcelamento(preco: number): { parcelas: number; valor: number } | null {
  const parcelas = preco >= 300 ? SITE.parcelasSemJuros : preco >= 100 ? 3 : 1;
  if (parcelas <= 1) return null;
  return { parcelas, valor: Math.round((preco / parcelas) * 100) / 100 };
}

export function percentualDesconto(preco: number, precoAntigo: number | null): number | null {
  if (!precoAntigo || precoAntigo <= preco) return null;
  return Math.round((1 - preco / precoAntigo) * 100);
}

export function formatDataHora(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function slugify(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// Máscaras de formulário
export function maskWhatsApp(v: string): string {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : "";
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export function maskCPF(v: string): string {
  const d = v.replace(/\D/g, "").slice(0, 11);
  return d
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

export function maskCEP(v: string): string {
  const d = v.replace(/\D/g, "").slice(0, 8);
  return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
}

export function cpfValido(cpf: string): boolean {
  const d = cpf.replace(/\D/g, "");
  if (d.length !== 11 || /^(\d)\1+$/.test(d)) return false;
  const calc = (n: number) => {
    let soma = 0;
    for (let i = 0; i < n; i++) soma += Number(d[i]) * (n + 1 - i);
    const r = (soma * 10) % 11;
    return r === 10 ? 0 : r;
  };
  return calc(9) === Number(d[9]) && calc(10) === Number(d[10]);
}

/** 1299.9 -> "1299,90" (valor para campo de formulário) */
export const paraCampo = (n: number | string | null) =>
  n === null || n === "" ? "" : Number(n).toFixed(2).replace(".", ",");
