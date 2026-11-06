"use client";

import { useEffect, useState } from "react";

function restante(alvo: number) {
  const diff = Math.max(0, alvo - Date.now());
  return {
    dias: Math.floor(diff / 86_400_000),
    horas: Math.floor((diff / 3_600_000) % 24),
    min: Math.floor((diff / 60_000) % 60),
    seg: Math.floor((diff / 1000) % 60),
    fim: diff === 0,
  };
}

/** Fim da oferta: próximo domingo às 23:59:59 (horário local). */
function proximoDomingo() {
  const d = new Date();
  d.setDate(d.getDate() + ((7 - d.getDay()) % 7));
  d.setHours(23, 59, 59, 0);
  return d.getTime();
}

export function Countdown({ ate }: { ate?: string }) {
  const [alvo, setAlvo] = useState<number | null>(null);
  const [t, setT] = useState<ReturnType<typeof restante> | null>(null);

  useEffect(() => {
    const a = ate ? new Date(ate).getTime() : proximoDomingo();
    setAlvo(a);
    setT(restante(a));
    const id = setInterval(() => setT(restante(a)), 1000);
    return () => clearInterval(id);
  }, [ate]);

  const blocos: [string, number | undefined][] = [
    ["dias", t?.dias],
    ["horas", t?.horas],
    ["min", t?.min],
    ["seg", t?.seg],
  ];

  return (
    <div>
      <p className="sr-only" aria-live="off">
        {t && alvo ? `A oferta termina em ${t.dias} dias, ${t.horas} horas e ${t.min} minutos` : ""}
      </p>
      <div className="flex gap-1.5 sm:gap-3" aria-hidden>
        {blocos.map(([rotulo, valor], i) => (
          <div key={rotulo} className="flex items-start gap-1.5 sm:gap-3">
            <div className="grid w-[3.75rem] place-items-center rounded-xl border border-line-strong bg-canvas py-3 sm:w-20">
              <span className="font-display text-[1.7rem] font-semibold leading-none tabular-nums sm:text-4xl">
                {valor === undefined ? "--" : String(valor).padStart(2, "0")}
              </span>
              <span className="mt-1.5 text-[11px] font-medium uppercase tracking-wider text-muted">{rotulo}</span>
            </div>
            {i < 3 && <span className="mt-3 hidden font-display text-2xl text-subtle sm:block">:</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
