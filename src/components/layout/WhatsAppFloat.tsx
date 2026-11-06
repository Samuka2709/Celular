import { MessageCircle } from "lucide-react";
import { mensagens, whatsappLink } from "@/lib/whatsapp";

export function WhatsAppFloat() {
  return (
    <a
      href={whatsappLink(mensagens.geral())}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar com a loja no WhatsApp (abre em nova aba)"
      className="fixed bottom-4 right-4 z-50 grid size-14 place-items-center rounded-full bg-whatsapp text-canvas shadow-[0_10px_24px_-8px_rgb(0_0_0/0.6)] transition-transform duration-150 ease-out hover:-translate-y-0.5 active:scale-95 sm:bottom-6 sm:right-6 pb-[env(safe-area-inset-bottom)]"
    >
      <MessageCircle className="size-7" strokeWidth={2.2} aria-hidden />
    </a>
  );
}
