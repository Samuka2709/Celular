import "server-only";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { env } from "../env";

/**
 * Cliente com a chave secreta (sb_secret_...): ignora RLS. Use SÓ no servidor, para criar pedidos,
 * processar o webhook e mostrar o acompanhamento do pedido (com token).
 */
export function supabaseServico() {
  if (!env.supabaseUrl || !env.supabaseSecretKey) throw new Error("Supabase (chave secreta) não configurado");
  return createClient(env.supabaseUrl, env.supabaseSecretKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** Cliente público (chave publicável), sem sessão: leitura do catálogo respeitando RLS. */
export function supabasePublico() {
  if (!env.supabaseUrl || !env.supabasePublishableKey) throw new Error("Supabase não configurado");
  return createClient(env.supabaseUrl, env.supabasePublishableKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** Cliente com a sessão do usuário logado (painel /admin). RLS decide o que ele pode fazer. */
export async function supabaseSessao() {
  const store = await cookies();
  return createServerClient(env.supabaseUrl, env.supabasePublishableKey, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (lista) => {
        try {
          lista.forEach(({ name, value, options }) => store.set(name, value, options));
        } catch {
          // Chamado de um Server Component: o middleware cuida de renovar a sessão.
        }
      },
    },
  });
}
