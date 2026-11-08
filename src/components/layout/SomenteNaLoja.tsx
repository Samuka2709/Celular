"use client";

import { usePathname } from "next/navigation";

/** Esconde cabeçalho, rodapé e botão de WhatsApp da loja dentro do painel /admin. */
export function SomenteNaLoja({ children, exceto = [] }: { children: React.ReactNode; exceto?: string[] }) {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin") || (pathname && exceto.some((p) => pathname === p || pathname.startsWith(p + "/")))) return null;
  return <>{children}</>;
}
