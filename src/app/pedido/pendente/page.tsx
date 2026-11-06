import type { Metadata } from "next";
import Link from "next/link";
import { StatusIcon } from "@/components/order/OrderStatus";
import { botao, cn, container } from "@/lib/ui";
import { mensagens, whatsappLink } from "@/lib/whatsapp";

export const metadata: Metadata = { title: "Aguardando pagamento", robots: { index: false } };

export default async function PendentePage({ searchParams }: { searchParams: Promise<{ pedido?: string }> }) {
  const { pedido } = await searchParams;
  const codigo = pedido && /^PED-[A-Z0-9]{5}$/i.test(pedido) ? pedido.toUpperCase() : null;

  return (
    <div className={cn(container, "grid min-h-[70vh] place-items-center py-16")}>
      <div className="w-full max-w-lg text-center">
        <StatusIcon tipo="pendente" />
        <h1 className="mt-8 font-display text-4xl font-semibold tracking-[-0.03em]">Aguardando pagamento</h1>
        {codigo && (
          <p className="mt-3 text-muted">
            Pedido <span className="font-display font-semibold text-ink">{codigo}</span>
          </p>
        )}
        <div className="mx-auto mt-6 max-w-md space-y-3 text-pretty text-muted">
          <p>
            Se você escolheu <span className="text-ink">Pix</span>, conclua o pagamento no app do seu banco. A confirmação
            costuma chegar em poucos minutos.
          </p>
          <p>
            Se escolheu <span className="text-ink">boleto</span>, a compensação pode levar até 3 dias úteis.
          </p>
          <p className="rounded-xl border border-line bg-card p-4 text-sm">
            Seus itens ficam reservados por <span className="font-semibold text-accent">30 minutos</span>. Depois disso, a
            reserva é liberada para outros clientes.
          </p>
        </div>
        <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
          {codigo && (
            <Link href={`/pedido/${codigo}`} className={botao("primario", "lg")}>
              Acompanhar pedido
            </Link>
          )}
          <a
            href={whatsappLink(codigo ? mensagens.pedido(codigo) : mensagens.geral())}
            target="_blank"
            rel="noopener noreferrer"
            className={botao("whatsapp", "lg")}
          >
            Falar no WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
