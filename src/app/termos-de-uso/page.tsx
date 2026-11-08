import type { Metadata } from "next";
import Link from "next/link";
import { TextPage } from "@/components/layout/TextPage";
import { SITE } from "@/lib/site";

export const metadata: Metadata = { title: "Termos de uso" };

// MODELO: revise com um profissional antes de publicar.
export default function TermosPage() {
  return (
    <TextPage titulo="Termos de uso" atualizado="07/11/2026">
      <p>
        Estes termos valem para as compras feitas neste site, operado por {SITE.nome} (CNPJ {SITE.cnpj}), com endereço
        em {SITE.endereco}. Ao fazer um pedido, você concorda com eles.
      </p>

      <h2>Produtos e preços</h2>
      <ul>
        <li>As fotos são ilustrativas. Cor, armazenamento e condição (novo ou seminovo) estão descritos em cada produto.</li>
        <li>Seminovos mostram a saúde da bateria, o estado do aparelho e o que acompanha.</li>
        <li>
          Os preços e o estoque podem mudar sem aviso. Vale o valor mostrado no momento em que o pedido é finalizado.
        </li>
        <li>Se houver erro evidente de preço, avisaremos você e o pedido poderá ser cancelado com reembolso integral.</li>
      </ul>

      <h2>Pedido e pagamento</h2>
      <ul>
        <li>Os pagamentos são processados pelo Mercado Pago (Pix, cartão ou boleto). Não temos acesso aos dados do seu cartão.</li>
        <li>
          O produto fica reservado enquanto o pagamento está pendente. Se o pagamento não for concluído no prazo do Mercado
          Pago, a reserva é cancelada automaticamente.
        </li>
        <li>O pedido só é confirmado depois que o Mercado Pago aprova o pagamento.</li>
      </ul>

      <h2>Entrega e retirada</h2>
      <ul>
        <li>A taxa e o prazo de entrega aparecem no checkout, conforme a cidade e o bairro.</li>
        <li>Na retirada na loja, apresente o código do pedido e um documento com foto.</li>
        <li>Você recebe por e-mail as atualizações de cada etapa do pedido.</li>
      </ul>

      <h2>Cancelamento, trocas e garantia</h2>
      <p>
        Você pode desistir da compra em até 7 dias após o recebimento. As regras completas estão em{" "}
        <Link href="/trocas-e-garantia">Trocas e garantia</Link>.
      </p>

      <h2>Uso do site</h2>
      <ul>
        <li>É proibido tentar acessar áreas restritas, sobrecarregar o site ou fazer pedidos com dados falsos.</li>
        <li>Pedidos com indício de fraude podem ser cancelados, com o valor devolvido.</li>
      </ul>

      <h2>Privacidade</h2>
      <p>
        O uso dos seus dados está explicado na <Link href="/politica-de-privacidade">Política de privacidade</Link>.
      </p>

      <h2>Contato</h2>
      <p>
        E-mail <a href={`mailto:${SITE.email}`}>{SITE.email}</a>, WhatsApp {SITE.whatsappExibicao}, atendimento{" "}
        {SITE.horario}.
      </p>
    </TextPage>
  );
}
