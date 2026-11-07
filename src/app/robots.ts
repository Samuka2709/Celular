import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  if (SITE.emTestes) {
    // Loja em testes: nenhum buscador deve indexar.
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/checkout", "/carrinho", "/pedido/", "/busca"] },
    host: SITE.url,
  };
}
