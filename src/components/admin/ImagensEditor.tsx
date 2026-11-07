"use client";

import { ArrowLeft, ArrowRight, ImagePlus, Loader2, Trash2 } from "lucide-react";
import Image from "next/image";
import { useRef, useState, useTransition } from "react";
import { atualizarImagem, enviarImagem, removerImagem } from "@/app/admin/actions";
import { botao, cn } from "@/lib/ui";

export interface ImagemLinha {
  id: string;
  url: string;
  cor: string | null;
}

const LIMITE = 200 * 1024; // ~200 KB
const LADO_MAX = 1400;

/** Redimensiona e converte para WebP no navegador até ficar com ~200 KB. */
async function comprimirParaWebp(arquivo: File): Promise<Blob> {
  const bitmap = await createImageBitmap(arquivo);
  let escala = Math.min(1, LADO_MAX / Math.max(bitmap.width, bitmap.height));
  let qualidade = 0.86;
  for (let tentativa = 0; tentativa < 12; tentativa++) {
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * escala);
    canvas.height = Math.round(bitmap.height * escala);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Navegador sem suporte a canvas");
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/webp", qualidade));
    if (!blob) throw new Error("Não foi possível converter a imagem");
    if (blob.type !== "image/webp") throw new Error("Este navegador não gera WebP. Use Chrome, Edge ou Firefox.");
    if (blob.size <= LIMITE) return blob;
    if (qualidade > 0.55) qualidade -= 0.08;
    else escala *= 0.85;
  }
  throw new Error("Não foi possível deixar a imagem com menos de 200 KB");
}

export function ImagensEditor({ productId, imagens, cores }: { productId: string; imagens: ImagemLinha[]; cores: string[] }) {
  const input = useRef<HTMLInputElement>(null);
  const [corEnvio, setCorEnvio] = useState<string>("");
  const [enviando, setEnviando] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [pendente, iniciar] = useTransition();

  async function enviar(arquivos: FileList) {
    setErro(null);
    for (const [i, arquivo] of [...arquivos].entries()) {
      setEnviando(`Enviando ${i + 1} de ${arquivos.length}`);
      try {
        const webp = await comprimirParaWebp(arquivo);
        const form = new FormData();
        form.set("productId", productId);
        form.set("cor", corEnvio);
        form.set("arquivo", new File([webp], "foto.webp", { type: "image/webp" }));
        const r = await enviarImagem(form);
        if (r.erro) throw new Error(r.erro);
      } catch (e) {
        setErro(`${arquivo.name}: ${e instanceof Error ? e.message : "falha no envio"}`);
        break;
      }
    }
    setEnviando(null);
    if (input.current) input.current.value = "";
  }

  return (
    <section aria-labelledby="fotos" className="rounded-2xl border border-line bg-card p-5">
      <h2 id="fotos" className="font-display text-lg font-semibold">
        Fotos
      </h2>
      <p className="mt-1 text-sm text-muted">
        As fotos são convertidas para WebP e reduzidas para até 200 KB antes do envio. Associe cada foto a uma cor para a
        galeria trocar quando o cliente escolher a cor. A primeira de cada cor aparece no card.
      </p>

      {imagens.length > 0 ? (
        <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
          {imagens.map((img, i) => (
            <li key={img.id} className={cn("rounded-xl border border-line bg-canvas p-2", pendente && "opacity-70")}>
              <div className="relative aspect-square">
                <Image src={img.url} alt="" fill sizes="200px" className="object-contain" />
              </div>
              <label className="sr-only" htmlFor={`cor-${img.id}`}>
                Cor da foto {i + 1}
              </label>
              <select
                id={`cor-${img.id}`}
                value={img.cor ?? ""}
                onChange={(e) => iniciar(() => atualizarImagem(img.id, { cor: e.target.value || null }))}
                className="mt-2 h-9 w-full rounded-md border border-line-strong bg-card px-2 text-xs"
              >
                <option value="">Todas as cores</option>
                {cores.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <div className="mt-1 flex justify-between">
                <div className="flex">
                  <button type="button" disabled={i === 0 || pendente} onClick={() => iniciar(() => atualizarImagem(img.id, { mover: -1 }))} aria-label="Mover para antes" className="grid size-9 place-items-center rounded-md text-muted hover:bg-card-2 hover:text-ink disabled:opacity-30">
                    <ArrowLeft className="size-4" aria-hidden />
                  </button>
                  <button type="button" disabled={i === imagens.length - 1 || pendente} onClick={() => iniciar(() => atualizarImagem(img.id, { mover: 1 }))} aria-label="Mover para depois" className="grid size-9 place-items-center rounded-md text-muted hover:bg-card-2 hover:text-ink disabled:opacity-30">
                    <ArrowRight className="size-4" aria-hidden />
                  </button>
                </div>
                <button
                  type="button"
                  disabled={pendente}
                  onClick={() => {
                    if (window.confirm("Remover esta foto?")) iniciar(() => removerImagem(img.id));
                  }}
                  aria-label="Remover foto"
                  className="grid size-9 place-items-center rounded-md text-muted hover:bg-danger/10 hover:text-danger"
                >
                  <Trash2 className="size-4" aria-hidden />
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 rounded-xl border border-dashed border-line-strong p-6 text-center text-sm text-muted">Nenhuma foto ainda.</p>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <label htmlFor="cor-envio" className="text-sm text-muted">
          Cor das novas fotos
        </label>
        <select
          id="cor-envio"
          value={corEnvio}
          onChange={(e) => setCorEnvio(e.target.value)}
          className="h-10 rounded-lg border border-line-strong bg-canvas px-3 text-sm"
        >
          <option value="">Todas as cores</option>
          {cores.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <input
          ref={input}
          id="upload"
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          onChange={(e) => e.target.files?.length && enviar(e.target.files)}
        />
        <label htmlFor="upload" className={botao("secundario", "sm", enviando ? "pointer-events-none opacity-60" : "")}>
          {enviando ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <ImagePlus className="size-4" aria-hidden />}
          {enviando ?? "Enviar fotos"}
        </label>
      </div>
      {erro && (
        <p role="alert" className="mt-3 text-sm text-danger">
          {erro}
        </p>
      )}
    </section>
  );
}
