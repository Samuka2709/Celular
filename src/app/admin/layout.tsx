import type { Metadata } from "next";
import { SITE } from "@/lib/site";

// Painel sempre renderizado na hora (depende da sessão do usuário)
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { default: `Painel | ${SITE.nome}`, template: `%s | Painel` },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-dvh bg-canvas">{children}</div>;
}
