"use client";

import { Minus, Plus } from "lucide-react";

export function QuantityStepper({
  valor,
  max,
  onChange,
  nome,
}: {
  valor: number;
  max: number;
  onChange: (n: number) => void;
  nome: string;
}) {
  const botao =
    "grid size-10 place-items-center rounded-lg text-ink transition-[background-color,transform] duration-150 hover:bg-card-2 active:scale-95 disabled:pointer-events-none disabled:text-subtle";
  return (
    <div className="inline-flex items-center rounded-xl border border-line-strong p-0.5" role="group" aria-label={`Quantidade de ${nome}`}>
      <button type="button" className={botao} onClick={() => onChange(valor - 1)} disabled={valor <= 1} aria-label="Diminuir quantidade">
        <Minus className="size-4" aria-hidden />
      </button>
      <output className="w-8 text-center text-sm font-semibold tabular-nums" aria-live="polite">
        {valor}
      </output>
      <button type="button" className={botao} onClick={() => onChange(valor + 1)} disabled={valor >= max} aria-label="Aumentar quantidade">
        <Plus className="size-4" aria-hidden />
      </button>
    </div>
  );
}
