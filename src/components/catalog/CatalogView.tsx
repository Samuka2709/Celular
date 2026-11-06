"use client";

import { SearchX, SlidersHorizontal, X } from "lucide-react";
import { useMemo, useState } from "react";
import type { Condicao, Product } from "@/lib/types";
import { botao, cn } from "@/lib/ui";
import { ProductGrid } from "../product/ProductCard";
import { Drawer } from "../ui/Drawer";

type Ordem = "mais-vendidos" | "menor-preco" | "maior-preco" | "lancamentos";

const ORDENS: { valor: Ordem; label: string }[] = [
  { valor: "mais-vendidos", label: "Mais vendidos" },
  { valor: "menor-preco", label: "Menor preço" },
  { valor: "maior-preco", label: "Maior preço" },
  { valor: "lancamentos", label: "Lançamentos" },
];

const FAIXAS = [
  { id: "todas", label: "Qualquer preço", min: 0, max: Infinity },
  { id: "ate-1500", label: "Até R$ 1.500", min: 0, max: 1500 },
  { id: "1500-3000", label: "R$ 1.500 a R$ 3.000", min: 1500, max: 3000 },
  { id: "3000-5000", label: "R$ 3.000 a R$ 5.000", min: 3000, max: 5000 },
  { id: "acima-5000", label: "Acima de R$ 5.000", min: 5000, max: Infinity },
] as const;

const FAIXAS_ACESSORIO = [
  { id: "todas", label: "Qualquer preço", min: 0, max: Infinity },
  { id: "ate-50", label: "Até R$ 50", min: 0, max: 50 },
  { id: "50-150", label: "R$ 50 a R$ 150", min: 50, max: 150 },
  { id: "acima-150", label: "Acima de R$ 150", min: 150, max: Infinity },
] as const;

