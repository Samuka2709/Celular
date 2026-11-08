"use client";

import { formatBRL } from "@/lib/format";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/ui";

export function opcoesDeCor(product: Product) {
  const mapa = new Map<string, { cor: string; hex: string; disponivel: boolean }>();
  for (const v of product.variants) {
    const atual = mapa.get(v.cor);
    mapa.set(v.cor, { cor: v.cor, hex: v.corHex, disponivel: (atual?.disponivel ?? false) || v.estoque > 0 });
  }
  return [...mapa.values()];
}

export function opcoesDeArmazenamento(product: Product, cor: string) {
  const todos = [...new Set(product.variants.map((v) => v.armazenamento).filter((a): a is string => !!a))];
  todos.sort((a, b) => parseInt(a) - parseInt(b));
  return todos.map((a) => {
    const v = product.variants.find((x) => x.cor === cor && x.armazenamento === a);
    return { armazenamento: a, existe: !!v, disponivel: !!v && v.estoque > 0, preco: v?.preco };
  });
}

/** Diferença de preço de um armazenamento em relação ao mais barato da mesma cor */
function diferenca(precos: (number | undefined)[], preco?: number) {
  const validos = precos.filter((p): p is number => p != null);
  if (preco == null || !validos.length) return null;
  const base = Math.min(...validos);
  return preco > base ? "+" + formatBRL(preco - base).replace(",00", "") : null;
}

/** Linha diagonal que "risca" uma opção esgotada */
function Risco({ claro = false }: { claro?: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        "pointer-events-none absolute left-1/2 top-1/2 h-px w-[130%] -translate-x-1/2 -translate-y-1/2 -rotate-[28deg]",
        claro ? "bg-ink/70" : "bg-muted",
      )}
    />
  );
}

export function VariantSelector({
  product,
  cor,
  armazenamento,
  onCor,
  onArmazenamento,
}: {
  product: Product;
  cor: string;
  armazenamento: string | null;
  onCor: (cor: string) => void;
  onArmazenamento: (a: string) => void;
}) {
  const cores = opcoesDeCor(product);
  const armazenamentos = opcoesDeArmazenamento(product, cor);

  return (
    <div className="space-y-6">
      <fieldset>
        <legend className="text-sm text-muted">
          Cor: <span className="font-medium text-ink">{cor}</span>
        </legend>
        <div className="mt-3 flex flex-wrap gap-3">
          {cores.map((c) => {
            const ativo = c.cor === cor;
            return (
              <label
                key={c.cor}
                title={c.disponivel ? c.cor : `${c.cor} (esgotado)`}
                className={cn(
                  "relative grid size-11 place-items-center rounded-full border-2 transition-[border-color,transform] duration-150",
                  ativo ? "border-accent" : "border-transparent",
                  c.disponivel ? "cursor-pointer hover:border-line-strong active:scale-95" : "cursor-not-allowed opacity-60",
                  ativo && "hover:border-accent",
                  "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent",
                )}
              >
                <input
                  type="radio"
                  name={`cor-${product.id}`}
                  value={c.cor}
                  checked={ativo}
                  disabled={!c.disponivel}
                  onChange={() => onCor(c.cor)}
                  className="sr-only"
                  aria-label={c.disponivel ? c.cor : `${c.cor}, esgotado`}
                />
                <span
                  aria-hidden
                  className="relative size-8 overflow-hidden rounded-full border border-white/15"
                  style={{ backgroundColor: c.hex }}
                >
                  {!c.disponivel && <Risco claro />}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      {armazenamentos.length > 0 && (
        <fieldset>
          <legend className="text-sm text-muted">
            Armazenamento: <span className="font-medium text-ink">{armazenamento}</span>
          </legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {armazenamentos.map((a) => {
              const ativo = a.armazenamento === armazenamento;
              return (
                <label
                  key={a.armazenamento}
                  className={cn(
                    "relative inline-flex min-h-11 py-1.5 min-w-[88px] items-center justify-center overflow-hidden rounded-xl border px-4 text-sm font-medium tabular-nums",
                    "transition-[border-color,background-color,color,transform] duration-150",
                    ativo ? "border-accent bg-accent/10 text-ink" : "border-line-strong text-ink",
                    a.disponivel
                      ? "cursor-pointer hover:border-muted active:scale-[0.97]"
                      : "cursor-not-allowed text-subtle",
                    ativo && "hover:border-accent",
                    "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent",
                  )}
                >
                  <input
                    type="radio"
                    name={`armazenamento-${product.id}`}
                    value={a.armazenamento}
                    checked={ativo}
                    disabled={!a.disponivel}
                    onChange={() => onArmazenamento(a.armazenamento)}
                    className="sr-only"
                    aria-label={
                      a.disponivel
                        ? a.armazenamento
                        : `${a.armazenamento}, ${a.existe ? "esgotado" : "indisponível nesta cor"}`
                    }
                  />
                  <span className="flex flex-col items-center leading-tight">
                    <span className={cn(!a.disponivel && "line-through decoration-muted")}>{a.armazenamento}</span>
                    {a.disponivel && diferenca(armazenamentos.map((x) => x.preco), a.preco) && (
                      <span className="text-[11px] font-normal text-muted">{diferenca(armazenamentos.map((x) => x.preco), a.preco)}</span>
                    )}
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>
      )}
    </div>
  );
}
