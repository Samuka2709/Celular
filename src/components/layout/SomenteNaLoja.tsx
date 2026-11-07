"use client";

import { usePathname } from "next/navigation";

/** Esconde cabeçalho, rodapé e botão de WhatsApp da loja dentro do painel /admin. */
export function SomenteNaLoja({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;
  return <>{children}</>;
}
