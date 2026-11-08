import { cookies } from "next/headers";

// Sessão do painel expira depois de um tempo sem uso: se alguém esquecer o /admin aberto
// num computador, o acesso cai sozinho. O proxy (src/proxy.ts) confere e renova a cada página.

export const COOKIE_ATIVIDADE = "admin_ativo";
export const INATIVIDADE_MS = 2 * 60 * 60_000; // 2 horas

export const opcoesCookieAtividade = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  path: "/admin",
  maxAge: INATIVIDADE_MS / 1000,
};

/** Chamado logo após o login: começa a contar o tempo de inatividade. */
export async function marcarAtividadeAdmin() {
  (await cookies()).set(COOKIE_ATIVIDADE, String(Date.now()), opcoesCookieAtividade);
}
