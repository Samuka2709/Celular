import type { Metadata } from "next";
import { CatalogView } from "@/components/catalog/CatalogView";
import { PageHeader } from "@/components/layout/PageHeader";
import { getProducts } from "@/lib/catalog";
import { container } from "@/lib/ui";

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
