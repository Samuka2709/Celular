import { cn } from "@/lib/ui";

type Tom = "destaque" | "contorno" | "seminovo" | "alerta" | "neutro";

const tons: Record<Tom, string> = {
  destaque: "bg-accent text-canvas",
  contorno: "border border-line-strong bg-canvas/80 text-ink",
  seminovo: "bg-ink text-canvas",
  alerta: "border border-accent/60 bg-canvas/80 text-accent",
  neutro: "bg-line-strong text-ink",
};

export function Badge({
  children,
  tom = "contorno",
  className,
}: {
  children: React.ReactNode;
  tom?: Tom;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center rounded-md px-2 text-[11px] font-semibold uppercase tracking-wide whitespace-nowrap backdrop-blur-sm",
        tons[tom],
        className,
      )}
    >
      {children}
    </span>
  );
}
