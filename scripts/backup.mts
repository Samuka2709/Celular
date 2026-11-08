// Backup do banco: exporta todas as tabelas da loja para backups/AAAA-MM-DD_HHhMM/*.json
//
// Rodar:   npm run backup
// Precisa do .env.local com NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SECRET_KEY.
// A pasta backups/ tem dados de clientes: ela não vai para o Git. Guarde uma cópia
// em local seguro (ex.: Google Drive pessoal) e apague backups antigos.
//
// As fotos dos produtos ficam no Storage do Supabase e não entram aqui (só os links).

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const chave = process.env.SUPABASE_SECRET_KEY;
if (!url || !chave) {
  console.error("Faltam NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SECRET_KEY no .env.local.");
  process.exit(1);
}

const db = createClient(url, chave, { auth: { persistSession: false } });

const TABELAS = [
  "products",
  "product_variants",
  "product_images",
  "delivery_zones",
  "orders",
  "order_items",
  "order_status_history",
  "admins",
  "admin_log",
];

const agora = new Date();
const p = (n: number) => String(n).padStart(2, "0");
const pasta = join(
  "backups",
  `${agora.getFullYear()}-${p(agora.getMonth() + 1)}-${p(agora.getDate())}_${p(agora.getHours())}h${p(agora.getMinutes())}`,
);
mkdirSync(pasta, { recursive: true });

let falhas = 0;
for (const tabela of TABELAS) {
  const linhas: unknown[] = [];
  let erro = "";
  for (let de = 0; ; de += 1000) {
    const { data, error } = await db.from(tabela).select("*").range(de, de + 999);
    if (error) {
      erro = error.message;
      break;
    }
    linhas.push(...data);
    if (data.length < 1000) break;
  }
  if (erro) {
    console.error(`  ✗ ${tabela}: ${erro}`);
    falhas++;
    continue;
  }
  writeFileSync(join(pasta, `${tabela}.json`), JSON.stringify(linhas, null, 2));
  console.log(`  ✓ ${tabela}: ${linhas.length} linha(s)`);
}

console.log(`\nBackup salvo em ${pasta}${falhas ? ` (com ${falhas} falha(s))` : ""}`);
process.exit(falhas ? 1 : 0);
