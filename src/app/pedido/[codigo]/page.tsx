import { MapPin, MessageCircle, Store } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { OrderTimeline } from "@/components/order/OrderTimeline";
import { getOrderByCode, tituloStatus } from "@/lib/catalog";
import { formatBRL, formatDataHora } from "@/lib/format";
import { SITE } from "@/lib/site";
import { botao, cn, container } from "@/lib/ui";
import { mensagens, whatsappLink } from "@/lib/whatsapp";

export const metadata: Metadata = { title: "Acompanhar pedido", robots: { index: false } };

export default async function PedidoPage({
  params,
  searchParams,
}: {
  params: Promise<{ codigo: string }>;
  searchParams: Promise<{ t?: string }>;
}) {
  const { codigo } = await params;
  const { t } = await searchParams;
  // Só mostra o pedido se o token do link (enviado por e-mail) bater
  const order = await getOrderByCode(codigo, t);
  if (!order) return <PedidoNaoEncontrado />;

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
                    {i.variacao && <span className="text-muted">{i.variacao}</span>}
                  </span>
                  <span className="shrink-0 tabular-nums">{formatBRL(i.precoUnitario * i.quantidade)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-2 flex items-baseline justify-between border-t border-line pt-4">
              <span className="font-semibold">{["aguardando_pagamento", "cancelado", "expirado"].includes(order.status) ? "Total" : "Total pago"}</span>
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

function PedidoNaoEncontrado() {
  return (
    <div className={cn(container, "grid min-h-[60vh] place-items-center py-16 text-center")}>
      <div className="max-w-md">
        <h1 className="font-display text-3xl font-semibold tracking-tight">Pedido não encontrado</h1>
        <p className="mt-3 text-muted">
          Para ver o andamento, use o link de acompanhamento que enviamos por e-mail. Se não encontrar, fale com a gente
          no WhatsApp informando o número do pedido.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <a href={whatsappLink(mensagens.geral())} target="_blank" rel="noopener noreferrer" className={botao("whatsapp", "md")}>
            Falar no WhatsApp
          </a>
          <Link href="/" className={botao("secundario", "md")}>
            Página inicial
          </Link>
        </div>
      </div>
    </div>
  );
}
