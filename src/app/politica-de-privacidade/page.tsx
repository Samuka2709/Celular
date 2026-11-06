import type { Metadata } from "next";
import { TextPage } from "@/components/layout/TextPage";
import { SITE } from "@/lib/site";

export const metadata: Metadata = { title: "Política de privacidade" };

// MODELO: revise com um profissional antes de publicar.
export default function PrivacidadePage() {
  return (
    <TextPage titulo="Política de privacidade" atualizado="06/11/2026">
      <p>
        Esta política explica como a {SITE.nome} (CNPJ {SITE.cnpj}) coleta, usa e protege seus dados pessoais, de acordo
        com a Lei Geral de Proteção de Dados (Lei 13.709/2018).
      </p>

      <h2>Quais dados coletamos</h2>
      <ul>
        <li>
          <strong>Dados do pedido:</strong> nome, e-mail, WhatsApp, CPF (opcional) e endereço de entrega.
        </li>
        <li>
          <strong>Dados de pagamento:</strong> são informados diretamente no Mercado Pago. Não recebemos nem armazenamos
          números de cartão.
        </li>
        <li>
          <strong>Dados de navegação:</strong> o carrinho fica salvo apenas no seu navegador.
        </li>
      </ul>

      <h2>Para que usamos</h2>
      <ul>
        <li>Processar o pedido, emitir nota fiscal e fazer a entrega.</li>
        <li>Enviar confirmações e atualizações do pedido por e-mail e WhatsApp.</li>
        <li>Prestar atendimento e cumprir obrigações legais e fiscais.</li>
      </ul>
      <p>Não vendemos nem compartilhamos seus dados para fins de publicidade.</p>

      <h2>Com quem compartilhamos</h2>
      <p>
        Apenas com os parceiros necessários para concluir a compra: processador de pagamento (Mercado Pago), serviço de
        e-mail e, quando houver, o responsável pela entrega.
      </p>

      <h2>Por quanto tempo guardamos</h2>
      <p>Pelo tempo necessário para cumprir o pedido e as obrigações legais, como a guarda de documentos fiscais.</p>

      <h2>Seus direitos</h2>
      <p>
        Você pode pedir acesso, correção ou exclusão dos seus dados a qualquer momento pelo e-mail{" "}
        <a href={`mailto:${SITE.email}`}>{SITE.email}</a> ou pelo WhatsApp {SITE.whatsappExibicao}.
      </p>
    </TextPage>
  );
}
