"use client";

import { BatteryMedium, MessageCircle, PackageCheck, ShieldCheck, ShoppingBag, Store, Truck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { variantePadrao } from "@/lib/catalog";
import { useCart } from "@/lib/cart";
import { percentualDesconto } from "@/lib/format";
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

        <div className="mt-8 flex flex-col gap-3">
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
              <button
                type="button"
                disabled={limite}
                onClick={() => {
                  if (!limite) adicionar();
                  router.push("/checkout");
                }}
                className={botao("primario", "lg", "flex-1")}
              >
                {limite ? "Limite em estoque no carrinho" : "Comprar"}
              </button>
              <button
                type="button"
                disabled={limite}
                onClick={adicionar}
                aria-label="Adicionar ao carrinho e continuar comprando"
                title="Adicionar ao carrinho"
                className={botao("secundario", "icone")}
              >
                <ShoppingBag className="size-5" aria-hidden />
              </button>
            </div>
          )}
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
    </div>
  );
}