function normalizar(t: string) {
  return t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

interface Filtros {
  marcas: string[];
  armazenamentos: string[];
  condicao: "todas" | Condicao;
  faixa: string;
  soDisponiveis: boolean;
}

const VAZIO: Filtros = { marcas: [], armazenamentos: [], condicao: "todas", faixa: "todas", soDisponiveis: false };

export function CatalogView({
  products,
  busca,
  marcaInicial,
  condicaoInicial,
  tipo = "celular",
}: {
  products: Product[];
  busca?: string;
  marcaInicial?: string;
  condicaoInicial?: Condicao;
  tipo?: "celular" | "acessorio" | "misto";
}) {
  const [filtros, setFiltros] = useState<Filtros>({
    ...VAZIO,
    marcas: marcaInicial ? [marcaInicial] : [],
    condicao: condicaoInicial ?? "todas",
  });
  const [ordem, setOrdem] = useState<Ordem>("mais-vendidos");
  const [gaveta, setGaveta] = useState(false);

  const faixas = tipo === "acessorio" ? FAIXAS_ACESSORIO : FAIXAS;
  const marcas = useMemo(() => [...new Set(products.map((p) => p.marca))].sort(), [products]);
  const armazenamentos = useMemo(
    () =>
      [...new Set(products.flatMap((p) => p.variants.map((v) => v.armazenamento)).filter((a): a is string => !!a))].sort(
        (a, b) => parseInt(a) - parseInt(b),
      ),
    [products],
  );
  const temSeminovo = products.some((p) => p.condicao === "seminovo");

  const resultado = useMemo(() => {
    const faixa = faixas.find((f) => f.id === filtros.faixa) ?? faixas[0];
    const termo = busca ? normalizar(busca) : "";
    const lista = products
      .map((p) => {
        const variantes = p.variants.filter(
          (v) =>
            (!filtros.armazenamentos.length || (v.armazenamento && filtros.armazenamentos.includes(v.armazenamento))) &&
            (!filtros.soDisponiveis || v.estoque > 0),
        );
        const menor = variantes.length ? Math.min(...variantes.map((v) => v.preco)) : Infinity;
        return { p, variantes, menor };
      })
      .filter(({ p, variantes, menor }) => {
        if (!variantes.length) return false;
        if (filtros.marcas.length && !filtros.marcas.includes(p.marca)) return false;
        if (filtros.condicao !== "todas" && p.condicao !== filtros.condicao) return false;
        if (menor < faixa.min || menor > faixa.max) return false;
        if (termo && !normalizar(`${p.nome} ${p.marca} ${p.descricao} ${p.categoria}`).includes(termo)) return false;
        return true;
      });

    const disponivel = (p: Product) => (p.variants.some((v) => v.estoque > 0) ? 0 : 1);
    lista.sort((a, b) => {
      const d = disponivel(a.p) - disponivel(b.p);
      if (d) return d;
      switch (ordem) {
        case "menor-preco":
          return a.menor - b.menor;
        case "maior-preco":
          return b.menor - a.menor;
        case "lancamentos":
          return b.p.createdAt.localeCompare(a.p.createdAt);
        default:
          return b.p.vendas - a.p.vendas;
      }
    });
    return lista.map((x) => x.p);
  }, [products, filtros, ordem, busca, faixas]);

  const ativos: { label: string; remover: () => void }[] = [
    ...filtros.marcas.map((m) => ({
      label: m,
      remover: () => setFiltros((f) => ({ ...f, marcas: f.marcas.filter((x) => x !== m) })),
    })),
    ...filtros.armazenamentos.map((a) => ({
      label: a,
      remover: () => setFiltros((f) => ({ ...f, armazenamentos: f.armazenamentos.filter((x) => x !== a) })),
    })),
    ...(filtros.condicao !== "todas"
      ? [{ label: filtros.condicao === "novo" ? "Novos" : "Seminovos", remover: () => setFiltros((f) => ({ ...f, condicao: "todas" })) }]
      : []),
    ...(filtros.faixa !== "todas"
      ? [
          {
            label: faixas.find((x) => x.id === filtros.faixa)?.label ?? "",
            remover: () => setFiltros((f) => ({ ...f, faixa: "todas" })),
          },
        ]
      : []),
    ...(filtros.soDisponiveis
      ? [{ label: "Só disponíveis", remover: () => setFiltros((f) => ({ ...f, soDisponiveis: false })) }]
      : []),
  ];

  const toggle = (campo: "marcas" | "armazenamentos", valor: string) =>
    setFiltros((f) => ({
      ...f,
      [campo]: f[campo].includes(valor) ? f[campo].filter((x) => x !== valor) : [...f[campo], valor],
    }));

  const painel = (p: string) => (
    <div className="space-y-8">
      <label className="flex min-h-11 cursor-pointer items-center justify-between gap-4">
        <span className="text-sm font-medium text-ink">Só disponíveis</span>
        <span className="relative inline-flex">
          <input
            type="checkbox"
            className="peer sr-only"
            checked={filtros.soDisponiveis}
            onChange={(e) => setFiltros((f) => ({ ...f, soDisponiveis: e.target.checked }))}
          />
          <span className="h-6 w-11 rounded-full bg-line-strong transition-colors duration-150 peer-checked:bg-accent peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent" />
          <span className="absolute left-0.5 top-0.5 size-5 rounded-full bg-ink shadow transition-transform duration-200 ease-out peer-checked:translate-x-5" />
        </span>
      </label>

      {marcas.length > 1 && (
        <fieldset>
          <legend className="font-display text-sm font-semibold text-ink">Marca</legend>
          <div className="mt-3 space-y-1">
            {marcas.map((m) => {
              const qtd = products.filter((p) => p.marca === m).length;
              return (
                <label key={m} className="flex min-h-10 cursor-pointer items-center gap-3 text-sm text-muted hover:text-ink">
                  <input
                    type="checkbox"
                    checked={filtros.marcas.includes(m)}
                    onChange={() => toggle("marcas", m)}
                    className="size-[18px] cursor-pointer rounded accent-[var(--color-accent)]"
                  />
                  <span className="flex-1 text-ink">{m}</span>
                  <span className="tabular-nums text-xs text-subtle">{qtd}</span>
                </label>
              );
            })}
          </div>
        </fieldset>
      )}

      {armazenamentos.length > 0 && (
        <fieldset>
          <legend className="font-display text-sm font-semibold text-ink">Armazenamento</legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {armazenamentos.map((a) => {
              const ativo = filtros.armazenamentos.includes(a);
              return (
                <label
                  key={a}
                  className={cn(
                    "inline-flex h-10 cursor-pointer items-center rounded-lg border px-3 text-sm tabular-nums transition-[border-color,background-color] duration-150",
                    ativo ? "border-accent bg-accent/10 text-ink" : "border-line-strong text-muted hover:border-muted hover:text-ink",
                    "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent",
                  )}
                >
                  <input type="checkbox" className="sr-only" checked={ativo} onChange={() => toggle("armazenamentos", a)} />
                  {a}
                </label>
              );
            })}
          </div>
        </fieldset>
      )}

      {temSeminovo && (
        <fieldset>
          <legend className="font-display text-sm font-semibold text-ink">Condição</legend>
          <div className="mt-3 grid grid-cols-3 gap-1 rounded-xl border border-line-strong p-1">
            {(
              [
                ["todas", "Todos"],
                ["novo", "Novos"],
                ["seminovo", "Seminovos"],
              ] as const
            ).map(([valor, label]) => (
              <label
                key={valor}
                className={cn(
                  "grid h-9 cursor-pointer place-items-center rounded-lg text-sm transition-colors duration-150",
                  filtros.condicao === valor ? "bg-card-2 font-semibold text-ink" : "text-muted hover:text-ink",
                  "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-accent",
                )}
              >
                <input
                  type="radio"
                  name={`${p}-condicao`}
                  className="sr-only"
                  checked={filtros.condicao === valor}
                  onChange={() => setFiltros((f) => ({ ...f, condicao: valor }))}
                />
                {label}
              </label>
            ))}
          </div>
        </fieldset>
      )}

      <fieldset>
        <legend className="font-display text-sm font-semibold text-ink">Faixa de preço</legend>
        <div className="mt-3 space-y-1">
          {faixas.map((f) => (
            <label key={f.id} className="flex min-h-10 cursor-pointer items-center gap-3 text-sm text-ink">
              <input
                type="radio"
                name={`${p}-faixa`}
                checked={filtros.faixa === f.id}
                onChange={() => setFiltros((x) => ({ ...x, faixa: f.id }))}
                className="size-[18px] cursor-pointer accent-[var(--color-accent)]"
              />
              {f.label}
            </label>
          ))}
        </div>
      </fieldset>
    </div>
  );

  return (
    <div className="grid gap-8 lg:grid-cols-[240px_1fr] lg:gap-10">
      <aside aria-label="Filtros" className="hidden lg:block">
        <div className="sticky top-24">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Filtros</h2>
            {ativos.length > 0 && (
              <button type="button" onClick={() => setFiltros(VAZIO)} className="text-sm text-muted underline underline-offset-4 hover:text-ink">
                Limpar
              </button>
            )}
          </div>
          {painel("lateral")}
        </div>
      </aside>

      <div>
        <div className="mb-5 flex items-center gap-3">
          <button
            type="button"
            onClick={() => setGaveta(true)}
            className={botao("secundario", "sm", "lg:hidden")}
            aria-haspopup="dialog"
          >
            <SlidersHorizontal className="size-4" aria-hidden />
            Filtros
            {ativos.length > 0 && (
              <span className="grid size-5 place-items-center rounded-full bg-accent text-[11px] font-bold text-canvas">
                {ativos.length}
              </span>
            )}
          </button>
          <p className="hidden text-sm text-muted lg:block" aria-live="polite">
            {resultado.length} {resultado.length === 1 ? "produto" : "produtos"}
          </p>
          <label className="ml-auto flex items-center gap-2 text-sm text-muted">
            <span className="hidden sm:inline">Ordenar por</span>
            <span className="sr-only sm:hidden">Ordenar por</span>
            <select
              value={ordem}
              onChange={(e) => setOrdem(e.target.value as Ordem)}
              className="h-10 cursor-pointer rounded-lg border border-line-strong bg-card px-3 pr-8 text-sm text-ink hover:border-muted focus:border-accent focus:outline-none"
            >
              {ORDENS.map((o) => (
                <option key={o.valor} value={o.valor}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {ativos.length > 0 && (
          <ul className="mb-5 flex flex-wrap gap-2" aria-label="Filtros ativos">
            {ativos.map((a) => (
              <li key={a.label}>
                <button
                  type="button"
                  onClick={a.remover}
                  className="inline-flex h-8 items-center gap-1.5 rounded-full border border-line-strong bg-card pl-3 pr-2 text-xs font-medium text-ink transition-colors duration-150 hover:border-muted"
                  aria-label={`Remover filtro ${a.label}`}
                >
                  {a.label}
                  <X className="size-3.5 text-muted" aria-hidden />
                </button>
              </li>
            ))}
            <li>
              <button
                type="button"
                onClick={() => setFiltros(VAZIO)}
                className="inline-flex h-8 items-center px-2 text-xs font-medium text-muted underline underline-offset-4 hover:text-ink"
              >
                Limpar tudo
              </button>
            </li>
          </ul>
        )}

        <p className="mb-4 text-sm text-muted lg:hidden" aria-live="polite">
          {resultado.length} {resultado.length === 1 ? "produto" : "produtos"}
        </p>

        {resultado.length ? (
          <ProductGrid products={resultado} prioridade={4} />
        ) : (
          <div className="grid place-items-center rounded-2xl border border-dashed border-line-strong px-6 py-16 text-center">
            <SearchX className="size-10 text-subtle" strokeWidth={1.5} aria-hidden />
            <p className="mt-4 font-display text-lg font-semibold">Nenhum produto encontrado</p>
            <p className="mt-1 max-w-sm text-sm text-muted">
              {busca ? `Não achamos nada para "${busca}" com esses filtros.` : "Nenhum produto combina com os filtros escolhidos."}{" "}
              Tente remover algum filtro ou fale com a gente no WhatsApp.
            </p>
            {ativos.length > 0 && (
              <button type="button" onClick={() => setFiltros(VAZIO)} className={botao("secundario", "sm", "mt-6")}>
                Limpar filtros
              </button>
            )}
          </div>
        )}
      </div>

      <Drawer
        open={gaveta}
        onClose={() => setGaveta(false)}
        titulo="Filtros"
        rodape={
          <div className="flex gap-3">
            <button type="button" onClick={() => setFiltros(VAZIO)} className={botao("secundario", "md")}>
              Limpar
            </button>
            <button type="button" onClick={() => setGaveta(false)} className={botao("primario", "md", "flex-1")}>
              Ver {resultado.length} {resultado.length === 1 ? "produto" : "produtos"}
            </button>
          </div>
        }
      >
        <div className="p-4">{painel("gaveta")}</div>
      </Drawer>
    </div>
  );
}
