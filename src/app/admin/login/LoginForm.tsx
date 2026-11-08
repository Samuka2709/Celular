"use client";

import { Loader2 } from "lucide-react";
import { useActionState, useState } from "react";
import { Field, inputClasses } from "@/components/checkout/Field";
import { Turnstile } from "@/components/Turnstile";
import { botao } from "@/lib/ui";
import { entrar, type EstadoAcao } from "../actions";

export function LoginForm() {
  const [estado, acao, pendente] = useActionState<EstadoAcao, FormData>(entrar, {});
  // O token do captcha vale uma vez: a cada envio, o widget é recriado para gerar outro
  const [envios, setEnvios] = useState(0);
  return (
    <form action={acao} onSubmit={() => setTimeout(() => setEnvios((n) => n + 1), 0)} className="mt-6 space-y-4">
      <Field id="email" label="E-mail">
        <input id="email" name="email" type="email" autoComplete="username" required className={inputClasses()} />
      </Field>
      <Field id="senha" label="Senha">
        <input id="senha" name="senha" type="password" autoComplete="current-password" required className={inputClasses()} />
      </Field>
      <Turnstile key={envios} />
      {estado.erro && (
        <p role="alert" className="text-sm text-danger">
          {estado.erro}
        </p>
      )}
      <button type="submit" disabled={pendente} className={botao("primario", "lg", "w-full")}>
        {pendente && <Loader2 className="size-5 animate-spin" aria-hidden />}
        Entrar
      </button>
    </form>
  );
}
