import { Skeleton } from "@/components/ui/Skeleton";
import { cn, container } from "@/lib/ui";

export default function Loading() {
  return (
    <div role="status" aria-label="Carregando produto" className={cn(container, "pb-8 pt-6")}>
      <Skeleton className="h-4 w-56" />
      <div className="mt-6 grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:gap-14">
        <Skeleton className="aspect-square w-full rounded-3xl" />
        <div>
          <Skeleton className="h-6 w-24" />
          <Skeleton className="mt-4 h-10 w-3/4" />
          <Skeleton className="mt-2 h-4 w-1/3" />
          <Skeleton className="mt-8 h-12 w-1/2" />
          <Skeleton className="mt-3 h-4 w-1/3" />
          <div className="mt-10 flex gap-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="size-11 rounded-full" />
            ))}
          </div>
          <div className="mt-6 flex gap-2">
            {[0, 1].map((i) => (
              <Skeleton key={i} className="h-11 w-24 rounded-xl" />
            ))}
          </div>
          <Skeleton className="mt-10 h-14 w-full rounded-xl" />
          <Skeleton className="mt-3 h-14 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
