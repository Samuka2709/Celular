import Link from "next/link";
import { botao, cn, container } from "@/lib/ui";

export default function NotFound() {
  return (
    <div className={cn(container, "grid min-h-[60vh] place-items-center py-16 text-center")}>
      <div className="max-w-md">
        <p className="font-display text-7xl font-bold tracking-tighter text-accent">404</p>
        <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight">Página não encontrada</h1>
        <p className="mt-3 text-muted">O endereço pode ter mudado ou o produto não está mais à venda.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/celulares" className={botao("primario", "md")}>
            Ver celulares
          </Link>
          <Link href="/" className={botao("secundario", "md")}>
            Página inicial
          </Link>
        </div>
      </div>
    </div>
  );
}
