import { MapPin, MessageCircle, Store } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { OrderTimeline } from "@/components/order/OrderTimeline";
import { getOrderByCode, tituloStatus } from "@/lib/catalog";
import { formatBRL, formatDataHora } from "@/lib/format";
import { SITE } from "@/lib/site";
import { botao, cn, container } from "@/lib/ui";
import { mensagens, whatsappLink } from "@/lib/whatsapp";

export const metadata: Metadata = { title: "Acompanhar pedido", robots: { index: false } };

export default async function PedidoPage({ params }: { params: Promise<{ codigo: string }> }) {
  const { codigo } = await params;
  // BACKEND: buscar pelo código + token (?t=) e só mostrar se o token bater.
  const order = await getOrderByCode(codigo);
  if (!order) notFound();

  return (
    <div className={cn(container, "max-w-4xl")}>
      <PageHeader
        titulo={`Pedido ${order.codigo}`}
        descricao={`Feito em ${formatDataHora(order.criadoEm)}. Status atual: ${tituloStatus(order.status)}.`}
        migalhas={[{ href: "/", label: "Início" }, { label: "Acompanhar pedido" }]}
      />

      <div className="grid gap-6 md:grid-cols-[1.1fr_1fr]">
        <section aria-labelledby="andamento" className="rounded-2xl border border-line bg-card p-5 sm:p-6">
          <h2 id="andamento" className="mb-6 font-display text-lg font-semibold">
            Andamento
          </h2>
          <OrderTimeline order={order} />
        </section>

        <div className="space-y-6">
          <section aria-labelledby="itens" className="rounded-2xl border border-line bg-card p-5 sm:p-6">
            <h2 id="itens" className="font-display text-lg font-semibold">
              Itens
            </h2>
            <ul className="mt-4 divide-y divide-line text-sm">
              {order.itens.map((i) => (
                <li key={i.nome + i.variacao} className="flex justify-between gap-4 py-3 first:pt-0">
                  <span>
                    <span className="block font-medium">
                      {i.quantidade}x {i.nome}
                    </span>
                    <span className="text-muted">{i.variacao}</span>
                  </span>
                  <span className="shrink-0 tabular-nums">{formatBRL(i.precoUnitario * i.quantidade)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-2 flex items-baseline justify-between border-t border-line pt-4">
              <span className="font-semibold">Total pago</span>
              <span className="font-display text-xl font-semibold tabular-nums">{formatBRL(order.total)}</span>
            </div>
          </section>

          <section aria-labelledby="recebimento" className="rounded-2xl border border-line bg-card p-5 sm:p-6">
            <h2 id="recebimento" className="font-display text-lg font-semibold">
              {order.tipoEntrega === "entrega" ? "Entrega" : "Retirada na loja"}
            </h2>
            <p className="mt-3 flex gap-2.5 text-sm text-muted">
              {order.tipoEntrega === "entrega" ? (
                <>
                  <MapPin className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
                  {order.bairroCidade}
                </>
              ) : (
                <>
                  <Store className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
                  <span>
                    {SITE.endereco}
                    <br />
                    {SITE.horario}
                  </span>
                </>
              )}
            </p>
          </section>

          <a
            href={whatsappLink(mensagens.pedido(order.codigo))}
            target="_blank"
            rel="noopener noreferrer"
            className={botao("whatsapp", "lg", "w-full")}
          >
            <MessageCircle className="size-5 text-whatsapp" aria-hidden />
            Falar com a loja no WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
