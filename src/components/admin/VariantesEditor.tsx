"use client";

import { Loader2, Plus, Trash2, Undo2 } from "lucide-react";
import { useState, useTransition } from "react";
import { salvarVariacoes } from "@/app/admin/actions";
import { botao, cn } from "@/lib/ui";

export interface VarianteLinha {
  id?: string;
  cor: string;
  cor_hex: string;
  armazenamento: string;
  preco: string;
  preco_antigo: string;
  preco_pix: string;
  estoque: string;
  reservado: number;
  sku: string;
  remover?: boolean;
}

const cel =
  "h-10 w-full min-w-0 rounded-md border border-line-strong bg-canvas px-2.5 text-sm text-ink tabular-nums placeholder:text-subtle hover:border-muted focus:border-accent focus:outline-none";

/** Aceita "1.299,90", "1299,90" e "1299.90" */
const num = (v: string) => {
  let t = v.trim().replace(/\s|R\$/g, "");
  if (t === "") return null;
  if (t.includes(",")) t = t.replace(/\./g, "").replace(",", ".");
  const n = Number(t);
  return Number.isFinite(n) ? n : NaN;
};


export function VariantesEditor({ productId, iniciais }: { productId: string; iniciais: VarianteLinha[] }) {
  const [linhas, setLinhas] = useState<VarianteLinha[]>(
    iniciais.length
      ? iniciais
      : [{ cor: "", cor_hex: "#26262a", armazenamento: "", preco: "", preco_antigo: "", preco_pix: "", estoque: "0", reservado: 0, sku: "" }],
  );
  const [pendente, iniciar] = useTransition();
  const [resultado, setResultado] = useState<{ erro?: string; msg?: string } | null>(null);
  const [sujo, setSujo] = useState(false);

  const atualizar = (i: number, campo: keyof VarianteLinha, valor: string | boolean) => {
    setSujo(true);
    setResultado(null);
    setLinhas((l) => l.map((x, j) => (j === i ? { ...x, [campo]: valor } : x)));
  };

  function salvar() {
    const payload = linhas
      .filter((l) => l.id || !l.remover)
      .map((l) => ({
        id: l.id,
        cor: l.cor,
        cor_hex: l.cor_hex,
        armazenamento: l.armazenamento.trim() || null,
        preco: num(l.preco) ?? 0,
        preco_antigo: num(l.preco_antigo),
        preco_pix: num(l.preco_pix),
        estoque: Math.trunc(num(l.estoque) ?? 0),
        sku: l.sku.trim() || null,
        remover: l.remover,
      }));
    iniciar(async () => {
      const r = await salvarVariacoes(productId, payload);
      setResultado(r);
      if (r.ok) setSujo(false);
    });
  }

  return (
    <section aria-labelledby="variacoes" className="rounded-2xl border border-line bg-card p-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="variacoes" className="font-display text-lg font-semibold">
            Variações e estoque
          </h2>
          <p className="mt-1 text-sm text-muted">
            Preço Pix em branco = 5% de desconto automático. &quot;Reservado&quot; são unidades em pedidos aguardando pagamento.
          </p>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[860px] text-sm">
          <thead className="text-left text-xs text-muted">
            <tr>
              <th className="w-[160px] pb-2 pr-2 font-medium">Cor</th>
              <th className="w-[100px] pb-2 pr-2 font-medium">Armazen.</th>
              <th className="pb-2 pr-2 font-medium">Preço</th>
              <th className="pb-2 pr-2 font-medium">Preço antigo</th>
              <th className="pb-2 pr-2 font-medium">Preço Pix</th>
              <th className="w-[80px] pb-2 pr-2 font-medium">Estoque</th>
              <th className="w-[70px] pb-2 pr-2 font-medium">Reserv.</th>
              <th className="pb-2 pr-2 font-medium">SKU</th>
              <th className="w-10 pb-2" />
            </tr>
          </thead>
          <tbody>
            {linhas.map((l, i) => (
              <tr key={l.id ?? `nova-${i}`} className={cn("align-middle", l.remover && "opacity-40")}>
                <td className="py-1 pr-2">
                  <div className="flex gap-1.5">
                    <input
                      type="color"
                      value={l.cor_hex}
                      onChange={(e) => atualizar(i, "cor_hex", e.target.value)}
                      aria-label={`Amostra da cor da linha ${i + 1}`}
                      className="h-10 w-10 shrink-0 cursor-pointer rounded-md border border-line-strong bg-canvas p-1"
                    />
                    <input value={l.cor} onChange={(e) => atualizar(i, "cor", e.target.value)} placeholder="Preto" aria-label={`Cor da linha ${i + 1}`} className={cel} />
                  </div>
                </td>
                <td className="py-1 pr-2">
                  <input value={l.armazenamento} onChange={(e) => atualizar(i, "armazenamento", e.target.value)} placeholder="128 GB" aria-label={`Armazenamento da linha ${i + 1}`} className={cel} />
                </td>
                <td className="py-1 pr-2">
                  <input inputMode="decimal" value={l.preco} onChange={(e) => atualizar(i, "preco", e.target.value)} placeholder="0,00" aria-label={`Preço da linha ${i + 1}`} className={cel} />
                </td>
                <td className="py-1 pr-2">
                  <input inputMode="decimal" value={l.preco_antigo} onChange={(e) => atualizar(i, "preco_antigo", e.target.value)} placeholder="opcional" aria-label={`Preço antigo da linha ${i + 1}`} className={cel} />
                </td>
                <td className="py-1 pr-2">
                  <input inputMode="decimal" value={l.preco_pix} onChange={(e) => atualizar(i, "preco_pix", e.target.value)} placeholder="auto" aria-label={`Preço Pix da linha ${i + 1}`} className={cel} />
                </td>
                <td className="py-1 pr-2">
                  <input inputMode="numeric" value={l.estoque} onChange={(e) => atualizar(i, "estoque", e.target.value.replace(/\D/g, ""))} aria-label={`Estoque da linha ${i + 1}`} className={cel} />
                </td>
                <td className="py-1 pr-2 text-center tabular-nums text-muted">{l.reservado || "-"}</td>
                <td className="py-1 pr-2">
                  <input value={l.sku} onChange={(e) => atualizar(i, "sku", e.target.value)} placeholder="opcional" aria-label={`SKU da linha ${i + 1}`} className={cel} />
                </td>
                <td className="py-1">
                  <button
                    type="button"
                    onClick={() => (l.id ? atualizar(i, "remover", !l.remover) : setLinhas((x) => x.filter((_, j) => j !== i)))}
                    aria-label={l.remover ? "Desfazer remoção" : `Remover linha ${i + 1}`}
                    title={l.remover ? "Desfazer" : "Remover"}
                    className="grid size-10 place-items-center rounded-md text-muted hover:bg-card-2 hover:text-danger"
                  >
                    {l.remover ? <Undo2 className="size-4" aria-hidden /> : <Trash2 className="size-4" aria-hidden />}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => {
            const ult = linhas[linhas.length - 1];
            setSujo(true);
            setLinhas((l) => [
              ...l,
              {
                cor: ult?.cor ?? "",
                cor_hex: ult?.cor_hex ?? "#26262a",
                armazenamento: "",
                preco: "",
                preco_antigo: "",
                preco_pix: "",
                estoque: "0",
                reservado: 0,
                sku: "",
              },
            ]);
          }}
          className={botao("secundario", "sm")}
        >
          <Plus className="size-4" aria-hidden />
          Adicionar variação
        </button>
        <button type="button" onClick={salvar} disabled={pendente || !sujo} className={botao("primario", "sm")}>
          {pendente && <Loader2 className="size-4 animate-spin" aria-hidden />}
          Salvar variações
        </button>
        <p aria-live="polite" className={cn("text-sm", resultado?.erro ? "text-danger" : "text-success")}>
          {resultado?.erro ?? resultado?.msg ?? (sujo ? <span className="text-muted">Alterações não salvas</span> : "")}
        </p>
      </div>
    </section>
  );
}
