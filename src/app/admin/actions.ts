"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { exigirAdmin } from "@/lib/admin";
import { supabaseConfigurado } from "@/lib/env";
import { emailMudancaStatus } from "@/lib/notificacoes/email";
import { carregarPedido } from "@/lib/pedidos";
import { ipDosCabecalhos, limitar } from "@/lib/rate-limit";
import { supabaseServico, supabaseSessao } from "@/lib/supabase/server";
import type { OrderStatus } from "@/lib/types";

export interface EstadoAcao {
  ok?: boolean;
  erro?: string;
  msg?: string;
}

const atualizarLoja = () => revalidatePath("/", "layout");

function erroAmigavel(e: { code?: string; message?: string } | null | undefined, padrao: string) {
  if (!e) return padrao;
  if (e.code === "23505") return "Já existe um registro com esse valor (slug ou SKU repetido).";
  if (e.message?.includes("reserva_menor_que_estoque"))
    return "O estoque não pode ficar menor que as unidades reservadas em pedidos aguardando pagamento.";
  if (e.message?.includes("estoque_check")) return "Estoque não pode ser negativo.";
  if (e.code === "42501") return "Sem permissão para esta ação.";
  return `${padrao} (${e.message ?? "erro desconhecido"})`;
}

// ---------------------------------------------------------------------------
// Login
// ---------------------------------------------------------------------------
export async function entrar(_: EstadoAcao, form: FormData): Promise<EstadoAcao> {
  if (!supabaseConfigurado()) return { erro: "Supabase ainda não configurado. Veja o README." };
  const email = String(form.get("email") ?? "").trim();
  const senha = String(form.get("senha") ?? "");
  if (!email || !senha) return { erro: "Informe e-mail e senha." };

  // Contra quem tenta adivinhar a senha: 5 tentativas a cada 15 min por IP
  // e 10 por hora para o mesmo e-mail (vale mesmo trocando de IP)
  const ip = ipDosCabecalhos(await headers());
  const [porIp, porEmail] = await Promise.all([
    limitar(`login:ip:${ip}`, 5, 15 * 60_000),
    limitar(`login:email:${email.toLowerCase()}`, 10, 60 * 60_000),
  ]);
  if (!porIp.ok || !porEmail.ok) {
    const min = Math.ceil(Math.max(porIp.tentarEmSeg, porEmail.tentarEmSeg) / 60);
    return { erro: `Muitas tentativas. Tente de novo em ${min} min.` };
  }

  const supabase = await supabaseSessao();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password: senha });
  if (error || !data.user) return { erro: "E-mail ou senha incorretos." };

  const { data: admin } = await supabase.from("admins").select("user_id").eq("user_id", data.user.id).maybeSingle();
  if (!admin) {
    await supabase.auth.signOut();
    return { erro: "Este usuário não tem acesso ao painel." };
  }
  redirect("/admin");
}

