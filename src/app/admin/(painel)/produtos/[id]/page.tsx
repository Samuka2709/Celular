import { ArrowLeft, ExternalLink } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ImagensEditor } from "@/components/admin/ImagensEditor";
import { ProdutoForm } from "@/components/admin/ProdutoForm";
import { ProdutoLinhaAcoes } from "@/components/admin/ProdutoLinhaAcoes";
import { VariantesEditor } from "@/components/admin/VariantesEditor";
import { exigirAdmin } from "@/lib/admin";
import { paraCampo } from "@/lib/format";
import { botao } from "@/lib/ui";

export const metadata: Metadata = { title: "Editar produto" };

export default async function EditarProdutoPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ novo?: string; copia?: string }>;
}) {
  const { id } = await params;
  const { novo, copia } = await searchParams;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const { supabase } = await exigirAdmin();

  const { data: p } = await supabase
    .from("products")
    .select("*, product_variants(*), product_images(id, url, cor, ordem)")
    .eq("id", id)
    .maybeSingle();
  if (!p) notFound();

  type V = {
    id: string;
    cor: string;
    cor_hex: string;
    armazenamento: string | null;
    preco: number;
    preco_antigo: number | null;
    preco_pix: number;
    estoque: number;
    estoque_reservado: number;
    sku: string | null;
    ordem: number;
  };
  const variantes = ([...(p.product_variants ?? [])] as V[]).sort((a, b) => a.ordem - b.ordem);
  const imagens = ([...(p.product_images ?? [])] as { id: string; url: string; cor: string | null; ordem: number }[]).sort(
    (a, b) => a.ordem - b.ordem,
  );
  const cores = [...new Set(variantes.map((v) => v.cor))];

  return (
    <>
      <Link href="/admin/produtos" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink">
        <ArrowLeft className="size-4" aria-hidden />
        Produtos
      </Link>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl font-semibold tracking-tight">{p.nome}</h1>
        <div className="flex items-center gap-2">
          <ProdutoLinhaAcoes id={p.id} ativo={p.ativo} slug={p.slug} />
          <a href={`/produto/${p.slug}`} target="_blank" className={botao("secundario", "sm")}>
            <ExternalLink className="size-4" aria-hidden />
            Ver na loja
          </a>
        </div>
      </div>

      {(novo || copia) && (
        <p className="mb-6 rounded-xl border border-accent/40 bg-accent/5 p-4 text-sm text-muted">
          {novo
            ? "Produto criado. Agora cadastre as variações e envie as fotos."
            : "Cópia criada desativada e com estoque zerado. Revise, ajuste o estoque e ative quando estiver pronta."}
        </p>
      )}

      <div className="space-y-6">
        <VariantesEditor
          productId={p.id}
          iniciais={variantes.map((v) => ({
            id: v.id,
            cor: v.cor,
            cor_hex: v.cor_hex,
            armazenamento: v.armazenamento ?? "",
            preco: paraCampo(v.preco),
            preco_antigo: paraCampo(v.preco_antigo),
            preco_pix: paraCampo(v.preco_pix),
            estoque: String(v.estoque),
            reservado: v.estoque_reservado,
            sku: v.sku ?? "",
          }))}
        />
        <ImagensEditor productId={p.id} imagens={imagens} cores={cores} />
        <ProdutoForm
          produto={{
            id: p.id,
            slug: p.slug,
            nome: p.nome,
            marca: p.marca,
            categoria: p.categoria,
            condicao: p.condicao,
            descricao: p.descricao,
            destaque: p.destaque,
            ativo: p.ativo,
            ficha: p.ficha_tecnica ?? {},
            seminovo: p.detalhes_seminovo,
          }}
        />
      </div>
    </>
  );
}
