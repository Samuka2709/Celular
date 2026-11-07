import { ArrowLeft, MessageCircle } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { StatusActions } from "@/components/admin/StatusActions";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { exigirAdmin } from "@/lib/admin";
import { formatBRL, formatDataHora, maskCPF, maskWhatsApp } from "@/lib/format";
import { linkWhatsapp, mensagemStatus } from "@/lib/notificacoes/whatsapp";
import { tituloStatus } from "@/lib/produto";
import type { OrderStatus } from "@/lib/types";
import { botao } from "@/lib/ui";

export const metadata: Metadata = { title: "Pedido" };

export default async function PedidoAdminPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await exigirAdmin();
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const { data: o } = await supabase
    .from("orders")
    .select("*, order_items ( id, nome_snapshot, quantidade, preco_unitario ), order_status_history ( id, status, observacao, created_at )")
    .eq("id", id)
    .maybeSingle();
  if (!o) notFound();

  const status = o.status as OrderStatus;
  const end = o.endereco as Record<string, string> | null;
  const historico = [...(o.order_status_history ?? [])].sort((a, b) => b.created_at.localeCompare(a.created_at));
  const wa = linkWhatsapp(
    o.whatsapp,
    mensagemStatus({ nome: o.nome, codigo: o.codigo, token: o.token_acompanhamento, status, total: Number(o.total), tipoEntrega: o.tipo_entrega }),
  );

  return (
    <>
      <Link href="/admin/pedidos" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink">
        <ArrowLeft className="size-4" aria-hidden />
        Pedidos
      </Link>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <h1 className="font-display text-3xl font-semibold tracking-tight">{o.codigo}</h1>
        <StatusBadge status={status} />
        <span className="text-sm text-muted">{formatDataHora(o.created_at)}</span>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
        <div className="space-y-6">
          <section aria-labelledby="acoes" className="rounded-2xl border border-line bg-card p-5">
            <h2 id="acoes" className="font-display text-lg font-semibold">
              Próximo passo
            </h2>
            <StatusActions orderId={o.id} status={status} tipoEntrega={o.tipo_entrega} />
            <a href={wa} target="_blank" rel="noopener noreferrer" className={botao("whatsapp", "md", "mt-4 w-full sm:w-auto")}>
              <MessageCircle className="size-4 text-whatsapp" aria-hidden />
              Avisar cliente no WhatsApp
            </a>
            <p className="mt-2 text-xs text-subtle">Abre o WhatsApp com a mensagem do status atual ({tituloStatus(status)}) pronta.</p>
          </section>

          <section aria-labelledby="itens" className="rounded-2xl border border-line bg-card p-5">
            <h2 id="itens" className="font-display text-lg font-semibold">
              Itens
            </h2>
            <ul className="mt-3 divide-y divide-line text-sm">
              {(o.order_items ?? []).map((i: { id: string; nome_snapshot: string; quantidade: number; preco_unitario: number }) => (
                <li key={i.id} className="flex justify-between gap-4 py-2.5">
                  <span>
                    {i.quantidade}x {i.nome_snapshot}
                  </span>
                  <span className="tabular-nums">{formatBRL(Number(i.preco_unitario) * i.quantidade)}</span>
                </li>
              ))}
            </ul>
            <dl className="mt-2 space-y-1.5 border-t border-line pt-3 text-sm tabular-nums">
              <div className="flex justify-between">
                <dt className="text-muted">Subtotal</dt>
                <dd>{formatBRL(Number(o.subtotal))}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Entrega</dt>
                <dd>{Number(o.frete) ? formatBRL(Number(o.frete)) : "Grátis"}</dd>
              </div>
              <div className="flex justify-between font-semibold">
                <dt>Total ({o.forma_pagamento === "pix" ? "Pix" : "cartão/boleto"})</dt>
                <dd>{formatBRL(Number(o.total))}</dd>
              </div>
            </dl>
          </section>

          <section aria-labelledby="historico" className="rounded-2xl border border-line bg-card p-5">
            <h2 id="historico" className="font-display text-lg font-semibold">
              Histórico
            </h2>
            <ol className="mt-3 space-y-3">
              {historico.map((h: { id: string; status: OrderStatus; observacao: string | null; created_at: string }) => (
                <li key={h.id} className="flex gap-3 text-sm">
                  <span className="w-24 shrink-0 tabular-nums text-subtle">{formatDataHora(h.created_at)}</span>
                  <span>
                    <span className="font-medium">{tituloStatus(h.status)}</span>
                    {h.observacao && (
                      <span className={h.observacao.startsWith("ATENÇÃO") ? "block font-medium text-danger" : "block text-muted"}>
                        {h.observacao}
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ol>
          </section>
        </div>

        <div className="space-y-6">
          <section aria-labelledby="cliente" className="rounded-2xl border border-line bg-card p-5 text-sm">
            <h2 id="cliente" className="font-display text-lg font-semibold">
              Cliente
            </h2>
            <dl className="mt-3 space-y-2">
              <div>
                <dt className="text-muted">Nome</dt>
                <dd>{o.nome}</dd>
              </div>
              <div>
                <dt className="text-muted">WhatsApp</dt>
                <dd>{maskWhatsApp(o.whatsapp)}</dd>
              </div>
              <div>
                <dt className="text-muted">E-mail</dt>
                <dd className="break-all">{o.email}</dd>
              </div>
              {o.cpf && (
                <div>
                  <dt className="text-muted">CPF</dt>
                  <dd>{maskCPF(o.cpf)}</dd>
                </div>
              )}
            </dl>
          </section>

          <section aria-labelledby="entrega" className="rounded-2xl border border-line bg-card p-5 text-sm">
            <h2 id="entrega" className="font-display text-lg font-semibold">
              {o.tipo_entrega === "entrega" ? "Entrega" : "Retirada na loja"}
            </h2>
            {end ? (
              <p className="mt-3 leading-relaxed">
                {end.rua}, {end.numero}
                {end.complemento ? ` (${end.complemento})` : ""}
                <br />
                {end.bairro}, {end.cidade}
                {end.uf ? ` - ${end.uf}` : ""}
                <br />
                CEP {end.cep}
              </p>
            ) : (
              <p className="mt-3 text-muted">O cliente vai retirar na loja.</p>
            )}
          </section>

          <section aria-labelledby="pagamento" className="rounded-2xl border border-line bg-card p-5 text-sm">
            <h2 id="pagamento" className="font-display text-lg font-semibold">
              Mercado Pago
            </h2>
            <dl className="mt-3 space-y-2">
              <div>
                <dt className="text-muted">Pagamento</dt>
                <dd>{o.mp_payment_id ?? "Ainda não pago"}</dd>
              </div>
              {o.reserva_ativa && o.reserva_expira_em && (
                <div>
                  <dt className="text-muted">Reserva expira</dt>
                  <dd>{formatDataHora(o.reserva_expira_em)}</dd>
                </div>
              )}
            </dl>
          </section>
        </div>
      </div>
    </>
  );
}
