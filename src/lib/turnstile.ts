import "server-only";

// Cloudflare Turnstile: captcha invisível (grátis) contra robôs no login e no checkout.
// Só fica ativo com NEXT_PUBLIC_TURNSTILE_SITE_KEY e TURNSTILE_SECRET_KEY configuradas.
// Sem elas, a verificação sempre passa e o site funciona como antes.

export const turnstileAtivo = () => !!(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && process.env.TURNSTILE_SECRET_KEY);

export async function verificarTurnstile(token: FormDataEntryValue | string | null | undefined, ip?: string) {
  if (!turnstileAtivo()) return true;
  if (typeof token !== "string" || !token) return false;
  try {
    const corpo = new URLSearchParams({ secret: process.env.TURNSTILE_SECRET_KEY!, response: token });
    if (ip && ip !== "desconhecido") corpo.set("remoteip", ip);
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: corpo,
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    const json = (await res.json()) as { success?: boolean };
    return json.success === true;
  } catch (e) {
    // Se a Cloudflare não responder, não trava as vendas: deixa passar e registra
    console.error("[turnstile] falha na verificação, liberando:", e);
    return true;
  }
}
