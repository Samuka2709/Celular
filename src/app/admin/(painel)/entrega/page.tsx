import type { Metadata } from "next";
import { ZonaForm } from "@/components/admin/ZonaForm";
import { AdminTitulo } from "@/components/admin/StatusBadge";
import { exigirAdmin } from "@/lib/admin";
import { paraCampo } from "@/lib/format";

export const metadata: Metadata = { title: "Entrega" };

export default async function EntregaPage() {
  const { supabase } = await exigirAdmin();
  const { data: zonas, error } = await supabase
    .from("delivery_zones")
    .select("id, cidade, bairro, taxa, prazo, ativo")
    .order("cidade")
    .order("bairro", { nullsFirst: true });

  return (
    <>
      <AdminTitulo
        titulo="Taxas de entrega"
        descricao="Defina a taxa por cidade (deixe o bairro em branco) ou por bairro específico. O bairro tem prioridade sobre a cidade. Retirada na loja é sempre grátis."
      />
      {error && <p className="mb-4 text-sm text-danger">Erro: {error.message}</p>}
      <div className="space-y-3">
        {(zonas ?? []).map((z) => (
          <ZonaForm
            key={z.id}
            zona={{ id: z.id, cidade: z.cidade, bairro: z.bairro ?? "", taxa: paraCampo(z.taxa), prazo: z.prazo ?? "", ativo: z.ativo }}
          />
        ))}
        <div className="pt-4">
          <h2 className="mb-3 font-display text-lg font-semibold">Adicionar taxa</h2>
          <ZonaForm />
        </div>
      </div>
    </>
  );
}
