import Link from "next/link";
import { SITE } from "@/lib/site";
import { cn } from "@/lib/ui";

/** Marca provisória: troque o nome em src/lib/site.ts */
export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("inline-flex items-center gap-2.5", className)} aria-label={`${SITE.nome}, página inicial`}>
      <svg viewBox="0 0 32 32" className="size-8 shrink-0" aria-hidden>
        <rect x="1" y="1" width="30" height="30" rx="9" fill="var(--color-accent)" />
        <rect x="10.5" y="6.5" width="11" height="19" rx="3" fill="none" stroke="var(--color-canvas)" strokeWidth="2.2" />
        <circle cx="16" cy="21.5" r="1.3" fill="var(--color-canvas)" />
      </svg>
      <span className="font-display text-lg font-bold tracking-tight text-ink">{SITE.nome}</span>
    </Link>
  );
}
