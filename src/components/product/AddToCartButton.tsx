"use client";

import { Check, ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";
import { useCart, type CartItem } from "@/lib/cart";
import { botao, cn } from "@/lib/ui";

export function AddToCartButton({
  item,
  compacto = false,
  className,
}: {
  item: Omit<CartItem, "quantidade">;
  compacto?: boolean;
  className?: string;
}) {
  const { add, items } = useCart();
  const [ok, setOk] = useState(false);
  const noCarrinho = items.find((i) => i.variantId === item.variantId)?.quantidade ?? 0;
  const limite = noCarrinho >= item.estoqueMax;

  useEffect(() => {
    if (!ok) return;
    const t = setTimeout(() => setOk(false), 1600);
    return () => clearTimeout(t);
  }, [ok]);

  return (
    <button
      type="button"
      disabled={limite}
      onClick={() => {
        add(item);
        setOk(true);
      }}
      className={botao(ok ? "secundario" : "primario", "sm", cn("w-full", className))}
      aria-live="polite"
    >
      <span className="relative grid size-4 place-items-center" aria-hidden>
        <ShoppingBag
          className={cn("absolute size-4 transition-[opacity,transform] duration-200", ok ? "scale-75 opacity-0" : "opacity-100")}
        />
        <Check
          className={cn("absolute size-4 text-accent transition-[opacity,transform] duration-200", ok ? "opacity-100" : "scale-75 opacity-0")}
        />
      </span>
      {limite ? (
        "Limite em estoque"
      ) : ok ? (
        "Adicionado"
      ) : compacto ? (
        <>
          <span className="sm:hidden">Adicionar</span>
          <span className="hidden sm:inline">Adicionar ao carrinho</span>
        </>
      ) : (
        "Adicionar ao carrinho"
      )}
    </button>
  );
}
