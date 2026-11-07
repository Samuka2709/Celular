import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { SomenteNaLoja } from "@/components/layout/SomenteNaLoja";
import { WhatsAppFloat } from "@/components/layout/WhatsAppFloat";
import { CartProvider } from "@/lib/cart";
import { SITE } from "@/lib/site";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const display = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display-family",
  display: "swap",
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: `${SITE.nome} | Celulares novos e seminovos`, template: `%s | ${SITE.nome}` },
  description: SITE.descricao,
  openGraph: { locale: "pt_BR", siteName: SITE.nome, type: "website" },
  robots: SITE.emTestes ? { index: false, follow: false, googleBot: { index: false, follow: false } } : undefined,
};

export const viewport: Viewport = {
  themeColor: "#0b0b0d",
  colorScheme: "dark",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${display.variable}`}>
      <body className="min-h-dvh">
        <a
          href="#conteudo"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-lg focus:bg-accent focus:px-4 focus:py-2 focus:font-semibold focus:text-canvas"
        >
          Pular para o conteúdo
        </a>
        <CartProvider>
          <SomenteNaLoja>
            <div className="bg-accent text-canvas">
              <p className="mx-auto max-w-7xl px-4 py-1.5 text-center text-xs font-semibold sm:text-[13px]">
                {SITE.avisoTopo}
              </p>
            </div>
            <Header />
          </SomenteNaLoja>
          <main id="conteudo" tabIndex={-1} className="outline-none">
            {children}
          </main>
          <SomenteNaLoja>
            <Footer />
            <WhatsAppFloat />
          </SomenteNaLoja>
        </CartProvider>
      </body>
    </html>
  );
}
