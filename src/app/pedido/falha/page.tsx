import { RotateCcw } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { StatusIcon } from "@/components/order/OrderStatus";
import { botao, cn, container } from "@/lib/ui";
import { mensagens, whatsappLink } from "@/lib/whatsapp";

export const metadata: Metadata = { title: "Pagamento não aprovado", robots: { index: false } };

export default function FalhaPage() {
  return (
    <div className={cn(container, "grid min-h-[70vh] place-items-center py-16")}>
      <div className="w-full max-w-lg text-center">
        <StatusIcon tipo="falha" />
        <h1 className="mt-8 font-display text-4xl font-semibold tracking-[-0.03em]">Pagamento não aprovado</h1>
        <p className="mx-auto mt-4 max-w-md text-pretty text-muted">
          Nenhum valor foi cobrado. Os motivos mais comuns são limite insuficiente, dados do cartão digitados errado ou
          bloqueio de segurança do banco.
        </p>
        <ul className="mx-auto mt-6 max-w-sm space-y-2 text-left text-sm text-muted">
          <li className="flex gap-2">
            <span className="mt-2 size-1.5 shrink-0 rounded-full bg-accent" aria-hidden />
            Confira os dados do cartão e tente de novo
          </li>
          <li className="flex gap-2">
            <span className="mt-2 size-1.5 shrink-0 rounded-full bg-accent" aria-hidden />
            Pague com Pix: é aprovado na hora e sai 5% mais barato
          </li>
          <li className="flex gap-2">
            <span className="mt-2 size-1.5 shrink-0 rounded-full bg-accent" aria-hidden />
            Seu carrinho continua salvo
          </li>
        </ul>
        <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/checkout" className={botao("primario", "lg")}>
            <RotateCcw className="size-5" aria-hidden />
            Tentar de novo
          </Link>
          <a href={whatsappLink(mensagens.geral())} target="_blank" rel="noopener noreferrer" className={botao("whatsapp", "lg")}>
            Pedir ajuda no WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
