import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { ProdutoForm } from "@/components/admin/ProdutoForm";
import { AdminTitulo } from "@/components/admin/StatusBadge";
import { exigirAdmin } from "@/lib/admin";

export const metadata: Metadata = { title: "Novo produto" };

export default async function NovoProdutoPage() {
  await exigirAdmin();
  return (
    <>
      <Link href="/admin/produtos" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink">
        <ArrowLeft className="size-4" aria-hidden />
        Produtos
      </Link>
      <AdminTitulo titulo="Novo produto" descricao="Depois de salvar você cadastra as variações (cor, armazenamento, preço, estoque) e as fotos." />
      <ProdutoForm />
    </>
  );
}
