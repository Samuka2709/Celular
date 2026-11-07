"use client";

import { ArrowRight, Lock, MessageCircle, Pause, Play, ShieldCheck, Truck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { formatBRL } from "@/lib/format";
import { botao, cn, container } from "@/lib/ui";
import { ProductStage } from "../product/ProductStage";

export interface HeroSlide {
  linha1: string;
  linha2: string;
  subtitulo: string;
  href: string;
  imagem: string;
  imagemAlt: string;
  aPartirDe: number;
}

const INTERVALO = 6500;

const SELOS = [
  { icone: ShieldCheck, linha1: "Garantia", linha2: "de verdade" },
  { icone: Truck, linha1: "Entrega ou", linha2: "retirada" },
  { icone: Lock, linha1: "Pagamento", linha2: "seguro" },
  { icone: MessageCircle, linha1: "Atendimento", linha2: "WhatsApp" },
];

export interface HeroAcessorio {
  src: string;
  alt: string;
}

export function HeroCarousel({ slides, acessorios = [] }: { slides: HeroSlide[]; acessorios?: HeroAcessorio[] }) {
  const [esq, dir] = acessorios;
  const [atual, setAtual] = useState(0);
  const [pausado, setPausado] = useState(false);
  const [interacao, setInteracao] = useState(false);
  const [reduzido, setReduzido] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduzido(mq.matches);
    const on = () => setReduzido(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  const ir = useCallback((i: number) => setAtual((i + slides.length) % slides.length), [slides.length]);

  useEffect(() => {
    if (pausado || interacao || reduzido) return;
    const t = setTimeout(() => ir(atual + 1), INTERVALO);
    return () => clearTimeout(t);
  }, [atual, pausado, interacao, reduzido, ir]);

  return (
    <section
      aria-roledescription="carrossel"
      aria-label="Destaques"
      className="relative overflow-hidden border-b border-line bg-[linear-gradient(115deg,#121215_0%,#0a0a0c_45%,#141418_100%)]"
      onMouseEnter={() => setInteracao(true)}
      onMouseLeave={() => setInteracao(false)}
      onFocus={() => setInteracao(true)}
      onBlur={() => setInteracao(false)}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") ir(atual + 1);
        if (e.key === "ArrowLeft") ir(atual - 1);
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(40%_65%_at_72%_60%,rgb(255_106_0/0.22),transparent_70%)]"
      />
      {/* Cenário: moldura em néon e filetes laranja atrás do produto */}
      <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 hidden w-[60%] md:block">
        <div className="absolute left-[16%] top-[8%] h-[78%] w-[62%] [clip-path:polygon(14%_0,86%_0,100%_18%,100%_82%,86%_100%,14%_100%,0_82%,0_18%)] bg-white/[0.07]" />
        <div className="absolute left-[17%] top-[9.5%] h-[75%] w-[60%] [clip-path:polygon(14%_0,86%_0,100%_18%,100%_82%,86%_100%,14%_100%,0_82%,0_18%)] bg-[#0d0d10]" />
        <span className="absolute left-[24%] top-[8%] h-[3px] w-[24%] rounded-full bg-white shadow-[0_0_18px_4px_rgb(255_255_255/0.45)]" />
        <span className="absolute right-[22%] top-[22%] h-[30%] w-[3px] rounded-full bg-white/90 shadow-[0_0_18px_4px_rgb(255_255_255/0.35)]" />
        <span className="absolute right-[6%] top-0 h-[55%] w-[3px] origin-top rotate-[-35deg] rounded-full bg-accent shadow-[0_0_16px_3px_rgb(255_106_0/0.75)]" />
        <span className="absolute right-[1%] bottom-[8%] h-[38%] w-[3px] origin-bottom rotate-[35deg] rounded-full bg-accent shadow-[0_0_16px_3px_rgb(255_106_0/0.75)]" />
        <span className="absolute left-[2%] top-[30%] h-[3px] w-[10%] rotate-[-35deg] rounded-full bg-accent/80 shadow-[0_0_12px_2px_rgb(255_106_0/0.6)]" />
      </div>
      <div className={cn(container, "relative")}>
        <div className="relative">
        <div className="grid">
          {slides.map((s, i) => {
            const ativo = i === atual;
            return (
              <div
                key={s.href + i}
                role="group"
                aria-roledescription="slide"
                aria-label={`${i + 1} de ${slides.length}`}
                aria-hidden={!ativo}
                inert={!ativo}
                className={cn(
                  "col-start-1 row-start-1 grid items-center gap-2 pb-4 pt-8 md:grid-cols-[1fr_1.05fr] md:gap-6 md:pb-12 md:pt-14",
                  "transition-opacity duration-500 ease-out",
                  ativo ? "opacity-100" : "opacity-0",
                )}
              >
                <div className="relative z-10 order-2 md:order-1">
                  <h2 className="font-display text-[2.3rem] font-bold uppercase leading-[0.98] tracking-[-0.01em] sm:text-6xl lg:text-[4.1rem]">
                    <span className="block">{s.linha1}</span>
                    <span className="block text-accent">{s.linha2}</span>
                  </h2>
                  <p className="mt-4 max-w-md text-base leading-relaxed text-muted">{s.subtitulo}</p>
                  <ul className="mt-6 grid max-w-md grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-4">
                    {SELOS.map(({ icone: Icone, linha1, linha2 }) => (
                      <li key={linha1} className="flex items-center gap-2 text-[10px] font-semibold uppercase leading-tight tracking-wider text-muted">
                        <Icone className="size-5 shrink-0 text-ink" strokeWidth={1.6} aria-hidden />
                        <span>
                          {linha1}
                          <br />
                          {linha2}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-4">
                    <Link href={s.href} className={botao("primario", "lg")} tabIndex={ativo ? 0 : -1}>
                      Comprar agora
                      <ArrowRight className="size-5" aria-hidden />
                    </Link>
                    <p className="text-sm text-muted tabular-nums">
                      a partir de <span className="font-semibold text-ink">{formatBRL(s.aPartirDe)}</span>
                    </p>
                  </div>
                </div>
                <div
                  className={cn(
                    "order-1 mx-auto w-full max-w-[280px] transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] sm:max-w-[360px] md:order-2 md:max-w-[480px]",
                    ativo ? "translate-y-0 scale-100" : "translate-y-4 scale-[0.97]",
                  )}
                >
                  <div className="relative">
                    {/* Pedestal com aro laranja aceso */}
                    <div aria-hidden className="absolute bottom-[2%] left-1/2 h-[16%] w-[86%] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(ellipse_at_50%_35%,#2c2c33_0%,#151519_60%,#0b0b0d_100%)] shadow-[0_0_0_2px_rgb(255_106_0/0.9),0_0_28px_6px_rgb(255_106_0/0.55),0_24px_40px_-10px_rgb(0_0_0/0.9)]" />
                    <div aria-hidden className="absolute bottom-[9%] left-1/2 h-[10%] w-[70%] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(ellipse_at_50%_40%,#34343c_0%,#1a1a1f_70%)] shadow-[inset_0_1px_0_rgb(255_255_255/0.12)]" />
                    <ProductStage
                      src={s.imagem}
                      alt={s.imagemAlt}
                      priority={i === 0}
                      pedestal={false}
                      className="relative -mt-2"
                      imgClassName="scale-[0.84] translate-y-[3%] drop-shadow-[0_20px_30px_rgb(0_0_0/0.7)]"
                      sizes="(min-width: 768px) 480px, 280px"
                    />
                    {/* Acessórios ao lado do celular, sobre o mesmo pedestal */}
                    {esq && (
                      <div className="absolute bottom-[9%] left-[0%] aspect-square w-[44%]">
                        <Image src={esq.src} alt={esq.alt} fill sizes="(min-width: 768px) 200px, 120px" className="object-contain drop-shadow-[0_16px_20px_rgb(0_0_0/0.75)]" />
                      </div>
                    )}
                    {dir && (
                      <div className="absolute bottom-[9%] right-[1%] aspect-square w-[34%]">
                        <Image src={dir.src} alt={dir.alt} fill sizes="(min-width: 768px) 150px, 90px" className="object-contain drop-shadow-[0_16px_20px_rgb(0_0_0/0.75)]" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-center gap-1 pb-4 md:-mt-6">
          <div className="flex items-center">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => ir(i)}
                aria-label={`Ir para o slide ${i + 1}`}
                aria-current={i === atual}
                className="grid h-11 w-7 place-items-center"
              >
                <span
                  className={cn(
                    "block h-2 rounded-full transition-[width,background-color] duration-300 ease-out",
                    i === atual ? "w-2 bg-accent shadow-[0_0_8px_rgb(255_106_0/0.9)]" : "w-2 bg-muted/60",
                  )}
                />
              </button>
            ))}
          </div>
          {!reduzido && (
            <button
              type="button"
              onClick={() => setPausado((p) => !p)}
              aria-label={pausado ? "Retomar troca automática" : "Pausar troca automática"}
              className="ml-1 grid size-11 place-items-center rounded-full text-muted transition-colors duration-150 hover:text-ink"
            >
              {pausado ? <Play className="size-4" aria-hidden /> : <Pause className="size-4" aria-hidden />}
            </button>
          )}
        </div>
        </div>
      </div>
    </section>
  );
}
