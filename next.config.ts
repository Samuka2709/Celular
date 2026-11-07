import type { NextConfig } from "next";

// Fotos enviadas pelo /admin ficam no Supabase Storage
const supabaseHost = (() => {
  try {
    return process.env.SUPABASE_URL ? new URL(process.env.SUPABASE_URL).hostname : null;
  } catch {
    return null;
  }
})();

const nextConfig: NextConfig = {
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
