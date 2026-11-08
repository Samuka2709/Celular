import type { NextConfig } from "next";

// Fotos enviadas pelo /admin ficam no Supabase Storage
const supabaseHost = (() => {
  try {
    return process.env.NEXT_PUBLIC_SUPABASE_URL ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname : null;
  } catch {
    return null;
  }
})();

const dev = process.env.NODE_ENV !== "production";
const supabaseOrigem = supabaseHost ? `https://${supabaseHost}` : "";

// Política de conteúdo: só carrega scripts, imagens e conexões da própria loja,
// do Supabase e (nas prévias da Vercel) da barra de comentários vercel.live.
// 'unsafe-inline' em script-src é necessário para os scripts que o Next.js injeta na página.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${dev ? " 'unsafe-eval'" : ""} https://vercel.live https://challenges.cloudflare.com`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: ${supabaseOrigem}`,
  "font-src 'self' data:",
  `connect-src 'self' ${supabaseOrigem} ${supabaseOrigem.replace("https://", "wss://")} https://vercel.live https://challenges.cloudflare.com${dev ? " ws:" : ""}`,
  // Cloudflare Turnstile (captcha invisível) roda num iframe
  "frame-src https://vercel.live https://challenges.cloudflare.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  // Só na Vercel (HTTPS); no localhost quebraria os arquivos servidos por http
  ...(process.env.VERCEL ? ["upgrade-insecure-requests"] : []),
]
  .join("; ")
  .replace(/\s+/g, " ");

const cabecalhos = [
  { key: "Content-Security-Policy", value: csp },
  // Impede que outro site coloque a loja dentro de um iframe (clickjacking)
  { key: "X-Frame-Options", value: "DENY" },
  // O navegador não "adivinha" o tipo de arquivo
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Ao clicar num link externo, envia só o domínio, nunca o caminho (que pode ter o token do pedido)
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Sempre HTTPS por 2 anos
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  // Bloqueia câmera, microfone e localização (a loja não usa)
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      { source: "/:path*", headers: cabecalhos },
      // O painel e as páginas de pedido nunca ficam em cache compartilhado
      { source: "/admin/:path*", headers: [{ key: "Cache-Control", value: "no-store" }] },
      { source: "/pedido/:path*", headers: [{ key: "Cache-Control", value: "private, no-store" }] },
    ];
  },
  images: {
    remotePatterns: supabaseHost
      ? [{ protocol: "https", hostname: supabaseHost, pathname: "/storage/v1/object/public/**" }]
      : [],
  },
  // Disponibiliza para o navegador só o que é público (número do WhatsApp da loja)
  env: {
    NEXT_PUBLIC_LOJA_WHATSAPP: process.env.LOJA_WHATSAPP ?? "",
  },
  experimental: {
    serverActions: { bodySizeLimit: "1mb" },
  },
};

export default nextConfig;
