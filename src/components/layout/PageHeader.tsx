import { ChevronRight } from "lucide-react";
import Link from "next/link";

export function Breadcrumbs({ itens }: { itens: { href?: string; label: string }[] }) {
  return (
    <nav aria-label="Você está em">
      <ol className="flex flex-wrap items-center gap-1 text-sm text-muted">
        {itens.map((item, i) => (
          <li key={item.label} className="flex items-center gap-1">
            {i > 0 && <ChevronRight className="size-3.5 text-subtle" aria-hidden />}
            {item.href ? (
              <Link href={item.href} className="transition-colors duration-150 hover:text-ink">
                {item.label}
              </Link>
            ) : (
              <span aria-current="page" className="text-ink">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function PageHeader({
  titulo,
  descricao,
  migalhas,
}: {
  titulo: string;
  descricao?: string;
  migalhas: { href?: string; label: string }[];
}) {
  return (
    <div className="pb-8 pt-6 sm:pt-10">
      <Breadcrumbs itens={migalhas} />
      <h1 className="mt-4 font-display text-4xl font-semibold tracking-[-0.03em] text-balance sm:text-5xl">{titulo}</h1>
      {descricao && <p className="mt-3 max-w-2xl text-pretty text-muted">{descricao}</p>}
    </div>
  );
}
