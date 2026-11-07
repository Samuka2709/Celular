"use client";

import { Loader2, Trash2 } from "lucide-react";
import { useActionState, useEffect, useRef, useTransition } from "react";
import { removerZona, salvarZona, type EstadoAcao } from "@/app/admin/actions";
import { botao, cn } from "@/lib/ui";

const campo =
  "h-10 w-full rounded-md border border-line-strong bg-canvas px-2.5 text-sm text-ink placeholder:text-subtle hover:border-muted focus:border-accent focus:outline-none";

export function ZonaForm({
  zona,
}: {
  zona?: { id: string; cidade: string; bairro: string; taxa: string; prazo: string; ativo: boolean };
}) {
  const [estado, acao, pendente] = useActionState<EstadoAcao, FormData>(salvarZona, {});
  const [removendo, iniciar] = useTransition();
  const form = useRef<HTMLFormElement>(null);
  const sufixo = zona?.id ?? "nova";

  useEffect(() => {
    if (!zona && estado.ok) form.current?.reset();
  }, [estado, zona]);

  return (
    <form
      ref={form}
      action={acao}
      className="grid grid-cols-2 items-end gap-2 rounded-xl border border-line bg-card p-3 sm:grid-cols-[1.2fr_1.2fr_0.7fr_1.6fr_auto_auto]"
    >
      {zona && <input type="hidden" name="id" value={zona.id} />}
      <div>
        <label htmlFor={`cidade-${sufixo}`} className="mb-1 block text-xs text-muted">
          Cidade
        </label>
        <input id={`cidade-${sufixo}`} name="cidade" required defaultValue={zona?.cidade} placeholder="Ilhéus" className={campo} />
      </div>
      <div>
        <label htmlFor={`bairro-${sufixo}`} className="mb-1 block text-xs text-muted">
          Bairro (opcional)
        </label>
        <input id={`bairro-${sufixo}`} name="bairro" defaultValue={zona?.bairro} placeholder="Todos" className={campo} />
      </div>
      <div>
        <label htmlFor={`taxa-${sufixo}`} className="mb-1 block text-xs text-muted">
          Taxa (R$)
        </label>
        <input id={`taxa-${sufixo}`} name="taxa" required inputMode="decimal" defaultValue={zona?.taxa} placeholder="12,00" className={cn(campo, "tabular-nums")} />
      </div>
      <div>
        <label htmlFor={`prazo-${sufixo}`} className="mb-1 block text-xs text-muted">
          Prazo
        </label>
        <input id={`prazo-${sufixo}`} name="prazo" defaultValue={zona?.prazo} placeholder="No mesmo dia" className={campo} />
      </div>
      <label className="inline-flex h-10 cursor-pointer items-center gap-2 text-sm">
        <input type="checkbox" name="ativo" defaultChecked={zona?.ativo ?? true} className="size-[18px] accent-[var(--color-accent)]" />
        Ativa
      </label>
      <div className="flex items-center gap-1">
        <button type="submit" disabled={pendente} className={botao(zona ? "secundario" : "primario", "sm")}>
          {pendente && <Loader2 className="size-4 animate-spin" aria-hidden />}
          {zona ? "Salvar" : "Adicionar"}
        </button>
        {zona && (
          <button
            type="button"
            disabled={removendo}
            onClick={() => {
              if (window.confirm(`Remover a taxa de ${zona.bairro || zona.cidade}?`)) iniciar(() => removerZona(zona.id));
            }}
            aria-label={`Remover taxa de ${zona.bairro || zona.cidade}`}
            className="grid size-10 place-items-center rounded-md text-muted hover:bg-danger/10 hover:text-danger"
          >
            <Trash2 className="size-4" aria-hidden />
          </button>
        )}
      </div>
      {(estado.erro || estado.msg) && (
        <p aria-live="polite" className={cn("col-span-full text-sm", estado.erro ? "text-danger" : "text-success")}>
          {estado.erro ?? estado.msg}
        </p>
      )}
    </form>
  );
}
