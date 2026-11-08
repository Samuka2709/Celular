import "server-only";
import { headers } from "next/headers";
import { ipDosCabecalhos } from "./rate-limit";
import { supabaseServico } from "./supabase/server";

type Quem = { id?: string | null; email?: string | null };

/**
 * Grava uma linha em admin_log (logins e ações do painel).
 * Nunca derruba a ação principal: se a tabela não existir ou o banco falhar, só registra no console.
 * Não guarde senhas nem dados de cartão em "detalhes".
 */
export async function registrar(acao: string, quem: Quem | null, detalhes: Record<string, unknown> = {}) {
  try {
    const ip = ipDosCabecalhos(await headers());
    const { error } = await supabaseServico()
      .from("admin_log")
      .insert({ acao, user_id: quem?.id ?? null, email: quem?.email ?? null, ip, detalhes });
    if (error) console.error("[auditoria]", acao, error.message);
  } catch (e) {
    console.error("[auditoria]", acao, e);
  }
}
