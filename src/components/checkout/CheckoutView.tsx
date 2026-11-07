"use client";

import { AlertCircle, Check, ChevronDown, CreditCard, FlaskConical, Loader2, Lock, MapPin, QrCode, ShoppingBag, Store, Truck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useCart } from "@/lib/cart";
import { cpfValido, formatBRL, maskCEP, maskCPF, maskWhatsApp } from "@/lib/format";
import { SITE } from "@/lib/site";
import { botao, cn } from "@/lib/ui";
import { Skeleton } from "../ui/Skeleton";
import { Field, inputClasses } from "./Field";

type TipoEntrega = "retirada" | "entrega";
type FormaPagamento = "pix" | "cartao_boleto";

type EstadoFrete =
  | { status: "idle" }
  | { status: "calculando" }
  | { status: "ok"; taxa: number; prazo: string | null }
  | { status: "erro"; erro: string };

interface Dados {
  formaPagamento: FormaPagamento;
  nome: string;
  whatsapp: string;
  email: string;
  cpf: string;
  tipoEntrega: TipoEntrega;
  cep: string;
  rua: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  uf: string;
}

const INICIAL: Dados = {
  formaPagamento: "pix",
  nome: "",
  whatsapp: "",
  email: "",
  cpf: "",
  tipoEntrega: "retirada",
  cep: "",
  rua: "",
  numero: "",
  complemento: "",
  bairro: "",
  cidade: "",
  uf: "",
};

type Erros = Partial<Record<keyof Dados, string>>;

function validarDados(d: Dados): Erros {
  const e: Erros = {};
  if (d.nome.trim().split(/\s+/).length < 2) e.nome = "Informe nome e sobrenome.";
  if (d.whatsapp.replace(/\D/g, "").length < 11) e.whatsapp = "Informe o WhatsApp com DDD, ex.: (73) 99999-9999.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(d.email.trim())) e.email = "Informe um e-mail válido, ex.: nome@email.com.";
  if (d.cpf && !cpfValido(d.cpf)) e.cpf = "CPF inválido. Confira os números ou deixe em branco.";
  return e;
}

function validarEntrega(d: Dados): Erros {
  const e: Erros = {};
  if (d.tipoEntrega === "retirada") return e;
  if (d.cep.replace(/\D/g, "").length !== 8) e.cep = "Informe os 8 números do CEP.";
  if (!d.rua.trim()) e.rua = "Informe a rua.";
  if (!d.numero.trim()) e.numero = "Informe o número (ou S/N).";
  if (!d.bairro.trim()) e.bairro = "Informe o bairro.";
  if (!d.cidade.trim()) e.cidade = "Informe a cidade.";
  return e;
}

const ORDEM_CAMPOS: (keyof Dados)[] = ["nome", "whatsapp", "email", "cpf", "cep", "rua", "numero", "bairro", "cidade"];

