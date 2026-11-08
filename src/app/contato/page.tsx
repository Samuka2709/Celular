import { Clock, Mail, MapPin, MessageCircle } from "lucide-react";
import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { SITE } from "@/lib/site";
import { botao, cn, container } from "@/lib/ui";
import { mensagens, whatsappLink } from "@/lib/whatsapp";

export const metadata: Metadata = { title: "Contato", description: `Fale com a ${SITE.nome} pelo WhatsApp, e-mail ou na loja.` };

export default function ContatoPage() {
  const itens = [
    { icone: MapPin, titulo: "Loja", texto: SITE.endereco },
    { icone: Clock, titulo: "Horário", texto: SITE.horario },
    { icone: Mail, titulo: "E-mail", texto: SITE.email, href: `mailto:${SITE.email}` },
  ];
  return (
    <div className={cn(container, "max-w-5xl")}>
      <PageHeader
        titulo="Contato"
        descricao="O jeito mais rápido de falar com a gente é pelo WhatsApp. Respondemos no horário de atendimento."
        migalhas={[{ href: "/", label: "Início" }, { label: "Contato" }]}
      />
      <div className="grid gap-6 md:grid-cols-[1.2fr_1fr] [&>*]:min-w-0 [overflow-wrap:anywhere]">
        <div className="relative overflow-hidden rounded-3xl border border-line bg-card p-6 sm:p-10">
          <div aria-hidden className="absolute -right-20 -top-20 size-72 rounded-full bg-[radial-gradient(closest-side,rgb(37_211_102/0.18),transparent)]" />
          <MessageCircle className="relative size-10 text-whatsapp" strokeWidth={1.5} aria-hidden />
          <h2 className="relative mt-6 font-display text-3xl font-semibold tracking-tight">WhatsApp</h2>
          <p className="relative mt-2 font-display text-xl tabular-nums text-muted">{SITE.whatsappExibicao}</p>
          <p className="relative mt-4 max-w-sm text-muted">
            Tire dúvidas sobre aparelhos, peça fotos e vídeos de seminovos ou acompanhe seu pedido.
          </p>
          <a
            href={whatsappLink(mensagens.geral())}
            target="_blank"
            rel="noopener noreferrer"
            className={botao("primario", "lg", "relative mt-8")}
          >
            Chamar no WhatsApp
          </a>
        </div>
        <ul className="divide-y divide-line rounded-3xl border border-line bg-card">
          {itens.map(({ icone: Icone, titulo, texto, href }) => (
            <li key={titulo} className="flex gap-4 p-6">
              <Icone className="mt-0.5 size-5 shrink-0 text-accent" aria-hidden />
              <div>
                <h2 className="font-display font-semibold">{titulo}</h2>
                {href ? (
                  <a href={href} className="mt-1 block text-muted underline-offset-4 hover:text-ink hover:underline">
                    {texto}
                  </a>
                ) : (
                  <p className="mt-1 text-muted">{texto}</p>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
