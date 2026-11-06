"use client";

import { ArrowRight, Lock, ShoppingBag, Store, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/lib/cart";
import { formatBRL, parcelamento } from "@/lib/format";
import { botao } from "@/lib/ui";
import { Skeleton } from "../ui/Skeleton";
import { QuantityStepper } from "./QuantityStepper";

export function CartView() {
  const { items, hydrated, subtotal, subtotalPix, setQuantidade, remove } = useCart();

  if (!hydrated) {
    return (
      <div role="status" aria-label="Carregando carrinho" className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-3">
          {[0, 1].map((i) => (
            <Skeleton key={i} className="h-32 w-full rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-72 w-full rounded-2xl" />
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="grid place-items-center rounded-3xl border border-dashed border-line-strong px-6 py-20 text-center">
        <ShoppingBag className="size-12 text-subtle" strokeWidth={1.25} aria-hidden />
        <h2 className="mt-5 font-display text-2xl font-semibold">Seu carrinho está vazio</h2>
        <p className="mt-2 max-w-sm text-muted">Veja os mais vendidos ou os seminovos revisados com garantia da loja.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/celulares" className={botao("primario", "md")}>
            Ver celulares
          </Link>
          <Link href="/acessorios" className={botao("secundario", "md")}>
            Ver acessórios
          </Link>
        </div>
      </div>
    );
  }

  const parc = parcelamento(subtotal);

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_380px] lg:items-start">
      <section aria-label="Itens do carrinho">
        <ul className="divide-y divide-line rounded-2xl border border-line bg-card">
          {items.map((item) => (
            <li key={item.variantId} className="flex gap-4 p-4 sm:p-5">
              <Link
                href={`/produto/${item.slug}`}
                className="relative size-24 shrink-0 overflow-hidden rounded-xl bg-canvas sm:size-28"
                tabIndex={-1}
                aria-hidden
              >
                <Image src={item.imagem} alt="" fill sizes="112px" className="object-contain p-2" />
              </Link>
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link href={`/produto/${item.slug}`} className="font-display font-semibold leading-snug hover:text-accent">
                      {item.nome}
                    </Link>
                    <p className="mt-0.5 text-sm text-muted">{[item.cor, item.armazenamento].filter(Boolean).join(" · ")}</p>
                  </div>
                  <p className="shrink-0 text-right font-semibold tabular-nums">{formatBRL(item.preco * item.quantidade)}</p>
                </div>
                <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-3">
                  <QuantityStepper
                    valor={item.quantidade}
                    max={item.estoqueMax}
                    nome={item.nome}
                    onChange={(n) => setQuantidade(item.variantId, n)}
                  />
                  <button
                    type="button"
                    onClick={() => remove(item.variantId)}
                    className="inline-flex h-10 items-center gap-1.5 rounded-lg px-2 text-sm text-muted transition-colors duration-150 hover:bg-card-2 hover:text-danger"
                    aria-label={`Remover ${item.nome} do carrinho`}
                  >
                    <Trash2 className="size-4" aria-hidden />
                    <span className="hidden sm:inline">Remover</span>
                  </button>
                </div>
                {item.quantidade >= item.estoqueMax && (
                  <p className="mt-2 text-xs text-accent">
                    {item.estoqueMax === 1 ? "Só temos 1 unidade desta variação." : `Máximo de ${item.estoqueMax} unidades em estoque.`}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
        <Link href="/celulares" className="mt-4 inline-flex h-11 items-center text-sm font-medium text-muted underline underline-offset-4 hover:text-ink">
          Continuar comprando
        </Link>
      </section>

      <aside aria-labelledby="resumo" className="rounded-2xl border border-line bg-card p-5 sm:p-6 lg:sticky lg:top-24">
        <h2 id="resumo" className="font-display text-lg font-semibold">
          Resumo
        </h2>
        <dl className="mt-5 space-y-3 text-sm tabular-nums">
          <div className="flex justify-between">
            <dt className="text-muted">Subtotal</dt>
            <dd>{formatBRL(subtotal)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Entrega</dt>
            <dd className="text-right text-muted">Calculada no checkout</dd>
          </div>
          <div className="flex items-baseline justify-between border-t border-line pt-4">
            <dt className="font-semibold">Total</dt>
            <dd className="font-display text-2xl font-semibold">{formatBRL(subtotal)}</dd>
          </div>
        </dl>
        <p className="mt-2 text-right text-sm tabular-nums text-accent">
          ou <strong>{formatBRL(subtotalPix)}</strong> no Pix
        </p>
        {parc && (
          <p className="text-right text-xs tabular-nums text-muted">
            ou {parc.parcelas}x de {formatBRL(parc.valor)} sem juros
          </p>
        )}
        <Link href="/checkout" className={botao("primario", "lg", "mt-6 w-full")}>
          Finalizar compra
          <ArrowRight className="size-5" aria-hidden />
        </Link>
        <ul className="mt-5 space-y-2 text-xs text-muted">
          <li className="flex items-center gap-2">
            <Store className="size-4 text-accent" aria-hidden />
            Retirada na loja sem custo
          </li>
          <li className="flex items-center gap-2">
            <Lock className="size-4 text-accent" aria-hidden />
            Pagamento no ambiente seguro do Mercado Pago
          </li>
        </ul>
      </aside>
    </div>
  );
}
