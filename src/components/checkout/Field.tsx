import { cn } from "@/lib/ui";

export function Field({
  id,
  label,
  erro,
  dica,
  opcional,
  className,
  children,
}: {
  id: string;
  label: string;
  erro?: string;
  dica?: string;
  opcional?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 flex items-baseline justify-between text-sm font-medium text-ink">
        {label}
        {opcional && <span className="text-xs font-normal text-muted">Opcional</span>}
      </label>
      {children}
      {erro ? (
        <p id={`${id}-erro`} className="mt-1.5 text-sm text-danger">
          {erro}
        </p>
      ) : dica ? (
        <p id={`${id}-dica`} className="mt-1.5 text-xs text-muted">
          {dica}
        </p>
      ) : null}
    </div>
  );
}

export function inputClasses(erro?: string) {
  return cn(
    "h-12 w-full rounded-xl border bg-canvas px-4 text-base text-ink caret-accent placeholder:text-subtle",
    "transition-[border-color,box-shadow] duration-150 focus:outline-none",
    erro
      ? "border-danger focus:shadow-[0_0_0_3px_rgb(248_113_113/0.25)]"
      : "border-line-strong hover:border-muted focus:border-accent focus:shadow-[0_0_0_3px_rgb(255_106_0/0.2)]",
  );
}
