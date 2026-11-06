import type { Metadata } from "next";
import { CatalogView } from "@/components/catalog/CatalogView";
import { PageHeader } from "@/components/layout/PageHeader";
import { getProducts } from "@/lib/catalog";
import { container } from "@/lib/ui";

export const metadata: Metadata = { title: "Busca", robots: { index: false } };

export default async function BuscaPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const produtos = await getProducts();
  return (
    <div className={container}>
      <PageHeader
        titulo={q ? `Resultados para "${q}"` : "Buscar"}
        migalhas={[{ href: "/", label: "Início" }, { label: "Busca" }]}
      />
      <CatalogView key={q} products={produtos} busca={q} tipo="misto" />
    </div>
  );
}
