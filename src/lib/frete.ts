// Cálculo de frete isolado. Hoje usa a tabela delivery_zones (editável no /admin/entrega).
// Para usar o Melhor Envio no futuro, troque o corpo de calcularFrete mantendo a assinatura.
import { supabaseConfigurado } from "./env";
import { supabasePublico } from "./supabase/server";

export type ResultadoFrete =
  | { ok: true; taxa: number; prazo: string | null; descricao: string }
  | { ok: false; erro: string };

interface Zona {
  cidade: string;
  bairro: string | null;
  taxa: number;
  prazo: string | null;
}

// Tabela usada no modo demonstração (sem Supabase)
const ZONAS_DEMO: Zona[] = [
  { cidade: "Ilhéus", bairro: null, taxa: 12, prazo: "No mesmo dia para pedidos pagos até 15h" },
  { cidade: "Itabuna", bairro: null, taxa: 25, prazo: "Em até 1 dia útil" },
  { cidade: "Uruçuca", bairro: null, taxa: 25, prazo: "Em até 1 dia útil" },
  { cidade: "Itacaré", bairro: null, taxa: 35, prazo: "Em até 2 dias úteis" },
  { cidade: "Una", bairro: null, taxa: 35, prazo: "Em até 2 dias úteis" },
  { cidade: "Canavieiras", bairro: null, taxa: 35, prazo: "Em até 2 dias úteis" },
];

const norm = (t: string | null | undefined) =>
  (t ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();

async function zonas(): Promise<Zona[]> {
  if (!supabaseConfigurado()) return ZONAS_DEMO;
  const { data, error } = await supabasePublico()
    .from("delivery_zones")
    .select("cidade, bairro, taxa, prazo")
    .eq("ativo", true);
  if (error) throw new Error(`Erro ao carregar taxas de entrega: ${error.message}`);
  return (data ?? []).map((z) => ({ ...z, taxa: Number(z.taxa) }));
}

export async function calcularFrete(entrada: {
  tipo: "retirada" | "entrega";
  cidade?: string;
  bairro?: string;
}): Promise<ResultadoFrete> {
  if (entrada.tipo === "retirada") return { ok: true, taxa: 0, prazo: null, descricao: "Retirada na loja" };
  const cidade = norm(entrada.cidade);
  if (!cidade) return { ok: false, erro: "Informe a cidade para calcular a entrega." };
  const bairro = norm(entrada.bairro);

  const lista = await zonas();
  const zona =
    lista.find((z) => norm(z.cidade) === cidade && z.bairro && norm(z.bairro) === bairro) ??
    lista.find((z) => norm(z.cidade) === cidade && !z.bairro);

  if (!zona) {
    return {
      ok: false,
      erro: "Ainda não entregamos nesse endereço. Escolha retirar na loja ou fale com a gente no WhatsApp.",
    };
  }
  return { ok: true, taxa: zona.taxa, prazo: zona.prazo, descricao: `Entrega em ${zona.bairro ?? zona.cidade}` };
}
