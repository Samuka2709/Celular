import { ArrowRight, ArrowUpRight, Lock, MessageCircle, QrCode, ShieldCheck, Star } from "lucide-react";
import Link from "next/link";
import { cn, container } from "@/lib/ui";

export function SectionHeader({
  id,
  titulo,
  descricao,
  href,
  linkLabel = "Ver todos",
  claro = false,
}: {
  id?: string;
  titulo: string;
  descricao?: string;
  href?: string;
  linkLabel?: string;
  claro?: boolean;
}) {
  return (
    <div className={cn("mb-8 flex justify-between gap-x-6 gap-y-4", descricao ? "flex-col sm:flex-row sm:items-end" : "items-end")}>
      <div className="min-w-0">
        <h2
          id={id}
          className={cn(
            "font-display text-3xl font-semibold tracking-[-0.025em] text-balance sm:text-4xl",
            claro ? "text-canvas" : "text-ink",
          )}
        >
          {titulo}
        </h2>
        {descricao && (
          <p className={cn("mt-2 max-w-xl text-pretty", claro ? "text-paper-muted" : "text-muted")}>{descricao}</p>
        )}
      </div>
      {href && (
        <Link
          href={href}
          className={cn(
            "group inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold",
            claro ? "text-accent-ink" : "text-ink",
          )}
        >
          {linkLabel}
          <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden />
        </Link>
      )}
    </div>
  );
}

const BENEFICIOS = [
  { icone: ShieldCheck, titulo: "Garantia", texto: "1 ano nos novos, 90 dias nos seminovos" },
  { icone: Lock, titulo: "Pagamento seguro", texto: "Ambiente protegido do Mercado Pago" },
  { icone: QrCode, titulo: "5% off no Pix", texto: "Ou até 10x sem juros no cartão" },
  { icone: MessageCircle, titulo: "Atendimento no WhatsApp", texto: "Fale com uma pessoa, antes e depois" },
];

export function Benefits() {
  return (
    <section aria-label="Benefícios" className={container}>
      <ul className="grid grid-cols-2 overflow-hidden rounded-2xl border border-line bg-card lg:grid-cols-4">
        {BENEFICIOS.map(({ icone: Icone, titulo, texto }, i) => (
          <li
            key={titulo}
            className={cn(
              "flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:gap-4 sm:p-5",
              i % 2 === 1 && "border-l border-line",
              i >= 2 && "border-t border-line lg:border-t-0",
              i === 2 && "lg:border-l",
            )}
          >
            <Icone className="size-6 shrink-0 text-accent" strokeWidth={1.75} aria-hidden />
            <div>
              <p className="font-display text-[15px] font-semibold leading-tight text-ink">{titulo}</p>
              <p className="mt-1 text-xs leading-snug text-muted sm:text-[13px]">{texto}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function Brands({ marcas }: { marcas: { marca: string; total: number }[] }) {
  return (
    <section aria-labelledby="marcas" className="bg-paper py-16 text-canvas sm:py-20">
      <div className={container}>
        <h2 id="marcas" className="font-display text-3xl font-semibold tracking-[-0.025em] sm:text-4xl">
          Comprar por marca
        </h2>
        <ul className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
          {marcas.map((m) => (
            <li key={m.marca}>
              <Link
                href={`/celulares?marca=${encodeURIComponent(m.marca)}`}
                className="group relative flex h-32 flex-col justify-between overflow-hidden rounded-2xl border border-paper-line bg-paper-card p-5 transition-[border-color,transform,box-shadow] duration-200 ease-out hover:-translate-y-1 hover:border-accent/50 hover:shadow-[0_14px_28px_-18px_rgb(194_65_12/0.6)] sm:h-40"
              >
                <span className="font-display text-2xl font-bold tracking-tight sm:text-3xl">{m.marca}</span>
                <span className="flex items-center justify-between text-sm text-paper-muted">
                  {m.total} {m.total === 1 ? "modelo" : "modelos"}
                  <ArrowUpRight
                    className="size-5 text-accent-ink transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    aria-hidden
                  />
                </span>
              </Link>
            </li>
          ))}
          <li className="col-span-2 lg:col-span-1">
            <Link
              href="/celulares?condicao=seminovo"
              className="group relative flex h-32 flex-col justify-between overflow-hidden rounded-2xl bg-canvas p-5 text-ink transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-1 hover:shadow-[0_14px_28px_-14px_rgb(255_106_0/0.6)] sm:h-40"
            >
              <span className="font-display text-2xl font-bold tracking-tight sm:text-3xl">Seminovos</span>
              <span className="flex items-center justify-between text-sm text-muted">
                Revisados, com garantia
                <ArrowUpRight
                  className="size-5 text-accent transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  aria-hidden
                />
              </span>
            </Link>
          </li>
        </ul>
      </div>
    </section>
  );
}

const DEPOIMENTOS = [
  {
    texto:
      "Texto de exemplo. Substitua por uma avaliação real de cliente, de preferência com a cidade e o aparelho comprado.",
    nome: "Nome do cliente",
    detalhe: "Ilhéus · comprou um iPhone seminovo",
  },
  {
    texto:
      "Texto de exemplo. Avaliações reais do Google ou do Instagram da loja passam mais confiança do que textos genéricos.",
    nome: "Nome do cliente",
    detalhe: "Itabuna · comprou um Galaxy",
  },
  {
    texto: "Texto de exemplo. Peça autorização ao cliente antes de publicar o nome e a foto.",
    nome: "Nome do cliente",
    detalhe: "Ilhéus · retirou na loja",
  },
];

export function Testimonials() {
  return (
    <section aria-labelledby="depoimentos" className={cn(container, "py-16 sm:py-24")}>
      <h2 id="depoimentos" className="font-display text-3xl font-semibold tracking-[-0.025em] sm:text-4xl">
        Quem comprou, conta
      </h2>
      <ul className="mt-10 grid gap-x-10 gap-y-10 md:grid-cols-3">
        {DEPOIMENTOS.map((d, i) => (
          <li key={i} className="relative border-t border-line-strong pt-6">
            <span className="absolute -top-px left-0 h-px w-12 bg-accent" aria-hidden />
            <div className="flex items-center justify-between">
              <div className="flex gap-0.5" role="img" aria-label="5 de 5 estrelas">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star key={j} className="size-4 fill-accent text-accent" aria-hidden />
                ))}
              </div>
              <span className="rounded border border-dashed border-muted px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted">
                Exemplo
              </span>
            </div>
            <blockquote className="mt-4 text-lg leading-relaxed text-ink text-pretty">“{d.texto}”</blockquote>
            <p className="mt-5 text-sm font-semibold text-ink">{d.nome}</p>
            <p className="text-sm text-muted">{d.detalhe}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
