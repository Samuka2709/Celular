import type { Metadata } from "next";
import { CatalogView } from "@/components/catalog/CatalogView";
import { PageHeader } from "@/components/layout/PageHeader";
import { getProducts } from "@/lib/catalog";
import { container } from "@/lib/ui";

export const metadata: Metadata = {
  title: "Celulares",
  description: "iPhone, Samsung, Motorola e Xiaomi novos e seminovos revisados, com entrega em Ilhéus e região.",
};

export default async function CelularesPage({
  searchParams,
}: {
  searchParams: Promise<{ marca?: string; condicao?: string }>;
}) {
  const { marca, condicao } = await searchParams;
  const produtos = (await getProducts()).filter((p) => p.categoria === "celular");
  const cond = condicao === "novo" || condicao === "seminovo" ? condicao : undefined;

  return (
    <div className={container}>
      <PageHeader
        titulo={cond === "seminovo" ? "Seminovos revisados" : marca ? `Celulares ${marca}` : "Celulares"}
        descricao="Novos com garantia do fabricante e seminovos revisados com 90 dias de garantia da loja."
        migalhas={[{ href: "/", label: "Início" }, { label: "Celulares" }]}
      />
      <CatalogView key={`${marca}-${cond}`} products={produtos} marcaInicial={marca} condicaoInicial={cond} />
    </div>
  );
}
