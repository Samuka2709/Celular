import { Mail, MessageCircle } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { ClearCartOnMount, StatusIcon } from "@/components/order/OrderStatus";
import { SITE } from "@/lib/site";
import { botao, cn, container } from "@/lib/ui";

export const metadata: Metadata = { title: "Pedido confirmado", robots: { index: false } };

export default async function SucessoPage({ searchParams }: { searchParams: Promise<{ pedido?: string }> }) {
  const { pedido } = await searchParams;
  const codigo = pedido && /^PED-[A-Z0-9]{5}$/i.test(pedido) ? pedido.toUpperCase() : null;

  return (
    <div className={cn(container, "grid min-h-[70vh] place-items-center py-16")}>
      <ClearCartOnMount />
      <div className="w-full max-w-lg text-center">
        <StatusIcon tipo="sucesso" />
        <h1 className="animate-fade-up mt-8 font-display text-4xl font-semibold tracking-[-0.03em]">Pedido confirmado</h1>
        {codigo && (
          <p className="mt-3 text-muted">
            Número do pedido{" "}
            <span className="rounded-lg border border-line-strong bg-card px-2 py-1 font-display font-semibold tracking-wide text-ink">
              {codigo}
            </span>
          </p>
        )}
        <p className="mx-auto mt-6 max-w-sm text-pretty text-muted">
          Você vai receber a confirmação por e-mail e WhatsApp.
        </p>
        {SITE.emTestes && (
          <p className="mx-auto mt-4 max-w-sm rounded-xl border border-accent/40 bg-accent/5 px-4 py-3 text-sm text-muted">
            <span className="font-semibold text-ink">Pedido de teste.</span> A loja está em fase de testes e nenhum
            pagamento foi feito.
          </p>
        )}
        <div className="mt-4 flex justify-center gap-4 text-subtle">
          <Mail className="size-5" aria-hidden />
          <MessageCircle className="size-5" aria-hidden />
        </div>
        <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
          {codigo && (
            <Link href={`/pedido/${codigo}`} className={botao("primario", "lg")}>
              Acompanhar pedido
            </Link>
          )}
          <Link href="/" className={botao("secundario", "lg")}>
            Continuar comprando
          </Link>
        </div>
      </div>
    </div>
  );
}
