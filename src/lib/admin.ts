import { redirect } from "next/navigation";
import { supabaseConfigurado } from "./env";
import { supabaseSessao } from "./supabase/server";

/**
 * Garante que quem está acessando é administrador (está na tabela admins).
 * Retorna o cliente com a sessão do usuário: o RLS do banco confere de novo cada operação.
 */
export async function exigirAdmin() {
  if (!supabaseConfigurado()) redirect("/admin/login");
  const supabase = await supabaseSessao();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data: admin } = await supabase.from("admins").select("user_id").eq("user_id", user.id).maybeSingle();
  if (!admin) redirect("/admin/login?erro=sem-permissao");

  return { supabase, user };
}
