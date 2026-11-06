import { Clock, Mail, MapPin, MessageCircle } from "lucide-react";
import Link from "next/link";
import { NAV, SITE } from "@/lib/site";
import { cn, container } from "@/lib/ui";
import { mensagens, whatsappLink } from "@/lib/whatsapp";
import { Logo } from "./Logo";

const pagamentos = ["Pix", "Cartão de crédito", "Cartão de débito", "Boleto"];

export function Footer() {
  return (
    <footer className="mt-24 border-t border-line bg-canvas">
      <div className={cn(container, "grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]")}>
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">{SITE.descricao}</p>
          <a
            href={whatsappLink(mensagens.geral())}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl border border-whatsapp/50 bg-whatsapp/10 px-4 text-sm font-semibold text-ink transition-colors duration-150 hover:bg-whatsapp/20"
          >
            <MessageCircle className="size-4 text-whatsapp" aria-hidden />
            WhatsApp {SITE.whatsappExibicao}
          </a>
        </div>

        <nav aria-label="Loja">
          <h2 className="font-display text-sm font-semibold text-ink">Loja</h2>
          <ul className="mt-4 space-y-1">
            {NAV.map((n) => (
              <li key={n.href}>
                <Link href={n.href} className="inline-flex min-h-9 items-center text-sm text-muted transition-colors duration-150 hover:text-ink">
                  {n.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/carrinho" className="inline-flex min-h-9 items-center text-sm text-muted transition-colors duration-150 hover:text-ink">
                Carrinho
              </Link>
            </li>
          </ul>
        </nav>

        <nav aria-label="Ajuda">
          <h2 className="font-display text-sm font-semibold text-ink">Ajuda</h2>
          <ul className="mt-4 space-y-1">
            {[
              { href: "/trocas-e-garantia", label: "Trocas e garantia" },
              { href: "/politica-de-privacidade", label: "Política de privacidade" },
              { href: "/contato", label: "Fale conosco" },
            ].map((n) => (
              <li key={n.href}>
                <Link href={n.href} className="inline-flex min-h-9 items-center text-sm text-muted transition-colors duration-150 hover:text-ink">
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="font-display text-sm font-semibold text-ink">Contato</h2>
          <ul className="mt-4 space-y-3 text-sm text-muted">
            <li className="flex gap-2.5">
              <MapPin className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
              <span>{SITE.endereco}</span>
            </li>
            <li className="flex gap-2.5">
              <Clock className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
              <span>{SITE.horario}</span>
            </li>
            <li className="flex gap-2.5">
              <Mail className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
              <a href={`mailto:${SITE.email}`} className="hover:text-ink">
                {SITE.email}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-line">
        <div className={cn(container, "flex flex-col gap-4 py-6 md:flex-row md:items-center md:justify-between")}>
          <div>
            <h2 className="sr-only">Formas de pagamento</h2>
            <ul className="flex flex-wrap gap-2" aria-label="Formas de pagamento">
              {pagamentos.map((p) => (
                <li key={p} className="rounded-md border border-line px-2.5 py-1 text-xs font-medium text-muted">
                  {p}
                </li>
              ))}
            </ul>
            <p className="mt-2 text-xs text-subtle">Pagamentos processados pelo Mercado Pago.</p>
          </div>
          <p className="text-xs text-subtle">
            © {new Date().getFullYear()} {SITE.nome} · CNPJ {SITE.cnpj}
          </p>
        </div>
      </div>
    </footer>
  );
}
