import type { Metadata } from "next";
import { CartView } from "@/components/cart/CartView";
import { PageHeader } from "@/components/layout/PageHeader";
import { container } from "@/lib/ui";

export const metadata: Metadata = { title: "Carrinho", robots: { index: false } };

export default function CarrinhoPage() {
  return (
    <div className={container}>
      <PageHeader titulo="Carrinho" migalhas={[{ href: "/", label: "Início" }, { label: "Carrinho" }]} />
      <CartView />
    </div>
  );
}
