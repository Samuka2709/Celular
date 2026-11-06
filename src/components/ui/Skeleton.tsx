import { cn } from "@/lib/ui";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "relative overflow-hidden rounded-lg bg-card-2",
        "after:absolute after:inset-0 after:-translate-x-full after:animate-[shimmer_1.4s_infinite]",
        "after:bg-gradient-to-r after:from-transparent after:via-white/5 after:to-transparent",
        className,
      )}
    />
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="rounded-2xl border border-line bg-card p-3">
      <Skeleton className="aspect-square w-full rounded-xl" />
      <Skeleton className="mt-4 h-3 w-16" />
      <Skeleton className="mt-2 h-4 w-3/4" />
      <Skeleton className="mt-2 h-3 w-1/2" />
      <Skeleton className="mt-4 h-6 w-2/3" />
      <Skeleton className="mt-2 h-3 w-1/2" />
      <Skeleton className="mt-4 h-10 w-full rounded-xl" />
    </div>
  );
}

export function GridSkeleton({ itens = 8 }: { itens?: number }) {
  return (
    <div role="status" aria-label="Carregando produtos" className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {Array.from({ length: itens }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
