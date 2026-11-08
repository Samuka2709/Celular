"use client";

import { useEffect, useRef } from "react";

// Widget do Cloudflare Turnstile. Não renderiza nada sem NEXT_PUBLIC_TURNSTILE_SITE_KEY.
// Dentro de um <form>, cria o campo oculto "cf-turnstile-response" sozinho.
// Para pedir um token novo (ele vale uma vez só), troque a "key" do componente.

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";
const SCRIPT = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

type TurnstileApi = {
  render: (el: HTMLElement, opts: Record<string, unknown>) => string;
  remove: (id: string) => void;
};
declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

let carregando: Promise<void> | null = null;
function carregarScript() {
  if (window.turnstile) return Promise.resolve();
  carregando ??= new Promise((ok, falha) => {
    const s = document.createElement("script");
    s.src = SCRIPT;
    s.async = true;
    s.onload = () => ok();
    s.onerror = () => {
      carregando = null;
      falha(new Error("Turnstile não carregou"));
    };
    document.head.appendChild(s);
  });
  return carregando;
}

export const turnstileNoNavegador = !!SITE_KEY;

export function Turnstile({ onToken }: { onToken?: (token: string) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const cb = useRef(onToken);
  useEffect(() => {
    cb.current = onToken;
  }, [onToken]);

  useEffect(() => {
    if (!SITE_KEY || !ref.current) return;
    let id: string | undefined;
    let ativo = true;
    carregarScript()
      .then(() => {
        if (!ativo || !ref.current || !window.turnstile) return;
        id = window.turnstile.render(ref.current, {
          sitekey: SITE_KEY,
          language: "pt-br",
          appearance: "interaction-only",
          callback: (t: string) => cb.current?.(t),
          "expired-callback": () => cb.current?.(""),
        });
      })
      .catch((e) => console.error(e));
    return () => {
      ativo = false;
      if (id && window.turnstile) window.turnstile.remove(id);
    };
  }, []);

  if (!SITE_KEY) return null;
  return <div ref={ref} />;
}
