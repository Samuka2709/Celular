import { BatteryMedium, MessageCircle } from "lucide-react";
import Link from "next/link";
import { estoqueTotal, imagemDaCor, variantePadrao } from "@/lib/produto";
import { percentualDesconto } from "@/lib/format";
import type { Product } from "@/lib/types";
import { botao, cn } from "@/lib/ui";
import { mensagens, whatsappLink } from "@/lib/whatsapp";
import { Badge } from "../ui/Badge";
import { PriceTag } from "../ui/PriceTag";
import { AddToCartButton } from "./AddToCartButton";
import { ProductStage } from "./ProductStage";

export function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  const v = variantePadrao(product);
  const total = estoqueTotal(product);
  const esgotado = total === 0;
  const desconto = percentualDesconto(v.preco, v.precoAntigo);
  const img = imagemDaCor(product, v.cor);
  const href = `/produto/${product.slug}`;
  const cores = new Set(product.variants.map((x) => x.cor)).size;
  const variacao = [v.armazenamento, v.cor].filter(Boolean).join(" · ");

  return (
    <article
      className={cn(
        "group relative flex flex-col rounded-2xl border border-line bg-card p-3 sm:p-4",
        "transition-[transform,border-color,box-shadow] duration-200 ease-out",
        "hover:-translate-y-1 hover:border-accent/45 hover:shadow-[0_16px_32px_-18px_rgb(255_106_0/0.55)]",
      )}
    >
      <Link href={href} className="relative block rounded-xl" tabIndex={-1} aria-hidden>
        <ProductStage
          src={img.url}
          alt=""
          sizes="(min-width: 1024px) 280px, (min-width: 640px) 33vw, 50vw"
          priority={priority}
          esgotado={esgotado}
          imgClassName="group-hover:scale-[1.03]"
        />
      </Link>

      <div className="pointer-events-none absolute inset-x-3 top-3 flex flex-wrap gap-1.5 sm:inset-x-4 sm:top-4">
        {esgotado ? (
          <Badge tom="neutro">Esgotado</Badge>
        ) : (
          <>
            {product.condicao === "seminovo" ? <Badge tom="seminovo">Seminovo</Badge> : <Badge>Novo</Badge>}
            {desconto && <Badge tom="destaque">-{desconto}%</Badge>}
            {total <= 2 && <Badge tom="alerta">Últimas unidades</Badge>}
          </>
        )}
      </div>

      <div className="mt-3 flex flex-1 flex-col">
        <p className="text-xs font-medium text-muted">{product.marca}</p>
        <h3 className="mt-0.5 font-display text-[15px] font-semibold leading-snug text-ink sm:text-base">
          <Link href={href} className="after:absolute after:inset-0 after:rounded-2xl focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-accent">
            {product.nome}
          </Link>
        </h3>
        <p className="mt-0.5 text-xs text-muted">
          {variacao}
          {cores > 1 && <span className="text-subtle"> · {cores} cores</span>}
        </p>

        {product.detalhesSeminovo && (
          <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-ink">
            <BatteryMedium className="size-4 text-accent" aria-hidden />
            Bateria {product.detalhesSeminovo.saudeBateria}%
          </p>
        )}

        <PriceTag
          className="mt-2"
          preco={v.preco}
          precoAntigo={v.precoAntigo}
          precoPix={v.precoPix}
          esgotado={esgotado}
        />

        <div className="relative z-10 mt-auto pt-4">
          {esgotado ? (
            <a
              href={whatsappLink(mensagens.aviseMe(product.nome))}
              target="_blank"
              rel="noopener noreferrer"
              className={botao("secundario", "sm", "w-full")}
            >
              <MessageCircle className="size-4" aria-hidden />
              <span className="sm:hidden">Avise-me</span>
              <span className="hidden sm:inline">Avise-me no WhatsApp</span>
            </a>
          ) : (
            <AddToCartButton
              compacto
              item={{
                variantId: v.id,
                productId: product.id,
                slug: product.slug,
                nome: product.nome,
                cor: v.cor,
                armazenamento: v.armazenamento,
                preco: v.preco,
                precoPix: v.precoPix,
                imagem: img.url,
                estoqueMax: v.estoque,
              }}
            />
          )}
        </div>
      </div>
    </article>
  );
}

export function ProductGrid({
  products,
  prioridade = 0,
  maxCelular,
}: {
  products: Product[];
  prioridade?: number;
  /** Quantos cards mostrar no celular (o resto aparece a partir de sm) */
  maxCelular?: number;
}) {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {products.map((p, i) => (
        <li key={p.id} className={cn("flex [&>article]:w-full", maxCelular != null && i >= maxCelular && "max-sm:hidden")}>
          <ProductCard product={p} priority={i < prioridade} />
        </li>
      ))}
    </ul>
  );
}
