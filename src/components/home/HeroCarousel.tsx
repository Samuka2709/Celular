"use client";

import { ArrowRight, Lock, MessageCircle, Pause, Play, ShieldCheck, Truck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { formatBRL } from "@/lib/format";
import { botao, cn, container } from "@/lib/ui";

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
      className="relative overflow-hidden border-b border-line bg-canvas"
      onMouseEnter={() => setInteracao(true)}
      onMouseLeave={() => setInteracao(false)}
      onFocus={() => setInteracao(true)}
      onBlur={() => setInteracao(false)}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") ir(atual + 1);
        if (e.key === "ArrowLeft") ir(atual - 1);
      }}
    >
      {/* Cena: fone, celular e relógio no pedestal (imagem gerada, em public/hero) */}
      <div aria-hidden className="relative aspect-[3/2] w-full md:absolute md:inset-y-0 md:right-0 md:aspect-auto md:w-[64%]">
        <Image
          src="/hero/vitrine.webp"
          alt=""
          fill
          priority
          sizes="(min-width: 768px) 64vw, 100vw"
          className="object-cover object-[70%_center]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(to_top,#0a1626_0%,transparent_35%)] md:bg-[linear-gradient(to_right,#0a1626_0%,rgb(10_22_38/0.6)_22%,transparent_50%)]" />
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
                  "col-start-1 row-start-1 grid items-center gap-2 pb-4 pt-2 md:min-h-[480px] md:grid-cols-[1fr_1.05fr] md:gap-6 md:py-14 lg:min-h-[540px]",
                  "transition-opacity duration-500 ease-out",
                  ativo ? "opacity-100" : "opacity-0",
                )}
              >
                <div className="relative z-10 md:order-1">
                  <h2 className="font-display text-[2.3rem] font-bold uppercase leading-[0.98] tracking-[-0.01em] sm:text-6xl lg:text-[4.1rem]">
                    <span className="block">{s.linha1}</span>
                    <span className="block text-accent">{s.linha2}</span>
                  </h2>
                  <p className="mt-4 max-w-md text-base leading-relaxed text-muted">{s.subtitulo}</p>
                  <ul className="mt-6 hidden max-w-md grid-cols-4 gap-x-4 lg:grid">
                    {SELOS.map(({ icone: Icone, linha1, linha2 }) => (
                      <li key={linha1} className="flex items-center gap-2 text-xs font-semibold uppercase leading-tight tracking-wide text-muted">
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
                <div aria-hidden className="hidden md:order-2 md:block" />
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
