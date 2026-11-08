import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_ATIVIDADE, INATIVIDADE_MS, opcoesCookieAtividade } from "./lib/sessao-admin";

// Renova a sessão do Supabase, protege o /admin e encerra a sessão após 2 h sem uso
export async function proxy(req: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !anon) return NextResponse.next();

  let res = NextResponse.next({ request: req });
  const supabase = createServerClient(url, anon, {
    cookies: {
      getAll: () => req.cookies.getAll(),
      setAll: (lista) => {
        lista.forEach(({ name, value }) => req.cookies.set(name, value));
        res = NextResponse.next({ request: req });
        lista.forEach(({ name, value, options }) => res.cookies.set(name, value, options));
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const naLogin = req.nextUrl.pathname === "/admin/login";
  const paraLogin = (motivo?: string) => {
    const destino = req.nextUrl.clone();
    destino.pathname = "/admin/login";
    destino.search = motivo ? `?erro=${motivo}` : "";
    const r = NextResponse.redirect(destino);
    // Leva junto os cookies que o Supabase alterou (ex.: sessão apagada)
    res.cookies.getAll().forEach((c) => r.cookies.set(c));
    return r;
  };

  if (!user) return naLogin ? res : paraLogin();
  if (naLogin) return res;

  // Sessão sem uso há mais de 2 h (ou aberta antes desta regra existir): encerra
  const ultimo = Number(req.cookies.get(COOKIE_ATIVIDADE)?.value ?? 0);
  if (!ultimo || Date.now() - ultimo > INATIVIDADE_MS) {
    await supabase.auth.signOut();
    const r = paraLogin("sessao-expirada");
    r.cookies.delete(COOKIE_ATIVIDADE);
    return r;
  }

  // Renova no máximo a cada 5 min, para não mandar Set-Cookie em toda requisição
  if (Date.now() - ultimo > 5 * 60_000) res.cookies.set(COOKIE_ATIVIDADE, String(Date.now()), opcoesCookieAtividade);
  return res;
}

export const config = {
  matcher: ["/admin/:path*"],
};
