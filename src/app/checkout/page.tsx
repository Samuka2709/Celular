import type { Metadata } from "next";
import { CheckoutView } from "@/components/checkout/CheckoutView";
import { PageHeader } from "@/components/layout/PageHeader";
import { container } from "@/lib/ui";

export const metadata: Metadata = { title: "Finalizar compra", robots: { index: false } };

export default function CheckoutPage() {
  return (
    <div className={container}>
      <PageHeader
        titulo="Finalizar compra"
        migalhas={[{ href: "/", label: "Início" }, { href: "/carrinho", label: "Carrinho" }, { label: "Checkout" }]}
      />
      <CheckoutView />
    </div>
  );
}
