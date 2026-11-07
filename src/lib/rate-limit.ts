// Limite de tentativas por chave (ex.: "checkout:IP", "login:IP").
//
// Com UPSTASH_REDIS_REST_URL e UPSTASH_REDIS_REST_TOKEN configurados, o limite vale
// para todos os servidores da Vercel ao mesmo tempo (Redis do Upstash, plano grátis).
// Sem elas, usa a memória de cada servidor: barra abuso básico, mas cada instância conta separado.
// Se o Upstash cair, volta para a memória em vez de bloquear os clientes.

const janelas = new Map<string, number[]>();

function limitarEmMemoria(chave: string, max: number, janelaMs: number) {
  const agora = Date.now();
  const lista = (janelas.get(chave) ?? []).filter((t) => agora - t < janelaMs);
  if (lista.length >= max) {
    janelas.set(chave, lista);
    return { ok: false, tentarEmSeg: Math.ceil((janelaMs - (agora - lista[0])) / 1000) };
  }
  lista.push(agora);
  janelas.set(chave, lista);
  if (janelas.size > 5000) {
    for (const [k, v] of janelas) if (!v.some((t) => agora - t < janelaMs)) janelas.delete(k);
  }
  return { ok: true, tentarEmSeg: 0 };
}

async function limitarNoUpstash(url: string, token: string, chave: string, max: number, janelaMs: number) {
  // Janela fixa: INCR na chave da janela atual e expira junto com ela
  const janela = Math.floor(Date.now() / janelaMs);
  const k = `rl:${chave}:${janela}`;
  const res = await fetch(`${url.replace(/\/$/, "")}/pipeline`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify([
      ["INCR", k],
      ["PEXPIRE", k, String(janelaMs)],
    ]),
    cache: "no-store",
    signal: AbortSignal.timeout(1500),
  });
  if (!res.ok) throw new Error(`Upstash ${res.status}`);
  const [{ result: total }] = (await res.json()) as [{ result: number }, unknown];
  if (total > max) {
    const fim = (janela + 1) * janelaMs;
    return { ok: false, tentarEmSeg: Math.max(1, Math.ceil((fim - Date.now()) / 1000)) };
  }
  return { ok: true, tentarEmSeg: 0 };
}

export async function limitar(chave: string, max: number, janelaMs: number): Promise<{ ok: boolean; tentarEmSeg: number }> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) {
    try {
      return await limitarNoUpstash(url, token, chave, max, janelaMs);
    } catch (e) {
      console.error("[rate-limit] Upstash indisponível, usando memória:", e);
    }
  }
  return limitarEmMemoria(chave, max, janelaMs);
}

export function ipDaRequisicao(req: Request): string {
  return ipDosCabecalhos(req.headers);
}

export function ipDosCabecalhos(h: Headers): string {
  return h.get("x-real-ip") ?? h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "desconhecido";
}
