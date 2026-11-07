"use client";

import { Loader2 } from "lucide-react";
import { useState, useTransition } from "react";
import { mudarStatusPedido } from "@/app/admin/actions";
import type { OrderStatus } from "@/lib/types";
import { botao } from "@/lib/ui";

interface Acao {
  status: OrderStatus;
  label: string;
  perigo?: boolean;
  confirmar?: string;
}

function proximas(status: OrderStatus, tipo: "retirada" | "entrega"): Acao[] {
  const cancelar: Acao = {
    status: "cancelado",
    label: "Cancelar pedido",
    perigo: true,
    confirmar:
      "Cancelar este pedido? Os itens voltam para o estoque. Se o cliente já pagou, faça o reembolso no Mercado Pago.",
  };
  switch (status) {
    case "aguardando_pagamento":
      return [
        { status: "pago", label: "Marcar como pago", confirmar: "Confirmar que o pagamento foi recebido fora do Mercado Pago?" },
        cancelar,
      ];
    case "pago":
      return [{ status: "separando", label: "Começar a separar" }, cancelar];
    case "separando":
      return [
        tipo === "entrega"
          ? { status: "enviado", label: "Saiu para entrega" }
          : { status: "pronto_retirada", label: "Pronto para retirada" },
        cancelar,
      ];
    case "enviado":
    case "pronto_retirada":
      return [{ status: "entregue", label: tipo === "entrega" ? "Marcar como entregue" : "Marcar como retirado" }, cancelar];
    default:
      return [];
  }
}

export function StatusActions({
  orderId,
  status,
  tipoEntrega,
}: {
  orderId: string;
  status: OrderStatus;
  tipoEntrega: "retirada" | "entrega";
}) {
  const [pendente, iniciar] = useTransition();
  const [clicado, setClicado] = useState<OrderStatus | null>(null);
  const [resultado, setResultado] = useState<{ erro?: string; msg?: string } | null>(null);
  const acoes = proximas(status, tipoEntrega);

  if (!acoes.length) {
    return <p className="mt-3 text-sm text-muted">Pedido finalizado. Nenhuma ação pendente.</p>;
  }

  return (
    <div className="mt-4">
      <div className="flex flex-wrap gap-2">
        {acoes.map((a) => (
          <button
            key={a.status}
            type="button"
            disabled={pendente}
            onClick={() => {
              if (a.confirmar && !window.confirm(a.confirmar)) return;
              setClicado(a.status);
              setResultado(null);
              iniciar(async () => setResultado(await mudarStatusPedido(orderId, a.status)));
            }}
            className={a.perigo ? botao("perigo", "md") : botao("primario", "md")}
          >
            {pendente && clicado === a.status && <Loader2 className="size-4 animate-spin" aria-hidden />}
            {a.label}
          </button>
        ))}
      </div>
      <p aria-live="polite" className={resultado?.erro ? "mt-3 text-sm text-danger" : "mt-3 text-sm text-success"}>
        {resultado?.erro ?? resultado?.msg ?? ""}
      </p>
    </div>
  );
}
