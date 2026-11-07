import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { env } from "../env";

/**
 * Cliente com a service_role: ignora RLS. Use SÓ no servidor, para criar pedidos,
 * processar o webhook e mostrar o acompanhamento do pedido (com token).
 */
export function supabaseServico() {
  if (!env.supabaseUrl || !env.supabaseServiceKey) throw new Error("Supabase (service role) não configurado");
  return createClient(env.supabaseUrl, env.supabaseServiceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** Cliente público (anon), sem sessão: leitura do catálogo respeitando RLS. */
export function supabasePublico() {
  if (!env.supabaseUrl || !env.supabaseAnonKey) throw new Error("Supabase não configurado");
  return createClient(env.supabaseUrl, env.supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** Cliente com a sessão do usuário logado (painel /admin). RLS decide o que ele pode fazer. */
export async function supabaseSessao() {
  const store = await cookies();
  return createServerClient(env.supabaseUrl, env.supabaseAnonKey, {
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
