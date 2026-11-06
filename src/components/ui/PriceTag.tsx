import { formatBRL, parcelamento } from "@/lib/format";
import { SITE } from "@/lib/site";
import { cn } from "@/lib/ui";

export function PriceTag({
  preco,
  precoAntigo,
  precoPix,
  tamanho = "sm",
  esgotado = false,
  className,
}: {
  preco: number;
  precoAntigo?: number | null;
  precoPix: number;
  tamanho?: "sm" | "lg";
  esgotado?: boolean;
  className?: string;
}) {
  const parc = parcelamento(preco);
  const grande = tamanho === "lg";
  return (
    <div className={cn("tabular-nums", esgotado && "opacity-60", className)}>
      {precoAntigo && precoAntigo > preco ? (
        <p className={cn("text-muted line-through", grande ? "text-sm" : "text-xs")}>
          <span className="sr-only">De </span>
          {formatBRL(precoAntigo)}
        </p>
      ) : (
        <p className={cn("invisible", grande ? "hidden" : "text-xs")} aria-hidden>
          &nbsp;
        </p>
      )}
      <p
        className={cn(
          "font-display font-semibold tracking-tight text-ink",
          grande ? "text-4xl sm:text-[2.75rem] leading-none" : "text-xl leading-tight",
        )}
      >
        {precoAntigo && precoAntigo > preco && <span className="sr-only">Por </span>}
        {formatBRL(preco)}
      </p>
      <p className={cn("mt-1 text-accent", grande ? "text-base" : "text-[13px]")}>
        <strong className="font-semibold">{formatBRL(precoPix)}</strong> no Pix
        {grande && <span className="text-muted"> ({Math.round(SITE.descontoPix * 100)}% de desconto)</span>}
      </p>
      {parc && (
        <p className={cn("text-muted", grande ? "mt-1 text-sm" : "text-xs")}>
          ou {parc.parcelas}x de {formatBRL(parc.valor)} sem juros
        </p>
      )}
    </div>
  );
}