export async function sair() {
  const supabase = await supabaseSessao();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

// ---------------------------------------------------------------------------
// Produtos
// ---------------------------------------------------------------------------
const produtoSchema = z.object({
  id: z.string().optional(),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Slug: só letras minúsculas, números e hífen (ex.: iphone-15-128gb)."),
  nome: z.string().trim().min(2, "Informe o nome.").max(120),
  marca: z.string().trim().min(1, "Informe a marca.").max(60),
  categoria: z.enum(["celular", "acessorio"]),
  condicao: z.enum(["novo", "seminovo"]),
  descricao: z.string().trim().max(4000),
  destaque: z.boolean(),
  ativo: z.boolean(),
  ficha: z.record(z.string(), z.string()),
  saudeBateria: z.number().int().min(0).max(100).nullable(),
  estado: z.string().trim().max(200),
  acompanha: z.array(z.string()),
  garantia: z.string().trim().max(200),
});

export async function salvarProduto(_: EstadoAcao, form: FormData): Promise<EstadoAcao> {
  const { supabase } = await exigirAdmin();
  let ficha: Record<string, string> = {};
  try {
    ficha = JSON.parse(String(form.get("ficha") ?? "{}"));
  } catch {
    return { erro: "Ficha técnica inválida." };
  }
  const saude = String(form.get("saudeBateria") ?? "").trim();
  const parsed = produtoSchema.safeParse({
    id: String(form.get("id") ?? "") || undefined,
    slug: String(form.get("slug") ?? ""),
    nome: String(form.get("nome") ?? ""),
    marca: String(form.get("marca") ?? ""),
    categoria: String(form.get("categoria") ?? "celular"),
    condicao: String(form.get("condicao") ?? "novo"),
    descricao: String(form.get("descricao") ?? ""),
    destaque: form.get("destaque") === "on",
    ativo: form.get("ativo") === "on",
    ficha,
    saudeBateria: saude ? Number(saude) : null,
    estado: String(form.get("estado") ?? ""),
    acompanha: String(form.get("acompanha") ?? "")
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean),
    garantia: String(form.get("garantia") ?? ""),
  });
  if (!parsed.success) return { erro: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  const p = parsed.data;

  const linha = {
    slug: p.slug,
    nome: p.nome,
    marca: p.marca,
    categoria: p.categoria,
    condicao: p.condicao,
    descricao: p.descricao,
    destaque: p.destaque,
    ativo: p.ativo,
    ficha_tecnica: p.ficha,
    detalhes_seminovo:
      p.condicao === "seminovo"
        ? { saude_bateria: p.saudeBateria ?? 0, estado: p.estado, acompanha: p.acompanha, garantia: p.garantia }
        : null,
  };

  if (p.id) {
    // Ao editar, "ativo" é controlado pelo botão do topo da página, não por este formulário
    const { ativo: _ativo, ...semAtivo } = linha;
    void _ativo;
    const { error } = await supabase.from("products").update(form.has("ativo_presente") ? linha : semAtivo).eq("id", p.id);
    if (error) return { erro: erroAmigavel(error, "Não foi possível salvar") };
    atualizarLoja();
    revalidatePath(`/admin/produtos/${p.id}`);
    return { ok: true, msg: "Produto salvo." };
  }

  const { data, error } = await supabase.from("products").insert(linha).select("id").single();
  if (error || !data) return { erro: erroAmigavel(error, "Não foi possível criar o produto") };
  atualizarLoja();
  redirect(`/admin/produtos/${data.id}?novo=1`);
}

export async function alternarAtivo(id: string, ativo: boolean) {
  const { supabase } = await exigirAdmin();
  await supabase.from("products").update({ ativo }).eq("id", id);
  atualizarLoja();
  revalidatePath("/admin/produtos");
}

export async function duplicarProduto(id: string) {
  const { supabase } = await exigirAdmin();
  const { data: p } = await supabase
    .from("products")
    .select("*, product_variants(*), product_images(*)")
    .eq("id", id)
    .single();
  if (!p) return;

  let slug = `${p.slug}-copia`;
  for (let i = 2; ; i++) {
    const { data: existe } = await supabase.from("products").select("id").eq("slug", slug).maybeSingle();
    if (!existe) break;
    slug = `${p.slug}-copia-${i}`;
  }

  const { data: novo, error } = await supabase
    .from("products")
    .insert({
      slug,
      nome: `${p.nome} (cópia)`,
      marca: p.marca,
      categoria: p.categoria,
      condicao: p.condicao,
      descricao: p.descricao,
      ficha_tecnica: p.ficha_tecnica,
      detalhes_seminovo: p.detalhes_seminovo,
      destaque: false,
      ativo: false, // cópia começa desativada para revisar antes de publicar
      modelo_visual: p.modelo_visual,
    })
    .select("id")
    .single();
  if (error || !novo) return;

  const variantes = (p.product_variants ?? []) as Record<string, unknown>[];
  if (variantes.length) {
    await supabase.from("product_variants").insert(
      variantes.map((v) => ({
        product_id: novo.id,
        cor: v.cor,
        cor_hex: v.cor_hex,
        armazenamento: v.armazenamento,
        preco: v.preco,
        preco_antigo: v.preco_antigo,
        preco_pix: v.preco_pix,
        estoque: 0,
        sku: null,
        ordem: v.ordem,
      })),
    );
  }
  const imagens = (p.product_images ?? []) as Record<string, unknown>[];
  if (imagens.length) {
    await supabase
      .from("product_images")
      .insert(imagens.map((i) => ({ product_id: novo.id, url: i.url, cor: i.cor, alt: i.alt, ordem: i.ordem })));
  }
  redirect(`/admin/produtos/${novo.id}?copia=1`);
}

// ---------------------------------------------------------------------------
// Variações (editadas direto na tabela)
// ---------------------------------------------------------------------------
const varianteSchema = z.object({
  id: z.string().optional(),
  cor: z.string().trim().min(1, "Toda variação precisa de uma cor."),
  cor_hex: z.string().regex(/^#[0-9a-f]{6}$/i, "Cor inválida."),
  armazenamento: z.string().trim().max(20).nullable(),
  preco: z.number().positive("Preço deve ser maior que zero."),
  preco_antigo: z.number().positive().nullable(),
  preco_pix: z.number().positive().nullable(),
  estoque: z.number().int().min(0, "Estoque não pode ser negativo."),
  sku: z.string().trim().max(40).nullable(),
  remover: z.boolean().optional(),
});

export async function salvarVariacoes(productId: string, lista: unknown): Promise<EstadoAcao> {
  const { supabase } = await exigirAdmin();
  const parsed = z.array(varianteSchema).safeParse(lista);
  if (!parsed.success) return { erro: parsed.error.issues[0]?.message ?? "Variações inválidas." };

  const manter = parsed.data.filter((v) => !v.remover);
  if (!manter.length) return { erro: "O produto precisa de pelo menos uma variação." };

  const remover = parsed.data.filter((v) => v.remover && v.id).map((v) => v.id!);
  if (remover.length) {
    const { error } = await supabase.from("product_variants").delete().in("id", remover).eq("product_id", productId);
    if (error) return { erro: erroAmigavel(error, "Não foi possível remover variações") };
  }

  for (const [ordem, v] of manter.entries()) {
    const linha = {
      product_id: productId,
      cor: v.cor,
      cor_hex: v.cor_hex,
      armazenamento: v.armazenamento || null,
      preco: v.preco,
      preco_antigo: v.preco_antigo,
      // Sem preço Pix informado: aplica 5% de desconto
      preco_pix: v.preco_pix ?? Math.round(v.preco * 0.95 * 100) / 100,
      estoque: v.estoque,
      sku: v.sku || null,
      ordem,
    };
    const { error } = v.id
      ? await supabase.from("product_variants").update(linha).eq("id", v.id).eq("product_id", productId)
      : await supabase.from("product_variants").insert(linha);
    if (error) return { erro: erroAmigavel(error, `Não foi possível salvar a variação ${v.cor} ${v.armazenamento ?? ""}`) };
  }

  atualizarLoja();
  revalidatePath(`/admin/produtos/${productId}`);
  return { ok: true, msg: "Variações salvas." };
}

// ---------------------------------------------------------------------------
// Fotos (já chegam comprimidas em WebP pelo navegador)
// ---------------------------------------------------------------------------
export async function enviarImagem(form: FormData): Promise<EstadoAcao> {
  const { supabase } = await exigirAdmin();
  const productId = String(form.get("productId") ?? "");
  const cor = String(form.get("cor") ?? "") || null;
  const arquivo = form.get("arquivo");
  if (!productId || !(arquivo instanceof File)) return { erro: "Arquivo inválido." };
  if (arquivo.size > 400 * 1024) return { erro: "Imagem grande demais mesmo depois de comprimir." };
  if (!["image/webp", "image/jpeg", "image/png"].includes(arquivo.type)) return { erro: "Formato não suportado." };

  const caminho = `${productId}/${randomUUID()}.webp`;
  const { error: upErro } = await supabase.storage
    .from("produtos")
    .upload(caminho, arquivo, { contentType: arquivo.type, cacheControl: "31536000", upsert: false });
  if (upErro) return { erro: `Falha no envio: ${upErro.message}` };

  const { data: pub } = supabase.storage.from("produtos").getPublicUrl(caminho);
  const { data: ultima } = await supabase
    .from("product_images")
    .select("ordem")
    .eq("product_id", productId)
    .order("ordem", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { error } = await supabase
    .from("product_images")
    .insert({ product_id: productId, url: pub.publicUrl, cor, ordem: (ultima?.ordem ?? -1) + 1 });
  if (error) return { erro: erroAmigavel(error, "Foto enviada, mas não foi possível registrar") };

  atualizarLoja();
  revalidatePath(`/admin/produtos/${productId}`);
  return { ok: true };
}

export async function removerImagem(id: string) {
  const { supabase } = await exigirAdmin();
  const { data: img } = await supabase.from("product_images").select("url, product_id").eq("id", id).single();
  if (!img) return;
  await supabase.from("product_images").delete().eq("id", id);
  const marcador = "/storage/v1/object/public/produtos/";
  const i = img.url.indexOf(marcador);
  if (i >= 0) await supabase.storage.from("produtos").remove([img.url.slice(i + marcador.length)]);
  atualizarLoja();
  revalidatePath(`/admin/produtos/${img.product_id}`);
}

export async function atualizarImagem(id: string, dados: { cor?: string | null; mover?: -1 | 1 }) {
  const { supabase } = await exigirAdmin();
  const { data: img } = await supabase.from("product_images").select("id, product_id, ordem").eq("id", id).single();
  if (!img) return;

  if (dados.cor !== undefined) {
    await supabase.from("product_images").update({ cor: dados.cor || null }).eq("id", id);
  }
  if (dados.mover) {
    const { data: todas } = await supabase
      .from("product_images")
      .select("id, ordem")
      .eq("product_id", img.product_id)
      .order("ordem");
    const lista = todas ?? [];
    const idx = lista.findIndex((x) => x.id === id);
    const alvo = idx + dados.mover;
    if (idx >= 0 && alvo >= 0 && alvo < lista.length) {
      [lista[idx], lista[alvo]] = [lista[alvo], lista[idx]];
      await Promise.all(lista.map((x, ordem) => supabase.from("product_images").update({ ordem }).eq("id", x.id)));
    }
  }
  atualizarLoja();
  revalidatePath(`/admin/produtos/${img.product_id}`);
}

// ---------------------------------------------------------------------------
// Pedidos
// ---------------------------------------------------------------------------
const STATUS_VALIDOS: OrderStatus[] = ["pago", "separando", "enviado", "pronto_retirada", "entregue", "cancelado"];

export async function mudarStatusPedido(orderId: string, status: OrderStatus): Promise<EstadoAcao> {
  await exigirAdmin();
  if (!STATUS_VALIDOS.includes(status)) return { erro: "Status inválido." };

  // As regras de estoque ficam na função SQL; o servidor só chama depois de conferir que é admin.
  const { error } = await supabaseServico().rpc("mudar_status", {
    p_order_id: orderId,
    p_status: status,
    p_obs: status === "pago" ? "Pagamento confirmado manualmente pela loja." : null,
  });
  if (error) {
    if (error.message === "TRANSICAO_INVALIDA") return { erro: error.hint ?? "Mudança de status não permitida." };
    return { erro: erroAmigavel(error, "Não foi possível mudar o status") };
  }

  const pedido = await carregarPedido(orderId);
  if (pedido) await emailMudancaStatus(pedido, status).catch((e) => console.error("[admin] e-mail", e));

  atualizarLoja();
  revalidatePath(`/admin/pedidos/${orderId}`);
  revalidatePath("/admin/pedidos");
  return { ok: true, msg: "Status atualizado. O cliente foi avisado por e-mail." };
}

// ---------------------------------------------------------------------------
// Taxas de entrega
// ---------------------------------------------------------------------------
const zonaSchema = z.object({
  id: z.string().optional(),
  cidade: z.string().trim().min(2, "Informe a cidade."),
  bairro: z.string().trim().max(80),
  taxa: z.number().min(0, "Taxa inválida."),
  prazo: z.string().trim().max(120),
  ativo: z.boolean(),
});

export async function salvarZona(_: EstadoAcao, form: FormData): Promise<EstadoAcao> {
  const { supabase } = await exigirAdmin();
  const parsed = zonaSchema.safeParse({
    id: String(form.get("id") ?? "") || undefined,
    cidade: String(form.get("cidade") ?? ""),
    bairro: String(form.get("bairro") ?? ""),
    taxa: Number(String(form.get("taxa") ?? "").replace(",", ".")),
    prazo: String(form.get("prazo") ?? ""),
    ativo: form.get("ativo") === "on",
  });
  if (!parsed.success) return { erro: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  const z0 = parsed.data;
  const linha = { cidade: z0.cidade, bairro: z0.bairro || null, taxa: z0.taxa, prazo: z0.prazo || null, ativo: z0.ativo };
  const { error } = z0.id
    ? await supabase.from("delivery_zones").update(linha).eq("id", z0.id)
    : await supabase.from("delivery_zones").insert(linha);
  if (error) return { erro: erroAmigavel(error, "Não foi possível salvar a taxa") };
  revalidatePath("/admin/entrega");
  return { ok: true, msg: "Taxa salva." };
}

export async function removerZona(id: string) {
  const { supabase } = await exigirAdmin();
  await supabase.from("delivery_zones").delete().eq("id", id);
  revalidatePath("/admin/entrega");
}
