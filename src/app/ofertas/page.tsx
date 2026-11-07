import type { Metadata } from "next";
import { CatalogView } from "@/components/catalog/CatalogView";
import { PageHeader } from "@/components/layout/PageHeader";
import { getProducts } from "@/lib/catalog";
import { container } from "@/lib/ui";

// Atualiza preços e estoque a cada 60 s (e na hora, quando o admin ou o webhook mudam algo)
export const revalidate = 60;

export const metadata: Metadata = {
  title: "Ofertas",
  description: "Celulares e acessórios com desconto. Pague no Pix e economize mais 5%.",
};

export default async function OfertasPage() {
  const produtos = (await getProducts()).filter((p) =>
    p.variants.some((v) => v.precoAntigo && v.precoAntigo > v.preco),
  );
  return (
    <div className={container}>
      <PageHeader
        titulo="Ofertas"
        descricao="Preços com desconto enquanto durar o estoque. No Pix você ainda economiza mais 5%."
        migalhas={[{ href: "/", label: "Início" }, { label: "Ofertas" }]}
      />
      <CatalogView products={produtos} tipo="misto" />
    </div>
  );
}
