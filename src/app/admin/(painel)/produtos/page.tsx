import { Plus } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ProdutoLinhaAcoes } from "@/components/admin/ProdutoLinhaAcoes";
import { AdminTitulo } from "@/components/admin/StatusBadge";
import { exigirAdmin } from "@/lib/admin";
import { formatBRL } from "@/lib/format";
import { botao, cn } from "@/lib/ui";

export const metadata: Metadata = { title: "Produtos" };

type Linha = {
  id: string;
  slug: string;
  nome: string;
  marca: string;
  condicao: string;
  categoria: string;
  ativo: boolean;
  product_variants: { preco: number; estoque: number; estoque_reservado: number }[];
  product_images: { url: string; ordem: number }[];
};

export default async function ProdutosAdminPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { supabase } = await exigirAdmin();
  const { q } = await searchParams;

  let consulta = supabase
    .from("products")
    .select("id, slug, nome, marca, condicao, categoria, ativo, product_variants(preco, estoque, estoque_reservado), product_images(url, ordem)")
    .order("created_at", { ascending: false });
  const termo = q?.trim().replace(/[%,()]/g, "");
  if (termo) consulta = consulta.or(`nome.ilike.%${termo}%,marca.ilike.%${termo}%,slug.ilike.%${termo}%`);
  const { data, error } = await consulta;
  const produtos = (data ?? []) as unknown as Linha[];

  return (
    <>
      <AdminTitulo
        titulo="Produtos"
        descricao={`${produtos.length} produto(s)`}
        acoes={
          <Link href="/admin/produtos/novo" className={botao("primario", "md")}>
            <Plus className="size-4" aria-hidden />
            Novo produto
          </Link>
        }
      />
      <form className="mb-5 max-w-sm">
        <label htmlFor="q" className="sr-only">
          Buscar produto
        </label>
        <input
          id="q"
          name="q"
          defaultValue={q}
          placeholder="Buscar por nome, marca ou slug"
          className="h-10 w-full rounded-lg border border-line-strong bg-card px-3 text-sm placeholder:text-subtle focus:border-accent focus:outline-none"
        />
      </form>
      {error && <p className="text-sm text-danger">Erro: {error.message}</p>}

      <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-card">
        {produtos.map((p) => {
          const disp = p.product_variants.reduce((s, v) => s + Math.max(0, v.estoque - v.estoque_reservado), 0);
          const precos = p.product_variants.map((v) => Number(v.preco));
          const foto = [...p.product_images].sort((a, b) => a.ordem - b.ordem)[0]?.url;
          return (
            <li key={p.id} className={cn("flex items-center gap-3 p-3 sm:gap-4 sm:p-4", !p.ativo && "opacity-60")}>
              <div className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-canvas">
                {foto && <Image src={foto} alt="" fill sizes="56px" className="object-contain p-1" />}
              </div>
              <div className="min-w-0 flex-1">
                <Link href={`/admin/produtos/${p.id}`} className="font-medium hover:text-accent">
                  {p.nome}
                </Link>
                <p className="truncate text-xs text-muted">
                  {p.marca} · {p.condicao === "seminovo" ? "Seminovo" : "Novo"} · {p.product_variants.length} variação(ões)
                  {precos.length > 0 && ` · a partir de ${formatBRL(Math.min(...precos))}`}
                </p>
              </div>
              <span
                className={cn(
                  "hidden w-24 text-right text-sm tabular-nums sm:block",
                  disp === 0 ? "text-danger" : disp <= 2 ? "text-accent" : "text-muted",
                )}
              >
                {disp === 0 ? "Esgotado" : `${disp} em estoque`}
              </span>
              <ProdutoLinhaAcoes id={p.id} ativo={p.ativo} slug={p.slug} />
            </li>
          );
        })}
        {!produtos.length && <li className="p-10 text-center text-sm text-muted">Nenhum produto encontrado.</li>}
      </ul>
    </>
  );
}
