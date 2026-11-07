// Rate limit simples em memória (janela deslizante por IP).
// Na Vercel cada instância tem a própria memória, então o limite é "por instância":
// suficiente para barrar abuso básico. Para algo rígido, use Upstash/Redis.

const janelas = new Map<string, number[]>();

export function limitar(chave: string, max: number, janelaMs: number): { ok: boolean; tentarEmSeg: number } {
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

export function ipDaRequisicao(req: Request): string {
  return (
    req.headers.get("x-real-ip") ??
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "desconhecido"
  );
}
