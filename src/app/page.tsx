import { BadgeCheck, BatteryMedium, ShieldCheck } from "lucide-react";
import { HeroCarousel, type HeroSlide } from "@/components/home/HeroCarousel";
import { OfferBanner } from "@/components/home/OfferBanner";
import { Benefits, Brands, SectionHeader, Testimonials } from "@/components/home/Sections";
import { ProductGrid } from "@/components/product/ProductCard";
import { getBrands, getProducts, imagemDaCor, variantePadrao } from "@/lib/catalog";
import { SITE } from "@/lib/site";
import type { Product } from "@/lib/types";
import { cn, container } from "@/lib/ui";

// Atualiza preços e estoque a cada 60 s (e na hora, quando o admin ou o webhook mudam algo)
export const revalidate = 60;

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
  const celulares = produtos.filter((p) => p.categoria === "celular");
  const disponivel = (p: Product) => p.variants.some((v) => v.estoque > 0);
  const desconto = (p: Product) => {
    const v = variantePadrao(p);
    return v.precoAntigo ? 1 - v.preco / v.precoAntigo : 0;
  };
  const porVendas = (a: Product, b: Product) => b.vendas - a.vendas;

  // Escolhe os produtos do carrossel e da oferta a partir do catálogo (do banco ou de exemplo)
  const novoDestaque =
    celulares.filter((p) => p.condicao === "novo" && p.destaque && disponivel(p)).sort(porVendas)[0] ??
    celulares.filter((p) => p.condicao === "novo" && disponivel(p)).sort(porVendas)[0];
  const seminovoDestaque = celulares.filter((p) => p.condicao === "seminovo" && disponivel(p)).sort(porVendas)[0];
  // Oferta da semana: o celular com maior desconto, preferindo aparelhos novos
  const comDesconto = celulares.filter((p) => disponivel(p) && desconto(p) > 0).sort((a, b) => desconto(b) - desconto(a));
  const emOferta = comDesconto.find((p) => p.condicao === "novo") ?? comDesconto[0];
  const pixDestaque = emOferta ?? celulares.filter(disponivel).sort(porVendas)[1];

  const slides = [
    emOferta &&
      slide(
        emOferta,
        "Black November,",
        "preço de verdade.",
        "Descontos reais em iPhones e acessórios, com 5% off no Pix ou em até 10x sem juros.",
      ),
    novoDestaque &&
      slide(
        novoDestaque,
        "Novos e lacrados,",
        "com garantia.",
        "Aparelhos com nota fiscal e garantia do fabricante. Receba em casa ou retire hoje na loja.",
      ),
    seminovoDestaque &&
      slide(
        seminovoDestaque,
        "Seminovo revisado,",
        "bateria informada.",
        "Cada aparelho é testado pela nossa equipe e sai com 90 dias de garantia da loja.",
      ),
    pixDestaque &&
      slide(
        pixDestaque,
        "Pague no Pix",
        "e economize 5%.",
        "Ou parcele em até 10x sem juros no cartão. Tudo no ambiente seguro do Mercado Pago.",
      ),
  ].filter((x): x is HeroSlide => !!x);

  const maisVendidos = celulares
    .filter((p) => p.condicao === "novo")
    .sort((a, b) => b.vendas - a.vendas)
    .slice(0, 8);
  const seminovos = celulares.filter((p) => p.condicao === "seminovo").sort((a, b) => b.vendas - a.vendas).slice(0, 4);

  return (
    <>
      <h1 className="sr-only">{SITE.nome}: celulares novos e seminovos em Ilhéus e região</h1>
      {slides.length > 0 && <HeroCarousel slides={slides} />}
      <Benefits />

      <section aria-labelledby="mais-vendidos" className={cn(container, "py-16 sm:py-24")}>
        <SectionHeader id="mais-vendidos" titulo="Mais vendidos" href="/celulares" />
        <ProductGrid products={maisVendidos} maxCelular={4} />
      </section>

      <Brands marcas={marcas} />

      {emOferta && <OfferBanner product={emOferta} />}

      <section aria-labelledby="seminovos" className="bg-paper py-16 sm:py-24">
        <div className={container}>
          <SectionHeader
                id="seminovos"
                claro
                titulo="Seminovos revisados"
                descricao="Testamos tela, câmeras, biometria, áudio e bateria antes de anunciar. A saúde da bateria aparece em cada aparelho."
                href="/celulares?condicao=seminovo"
              />
          <ul className="-mt-2 mb-10 flex flex-wrap gap-x-8 gap-y-3 text-sm text-paper-soft">
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
