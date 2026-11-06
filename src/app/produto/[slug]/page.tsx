import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SectionHeader } from "@/components/home/Sections";
import { Breadcrumbs } from "@/components/layout/PageHeader";
import { ProductGrid } from "@/components/product/ProductCard";
import { ProductDetail } from "@/components/product/ProductDetail";
import { getProductBySlug, getProducts, getRelated, variantePadrao } from "@/lib/catalog";
import { formatBRL } from "@/lib/format";
import { cn, container } from "@/lib/ui";

type Params = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getProducts()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProductBySlug(slug);
  if (!p) return { title: "Produto não encontrado" };
  const v = variantePadrao(p);
  const nome = p.condicao === "seminovo" ? `${p.nome} seminovo` : p.nome;
  return {
    title: nome,
    description: `${nome} por ${formatBRL(v.preco)} ou ${formatBRL(v.precoPix)} no Pix. ${p.descricao}`,
    openGraph: { images: [p.images[0].url] },
  };
}

export default async function ProdutoPage({ params }: Params) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();
  const relacionados = await getRelated(product);
  const categoria =
    product.categoria === "acessorio"
      ? { href: "/acessorios", label: "Acessórios" }
      : { href: "/celulares", label: "Celulares" };

  return (
    <>
      <div className={cn(container, "pb-8 pt-6")}>
        <Breadcrumbs itens={[{ href: "/", label: "Início" }, categoria, { label: product.nome }]} />
        <div className="mt-6">
          <ProductDetail product={product} />
        </div>
      </div>
      {relacionados.length > 0 && (
        <section aria-labelledby="relacionados" className={cn(container, "pt-16")}>
          <SectionHeader id="relacionados" titulo="Você também pode gostar" href={categoria.href} />
          <ProductGrid products={relacionados} />
        </section>
      )}
    </>
  );
}
