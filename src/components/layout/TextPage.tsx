import { cn, container } from "@/lib/ui";
import { PageHeader } from "./PageHeader";

export function TextPage({
  titulo,
  atualizado,
  children,
}: {
  titulo: string;
  atualizado: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn(container, "max-w-3xl")}>
      <PageHeader titulo={titulo} descricao={`Última atualização: ${atualizado}`} migalhas={[{ href: "/", label: "Início" }, { label: titulo }]} />
      <div
        className={cn(
          "max-w-[68ch] space-y-5 leading-relaxed text-muted",
          "[&_h2]:mt-12 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:text-ink",
          "[&_strong]:font-semibold [&_strong]:text-ink",
          "[&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5 [&_li]:marker:text-accent",
          "[&_a]:text-ink [&_a]:underline [&_a]:decoration-accent [&_a]:underline-offset-4",
        )}
      >
        {children}
      </div>
    </div>
  );
}