export function CheckoutView() {
  const router = useRouter();
  const { items, hydrated, subtotal, subtotalPix } = useCart();
  const [d, setD] = useState<Dados>(INICIAL);
  const [tocados, setTocados] = useState<Partial<Record<keyof Dados, boolean>>>({});
  const [enviou, setEnviou] = useState(false);
  const [cepStatus, setCepStatus] = useState<"idle" | "buscando" | "ok" | "erro">("idle");
  const [enviando, setEnviando] = useState(false);
  const [resumoAberto, setResumoAberto] = useState(false);
  const [freteEstado, setFreteEstado] = useState<EstadoFrete>({ status: "idle" });
  const [erroEnvio, setErroEnvio] = useState<{ erro: string; esgotado?: boolean } | null>(null);
  const numeroRef = useRef<HTMLInputElement>(null);

  const errosDados = useMemo(() => validarDados(d), [d]);
  const errosEntrega = useMemo(() => validarEntrega(d), [d]);
  const erros = { ...errosDados, ...errosEntrega };
  const mostrar = (campo: keyof Dados) => ((enviou || tocados[campo]) && erros[campo]) || undefined;

  const dadosOk = Object.keys(errosDados).length === 0;
  const entregaOk = dadosOk && Object.keys(errosEntrega).length === 0;
  const etapa = !dadosOk ? 0 : !entregaOk ? 1 : 2;

  // Frete: grátis na retirada; na entrega, calculado no servidor pela cidade/bairro
  useEffect(() => {
    if (d.tipoEntrega !== "entrega" || d.cidade.trim().length < 2) {
      setFreteEstado({ status: "idle" });
      return;
    }
    const ctrl = new AbortController();
    const t = setTimeout(() => {
      setFreteEstado({ status: "calculando" });
      fetch(`/api/frete?cidade=${encodeURIComponent(d.cidade)}&bairro=${encodeURIComponent(d.bairro)}`, { signal: ctrl.signal })
        .then((r) => r.json())
        .then((r) => setFreteEstado(r.ok ? { status: "ok", taxa: r.taxa, prazo: r.prazo } : { status: "erro", erro: r.erro }))
        .catch((e) => {
          if (e.name !== "AbortError") setFreteEstado({ status: "erro", erro: "Não foi possível calcular a entrega agora." });
        });
    }, 350);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [d.tipoEntrega, d.cidade, d.bairro]);

  const frete = d.tipoEntrega === "retirada" ? 0 : freteEstado.status === "ok" ? freteEstado.taxa : null;
  const base = d.formaPagamento === "pix" ? subtotalPix : subtotal;
  const total = base + (frete ?? 0);
  const totalPix = subtotalPix + (frete ?? 0);

  // ViaCEP: busca o endereço quando o CEP tem 8 números
  useEffect(() => {
    const cep = d.cep.replace(/\D/g, "");
    if (d.tipoEntrega !== "entrega" || cep.length !== 8) {
      setCepStatus("idle");
      return;
    }
    const ctrl = new AbortController();
    setCepStatus("buscando");
    fetch(`https://viacep.com.br/ws/${cep}/json/`, { signal: ctrl.signal })
      .then((r) => {
        if (!r.ok) throw new Error("http");
        return r.json();
      })
      .then((json) => {
        if (json.erro) throw new Error("nao-encontrado");
        setD((atual) => ({
          ...atual,
          rua: json.logradouro || atual.rua,
          bairro: json.bairro || atual.bairro,
          cidade: json.localidade || atual.cidade,
          uf: json.uf || atual.uf,
        }));
        setCepStatus("ok");
        setTimeout(() => numeroRef.current?.focus(), 0);
      })
      .catch((err) => {
        if (err.name !== "AbortError") setCepStatus("erro");
      });
    return () => ctrl.abort();
  }, [d.cep, d.tipoEntrega]);

  const set = <K extends keyof Dados>(campo: K, valor: Dados[K]) => setD((atual) => ({ ...atual, [campo]: valor }));
  const blur = (campo: keyof Dados) => () => setTocados((t) => ({ ...t, [campo]: true }));
  const aria = (campo: keyof Dados, dica = false) => ({
    "aria-invalid": !!mostrar(campo) || undefined,
    "aria-describedby": mostrar(campo) ? `${campo}-erro` : dica ? `${campo}-dica` : undefined,
  });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setEnviou(true);
    const primeiro = ORDEM_CAMPOS.find((c) => erros[c]);
    if (primeiro) {
      document.getElementById(primeiro)?.focus();
      return;
    }
    if (d.tipoEntrega === "entrega" && freteEstado.status === "erro") {
      document.getElementById("cidade")?.focus();
      return;
    }
    setEnviando(true);
    setErroEnvio(null);
    try {
      // O servidor recalcula preços e frete pelo banco; aqui só vão variação e quantidade.
      const resp = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: d.nome,
          email: d.email,
          whatsapp: d.whatsapp,
          cpf: d.cpf,
          tipoEntrega: d.tipoEntrega,
          formaPagamento: d.formaPagamento,
          endereco:
            d.tipoEntrega === "entrega"
              ? { cep: d.cep, rua: d.rua, numero: d.numero, complemento: d.complemento, bairro: d.bairro, cidade: d.cidade, uf: d.uf }
              : undefined,
          itens: items.map((i) => ({ variantId: i.variantId, quantidade: i.quantidade })),
        }),
      });
      const r = await resp.json();
      if (!r.ok) {
        setErroEnvio({ erro: r.erro ?? "Não foi possível continuar.", esgotado: r.esgotado });
        setEnviando(false);
        return;
      }
      // Vai para o Mercado Pago (ou para a página de sucesso no modo demonstração)
      if (/^https?:\/\//.test(r.redirect)) window.location.href = r.redirect;
      else router.push(r.redirect);
    } catch {
      setErroEnvio({ erro: "Sem conexão. Confira sua internet e tente de novo." });
      setEnviando(false);
    }
  }

  if (!hydrated) {
    return (
      <div role="status" aria-label="Carregando checkout" className="grid gap-8 lg:grid-cols-[1fr_400px]">
        <Skeleton className="h-[640px] w-full rounded-2xl" />
        <Skeleton className="h-80 w-full rounded-2xl" />
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="grid place-items-center rounded-3xl border border-dashed border-line-strong px-6 py-20 text-center">
        <ShoppingBag className="size-12 text-subtle" strokeWidth={1.25} aria-hidden />
        <h2 className="mt-5 font-display text-2xl font-semibold">Não há itens para finalizar</h2>
        <p className="mt-2 max-w-sm text-muted">Adicione um produto ao carrinho para continuar.</p>
        <Link href="/celulares" className={botao("primario", "md", "mt-8")}>
          Ver celulares
        </Link>
      </div>
    );
  }

  const resumo = (
    <>
      <ul className="space-y-4">
        {items.map((i) => (
          <li key={i.variantId} className="flex gap-3">
            <div className="relative size-16 shrink-0 rounded-xl bg-canvas">
              <Image src={i.imagem} alt="" fill sizes="64px" className="object-contain p-1.5" />
              <span className="absolute -right-1.5 -top-1.5 grid size-5 place-items-center rounded-full bg-line-strong text-[11px] font-bold tabular-nums">
                {i.quantidade}
              </span>
            </div>
            <div className="min-w-0 flex-1 text-sm">
              <p className="font-medium leading-snug">{i.nome}</p>
              <p className="text-muted">{[i.cor, i.armazenamento].filter(Boolean).join(" · ")}</p>
            </div>
            <p className="text-sm font-medium tabular-nums">{formatBRL(i.preco * i.quantidade)}</p>
          </li>
        ))}
      </ul>
      <dl className="mt-5 space-y-2.5 border-t border-line pt-5 text-sm tabular-nums">
        <div className="flex justify-between">
          <dt className="text-muted">Subtotal</dt>
          <dd>{formatBRL(subtotal)}</dd>
        </div>
        {d.formaPagamento === "pix" && subtotal > subtotalPix && (
          <div className="flex justify-between text-accent">
            <dt>Desconto Pix</dt>
            <dd>-{formatBRL(subtotal - subtotalPix)}</dd>
          </div>
        )}
        <div className="flex justify-between gap-4">
          <dt className="text-muted">Entrega</dt>
          <dd className="text-right">
            {d.tipoEntrega === "retirada" ? (
              "Grátis"
            ) : freteEstado.status === "ok" ? (
              freteEstado.taxa === 0 ? "Grátis" : formatBRL(freteEstado.taxa)
            ) : freteEstado.status === "calculando" ? (
              <span className="text-muted">Calculando</span>
            ) : freteEstado.status === "erro" ? (
              <span className="text-danger">Indisponível</span>
            ) : (
              <span className="text-muted">Informe o CEP</span>
            )}
          </dd>
        </div>
        <div className="flex items-baseline justify-between border-t border-line pt-3">
          <dt className="font-semibold">Total{d.formaPagamento === "pix" ? " no Pix" : ""}</dt>
          <dd className="font-display text-2xl font-semibold">{formatBRL(total)}</dd>
        </div>
        {d.formaPagamento !== "pix" && (
          <div className="flex justify-between text-accent">
            <dt>No Pix sairia</dt>
            <dd className="font-semibold">{formatBRL(totalPix)}</dd>
          </div>
        )}
      </dl>
    </>
  );

  const etapas = ["Dados", "Entrega", "Pagamento"];

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:items-start lg:gap-10">
      {/* Resumo recolhível no celular */}
      <div className="rounded-2xl border border-line bg-card lg:hidden">
        <button
          type="button"
          onClick={() => setResumoAberto((a) => !a)}
          aria-expanded={resumoAberto}
          aria-controls="resumo-mobile"
          className="flex min-h-14 w-full items-center justify-between gap-3 px-4 text-left"
        >
          <span className="flex items-center gap-2 text-sm font-medium">
            <ShoppingBag className="size-4 text-accent" aria-hidden />
            {resumoAberto ? "Ocultar resumo" : "Ver resumo do pedido"}
            <ChevronDown className={cn("size-4 transition-transform duration-200", resumoAberto && "rotate-180")} aria-hidden />
          </span>
          <span className="font-display font-semibold tabular-nums">{formatBRL(total)}</span>
        </button>
        <div
          id="resumo-mobile"
          className={cn(
            "grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
            resumoAberto ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
          )}
        >
          <div className="overflow-hidden" inert={!resumoAberto}>
            <div className="border-t border-line p-4">{resumo}</div>
          </div>
        </div>
      </div>

      <form onSubmit={onSubmit} noValidate className="min-w-0">
        {SITE.emTestes && (
          <div role="note" className="mb-6 flex gap-3 rounded-xl border border-accent/40 bg-accent/5 p-4 text-sm">
            <FlaskConical className="mt-0.5 size-5 shrink-0 text-accent" aria-hidden />
            <p className="text-muted">
              <span className="font-semibold text-ink">Loja em fase de testes.</span> Os produtos e preços são de
              exemplo e nenhum pagamento é cobrado. Para comprar de verdade, fale com a gente no WhatsApp.
            </p>
          </div>
        )}
        <ol className="mb-8 flex items-center gap-2" aria-label="Etapas do checkout">
          {etapas.map((nome, i) => {
            const feito = i < etapa;
            const atual = i === etapa;
            return (
              <li key={nome} className="flex flex-1 items-center gap-2" aria-current={atual ? "step" : undefined}>
                <span
                  className={cn(
                    "grid size-7 shrink-0 place-items-center rounded-full text-xs font-bold transition-colors duration-200",
                    feito ? "bg-accent text-canvas" : atual ? "border-2 border-accent text-ink" : "border border-line-strong text-muted",
                  )}
                >
                  {feito ? <Check className="size-4" strokeWidth={3} aria-hidden /> : i + 1}
                </span>
                <span className={cn("text-sm font-medium", atual || feito ? "text-ink" : "text-muted")}>
                  {nome}
                  {feito && <span className="sr-only"> (concluído)</span>}
                </span>
                {i < etapas.length - 1 && (
                  <span aria-hidden className={cn("h-px flex-1 transition-colors duration-200", feito ? "bg-accent" : "bg-line-strong")} />
                )}
              </li>
            );
          })}
        </ol>

        <section aria-labelledby="sec-dados" className="rounded-2xl border border-line bg-card p-5 sm:p-6">
          <h2 id="sec-dados" className="font-display text-xl font-semibold">
            Seus dados
          </h2>
          <p className="mt-1 text-sm text-muted">Sem cadastro. Usamos estes dados só para o pedido e a entrega.</p>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <Field id="nome" label="Nome completo" erro={mostrar("nome")} className="sm:col-span-2">
              <input
                id="nome"
                autoComplete="name"
                value={d.nome}
                onChange={(e) => set("nome", e.target.value)}
                onBlur={blur("nome")}
                className={inputClasses(mostrar("nome"))}
                {...aria("nome")}
              />
            </Field>
            <Field id="whatsapp" label="WhatsApp" erro={mostrar("whatsapp")} dica="Enviamos as atualizações do pedido por aqui.">
              <input
                id="whatsapp"
                type="tel"
                inputMode="tel"
                autoComplete="tel-national"
                placeholder="(73) 99999-9999"
                value={d.whatsapp}
                onChange={(e) => set("whatsapp", maskWhatsApp(e.target.value))}
                onBlur={blur("whatsapp")}
                className={inputClasses(mostrar("whatsapp"))}
                {...aria("whatsapp", true)}
              />
            </Field>
            <Field id="email" label="E-mail" erro={mostrar("email")}>
              <input
                id="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="nome@email.com"
                value={d.email}
                onChange={(e) => set("email", e.target.value)}
                onBlur={blur("email")}
                className={inputClasses(mostrar("email"))}
                {...aria("email")}
              />
            </Field>
            <Field id="cpf" label="CPF" opcional erro={mostrar("cpf")} dica="Para emitir a nota fiscal no seu nome.">
              <input
                id="cpf"
                inputMode="numeric"
                placeholder="000.000.000-00"
                value={d.cpf}
                onChange={(e) => set("cpf", maskCPF(e.target.value))}
                onBlur={blur("cpf")}
                className={inputClasses(mostrar("cpf"))}
                {...aria("cpf", true)}
              />
            </Field>
          </div>
        </section>

        <section aria-labelledby="sec-entrega" className="mt-5 rounded-2xl border border-line bg-card p-5 sm:p-6">
          <h2 id="sec-entrega" className="font-display text-xl font-semibold">
            Entrega
          </h2>
          <fieldset className="mt-5">
            <legend className="sr-only">Como você quer receber</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              {(
                [
                  {
                    valor: "retirada",
                    titulo: "Retirar na loja",
                    texto: "Grátis. Pronto em até 2 h após o pagamento.",
                    icone: Store,
                  },
                  {
                    valor: "entrega",
                    titulo: "Entrega",
                    texto: "Ilhéus e região. Taxa calculada pelo CEP.",
                    icone: Truck,
                  },
                ] as const
              ).map((op) => {
                const ativo = d.tipoEntrega === op.valor;
                return (
                  <label
                    key={op.valor}
                    className={cn(
                      "relative flex cursor-pointer gap-3 rounded-xl border p-4 transition-[border-color,background-color] duration-150",
                      ativo ? "border-accent bg-accent/5" : "border-line-strong hover:border-muted",
                      "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent",
                    )}
                  >
                    <input
                      type="radio"
                      name="tipoEntrega"
                      value={op.valor}
                      checked={ativo}
                      onChange={() => set("tipoEntrega", op.valor)}
                      className="sr-only"
                    />
                    <op.icone className={cn("mt-0.5 size-5 shrink-0", ativo ? "text-accent" : "text-muted")} aria-hidden />
                    <span>
                      <span className="block font-medium">{op.titulo}</span>
                      <span className="mt-0.5 block text-sm text-muted">{op.texto}</span>
                    </span>
                    <span
                      aria-hidden
                      className={cn(
                        "ml-auto mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border-2 transition-colors duration-150",
                        ativo ? "border-accent" : "border-line-strong",
                      )}
                    >
                      <span className={cn("size-2.5 rounded-full bg-accent transition-transform duration-150", ativo ? "scale-100" : "scale-0")} />
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          {d.tipoEntrega === "retirada" ? (
            <p className="mt-5 flex gap-2.5 rounded-xl bg-canvas p-4 text-sm text-muted">
              <MapPin className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
              <span>
                <span className="text-ink">{SITE.endereco}</span>
                <br />
                {SITE.horario}
              </span>
            </p>
          ) : (
            <div className="animate-fade-up mt-6 grid gap-5 sm:grid-cols-6">
              <Field
                id="cep"
                label="CEP"
                erro={mostrar("cep") ?? (cepStatus === "erro" ? "CEP não encontrado. Confira o número ou preencha o endereço abaixo." : undefined)}
                className="sm:col-span-3"
              >
                <div className="relative">
                  <input
                    id="cep"
                    inputMode="numeric"
                    autoComplete="postal-code"
                    placeholder="00000-000"
                    value={d.cep}
                    onChange={(e) => set("cep", maskCEP(e.target.value))}
                    onBlur={blur("cep")}
                    className={inputClasses(mostrar("cep") ?? (cepStatus === "erro" ? "x" : undefined))}
                    aria-invalid={!!mostrar("cep") || cepStatus === "erro" || undefined}
                    aria-describedby={mostrar("cep") || cepStatus === "erro" ? "cep-erro" : undefined}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2" aria-live="polite">
                    {cepStatus === "buscando" && (
                      <>
                        <Loader2 className="size-5 animate-spin text-muted" aria-hidden />
                        <span className="sr-only">Buscando endereço</span>
                      </>
                    )}
                    {cepStatus === "ok" && (
                      <>
                        <Check className="size-5 text-success" aria-hidden />
                        <span className="sr-only">Endereço encontrado</span>
                      </>
                    )}
                  </span>
                </div>
              </Field>
              <div className="flex items-end pb-3 sm:col-span-3">
                <a
                  href="https://buscacepinter.correios.com.br/app/endereco/index.php"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted underline underline-offset-4 hover:text-ink"
                >
                  Não sei meu CEP
                </a>
              </div>
              <Field id="rua" label="Rua" erro={mostrar("rua")} className="sm:col-span-4">
                <input
                  id="rua"
                  autoComplete="address-line1"
                  value={d.rua}
                  onChange={(e) => set("rua", e.target.value)}
                  onBlur={blur("rua")}
                  className={inputClasses(mostrar("rua"))}
                  {...aria("rua")}
                />
              </Field>
              <Field id="numero" label="Número" erro={mostrar("numero")} className="sm:col-span-2">
                <input
                  id="numero"
                  ref={numeroRef}
                  inputMode="numeric"
                  value={d.numero}
                  onChange={(e) => set("numero", e.target.value)}
                  onBlur={blur("numero")}
                  className={inputClasses(mostrar("numero"))}
                  {...aria("numero")}
                />
              </Field>
              <Field id="complemento" label="Complemento" opcional className="sm:col-span-6">
                <input
                  id="complemento"
                  autoComplete="address-line2"
                  placeholder="Apartamento, bloco, ponto de referência"
                  value={d.complemento}
                  onChange={(e) => set("complemento", e.target.value)}
                  className={inputClasses()}
                />
              </Field>
              <Field id="bairro" label="Bairro" erro={mostrar("bairro")} className="sm:col-span-3">
                <input
                  id="bairro"
                  value={d.bairro}
                  onChange={(e) => set("bairro", e.target.value)}
                  onBlur={blur("bairro")}
                  className={inputClasses(mostrar("bairro"))}
                  {...aria("bairro")}
                />
              </Field>
              <Field id="cidade" label="Cidade" erro={mostrar("cidade")} className="sm:col-span-3">
                <input
                  id="cidade"
                  autoComplete="address-level2"
                  value={d.cidade}
                  onChange={(e) => set("cidade", e.target.value)}
                  onBlur={blur("cidade")}
                  className={inputClasses(mostrar("cidade"))}
                  {...aria("cidade")}
                />
              </Field>
              <div className="sm:col-span-6" aria-live="polite">
                {freteEstado.status === "ok" && (
                  <p className="flex gap-2.5 rounded-xl bg-canvas p-4 text-sm text-muted">
                    <Truck className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
                    <span>
                      Entrega: <span className="font-semibold text-ink">{freteEstado.taxa === 0 ? "grátis" : formatBRL(freteEstado.taxa)}</span>
                      {freteEstado.prazo && <>. {freteEstado.prazo}.</>}
                    </span>
                  </p>
                )}
                {freteEstado.status === "erro" && (
                  <p className="flex gap-2.5 rounded-xl border border-danger/40 p-4 text-sm text-danger">
                    <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
                    {freteEstado.erro}
                  </p>
                )}
              </div>
            </div>
          )}
        </section>

        <section aria-labelledby="sec-pagamento" className="mt-5 rounded-2xl border border-line bg-card p-5 sm:p-6">
          <h2 id="sec-pagamento" className="font-display text-xl font-semibold">
            Pagamento
          </h2>
          <fieldset className="mt-5">
            <legend className="sr-only">Forma de pagamento</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              {(
                [
                  {
                    valor: "pix",
                    titulo: `Pix · ${Math.round(SITE.descontoPix * 100)}% off`,
                    texto: "Aprovação na hora.",
                    icone: QrCode,
                  },
                  {
                    valor: "cartao_boleto",
                    titulo: "Cartão ou boleto",
                    texto: `Cartão em até ${SITE.parcelasSemJuros}x sem juros ou boleto.`,
                    icone: CreditCard,
                  },
                ] as const
              ).map((op) => {
                const ativo = d.formaPagamento === op.valor;
                return (
                  <label
                    key={op.valor}
                    className={cn(
                      "relative flex cursor-pointer gap-3 rounded-xl border p-4 transition-[border-color,background-color] duration-150",
                      ativo ? "border-accent bg-accent/5" : "border-line-strong hover:border-muted",
                      "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent",
                    )}
                  >
                    <input
                      type="radio"
                      name="formaPagamento"
                      value={op.valor}
                      checked={ativo}
                      onChange={() => set("formaPagamento", op.valor)}
                      className="sr-only"
                    />
                    <op.icone className={cn("mt-0.5 size-5 shrink-0", ativo ? "text-accent" : "text-muted")} aria-hidden />
                    <span>
                      <span className="block font-medium">{op.titulo}</span>
                      <span className="mt-0.5 block text-sm text-muted">{op.texto}</span>
                    </span>
                    <span
                      aria-hidden
                      className={cn(
                        "ml-auto mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border-2 transition-colors duration-150",
                        ativo ? "border-accent" : "border-line-strong",
                      )}
                    >
                      <span className={cn("size-2.5 rounded-full bg-accent transition-transform duration-150", ativo ? "scale-100" : "scale-0")} />
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>
          <div className="mt-4 flex gap-3 rounded-xl bg-canvas p-4">
            <Lock className="mt-0.5 size-5 shrink-0 text-accent" aria-hidden />
            <p className="text-sm leading-relaxed text-muted">
              Você termina o pagamento no <span className="text-ink">ambiente seguro do Mercado Pago</span>. Seus itens
              ficam reservados por 30 minutos. Não guardamos dados do seu cartão.
            </p>
          </div>
          {erroEnvio && (
            <div role="alert" className="mt-4 flex gap-2.5 rounded-xl border border-danger/40 p-4 text-sm text-danger">
              <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
              <span>
                {erroEnvio.erro}
                {erroEnvio.esgotado && (
                  <>
                    {" "}
                    <Link href="/carrinho" className="font-semibold underline underline-offset-2">
                      Revisar carrinho
                    </Link>
                  </>
                )}
              </span>
            </div>
          )}
          <button type="submit" disabled={enviando} className={botao("primario", "lg", "mt-6 w-full")}>
            {enviando ? (
              <>
                <Loader2 className="size-5 animate-spin" aria-hidden />
                Redirecionando para o pagamento
              </>
            ) : (
              <>
                <Lock className="size-4" aria-hidden />
                Ir para pagamento · {formatBRL(total)}
              </>
            )}
          </button>
          {enviou && Object.keys(erros).length > 0 && (
            <p role="alert" className="mt-3 text-center text-sm text-danger">
              Confira os campos destacados acima para continuar.
            </p>
          )}
          <p className="mt-4 text-center text-xs text-muted">
            Ao continuar você concorda com a{" "}
            <Link href="/trocas-e-garantia" className="underline underline-offset-2 hover:text-ink">
              política de trocas
            </Link>{" "}
            e a{" "}
            <Link href="/politica-de-privacidade" className="underline underline-offset-2 hover:text-ink">
              política de privacidade
            </Link>
            .
          </p>
        </section>
      </form>

      <aside aria-labelledby="resumo-titulo" className="hidden rounded-2xl border border-line bg-card p-6 lg:sticky lg:top-24 lg:block">
        <h2 id="resumo-titulo" className="mb-5 font-display text-lg font-semibold">
          Resumo do pedido
        </h2>
        {resumo}
      </aside>
    </div>
  );
}
