import type { Metadata } from "next";
import { TextPage } from "@/components/layout/TextPage";
import { SITE } from "@/lib/site";

export const metadata: Metadata = { title: "Trocas e garantia" };

// MODELO: confirme prazos e condições com a loja antes de publicar.
export default function TrocasPage() {
  return (
    <TextPage titulo="Trocas e garantia" atualizado="06/11/2026">
      <h2>Direito de arrependimento</h2>
      <p>
        Em compras feitas pelo site, você pode desistir em até <strong>7 dias corridos</strong> após o recebimento, conforme
        o Código de Defesa do Consumidor (art. 49). O produto deve estar sem sinais de uso, com todos os acessórios e na
        embalagem original. O valor é devolvido pelo mesmo meio de pagamento.
      </p>

      <h2>Garantia de aparelhos novos</h2>
      <p>
        Aparelhos novos têm a <strong>garantia do fabricante</strong> (normalmente 1 ano), válida com a nota fiscal. Podemos
        ajudar a encaminhar o aparelho para a assistência autorizada.
      </p>

      <h2>Garantia de seminovos</h2>
      <p>
        Seminovos têm <strong>90 dias de garantia da loja</strong> contra defeitos de funcionamento. A garantia não cobre
        quedas, contato com líquidos, tela quebrada após a compra ou abertura do aparelho por terceiros.
      </p>

      <h2>Como solicitar</h2>
      <ul>
        <li>
          Chame no WhatsApp {SITE.whatsappExibicao} com o número do pedido e uma descrição do problema.
        </li>
        <li>Se preferir, traga o aparelho na loja: {SITE.endereco}.</li>
        <li>Analisamos em até 3 dias úteis e combinamos a troca, o reparo ou a devolução.</li>
      </ul>
    </TextPage>
  );
}
