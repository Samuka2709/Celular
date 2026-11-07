"use client";

import { Copy, ExternalLink, Loader2 } from "lucide-react";
import { useTransition } from "react";
import { alternarAtivo, duplicarProduto } from "@/app/admin/actions";
import { cn } from "@/lib/ui";

export function ProdutoLinhaAcoes({ id, ativo, slug }: { id: string; ativo: boolean; slug: string }) {
  const [pendente, iniciar] = useTransition();
  return (
    <div className="flex shrink-0 items-center gap-1">
      <label className="inline-flex cursor-pointer items-center gap-2 px-1" title={ativo ? "Ativo na loja" : "Desativado"}>
        <span className="sr-only">{ativo ? "Desativar" : "Ativar"} produto</span>
        <span className="relative inline-flex">
          <input
            type="checkbox"
            className="peer sr-only"
            checked={ativo}
            disabled={pendente}
            onChange={(e) => iniciar(() => alternarAtivo(id, e.target.checked))}
          />
          <span className="h-6 w-11 rounded-full bg-line-strong transition-colors duration-150 peer-checked:bg-accent peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent" />
          <span className="absolute left-0.5 top-0.5 size-5 rounded-full bg-ink transition-transform duration-200 peer-checked:translate-x-5" />
        </span>
      </label>
      <button
        type="button"
        disabled={pendente}
        onClick={() => iniciar(() => duplicarProduto(id))}
        aria-label="Duplicar produto"
        title="Duplicar"
        className="grid size-10 place-items-center rounded-lg text-muted hover:bg-card-2 hover:text-ink"
      >
        {pendente ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Copy className="size-4" aria-hidden />}
      </button>
      <a
        href={`/produto/${slug}`}
        target="_blank"
        aria-label="Ver na loja"
        title="Ver na loja"
        className={cn("hidden size-10 place-items-center rounded-lg text-muted hover:bg-card-2 hover:text-ink sm:grid", !ativo && "pointer-events-none opacity-40")}
      >
        <ExternalLink className="size-4" aria-hidden />
      </a>
    </div>
  );
}
