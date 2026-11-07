import type { Metadata } from "next";
import { CatalogView } from "@/components/catalog/CatalogView";
import { PageHeader } from "@/components/layout/PageHeader";
import { getProducts } from "@/lib/catalog";
import { container } from "@/lib/ui";

// Atualiza preços e estoque a cada 60 s (e na hora, quando o admin ou o webhook mudam algo)
export const revalidate = 60;

export const metadata: Metadata = {
  title: "Acessórios",
  description: "Capas, películas, carregadores, cabos, fones e power banks.",
};

export default async function AcessoriosPage() {
  const produtos = (await getProducts()).filter((p) => p.categoria === "acessorio");
  return (
    <div className={container}>
      <PageHeader
        titulo="Acessórios"
        descricao="Capas, películas, carregadores e fones. Película de vidro com instalação grátis na loja."
        migalhas={[{ href: "/", label: "Início" }, { label: "Acessórios" }]}
      />
      <CatalogView products={produtos} tipo="acessorio" />
    </div>
  );
}
