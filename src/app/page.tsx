import { BadgeCheck, BatteryMedium, ShieldCheck } from "lucide-react";
import { HeroCarousel, type HeroSlide } from "@/components/home/HeroCarousel";
import { OfferBanner } from "@/components/home/OfferBanner";
import { Benefits, Brands, SectionHeader, Testimonials } from "@/components/home/Sections";
import { ProductGrid } from "@/components/product/ProductCard";
import { getBrands, getProducts, imagemDaCor, variantePadrao } from "@/lib/catalog";
import { SITE } from "@/lib/site";
import type { Product } from "@/lib/types";
import { cn, container } from "@/lib/ui";

function slide(p: Product, linha1: string, linha2: string, subtitulo: string): HeroSlide {
  const v = variantePadrao(p);
  const img = imagemDaCor(p, v.cor);
  return {
    linha1,
    linha2,
    subtitulo,
    href: `/produto/${p.slug}`,
    imagem: img.url,
    imagemAlt: img.alt,
    aPartirDe: Math.min(...p.variants.map((x) => x.preco)),
  };
}

export default async function Home() {
  const [produtos, marcas] = await Promise.all([getProducts(), getBrands()]);
  const porSlug = (s: string) => produtos.find((p) => p.slug === s)!;

  const slides = [
    slide(
      porSlug("iphone-16-pro"),
      "Novos e lacrados,",
      "com garantia.",
      "Aparelhos com nota fiscal e garantia do fabricante. Receba em casa ou retire hoje na loja.",
    ),
    slide(
      porSlug("iphone-13-seminovo"),
      "Seminovo revisado,",
      "bateria informada.",
      "Cada aparelho é testado pela nossa equipe e sai com 90 dias de garantia da loja.",
    ),
    slide(
      porSlug("galaxy-s24"),
      "Pague no Pix",
      "e economize 5%.",
      "Ou parcele em até 10x sem juros no cartão. Tudo no ambiente seguro do Mercado Pago.",
    ),
  ];

  const celulares = produtos.filter((p) => p.categoria === "celular");
  const maisVendidos = celulares
    .filter((p) => p.condicao === "novo")
    .sort((a, b) => b.vendas - a.vendas)
    .slice(0, 8);
  const seminovos = celulares.filter((p) => p.condicao === "seminovo").sort((a, b) => b.vendas - a.vendas).slice(0, 4);

  return (
    <>
      <h1 className="sr-only">{SITE.nome}: celulares novos e seminovos em Ilhéus e região</h1>
      <HeroCarousel slides={slides} />
      <Benefits />

      <section aria-labelledby="mais-vendidos" className={cn(container, "py-16 sm:py-24")}>
        <SectionHeader id="mais-vendidos" titulo="Mais vendidos" href="/celulares" />
        <ProductGrid products={maisVendidos} />
      </section>

      <Brands marcas={marcas} />

      <OfferBanner product={porSlug("galaxy-s24")} />

      <section aria-labelledby="seminovos" className="bg-paper py-16 sm:py-24">
        <div className={container}>
          <SectionHeader
                id="seminovos"
                claro
                titulo="Seminovos revisados"
                descricao="Testamos tela, câmeras, biometria, áudio e bateria antes de anunciar. A saúde da bateria aparece em cada aparelho."
                href="/celulares?condicao=seminovo"
              />
          <ul className="-mt-2 mb-10 flex flex-wrap gap-x-8 gap-y-3 text-sm text-[#3f3f46]">
            <li className="inline-flex items-center gap-2">
              <BadgeCheck className="size-5 text-accent-ink" aria-hidden />
              Tela, câmeras e biometria testadas
            </li>
            <li className="inline-flex items-center gap-2">
              <BatteryMedium className="size-5 text-accent-ink" aria-hidden />
              Saúde da bateria informada
            </li>
            <li className="inline-flex items-center gap-2">
              <ShieldCheck className="size-5 text-accent-ink" aria-hidden />
              90 dias de garantia da loja
            </li>
          </ul>
          <ProductGrid products={seminovos} />
        </div>
      </section>

      <Testimonials />
    </>
  );
}
