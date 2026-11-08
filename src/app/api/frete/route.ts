import { NextResponse } from "next/server";
import { calcularFrete } from "@/lib/frete";

// GET /api/frete?cidade=Ilhéus&bairro=Pontal -> taxa de entrega
export async function GET(req: Request) {
  const url = new URL(req.url);
  const cidade = url.searchParams.get("cidade")?.slice(0, 80) ?? "";
  const bairro = url.searchParams.get("bairro")?.slice(0, 80) ?? "";
  try {
    const r = await calcularFrete({ tipo: "entrega", cidade, bairro });
    return NextResponse.json(r, { headers: { "Cache-Control": "public, max-age=60" } });
  } catch (e) {
    console.error("[frete]", e);
    return NextResponse.json({ ok: false, erro: "Não conseguimos calcular a entrega agora. Tente de novo em instantes ou escolha retirar na loja." }, { status: 500 });
  }
}
