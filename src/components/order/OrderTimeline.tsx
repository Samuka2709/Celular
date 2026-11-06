import { Check } from "lucide-react";
import { formatDataHora } from "@/lib/format";
import type { OrderPublic, OrderStatus } from "@/lib/types";
import { cn } from "@/lib/ui";

interface Etapa {
  status: OrderStatus[];
  titulo: string;
  descricao: string;
}

export function etapasDoPedido(tipo: OrderPublic["tipoEntrega"]): Etapa[] {
  return [
    { status: ["aguardando_pagamento"], titulo: "Pedido recebido", descricao: "Recebemos seu pedido." },
    { status: ["pago"], titulo: "Pagamento aprovado", descricao: "O Mercado Pago confirmou o pagamento." },
    { status: ["separando"], titulo: "Separando", descricao: "Estamos conferindo e embalando seus itens." },
    tipo === "entrega"
      ? { status: ["enviado"], titulo: "Saiu para entrega", descricao: "O entregador está a caminho." }
      : { status: ["pronto_retirada"], titulo: "Pronto para retirada", descricao: "Pode vir buscar na loja." },
    {
      status: ["entregue"],
      titulo: "Entregue",
      descricao: tipo === "entrega" ? "Pedido entregue no endereço." : "Pedido retirado na loja.",
    },
  ];
}

export function OrderTimeline({ order }: { order: OrderPublic }) {
  const etapas = etapasDoPedido(order.tipoEntrega);
  const datas = etapas.map((e) => order.historico.find((h) => e.status.includes(h.status))?.data ?? null);
  const ultimaConcluida = datas.reduce((acc, d, i) => (d ? i : acc), -1);

  return (
    <ol className="relative" aria-label="Andamento do pedido">
      {etapas.map((etapa, i) => {
        const feito = i <= ultimaConcluida;
        const atual = i === ultimaConcluida + 1;
        const ultimo = i === etapas.length - 1;
        return (
          <li key={etapa.titulo} className="relative flex gap-4 pb-8 last:pb-0" aria-current={i === ultimaConcluida ? "step" : undefined}>
            {!ultimo && (
              <span
                aria-hidden
                className={cn("absolute left-[15px] top-9 h-[calc(100%-2.5rem)] w-0.5 rounded-full", i < ultimaConcluida ? "bg-accent" : "bg-line-strong")}
              />
            )}
            <span
              className={cn(
                "relative grid size-8 shrink-0 place-items-center rounded-full",
                feito ? "bg-accent text-canvas" : atual ? "border-2 border-dashed border-accent/60" : "border-2 border-line-strong",
              )}
            >
              {feito ? <Check className="size-4" strokeWidth={3} aria-hidden /> : <span className="size-1.5 rounded-full bg-line-strong" aria-hidden />}
            </span>
            <div className="pt-1">
              <p className={cn("font-display font-semibold", feito ? "text-ink" : atual ? "text-ink" : "text-muted")}>
                {etapa.titulo}
                <span className="sr-only">{feito ? " (concluído)" : atual ? " (próxima etapa)" : " (pendente)"}</span>
              </p>
              {datas[i] ? (
                <p className="mt-0.5 text-sm tabular-nums text-muted">
                  <time dateTime={datas[i]!}>{formatDataHora(datas[i]!)}</time>
                </p>
              ) : (
                <p className="mt-0.5 text-sm text-subtle">{atual ? "Próxima etapa" : "Aguardando"}</p>
              )}
              {i === ultimaConcluida && <p className="mt-1 text-sm text-muted">{etapa.descricao}</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
