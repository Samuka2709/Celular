import type { Metadata } from "next";
import Link from "next/link";
import { AdminTitulo, StatusBadge } from "@/components/admin/StatusBadge";
import { exigirAdmin } from "@/lib/admin";
import { formatBRL, formatDataHora } from "@/lib/format";
import { STATUS_PEDIDO, tituloStatus } from "@/lib/produto";
import type { OrderStatus } from "@/lib/types";
import { cn } from "@/lib/ui";

export const metadata: Metadata = { title: "Pedidos" };

export default async function PedidosPage({ searchParams }: { searchParams: Promise<{ status?: string; q?: string }> }) {
  const { supabase } = await exigirAdmin();
  const { status, q } = await searchParams;
  const filtro = STATUS_PEDIDO.includes(status as OrderStatus) ? (status as OrderStatus) : null;

  let consulta = supabase
    .from("orders")
    .select("id, codigo, nome, whatsapp, total, status, tipo_entrega, forma_pagamento, created_at")
    .order("created_at", { ascending: false })
    .limit(100);
  if (filtro) consulta = consulta.eq("status", filtro);
  const termo = q?.trim().replace(/[%,()]/g, "");
  if (termo) consulta = consulta.or(`codigo.ilike.%${termo}%,nome.ilike.%${termo}%`);
  const { data: pedidos, error } = await consulta;

  const chip = (valor: OrderStatus | null, label: string) => (
    <Link
      key={label}
      href={valor ? `/admin/pedidos?status=${valor}` : "/admin/pedidos"}
      aria-current={filtro === valor ? "page" : undefined}
      className={cn(
        "inline-flex h-9 shrink-0 items-center rounded-full border px-3.5 text-sm transition-colors duration-150",
        filtro === valor ? "border-accent bg-accent/10 text-ink" : "border-line-strong text-muted hover:text-ink",
      )}
    >
      {label}
    </Link>
  );

  return (
    <>
      <AdminTitulo titulo="Pedidos" descricao="Os 100 mais recentes. Use o filtro para achar um status." />
      <form className="mb-4 max-w-sm">
        {filtro && <input type="hidden" name="status" value={filtro} />}
        <label htmlFor="q" className="sr-only">
          Buscar por código ou nome
        </label>
        <input
          id="q"
          name="q"
          defaultValue={q}
          placeholder="Buscar por código ou nome"
          className="h-10 w-full rounded-lg border border-line-strong bg-card px-3 text-sm placeholder:text-subtle focus:border-accent focus:outline-none"
        />
      </form>
      <nav aria-label="Filtrar por status" className="no-scrollbar -mx-4 mb-5 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
        {chip(null, "Todos")}
        {STATUS_PEDIDO.map((s) => chip(s, tituloStatus(s)))}
      </nav>

      {error && <p className="text-sm text-danger">Erro ao carregar pedidos: {error.message}</p>}

      {pedidos?.length ? (
        <div className="overflow-hidden rounded-2xl border border-line bg-card">
          <table className="w-full text-sm">
            <thead className="hidden border-b border-line text-left text-xs uppercase tracking-wide text-muted md:table-header-group">
              <tr>
                <th className="px-4 py-3 font-medium">Pedido</th>
                <th className="px-4 py-3 font-medium">Cliente</th>
                <th className="px-4 py-3 font-medium">Recebimento</th>
                <th className="px-4 py-3 text-right font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {pedidos.map((p) => (
                <tr key={p.id} className="relative flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-3 hover:bg-card-2 md:table-row md:p-0">
                  <td className="md:px-4 md:py-3">
                    <Link href={`/admin/pedidos/${p.id}`} className="font-semibold after:absolute after:inset-0">
                      {p.codigo}
                    </Link>
                    <p className="text-xs text-subtle">{formatDataHora(p.created_at)}</p>
                  </td>
                  <td className="order-3 w-full text-muted md:w-auto md:px-4 md:py-3">{p.nome}</td>
                  <td className="hidden text-muted md:table-cell md:px-4 md:py-3">
                    {p.tipo_entrega === "entrega" ? "Entrega" : "Retirada"} · {p.forma_pagamento === "pix" ? "Pix" : "Cartão/boleto"}
                  </td>
                  <td className="ml-auto tabular-nums md:px-4 md:py-3 md:text-right">{formatBRL(Number(p.total))}</td>
                  <td className="md:px-4 md:py-3">
                    <StatusBadge status={p.status as OrderStatus} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="rounded-2xl border border-dashed border-line-strong p-10 text-center text-sm text-muted">
          Nenhum pedido {filtro ? `com status "${tituloStatus(filtro)}"` : "ainda"}.
        </p>
      )}
    </>
  );
}
