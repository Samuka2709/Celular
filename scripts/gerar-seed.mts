// Gera supabase/seed.sql a partir dos produtos de exemplo (src/lib/data/products.ts).
// Uso: npm run seed:gerar
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { PRODUCTS } from "../src/lib/data/products.ts";

const q = (v: unknown): string => {
  if (v === null || v === undefined) return "null";
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  return `'${String(v).replace(/'/g, "''")}'`;
};
const j = (v: unknown) => (v === null || v === undefined ? "null" : `${q(JSON.stringify(v))}::jsonb`);

const linhas: string[] = [
  "-- Seed gerado por scripts/gerar-seed.mts. Rode depois das migrations.",
  "-- Pode rodar de novo: produtos com o mesmo slug são substituídos.",
  "begin;",
  "",
  `delete from public.products where slug in (${PRODUCTS.map((p) => q(p.slug)).join(", ")});`,
  "",
];

for (const p of PRODUCTS) {
  const semi = p.detalhesSeminovo
    ? {
        saude_bateria: p.detalhesSeminovo.saudeBateria,
        estado: p.detalhesSeminovo.estado,
        acompanha: p.detalhesSeminovo.acompanha,
        garantia: p.detalhesSeminovo.garantia,
      }
    : null;
  linhas.push(
    `with p as (insert into public.products (slug, nome, marca, categoria, condicao, descricao, ficha_tecnica, detalhes_seminovo, destaque, ativo, vendas, modelo_visual, created_at)`,
    `  values (${[q(p.slug), q(p.nome), q(p.marca), q(p.categoria), q(p.condicao), q(p.descricao), j(p.fichaTecnica), j(semi), q(p.destaque), "true", q(p.vendas), q(p.modeloVisual), q(p.createdAt)].join(", ")})`,
    `  returning id),`,
    `v as (insert into public.product_variants (product_id, cor, cor_hex, armazenamento, preco, preco_antigo, preco_pix, estoque, sku, ordem)`,
    `  select p.id, x.* from p, (values`,
    p.variants
      .map(
        (v, i) =>
          `    (${[q(v.cor), q(v.corHex), q(v.armazenamento), v.preco, v.precoAntigo ?? "null::numeric", v.precoPix, v.estoque, q(v.sku), i].join(", ")})`,
      )
      .join(",\n"),
    `  ) as x(cor, cor_hex, armazenamento, preco, preco_antigo, preco_pix, estoque, sku, ordem) returning 1)`,
    `insert into public.product_images (product_id, url, cor, alt, ordem)`,
    `  select p.id, x.* from p, (values`,
    p.images.map((im) => `    (${[q(im.url), q(im.cor), q(im.alt), im.ordem].join(", ")})`).join(",\n"),
    `  ) as x(url, cor, alt, ordem);`,
    "",
  );
}

linhas.push(
  "-- Taxas de entrega de exemplo (edite no /admin/entrega)",
  "insert into public.delivery_zones (cidade, bairro, taxa, prazo) values",
  "  ('Ilhéus', null, 12, 'No mesmo dia para pedidos pagos até 15h'),",
  "  ('Itabuna', null, 25, 'Em até 1 dia útil'),",
  "  ('Uruçuca', null, 25, 'Em até 1 dia útil'),",
  "  ('Itacaré', null, 35, 'Em até 2 dias úteis'),",
  "  ('Una', null, 35, 'Em até 2 dias úteis'),",
  "  ('Canavieiras', null, 35, 'Em até 2 dias úteis')",
  "on conflict do nothing;",
  "",
  "commit;",
  "",
);

const destino = path.join(process.cwd(), "supabase", "seed.sql");
await writeFile(destino, linhas.join("\n"), "utf8");
console.log(`seed.sql gerado com ${PRODUCTS.length} produtos em ${destino}`);
