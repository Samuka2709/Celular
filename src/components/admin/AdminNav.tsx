"use client";

import { History, LayoutDashboard, Package, Receipt, Truck } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/ui";

const ITENS = [
  { href: "/admin", label: "Painel", icone: LayoutDashboard },
  { href: "/admin/pedidos", label: "Pedidos", icone: Receipt },
  { href: "/admin/produtos", label: "Produtos", icone: Package },
  { href: "/admin/entrega", label: "Entrega", icone: Truck },
  { href: "/admin/atividade", label: "Atividade", icone: History },
];

export function AdminNav() {
  const pathname = usePathname();
  const ativo = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));
  return (
    <nav aria-label="Painel" className="no-scrollbar overflow-x-auto px-2 pb-2 lg:px-3 lg:pb-0 lg:pt-4">
      <ul className="flex gap-1 lg:flex-col">
        {ITENS.map(({ href, label, icone: Icone }) => (
          <li key={href}>
            <Link
              href={href}
              aria-current={ativo(href) ? "page" : undefined}
              className={cn(
                "flex h-10 items-center gap-2.5 whitespace-nowrap rounded-lg px-3 text-sm font-medium transition-colors duration-150",
                ativo(href) ? "bg-card-2 text-ink" : "text-muted hover:bg-card hover:text-ink",
              )}
            >
              <Icone className={cn("size-4", ativo(href) && "text-accent")} aria-hidden />
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
