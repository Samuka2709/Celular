export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

type Variante = "primario" | "secundario" | "fantasma" | "whatsapp" | "claro";
type Tamanho = "sm" | "md" | "lg" | "icone";

const base =
  "inline-flex items-center justify-center gap-2 rounded-xl font-semibold select-none " +
  "transition-[background-color,border-color,color,transform,box-shadow] duration-150 ease-out " +
  "active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 cursor-pointer";

const variantes: Record<Variante, string> = {
  primario:
    "bg-accent text-canvas hover:bg-accent-hover shadow-[0_8px_20px_-10px_rgb(255_106_0/0.7)]",
  secundario: "border border-line-strong bg-card text-ink hover:border-muted hover:bg-card-2",
  fantasma: "text-ink hover:bg-card-2",
  whatsapp: "border border-whatsapp/50 bg-whatsapp/10 text-ink hover:bg-whatsapp/20 hover:border-whatsapp",
  claro: "bg-canvas text-ink hover:bg-card-2",
};

const tamanhos: Record<Tamanho, string> = {
  sm: "h-10 px-4 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-14 px-7 text-base",
  icone: "size-14 shrink-0",
};

export function botao(variante: Variante = "primario", tamanho: Tamanho = "md", extra?: string) {
  return cn(base, variantes[variante], tamanhos[tamanho], extra);
}

export const container = "mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8";
