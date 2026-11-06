"use client";

import Image from "next/image";
import { useState } from "react";
import type { ProductImage } from "@/lib/types";
import { cn } from "@/lib/ui";
import { ProductStage } from "./ProductStage";

export function ProductGallery({ imagens, esgotado }: { imagens: ProductImage[]; esgotado: boolean }) {
  const [ativa, setAtiva] = useState(0);
  const atual = imagens[Math.min(ativa, imagens.length - 1)];

  return (
    <div className="flex flex-col gap-3 lg:flex-row-reverse">
      <div className="relative flex-1 overflow-hidden rounded-3xl border border-line bg-card">
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_100%,rgb(255_106_0/0.10),transparent_60%)]"
        />
        <ProductStage
          key={atual.url}
          src={atual.url}
          alt={atual.alt}
          priority
          esgotado={esgotado}
          sizes="(min-width: 1024px) 560px, 100vw"
          className="animate-fade-up mx-auto max-w-[560px]"
        />
      </div>
      {imagens.length > 1 && (
        <div
          role="tablist"
          aria-label="Fotos do produto"
          className="no-scrollbar flex gap-2 overflow-x-auto lg:flex-col"
        >
          {imagens.map((img, i) => (
            <button
              key={img.url}
              type="button"
              role="tab"
              aria-selected={i === ativa}
              aria-label={`Ver foto ${i + 1}: ${img.alt}`}
              onClick={() => setAtiva(i)}
              className={cn(
                "relative size-20 shrink-0 overflow-hidden rounded-xl border bg-card transition-[border-color,transform] duration-150 active:scale-95",
                i === ativa ? "border-accent" : "border-line hover:border-line-strong",
              )}
            >
              <Image
                src={img.url}
                alt=""
                fill
                sizes="80px"
                className={cn("object-contain p-1.5", esgotado && "grayscale")}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
