"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

export interface CartItem {
  variantId: string;
  productId: string;
  slug: string;
  nome: string;
  cor: string;
  armazenamento: string | null;
  preco: number;
  precoPix: number;
  imagem: string;
  quantidade: number;
  estoqueMax: number;
}

interface CartContextValue {
  items: CartItem[];
  hydrated: boolean;
  count: number;
  subtotal: number;
  subtotalPix: number;
  /** muda a cada adição, usado para animar o ícone do carrinho */
  pulse: number;
  add: (item: Omit<CartItem, "quantidade">, quantidade?: number) => void;
  setQuantidade: (variantId: string, quantidade: number) => void;
  remove: (variantId: string) => void;
  clear: () => void;
}

const STORAGE_KEY = "loja-carrinho-v1";
const CartContext = createContext<CartContextValue | null>(null);

function lerStorage(): CartItem[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data.filter((i) => i && typeof i.variantId === "string") : [];
  } catch {
    return [];
  }
}

function gravarStorage(items: CartItem[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // modo privado ou armazenamento cheio: o carrinho segue só em memória
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [pulse, setPulse] = useState(0);
  const primeira = useRef(true);

  useEffect(() => {
    setItems(lerStorage());
    setHydrated(true);
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setItems(lerStorage());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (primeira.current) {
      primeira.current = false;
      return;
    }
    gravarStorage(items);
  }, [items, hydrated]);

  const add = useCallback<CartContextValue["add"]>((item, quantidade = 1) => {
    setItems((atual) => {
      const existente = atual.find((i) => i.variantId === item.variantId);
      if (existente) {
        return atual.map((i) =>
          i.variantId === item.variantId
            ? { ...i, quantidade: Math.min(i.quantidade + quantidade, item.estoqueMax) }
            : i,
        );
      }
      return [...atual, { ...item, quantidade: Math.min(quantidade, item.estoqueMax) }];
    });
    setPulse((p) => p + 1);
  }, []);

  const setQuantidade = useCallback((variantId: string, quantidade: number) => {
    setItems((atual) =>
      atual.map((i) =>
        i.variantId === variantId ? { ...i, quantidade: Math.max(1, Math.min(quantidade, i.estoqueMax)) } : i,
      ),
    );
  }, []);

  const remove = useCallback((variantId: string) => {
    setItems((atual) => atual.filter((i) => i.variantId !== variantId));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo<CartContextValue>(() => {
    const count = items.reduce((s, i) => s + i.quantidade, 0);
    const subtotal = items.reduce((s, i) => s + i.preco * i.quantidade, 0);
    const subtotalPix = items.reduce((s, i) => s + i.precoPix * i.quantidade, 0);
    return { items, hydrated, count, subtotal, subtotalPix, pulse, add, setQuantidade, remove, clear };
  }, [items, hydrated, pulse, add, setQuantidade, remove, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart precisa estar dentro de <CartProvider>");
  return ctx;
}
