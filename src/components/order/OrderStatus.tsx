"use client";

import { useEffect } from "react";
import { useCart } from "@/lib/cart";
import { cn } from "@/lib/ui";

/** Esvazia o carrinho quando o cliente chega na página de sucesso. */
export function ClearCartOnMount() {
  const { clear, hydrated } = useCart();
  useEffect(() => {
    if (hydrated) clear();
  }, [hydrated, clear]);
  return null;
}

export function StatusIcon({ tipo }: { tipo: "sucesso" | "pendente" | "falha" }) {
  const cor = tipo === "sucesso" ? "var(--color-accent)" : tipo === "pendente" ? "var(--color-muted)" : "var(--color-danger)";
  return (
    <div className={cn("animate-pop relative mx-auto grid size-24 place-items-center")} aria-hidden>
      <div
        className="absolute inset-0 rounded-full"
        style={{ background: `radial-gradient(closest-side, color-mix(in srgb, ${cor} 30%, transparent), transparent)` }}
      />
      <svg viewBox="0 0 52 52" className="relative size-20">
        <circle cx="26" cy="26" r="24" fill="none" stroke={cor} strokeWidth="2.5" opacity="0.35" />
        {tipo === "sucesso" && (
          <path
            className="animate-draw"
            d="M15 27 l7 7 l15 -16"
            fill="none"
            stroke={cor}
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
        {tipo === "pendente" && (
          <path
            className="animate-draw"
            d="M26 14 v12 l8 5"
            fill="none"
            stroke="var(--color-ink)"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
        {tipo === "falha" && (
          <path
            className="animate-draw"
            d="M18 18 l16 16 M34 18 l-16 16"
            fill="none"
            stroke={cor}
            strokeWidth="3.5"
            strokeLinecap="round"
          />
        )}
      </svg>
    </div>
  );
}
