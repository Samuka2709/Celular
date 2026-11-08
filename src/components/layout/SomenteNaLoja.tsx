"use client";

import { usePathname } from "next/navigation";

/** Esconde cabeçalho, rodapé e botão de WhatsApp da loja dentro do painel /admin. */
export function SomenteNaLoja({ children, exceto = [] }: { children: React.ReactNode; exceto?: string[] }) {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin") || (pathname && exceto.includes(pathname))) return null;
  return <>{children}</>;
}
