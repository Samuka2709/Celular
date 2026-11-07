"use client";

import { Loader2, Plus, X } from "lucide-react";
import { useActionState, useState } from "react";
import { salvarProduto, type EstadoAcao } from "@/app/admin/actions";
import { slugify } from "@/lib/format";
import { botao, cn } from "@/lib/ui";

export interface ProdutoFormDados {
  id: string;
  slug: string;
  nome: string;
  marca: string;
  categoria: "celular" | "acessorio";
  condicao: "novo" | "seminovo";
  descricao: string;
  destaque: boolean;
  ativo: boolean;
  ficha: Record<string, string>;
  seminovo: { saude_bateria?: number; estado?: string; acompanha?: string[]; garantia?: string } | null;
}

const campo =
  "h-11 w-full rounded-lg border border-line-strong bg-canvas px-3 text-sm text-ink placeholder:text-subtle hover:border-muted focus:border-accent focus:outline-none";
const rotulo = "mb-1.5 block text-sm font-medium";

const FICHA_PADRAO = ["Tela", "Processador", "Câmera traseira", "Câmera frontal", "Bateria", "Memória"];

export function ProdutoForm({ produto }: { produto?: ProdutoFormDados }) {
  const [estado, acao, pendente] = useActionState<EstadoAcao, FormData>(salvarProduto, {});
  const [nome, setNome] = useState(produto?.nome ?? "");
  const [slug, setSlug] = useState(produto?.slug ?? "");
  const [slugManual, setSlugManual] = useState(!!produto);
  const [condicao, setCondicao] = useState(produto?.condicao ?? "novo");
  const [ficha, setFicha] = useState<[string, string][]>(
    produto ? Object.entries(produto.ficha) : FICHA_PADRAO.map((k) => [k, ""]),
  );

  return (
    <form action={acao} className="space-y-6">
      {produto && <input type="hidden" name="id" value={produto.id} />}
      <input type="hidden" name="ficha" value={JSON.stringify(Object.fromEntries(ficha.filter(([k, v]) => k.trim() && v.trim())))} />

      <section className="rounded-2xl border border-line bg-card p-5">
        <h2 className="font-display text-lg font-semibold">Dados do produto</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="nome" className={rotulo}>
              Nome
            </label>
            <input
              id="nome"
              name="nome"
              required
              value={nome}
              onChange={(e) => {
                setNome(e.target.value);
                if (!slugManual) setSlug(slugify(e.target.value));
              }}
              placeholder="iPhone 15"
              className={campo}
            />
          </div>
          <div>
            <label htmlFor="slug" className={rotulo}>
              Endereço (slug)
            </label>
            <input
              id="slug"
              name="slug"
              required
              value={slug}
              onChange={(e) => {
                setSlugManual(true);
                setSlug(
                  e.target.value
                    .normalize("NFD")
                    .replace(/[̀-ͯ]/g, "")
                    .toLowerCase()
                    .replace(/[^a-z0-9-]/g, "-"),
                );
              }}
              className={campo}
            />
            <p className="mt-1 text-xs text-subtle">/produto/{slug || "..."}</p>
          </div>
          <div>
            <label htmlFor="marca" className={rotulo}>
              Marca
            </label>
            <input id="marca" name="marca" required defaultValue={produto?.marca} list="marcas" placeholder="Apple" className={campo} />
            <datalist id="marcas">
              {["Apple", "Samsung", "Motorola", "Xiaomi", "Genérica"].map((m) => (
                <option key={m} value={m} />
              ))}
            </datalist>
          </div>
          <div>
            <label htmlFor="categoria" className={rotulo}>
              Categoria
            </label>
            <select id="categoria" name="categoria" defaultValue={produto?.categoria ?? "celular"} className={campo}>
              <option value="celular">Celular</option>
              <option value="acessorio">Acessório</option>
            </select>
          </div>
          <div>
            <label htmlFor="condicao" className={rotulo}>
              Condição
            </label>
            <select
              id="condicao"
              name="condicao"
              value={condicao}
              onChange={(e) => setCondicao(e.target.value as "novo" | "seminovo")}
              className={campo}
            >
              <option value="novo">Novo</option>
              <option value="seminovo">Seminovo</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="descricao" className={rotulo}>
              Descrição
            </label>
            <textarea
              id="descricao"
              name="descricao"
              rows={4}
              defaultValue={produto?.descricao}
              className={cn(campo, "h-auto py-2.5 leading-relaxed")}
            />
          </div>
          <div className="flex flex-wrap gap-6 sm:col-span-2">
            {!produto && (
              <label className="inline-flex min-h-10 cursor-pointer items-center gap-2.5 text-sm">
                <input type="hidden" name="ativo_presente" value="1" />
                <input type="checkbox" name="ativo" defaultChecked className="size-[18px] accent-[var(--color-accent)]" />
                Ativo na loja
              </label>
            )}
            <label className="inline-flex min-h-10 cursor-pointer items-center gap-2.5 text-sm">
              <input type="checkbox" name="destaque" defaultChecked={produto?.destaque} className="size-[18px] accent-[var(--color-accent)]" />
              Destaque na home
            </label>
          </div>
        </div>
      </section>

      {condicao === "seminovo" && (
        <section className="rounded-2xl border border-line bg-card p-5">
          <h2 className="font-display text-lg font-semibold">Seminovo</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="saudeBateria" className={rotulo}>
                Saúde da bateria (%)
              </label>
              <input
                id="saudeBateria"
                name="saudeBateria"
                type="number"
                min={0}
                max={100}
                defaultValue={produto?.seminovo?.saude_bateria}
                className={campo}
              />
            </div>
            <div>
              <label htmlFor="garantia" className={rotulo}>
                Garantia da loja
              </label>
              <input id="garantia" name="garantia" defaultValue={produto?.seminovo?.garantia ?? "90 dias de garantia da loja"} className={campo} />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="estado" className={rotulo}>
                Estado do aparelho
              </label>
              <input id="estado" name="estado" defaultValue={produto?.seminovo?.estado} placeholder="Excelente: sem marcas visíveis de uso" className={campo} />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="acompanha" className={rotulo}>
                O que acompanha (um por linha)
              </label>
              <textarea
                id="acompanha"
                name="acompanha"
                rows={3}
                defaultValue={produto?.seminovo?.acompanha?.join("\n") ?? "Aparelho\nCabo de carregamento"}
                className={cn(campo, "h-auto py-2.5")}
              />
            </div>
          </div>
        </section>
      )}

      <section className="rounded-2xl border border-line bg-card p-5">
        <h2 className="font-display text-lg font-semibold">Ficha técnica</h2>
        <ul className="mt-4 space-y-2">
          {ficha.map(([k, v], i) => (
            <li key={i} className="flex gap-2">
              <label className="sr-only" htmlFor={`ficha-k-${i}`}>
                Item {i + 1}
              </label>
              <input
                id={`ficha-k-${i}`}
                value={k}
                onChange={(e) => setFicha((f) => f.map((x, j) => (j === i ? [e.target.value, x[1]] : x)))}
                placeholder="Item"
                className={cn(campo, "w-2/5")}
              />
              <label className="sr-only" htmlFor={`ficha-v-${i}`}>
                Valor de {k || `item ${i + 1}`}
              </label>
              <input
                id={`ficha-v-${i}`}
                value={v}
                onChange={(e) => setFicha((f) => f.map((x, j) => (j === i ? [x[0], e.target.value] : x)))}
                placeholder="Valor"
                className={cn(campo, "flex-1")}
              />
              <button
                type="button"
                onClick={() => setFicha((f) => f.filter((_, j) => j !== i))}
                aria-label={`Remover ${k || "item"}`}
                className="grid size-11 shrink-0 place-items-center rounded-lg text-muted hover:bg-card-2 hover:text-danger"
              >
                <X className="size-4" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
        <button type="button" onClick={() => setFicha((f) => [...f, ["", ""]])} className={botao("fantasma", "sm", "mt-3")}>
          <Plus className="size-4" aria-hidden />
          Adicionar item
        </button>
      </section>

      <div className="sticky bottom-0 -mx-4 flex items-center gap-4 border-t border-line bg-canvas/95 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-2xl sm:border">
        <button type="submit" disabled={pendente} className={botao("primario", "md")}>
          {pendente && <Loader2 className="size-4 animate-spin" aria-hidden />}
          {produto ? "Salvar produto" : "Criar produto"}
        </button>
        <p aria-live="polite" className={cn("text-sm", estado.erro ? "text-danger" : "text-success")}>
          {estado.erro ?? estado.msg ?? ""}
        </p>
      </div>
    </form>
  );
}
