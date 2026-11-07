import { ExternalLink, LogOut } from "lucide-react";
import { AdminNav } from "@/components/admin/AdminNav";
import { Logo } from "@/components/layout/Logo";
import { exigirAdmin } from "@/lib/admin";
import { sair } from "../actions";

export default async function PainelLayout({ children }: { children: React.ReactNode }) {
  const { user } = await exigirAdmin();
  return (
    <div className="lg:grid lg:min-h-dvh lg:grid-cols-[232px_1fr]">
      <aside className="sticky top-0 z-30 border-b border-line bg-canvas/95 backdrop-blur lg:h-dvh lg:border-b-0 lg:border-r">
        <div className="flex h-14 items-center justify-between px-4 lg:h-16">
          <Logo />
          <form action={sair} className="lg:hidden">
            <button type="submit" aria-label="Sair" className="grid size-10 place-items-center rounded-lg text-muted hover:bg-card-2 hover:text-ink">
              <LogOut className="size-5" aria-hidden />
            </button>
          </form>
        </div>
        <AdminNav />
        <div className="absolute inset-x-0 bottom-0 hidden border-t border-line p-4 lg:block">
          <p className="truncate text-xs text-muted" title={user.email ?? ""}>
            {user.email}
          </p>
          <div className="mt-3 flex gap-2">
            <a href="/" target="_blank" className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg border border-line-strong text-xs font-medium text-ink hover:border-muted">
              <ExternalLink className="size-3.5" aria-hidden />
              Ver loja
            </a>
            <form action={sair}>
              <button type="submit" className="inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-medium text-muted hover:bg-card-2 hover:text-ink">
                <LogOut className="size-3.5" aria-hidden />
                Sair
              </button>
            </form>
          </div>
        </div>
      </aside>
      <main className="min-w-0 px-4 pb-16 pt-6 sm:px-6 lg:px-10 lg:pt-10">{children}</main>
    </div>
  );
}
