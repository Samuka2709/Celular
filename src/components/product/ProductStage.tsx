import Image from "next/image";
import { cn } from "@/lib/ui";

/** Foto do produto sobre um pedestal com brilho laranja atrás (vitrine). */
export function ProductStage({
  src,
  alt,
  sizes,
  priority = false,
  esgotado = false,
  pedestal = true,
  className,
  imgClassName,
}: {
  src: string;
  alt: string;
  sizes: string;
  priority?: boolean;
  esgotado?: boolean;
  pedestal?: boolean;
  className?: string;
  imgClassName?: string;
}) {
  return (
    <div className={cn("relative aspect-square isolate", className)}>
      <div
        aria-hidden
        className={cn(
          "absolute inset-[10%] -z-10 stage-glow transition-opacity duration-200",
          esgotado ? "opacity-0" : "opacity-100",
        )}
      />
      {pedestal && (
        <div
          aria-hidden
          className="absolute bottom-[4%] left-1/2 -z-10 h-[11%] w-[64%] -translate-x-1/2 rounded-[50%] pedestal"
        />
      )}
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className={cn(
          "object-contain transition-[transform,filter,opacity] duration-200 ease-out",
          esgotado && "grayscale opacity-60",
          imgClassName,
        )}
      />
    </div>
  );
}
