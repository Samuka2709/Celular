"use client";

import { X } from "lucide-react";
import { useEffect, useId, useRef } from "react";
import { cn } from "@/lib/ui";

/** Gaveta lateral acessível (menu mobile e filtros). */
export function Drawer({
  open,
  onClose,
  titulo,
  lado = "esquerda",
  children,
  rodape,
}: {
  open: boolean;
  onClose: () => void;
  titulo: string;
  lado?: "esquerda" | "direita";
  children: React.ReactNode;
  rodape?: React.ReactNode;
}) {
  const painel = useRef<HTMLDivElement>(null);
  const fechar = useRef<HTMLButtonElement>(null);
  const anterior = useRef<HTMLElement | null>(null);
  const id = useId();

  useEffect(() => {
    if (!open) return;
    anterior.current = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    fechar.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab" && painel.current) {
        const foco = painel.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        if (!foco.length) return;
        const primeiro = foco[0];
        const ultimo = foco[foco.length - 1];
        if (e.shiftKey && document.activeElement === primeiro) {
          e.preventDefault();
          ultimo.focus();
        } else if (!e.shiftKey && document.activeElement === ultimo) {
          e.preventDefault();
          primeiro.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", onKey);
      anterior.current?.focus?.();
    };
  }, [open, onClose]);

  return (
    <div className={cn("fixed inset-0 z-[60]", !open && "pointer-events-none")} inert={!open}>
      <div
        aria-hidden
        onClick={onClose}
        className={cn(
          "absolute inset-0 bg-black/60 transition-opacity duration-200 ease-out",
          open ? "opacity-100" : "opacity-0",
        )}
      />
      <div
        ref={painel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={id}
        className={cn(
          "absolute top-0 flex h-full w-[min(88vw,380px)] flex-col border-line bg-canvas shadow-[0_0_40px_rgb(0_0_0/0.5)]",
          "transition-transform duration-300 [transition-timing-function:cubic-bezier(0.32,0.72,0,1)]",
          lado === "esquerda" ? "left-0 border-r" : "right-0 border-l",
          open ? "translate-x-0" : lado === "esquerda" ? "-translate-x-full" : "translate-x-full",
        )}
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-line px-4">
          <h2 id={id} className="font-display text-lg font-semibold">
            {titulo}
          </h2>
          <button
            ref={fechar}
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="grid size-11 place-items-center rounded-lg text-muted transition-colors duration-150 hover:bg-card-2 hover:text-ink"
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto overscroll-contain">{children}</div>
        {rodape && <div className="shrink-0 border-t border-line p-4">{rodape}</div>}
      </div>
    </div>
  );
}
