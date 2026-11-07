import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { imagemDaCor, variantePadrao } from "@/lib/produto";
import { formatBRL, percentualDesconto } from "@/lib/format";
import type { Product } from "@/lib/types";
import { botao, cn, container } from "@/lib/ui";
import { ProductStage } from "../product/ProductStage";
import { Countdown } from "./Countdown";

export function OfferBanner({ product }: { product: Product }) {
  const v = variantePadrao(product);
  const desconto = percentualDesconto(v.preco, v.precoAntigo);
  const img = imagemDaCor(product, v.cor);

  return (
    <section aria-labelledby="oferta" className={cn(container, "py-16 sm:py-24")}>
      <div className="relative overflow-hidden rounded-3xl border border-line bg-card">
        <div
          aria-hidden
          className="absolute -right-24 -top-24 size-[520px] rounded-full bg-[radial-gradient(closest-side,rgb(255_106_0/0.28),transparent)]"
        />
        <div className="relative grid items-center gap-6 p-5 sm:p-10 md:grid-cols-[1.2fr_1fr] lg:p-14">
          <div className="min-w-0">
            <h2 id="oferta" className="font-display text-4xl font-bold leading-[1.05] tracking-[-0.03em] sm:text-5xl">
              Oferta da semana
              <span className="mt-1 block text-accent">{product.nome}</span>
            </h2>
            <p className="mt-4 max-w-md text-muted">
              {product.marca} {product.nome} {v.armazenamento} com{" "}
              <strong className="font-semibold text-ink">{desconto}% de desconto</strong> até domingo, ou enquanto durar o
              estoque.
            </p>
            <div className="mt-8">
              <Countdown />
            </div>
            <div className="mt-8 flex flex-wrap items-end gap-x-6 gap-y-4">
              <div className="tabular-nums">
                {v.precoAntigo && <p className="text-sm text-muted line-through">{formatBRL(v.precoAntigo)}</p>}
                <p className="font-display text-3xl font-semibold">{formatBRL(v.preco)}</p>
                <p className="text-sm text-accent">
                  <strong>{formatBRL(v.precoPix)}</strong> no Pix
                </p>
              </div>
              <Link href={`/produto/${product.slug}`} className={botao("primario", "lg")}>
                Aproveitar oferta
                <ArrowRight className="size-5" aria-hidden />
              </Link>
            </div>
          </div>
          <div className="mx-auto w-full max-w-[340px] md:max-w-[420px]">
            <ProductStage src={img.url} alt={img.alt} sizes="(min-width: 768px) 420px, 340px" />
          </div>
        </div>
      </div>
    </section>
  );
}
