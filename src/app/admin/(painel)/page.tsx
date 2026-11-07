import { AlertTriangle, ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { AdminTitulo, StatusBadge } from "@/components/admin/StatusBadge";
import { exigirAdmin } from "@/lib/admin";
import { formatBRL, formatDataHora } from "@/lib/format";
import type { OrderStatus } from "@/lib/types";
import { cn } from "@/lib/ui";

export const metadata: Metadata = { title: "Painel" };

/** Meia-noite de hoje no horário da Bahia (UTC-3), em ISO */
function inicioDoDia() {
  const agora = new Date();
  const bahia = new Date(agora.getTime() - 3 * 3600_000);
  bahia.setUTCHours(0, 0, 0, 0);
  return new Date(bahia.getTime() + 3 * 3600_000).toISOString();
}

export default async function PainelPage() {
  const { supabase } = await exigirAdmin();

  const [hoje, aguardando, paraSeparar, recentes, variantes] = await Promise.all([
    supabase.from("orders").select("total, status").gte("created_at", inicioDoDia()),
    supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "aguardando_pagamento"),
    supabase.from("orders").select("id", { count: "exact", head: true }).in("status", ["pago", "separando"]),
    supabase
      .from("orders")
      .select("id, codigo, nome, total, status, created_at")
      .order("created_at", { ascending: false })
      .limit(8),
    supabase
      .from("product_variants")
      .select("id, cor, armazenamento, estoque, estoque_reservado, products!inner(id, nome, ativo)")
      .eq("products.ativo", true),
  ]);

  const pedidosHoje = hoje.data ?? [];
  const pagosHoje = pedidosHoje.filter((p) => !["aguardando_pagamento", "cancelado", "expirado"].includes(p.status));
  const faturamentoHoje = pagosHoje.reduce((s, p) => s + Number(p.total), 0);

  type V = { id: string; cor: string; armazenamento: string | null; estoque: number; estoque_reservado: number; products: { id: string; nome: string } };
  const lista = (variantes.data ?? []) as unknown as V[];
  const disp = (v: V) => v.estoque - v.estoque_reservado;
  const baixo = lista.filter((v) => disp(v) > 0 && disp(v) <= 2);
  const porProduto = new Map<string, { nome: string; total: number }>();
  for (const v of lista) {
    const atual = porProduto.get(v.products.id) ?? { nome: v.products.nome, total: 0 };
    atual.total += Math.max(0, disp(v));
    porProduto.set(v.products.id, atual);
  }
  const esgotados = [...porProduto.entries()].filter(([, p]) => p.total === 0);

  const cards = [
    { titulo: "Pedidos hoje", valor: String(pedidosHoje.length), detalhe: `${formatBRL(faturamentoHoje)} pagos`, href: "/admin/pedidos" },
    { titulo: "Aguardando pagamento", valor: String(aguardando.count ?? 0), detalhe: "Reserva de 30 min", href: "/admin/pedidos?status=aguardando_pagamento" },
    { titulo: "Para separar", valor: String(paraSeparar.count ?? 0), detalhe: "Pagos ou separando", href: "/admin/pedidos?status=pago" },
    { titulo: "Estoque baixo", valor: String(baixo.length), detalhe: `${esgotados.length} produto(s) esgotado(s)`, href: "#estoque" },
  ];

  return (
    <>
      <AdminTitulo titulo="Painel" descricao="Resumo de hoje e o que precisa de atenção." />

      <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {cards.map((c) => (
          <li key={c.titulo}>
            <Link href={c.href} className="block rounded-2xl border border-line bg-card p-4 transition-colors duration-150 hover:border-line-strong sm:p-5">
              <p className="text-sm text-muted">{c.titulo}</p>
              <p className="mt-1 font-display text-3xl font-semibold tabular-nums">{c.valor}</p>
              <p className="mt-1 text-xs text-subtle">{c.detalhe}</p>
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <section aria-labelledby="recentes" className="rounded-2xl border border-line bg-card">
          <div className="flex items-center justify-between p-5 pb-3">
            <h2 id="recentes" className="font-display text-lg font-semibold">
              Últimos pedidos
            </h2>
            <Link href="/admin/pedidos" className="inline-flex items-center gap-1 text-sm text-muted hover:text-ink">
              Ver todos <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
          {recentes.data?.length ? (
            <ul className="divide-y divide-line">
              {recentes.data.map((o) => (
                <li key={o.id}>
                  <Link href={`/admin/pedidos/${o.id}`} className="flex items-center gap-3 px-5 py-3 hover:bg-card-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">
                        {o.codigo} <span className="font-normal text-muted">· {o.nome}</span>
                      </p>
                      <p className="text-xs text-subtle">{formatDataHora(o.created_at)}</p>
                    </div>
                    <span className="hidden text-sm tabular-nums sm:block">{formatBRL(Number(o.total))}</span>
                    <StatusBadge status={o.status as OrderStatus} />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-5 pb-6 text-sm text-muted">Nenhum pedido ainda.</p>
          )}
        </section>

        <section id="estoque" aria-labelledby="estoque-titulo" className="rounded-2xl border border-line bg-card p-5">
          <h2 id="estoque-titulo" className="font-display text-lg font-semibold">
            Estoque
          </h2>
          {esgotados.length > 0 && (
            <>
              <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-danger">Esgotados</p>
              <ul className="mt-2 space-y-1">
                {esgotados.map(([id, p]) => (
                  <li key={id}>
                    <Link href={`/admin/produtos/${id}`} className="flex items-center gap-2 rounded-lg py-1.5 text-sm hover:text-accent">
                      <AlertTriangle className="size-4 text-danger" aria-hidden />
                      {p.nome}
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}
          <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-accent">Estoque baixo (2 ou menos)</p>
          {baixo.length ? (
            <ul className="mt-2 divide-y divide-line">
              {baixo.map((v) => (
                <li key={v.id}>
                  <Link href={`/admin/produtos/${v.products.id}`} className="flex items-center justify-between gap-3 py-2 text-sm hover:text-accent">
                    <span className="min-w-0 truncate">
                      {v.products.nome} <span className="text-muted">{[v.cor, v.armazenamento].filter(Boolean).join(" · ")}</span>
                    </span>
                    <span className={cn("shrink-0 font-semibold tabular-nums", disp(v) === 1 ? "text-danger" : "text-accent")}>
                      {disp(v)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-muted">Nenhuma variação com estoque baixo.</p>
          )}
        </section>
      </div>
    </>
  );
}
