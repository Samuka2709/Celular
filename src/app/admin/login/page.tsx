import type { Metadata } from "next";
import { Logo } from "@/components/layout/Logo";
import { supabaseConfigurado } from "@/lib/env";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Entrar" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ erro?: string }> }) {
  const { erro } = await searchParams;
  const configurado = supabaseConfigurado();
  return (
    <div className="grid min-h-dvh place-items-center px-4 py-12">
      <div className="w-full max-w-sm">
        <Logo />
        <h1 className="mt-8 font-display text-3xl font-semibold tracking-tight">Painel da loja</h1>
        {configurado ? (
          <>
            <p className="mt-2 text-sm text-muted">Entre com o e-mail e a senha de administrador.</p>
            {erro === "sem-permissao" && (
              <p role="alert" className="mt-4 rounded-xl border border-danger/40 p-3 text-sm text-danger">
                Este usuário não tem acesso ao painel.
              </p>
            )}
            {erro === "sessao-expirada" && (
              <p role="status" className="mt-4 rounded-xl border border-line bg-card p-3 text-sm text-muted">
                Sua sessão foi encerrada depois de 2 horas sem uso. Entre de novo.
              </p>
            )}
            <LoginForm />
          </>
        ) : (
          <div className="mt-6 rounded-2xl border border-line bg-card p-5 text-sm leading-relaxed text-muted">
            <p className="font-semibold text-ink">O banco de dados ainda não está ligado.</p>
            <p className="mt-2">
              Crie o projeto no Supabase e preencha as variáveis <code className="text-ink">NEXT_PUBLIC_SUPABASE_URL</code> e{" "}
              <code className="text-ink">NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code> (passo a passo no README). Enquanto isso, a loja funciona
              com os dados de exemplo.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
