import { GridSkeleton, Skeleton } from "@/components/ui/Skeleton";
import { container } from "@/lib/ui";

export default function Loading() {
  return (
    <div className={container}>
      <div className="pb-8 pt-6 sm:pt-10">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="mt-4 h-12 w-64" />
        <Skeleton className="mt-3 h-4 w-96 max-w-full" />
      </div>
      <GridSkeleton />
    </div>
  );
}
