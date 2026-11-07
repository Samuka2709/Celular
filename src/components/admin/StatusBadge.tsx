import { tituloStatus } from "@/lib/produto";
import type { OrderStatus } from "@/lib/types";
import { cn } from "@/lib/ui";

const CORES: Record<OrderStatus, string> = {
  aguardando_pagamento: "border-line-strong text-muted",
  pago: "border-accent/60 text-accent",
  separando: "border-accent/60 text-accent",
  enviado: "border-sky-400/50 text-sky-300",
  pronto_retirada: "border-sky-400/50 text-sky-300",
  entregue: "border-success/50 text-success",
  cancelado: "border-danger/40 text-danger",
  expirado: "border-line text-subtle",
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={cn("inline-flex h-6 items-center whitespace-nowrap rounded-md border px-2 text-xs font-medium", CORES[status])}>
      {tituloStatus(status)}
    </span>
  );
}

export function AdminTitulo({ titulo, descricao, acoes }: { titulo: string; descricao?: string; acoes?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">{titulo}</h1>
        {descricao && <p className="mt-1 text-sm text-muted">{descricao}</p>}
      </div>
      {acoes}
    </div>
  );
}
