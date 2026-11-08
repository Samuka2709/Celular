"use client";

import { BatteryMedium, Check, MessageCircle, PackageCheck, ShieldCheck, ShoppingBag, Store, Truck } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { variantePadrao } from "@/lib/produto";
import { useCart } from "@/lib/cart";
import { formatBRL, percentualDesconto } from "@/lib/format";
import type { Product } from "@/lib/types";
import { botao, cn } from "@/lib/ui";
import { mensagens, whatsappLink } from "@/lib/whatsapp";
import { Badge } from "../ui/Badge";
import { PriceTag } from "../ui/PriceTag";
import { ProductGallery } from "./ProductGallery";
import { opcoesDeArmazenamento, VariantSelector } from "./VariantSelector";

export function ProductDetail({ product }: { product: Product }) {
  const router = useRouter();
  const { add, items } = useCart();
  const inicial = variantePadrao(product);
  const [cor, setCor] = useState(inicial.cor);
  const [armazenamento, setArmazenamento] = useState<string | null>(inicial.armazenamento);
  // Confirmação visível ao adicionar pela sacola (some sozinha)
  const [adicionado, setAdicionado] = useState(false);
  useEffect(() => {
    if (!adicionado) return;
    const t = setTimeout(() => setAdicionado(false), 1800);
    return () => clearTimeout(t);
  }, [adicionado]);
  // Barra de compra fixa no celular quando os botões principais saem da tela (para cima)
  const acoesRef = useRef<HTMLDivElement>(null);
  const [acoesVisiveis, setAcoesVisiveis] = useState(true);
  useEffect(() => {
    const el = acoesRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setAcoesVisiveis(e.isIntersecting || e.boundingClientRect.top > 0));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const variante =
    product.variants.find((v) => v.cor === cor && v.armazenamento === armazenamento) ??
    product.variants.find((v) => v.cor === cor) ??
    inicial;

  const imagens = useMemo(
    () => product.images.filter((i) => i.cor === cor || i.cor === null).sort((a, b) => a.ordem - b.ordem),
    [product.images, cor],
  );

  const esgotado = variante.estoque === 0;
  const desconto = percentualDesconto(variante.preco, variante.precoAntigo);
  const noCarrinho = items.find((i) => i.variantId === variante.id)?.quantidade ?? 0;
  const limite = noCarrinho >= variante.estoque;
  const descricaoVariacao = [variante.cor, variante.armazenamento].filter(Boolean).join(", ");

  function trocarCor(novaCor: string) {
    setCor(novaCor);
    const opcoes = opcoesDeArmazenamento(product, novaCor);
    if (opcoes.length && !opcoes.find((o) => o.armazenamento === armazenamento && o.disponivel)) {
      setArmazenamento(opcoes.find((o) => o.disponivel)?.armazenamento ?? opcoes.find((o) => o.existe)?.armazenamento ?? null);
    }
  }

  // "Comprar" leva ao checkout; só adiciona se esta variação ainda não estiver no carrinho
  function comprar() {
    if (noCarrinho === 0) adicionar();
    router.push("/checkout");
  }

  function adicionar() {
    add({
      variantId: variante.id,
      productId: product.id,
      slug: product.slug,
      nome: product.nome,
      cor: variante.cor,
      armazenamento: variante.armazenamento,
      preco: variante.preco,
      precoPix: variante.precoPix,
      imagem: imagens[0]?.url ?? product.images[0].url,
      estoqueMax: variante.estoque,
    });
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-14">
      <div className="lg:sticky lg:top-24 lg:self-start">
        <ProductGallery imagens={imagens} esgotado={esgotado} />
      </div>

      <div>
        <div className="flex flex-wrap gap-1.5">
          {product.condicao === "seminovo" ? <Badge tom="seminovo">Seminovo</Badge> : <Badge>Novo</Badge>}
          {desconto && !esgotado && <Badge tom="destaque">-{desconto}%</Badge>}
          {esgotado && <Badge tom="neutro">Esgotado</Badge>}
        </div>
        <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          {product.nome}
        </h1>
        <p className="mt-1 text-sm text-muted">
          {product.marca} · {descricaoVariacao}
        </p>

        {product.detalhesSeminovo && (
          <p className="mt-3 inline-flex flex-wrap items-center gap-x-2 gap-y-1 rounded-xl border border-line bg-card px-3 py-2 text-sm">
            <BatteryMedium className="size-4 text-accent" aria-hidden />
            <span className="font-semibold tabular-nums text-ink">Bateria {product.detalhesSeminovo.saudeBateria}%</span>
            <span aria-hidden className="text-subtle">·</span>
            <span className="text-ink">{product.detalhesSeminovo.estado}</span>
            <span aria-hidden className="text-subtle">·</span>
            <span className="text-muted">{product.detalhesSeminovo.garantia}</span>
          </p>
        )}

        <PriceTag
          className="mt-6"
          tamanho="lg"
          preco={variante.preco}
          precoAntigo={variante.precoAntigo}
          precoPix={variante.precoPix}
          esgotado={esgotado}
        />

        <p
          className={cn(
            "mt-4 inline-flex items-center gap-2 text-sm font-medium",
            esgotado ? "text-muted" : variante.estoque <= 2 ? "text-accent" : "text-ink",
          )}
          aria-live="polite"
        >
          <span
            aria-hidden
            className={cn(
              "size-2 rounded-full",
              esgotado ? "bg-subtle" : variante.estoque <= 2 ? "bg-accent" : "bg-success",
            )}
          />
          {esgotado
            ? "Esgotado nesta variação"
            : variante.estoque <= 2
              ? `Restam ${variante.estoque} ${variante.estoque === 1 ? "unidade" : "unidades"}`
              : "Em estoque"}
        </p>

        <div className="mt-8">
          <VariantSelector
            product={product}
            cor={cor}
            armazenamento={armazenamento}
            onCor={trocarCor}
            onArmazenamento={setArmazenamento}
          />
        </div>

        <div ref={acoesRef} className="mt-8 flex flex-col gap-3">
          {esgotado ? (
            <a
              href={whatsappLink(mensagens.aviseMe(`${product.nome} (${descricaoVariacao})`))}
              target="_blank"
              rel="noopener noreferrer"
              className={botao("primario", "lg", "w-full")}
            >
              <MessageCircle className="size-5" aria-hidden />
              Avise-me no WhatsApp
            </a>
          ) : (
            <div className="flex gap-3">
              <button type="button" onClick={comprar} className={botao("primario", "lg", "flex-1")}>
                {noCarrinho > 0 ? "Finalizar compra" : "Comprar"}
              </button>
              <button
                type="button"
                disabled={limite}
                onClick={() => {
                  adicionar();
                  setAdicionado(true);
                }}
                aria-label={limite ? "Todas as unidades disponíveis já estão no carrinho" : "Adicionar ao carrinho e continuar comprando"}
                className={botao("secundario", "icone", adicionado ? "border-accent" : undefined)}
              >
                {adicionado ? <Check className="size-5 text-accent" aria-hidden /> : <ShoppingBag className="size-5" aria-hidden />}
              </button>
            </div>
          )}
          <p aria-live="polite" className="text-sm empty:hidden">
            {adicionado ? (
              <span className="inline-flex flex-wrap items-center gap-1.5 text-ink">
                <Check className="size-4 text-accent" aria-hidden />
                Adicionado ao carrinho.
                <Link href="/carrinho" className="font-medium underline underline-offset-2">
                  Ver carrinho
                </Link>
              </span>
            ) : limite && !esgotado ? (
              <span className="text-muted">
                Você já tem todas as unidades disponíveis desta variação no carrinho.{" "}
                <Link href="/carrinho" className="font-medium text-ink underline underline-offset-2">
                  Ver carrinho
                </Link>
              </span>
            ) : null}
          </p>
          <a
            href={whatsappLink(mensagens.produto(product.nome, descricaoVariacao))}
            target="_blank"
            rel="noopener noreferrer"
            className={botao("whatsapp", "lg", "w-full")}
          >
            <MessageCircle className="size-5 text-whatsapp" aria-hidden />
            Tirar dúvida no WhatsApp
          </a>
        </div>

        <ul className="mt-6 grid gap-3 rounded-2xl border border-line p-4 text-sm sm:grid-cols-3">
          <li className="flex items-start gap-2.5">
            <Truck className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
            <span className="text-muted">
              <span className="text-ink">Entrega local</span> em Ilhéus e região
            </span>
          </li>
          <li className="flex items-start gap-2.5">
            <Store className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
            <span className="text-muted">
              <span className="text-ink">Retire grátis</span> na loja
            </span>
          </li>
          <li className="flex items-start gap-2.5">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
            <span className="text-muted">
              <span className="text-ink">Garantia</span> {product.detalhesSeminovo ? "da loja" : "do fabricante"}
            </span>
          </li>
        </ul>

        {product.detalhesSeminovo && (
          <section aria-labelledby="estado" className="mt-10">
            <h2 id="estado" className="font-display text-xl font-semibold">
              Estado do aparelho
            </h2>
            <div className="mt-4 grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2">
              <div className="bg-card p-5">
                <p className="text-sm text-muted">Saúde da bateria</p>
                <p className="mt-1 flex items-center gap-2 font-display text-3xl font-semibold tabular-nums">
                  <BatteryMedium className="size-7 text-accent" aria-hidden />
                  {product.detalhesSeminovo.saudeBateria}%
                </p>
                <div
                  className="mt-3 h-1.5 overflow-hidden rounded-full bg-line-strong"
                  role="img"
                  aria-label={`Saúde da bateria ${product.detalhesSeminovo.saudeBateria} por cento`}
                >
                  <div className="h-full rounded-full bg-accent" style={{ width: `${product.detalhesSeminovo.saudeBateria}%` }} />
                </div>
              </div>
              <div className="bg-card p-5">
                <p className="text-sm text-muted">Estado</p>
                <p className="mt-1 font-medium text-ink">{product.detalhesSeminovo.estado}</p>
                <p className="mt-4 text-sm text-muted">Garantia</p>
                <p className="mt-1 font-medium text-ink">{product.detalhesSeminovo.garantia}</p>
              </div>
              <div className="bg-card p-5 sm:col-span-2">
                <p className="text-sm text-muted">O que acompanha</p>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {product.detalhesSeminovo.acompanha.map((a) => (
                    <li key={a} className="inline-flex items-center gap-1.5 rounded-lg bg-card-2 px-3 py-1.5 text-sm">
                      <PackageCheck className="size-4 text-accent" aria-hidden />
                      {a}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        )}

        <section aria-labelledby="descricao" className="mt-10">
          <h2 id="descricao" className="font-display text-xl font-semibold">
            Sobre o produto
          </h2>
          <p className="mt-3 max-w-[65ch] leading-relaxed text-muted">{product.descricao}</p>
        </section>

        <section aria-labelledby="ficha" className="mt-10">
          <h2 id="ficha" className="font-display text-xl font-semibold">
            Ficha técnica
          </h2>
          <div className="mt-4 overflow-hidden rounded-2xl border border-line">
          <table className="w-full text-sm">
            <caption className="sr-only">Especificações do {product.nome}</caption>
            <tbody>
              {Object.entries(product.fichaTecnica).map(([k, v], i) => (
                <tr key={k} className={cn(i % 2 === 0 ? "bg-card" : "bg-canvas")}>
                  <th scope="row" className="w-2/5 px-4 py-3 text-left font-medium text-muted">
                    {k}
                  </th>
                  <td className="px-4 py-3 text-ink">{v}</td>
                </tr>
              ))}
              {variante.armazenamento && (
                <tr className={cn(Object.keys(product.fichaTecnica).length % 2 === 0 ? "bg-card" : "bg-canvas")}>
                  <th scope="row" className="w-2/5 px-4 py-3 text-left font-medium text-muted">
                    Armazenamento
                  </th>
                  <td className="px-4 py-3 text-ink">{variante.armazenamento}</td>
                </tr>
              )}
            </tbody>
          </table>
          </div>
        </section>
      </div>

      {!esgotado && (
        <div
          aria-hidden={acoesVisiveis}
          inert={acoesVisiveis}
          className={cn(
            "fixed inset-x-0 bottom-0 z-40 border-t border-line bg-canvas/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur lg:hidden",
            "transition-[transform,opacity] duration-200 ease-out",
            acoesVisiveis ? "pointer-events-none translate-y-full opacity-0" : "translate-y-0 opacity-100",
          )}
        >
          <div className="flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs text-muted">{product.nome}</p>
              <p className="font-display text-lg font-semibold tabular-nums text-ink">
                {formatBRL(variante.precoPix)} <span className="text-xs font-normal text-muted">no Pix</span>
              </p>
            </div>
            <button type="button" onClick={comprar} className={botao("primario", "md")}>
              {noCarrinho > 0 ? "Finalizar compra" : "Comprar"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
