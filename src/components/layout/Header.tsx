"use client";

import { Menu, MessageCircle, Search, ShoppingBag, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useCart } from "@/lib/cart";
import { NAV, SITE } from "@/lib/site";
import { cn, container } from "@/lib/ui";
import { mensagens, whatsappLink } from "@/lib/whatsapp";
import { Drawer } from "../ui/Drawer";
import { Logo } from "./Logo";

function SearchForm({ autoFocus = false, onDone }: { autoFocus?: boolean; onDone?: () => void }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        const termo = q.trim();
        if (!termo) return;
        router.push(`/busca?q=${encodeURIComponent(termo)}`);
        onDone?.();
      }}
      className="relative w-full"
    >
      <label htmlFor={autoFocus ? "busca-mobile" : "busca"} className="sr-only">
        Buscar produtos
      </label>
      <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden />
      <input
        id={autoFocus ? "busca-mobile" : "busca"}
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        autoFocus={autoFocus}
        placeholder="Buscar celular, marca ou acessório"
        enterKeyHint="search"
        className="h-11 w-full rounded-xl border border-line bg-card pl-10 pr-4 text-sm text-ink placeholder:text-muted transition-[border-color] duration-150 hover:border-line-strong focus:border-accent focus:outline-none"
      />
    </form>
  );
}

export function Header() {
  const { count, hydrated, pulse } = useCart();
  const pathname = usePathname();
  const [menu, setMenu] = useState(false);
  const [busca, setBusca] = useState(false);
  const [rolou, setRolou] = useState(false);
  const sentinela = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMenu(false);
    setBusca(false);
  }, [pathname]);

  useEffect(() => {
    const el = sentinela.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => setRolou(!e.isIntersecting));
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const ativo = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <>
      <div ref={sentinela} aria-hidden className="h-0" />
      <header
        className={cn(
          "sticky top-0 z-40 border-b transition-[background-color,border-color] duration-200",
          rolou ? "border-line bg-canvas/90 backdrop-blur-md" : "border-transparent bg-canvas",
        )}
      >
        <div className={cn(container, "flex h-16 items-center gap-3 lg:gap-8")}>
          <button
            type="button"
            onClick={() => setMenu(true)}
            aria-label="Abrir menu"
            aria-expanded={menu}
            className="-ml-2 grid size-11 place-items-center rounded-lg text-ink hover:bg-card-2 lg:hidden"
          >
            <Menu className="size-5" aria-hidden />
          </button>

          <Logo />

          <nav aria-label="Principal" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {NAV.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={ativo(item.href) ? "page" : undefined}
                    className={cn(
                      "relative rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150",
                      ativo(item.href) ? "text-ink" : "text-muted hover:text-ink",
                      "after:absolute after:inset-x-3 after:-bottom-[13px] after:h-0.5 after:rounded-full after:bg-accent after:transition-transform after:duration-200",
                      ativo(item.href) ? "after:scale-x-100" : "after:scale-x-0",
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="ml-auto hidden w-full max-w-sm md:block">
            <SearchForm />
          </div>

          <div className="ml-auto flex items-center gap-1 md:ml-0">
            <button
              type="button"
              onClick={() => setBusca((b) => !b)}
              aria-label={busca ? "Fechar busca" : "Abrir busca"}
              aria-expanded={busca}
              className="grid size-11 place-items-center rounded-lg text-ink hover:bg-card-2 md:hidden"
            >
              {busca ? <X className="size-5" aria-hidden /> : <Search className="size-5" aria-hidden />}
            </button>
            <Link
              href="/carrinho"
              aria-label={`Carrinho, ${count} ${count === 1 ? "item" : "itens"}`}
              className="relative -mr-2 grid size-11 place-items-center rounded-lg text-ink hover:bg-card-2"
            >
              <ShoppingBag className="size-5" aria-hidden />
              {hydrated && count > 0 && (
                <span
                  key={pulse}
                  aria-hidden
                  className="animate-pop absolute right-0.5 top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-accent px-1 text-[11px] font-bold tabular-nums text-canvas"
                >
                  {count > 99 ? "99+" : count}
                </span>
              )}
            </Link>
          </div>
        </div>

        {busca && (
          <div className={cn(container, "animate-fade-up pb-3 md:hidden")}>
            <SearchForm autoFocus onDone={() => setBusca(false)} />
          </div>
        )}
      </header>

      <Drawer open={menu} onClose={() => setMenu(false)} titulo="Menu">
        <nav aria-label="Menu mobile" className="p-2">
          <ul>
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={ativo(item.href) ? "page" : undefined}
                  className={cn(
                    "flex h-12 items-center rounded-xl px-4 text-base font-medium transition-colors duration-150",
                    ativo(item.href) ? "bg-card text-ink" : "text-muted hover:bg-card hover:text-ink",
                  )}
                >
                  {ativo(item.href) && <span aria-hidden className="mr-3 h-4 w-0.5 rounded-full bg-accent" />}
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="mx-4 mt-4 rounded-2xl border border-line p-4">
          <p className="text-sm text-muted">Atendimento</p>
          <p className="mt-1 text-sm text-ink">{SITE.horario}</p>
          <a
            href={whatsappLink(mensagens.geral())}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-ink underline decoration-whatsapp underline-offset-4"
          >
            <MessageCircle className="size-4 text-whatsapp" aria-hidden />
            {SITE.whatsappExibicao}
          </a>
        </div>
      </Drawer>
    </>
  );
}
