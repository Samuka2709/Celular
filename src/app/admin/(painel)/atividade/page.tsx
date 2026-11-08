import type { Metadata } from "next";
import { AdminTitulo } from "@/components/admin/StatusBadge";
import { exigirAdmin } from "@/lib/admin";
import { cn } from "@/lib/ui";

export const metadata: Metadata = { title: "Atividade" };

const NOMES: Record<string, string> = {
  login_ok: "Entrou no painel",
  login_falhou: "Senha errada",
  login_bloqueado: "Login bloqueado (muitas tentativas)",
  login_sem_permissao: "Login sem permissão de admin",
  logout: "Saiu do painel",
  produto_criado: "Criou produto",
  produto_editado: "Editou produto",
  produto_ativado: "Ativou produto",
  produto_desativado: "Desativou produto",
  produto_duplicado: "Duplicou produto",
  variacoes_salvas: "Salvou variações (preço/estoque)",
  foto_enviada: "Enviou foto",
  foto_removida: "Removeu foto",
  pedido_status: "Mudou status do pedido",
  frete_salvo: "Salvou taxa de entrega",
  frete_removido: "Removeu taxa de entrega",
};

const ALERTA = new Set(["login_falhou", "login_bloqueado", "login_sem_permissao"]);

function resumo(acao: string, d: Record<string, unknown>) {
  if (acao === "pedido_status") return `Novo status: ${String(d.status)}`;
  if (typeof d.nome === "string") return d.nome;
  if (acao === "frete_salvo") return [d.cidade, d.bairro].filter(Boolean).join(" / ");
  return "";
}

function contarFalhasRecentes(linhas: { acao: string; criado_em: string }[]) {
  const limite = Date.now() - 24 * 3600_000;
  return linhas.filter((l) => ALERTA.has(l.acao) && new Date(l.criado_em).getTime() > limite).length;
}

export default async function AtividadePage() {
  const { supabase } = await exigirAdmin();
  const { data, error } = await supabase
    .from("admin_log")
    .select("id, criado_em, email, ip, acao, detalhes")
    .order("criado_em", { ascending: false })
    .limit(200);

  const linhas = data ?? [];
  const falhas24h = contarFalhasRecentes(linhas);

  return (
    <>
      <AdminTitulo
        titulo="Atividade"
        descricao="Últimos 200 registros de logins e ações no painel. Os registros são guardados por 1 ano."
      />
      {error && (
        <p className="mb-4 text-sm text-danger">
          Não foi possível carregar. Rode o arquivo supabase/migrations/20261107000006_auditoria.sql no SQL Editor do
          Supabase. ({error.message})
        </p>
      )}
      {falhas24h > 0 && (
        <p className="mb-4 rounded-lg border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-ink">
          {falhas24h} tentativa(s) de login com problema nas últimas 24 horas. Se não foi você, troque sua senha.
        </p>
      )}
      <div className="overflow-x-auto rounded-xl border border-line">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-card text-xs uppercase tracking-wide text-subtle">
            <tr>
              <th className="px-4 py-3 font-medium">Quando</th>
              <th className="px-4 py-3 font-medium">Quem</th>
              <th className="px-4 py-3 font-medium">O quê</th>
              <th className="px-4 py-3 font-medium">IP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {linhas.map((l) => (
              <tr key={l.id} className={cn(ALERTA.has(l.acao) && "bg-danger/5")}>
                <td className="whitespace-nowrap px-4 py-3 text-muted">
                  {new Date(l.criado_em).toLocaleString("pt-BR", { timeZone: "America/Bahia" })}
                </td>
                <td className="px-4 py-3">{l.email ?? "—"}</td>
                <td className="px-4 py-3">
                  <span className={cn(ALERTA.has(l.acao) && "font-semibold text-danger")}>{NOMES[l.acao] ?? l.acao}</span>
                  {resumo(l.acao, (l.detalhes ?? {}) as Record<string, unknown>) && (
                    <span className="block text-xs text-subtle">
                      {resumo(l.acao, (l.detalhes ?? {}) as Record<string, unknown>)}
                    </span>
                  )}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-subtle">{l.ip ?? "—"}</td>
              </tr>
            ))}
            {!linhas.length && !error && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted">
                  Nenhum registro ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
