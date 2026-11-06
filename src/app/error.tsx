"use client";

import { AlertTriangle, MessageCircle, RotateCcw } from "lucide-react";
import { useEffect } from "react";
import { botao, cn, container } from "@/lib/ui";
import { mensagens, whatsappLink } from "@/lib/whatsapp";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className={cn(container, "grid min-h-[60vh] place-items-center py-16 text-center")}>
      <div className="max-w-md">
        <AlertTriangle className="mx-auto size-10 text-accent" strokeWidth={1.5} aria-hidden />
        <h1 className="mt-5 font-display text-3xl font-semibold tracking-tight">Não foi possível carregar esta página</h1>
        <p className="mt-3 text-muted">
          Pode ser uma instabilidade na conexão. Tente de novo em alguns segundos. Se continuar, fale com a gente no
          WhatsApp.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={reset} className={botao("primario", "md")}>
            <RotateCcw className="size-4" aria-hidden />
            Tentar de novo
          </button>
          <a href={whatsappLink(mensagens.geral())} target="_blank" rel="noopener noreferrer" className={botao("whatsapp", "md")}>
            <MessageCircle className="size-4 text-whatsapp" aria-hidden />
            Falar no WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
