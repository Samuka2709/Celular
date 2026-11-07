"use client";

import { ArrowRight, Lock, MessageCircle, Pause, Play, ShieldCheck, Truck } from "lucide-react";
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
      className={cn(container, "pt-4 sm:pt-6")}
      onMouseEnter={() => setInteracao(true)}
      onMouseLeave={() => setInteracao(false)}
      onFocus={() => setInteracao(true)}
      onBlur={() => setInteracao(false)}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") ir(atual + 1);
        if (e.key === "ArrowLeft") ir(atual - 1);
      }}
    >
      <div className="relative overflow-hidden rounded-3xl border border-line bg-[linear-gradient(120deg,#131317_0%,#0c0c0f_50%,#16161b_100%)] px-5 sm:px-10 lg:px-14">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(45%_70%_at_72%_62%,rgb(255_106_0/0.22),transparent_70%)]"
        />
        {/* Moldura geométrica com filetes laranja atrás do produto */}
        <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 hidden w-[58%] md:block">
          <div className="absolute right-[12%] top-[12%] h-[62%] w-[52%] rounded-[28px] border border-white/10 bg-[linear-gradient(160deg,rgb(255_255_255/0.06),transparent_60%)] [clip-path:polygon(12%_0,100%_0,100%_88%,88%_100%,0_100%,0_12%)]" />
          <span className="absolute right-[10%] top-[10%] h-[2px] w-[22%] bg-white/50 shadow-[0_0_14px_rgb(255_255_255/0.6)]" />
          <span className="absolute right-[3%] top-[-5%] h-[70%] w-[2px] origin-top -rotate-[32deg] bg-gradient-to-b from-transparent via-accent to-transparent shadow-[0_0_12px_rgb(255_106_0/0.8)]" />
          <span className="absolute bottom-[-5%] right-[-2%] h-[45%] w-[2px] origin-bottom rotate-[32deg] bg-gradient-to-t from-transparent via-accent to-transparent shadow-[0_0_12px_rgb(255_106_0/0.8)]" />
          <span className="absolute bottom-[14%] left-[12%] h-[3px] w-[70%] rounded-full bg-accent/70 blur-[2px]" />
        </div>
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
                  <ProductStage src={s.imagem} alt={s.imagemAlt} priority={i === 0} sizes="(min-width: 768px) 520px, 300px" />
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
