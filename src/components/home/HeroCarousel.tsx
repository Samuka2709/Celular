"use client";

import { ArrowRight, ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
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

export function HeroCarousel({ slides }: { slides: HeroSlide[] }) {
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
      className="relative overflow-hidden"
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
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_70%_at_75%_55%,rgb(255_106_0/0.16),transparent_70%)]"
      />
      <div className={cn(container, "relative")}>
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
                  "col-start-1 row-start-1 grid items-center gap-2 pb-6 pt-8 md:grid-cols-[1.05fr_1fr] md:gap-8 md:py-16 lg:py-20",
                  "transition-opacity duration-500 ease-out",
                  ativo ? "opacity-100" : "opacity-0",
                )}
              >
                <div className="relative z-10 order-2 md:order-1">
                  <h2 className="font-display text-[2.6rem] font-bold leading-[1.02] tracking-[-0.035em] sm:text-6xl lg:text-7xl">
                    <span className="block">{s.linha1}</span>
                    <span className="block text-accent">{s.linha2}</span>
                  </h2>
                  <p className="mt-5 max-w-md text-base leading-relaxed text-muted sm:text-lg">{s.subtitulo}</p>
                  <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
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
                    "order-1 mx-auto w-full max-w-[300px] transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] sm:max-w-[380px] md:order-2 md:max-w-[520px]",
                    ativo ? "translate-y-0 scale-100" : "translate-y-4 scale-[0.97]",
                  )}
                >
                  <ProductStage src={s.imagem} alt={s.imagemAlt} priority={i === 0} sizes="(min-width: 768px) 520px, 300px" />
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center gap-2 pb-8 md:-mt-6">
          <button
            type="button"
            onClick={() => ir(atual - 1)}
            aria-label="Slide anterior"
            className="grid size-11 place-items-center rounded-full border border-line-strong text-ink transition-colors duration-150 hover:border-muted active:scale-95"
          >
            <ChevronLeft className="size-5" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => ir(atual + 1)}
            aria-label="Próximo slide"
            className="grid size-11 place-items-center rounded-full border border-line-strong text-ink transition-colors duration-150 hover:border-muted active:scale-95"
          >
            <ChevronRight className="size-5" aria-hidden />
          </button>
          <div className="ml-2 flex items-center">
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
                    "block h-1.5 rounded-full transition-[width,background-color] duration-300 ease-out",
                    i === atual ? "w-6 bg-accent" : "w-1.5 bg-line-strong",
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
    </section>
  );
}
