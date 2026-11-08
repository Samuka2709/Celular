import type { Metadata } from "next";
import { TextPage } from "@/components/layout/TextPage";
import { SITE } from "@/lib/site";

export const metadata: Metadata = { title: "Política de privacidade" };

// MODELO: revise com um profissional antes de publicar.
export default function PrivacidadePage() {
  return (
    <TextPage titulo="Política de privacidade" atualizado="07/11/2026">
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
      <ul>
        <li>
          <strong>Dados dos pedidos:</strong> 5 anos após a compra, prazo exigido para documentos fiscais e para eventuais
          reclamações de consumo.
        </li>
        <li>
          <strong>Pedidos não pagos ou cancelados antes do pagamento:</strong> até 6 meses.
        </li>
        <li>
          <strong>Registros de acesso ao painel da loja:</strong> 1 ano.
        </li>
      </ul>
      <p>Depois desses prazos, os dados são apagados ou anonimizados.</p>

      <h2>Como protegemos</h2>
      <ul>
        <li>Conexão sempre criptografada (HTTPS).</li>
        <li>Banco de dados com regras de acesso: apenas a equipe autorizada vê os pedidos, com login e verificação em duas etapas.</li>
        <li>Cada pedido tem um link exclusivo de acompanhamento, que não deve ser compartilhado.</li>
        <li>Registro das ações feitas no painel da loja.</li>
      </ul>

      <h2>Seus direitos</h2>
      <p>
        Você pode pedir acesso, correção ou exclusão dos seus dados a qualquer momento pelo e-mail{" "}
        <a href={`mailto:${SITE.email}`}>{SITE.email}</a> ou pelo WhatsApp {SITE.whatsappExibicao}.
      </p>
      <p>
        Pela LGPD, você também pode pedir: confirmação de que tratamos seus dados, cópia deles, informação sobre com quem
        foram compartilhados e revogação de consentimento. Respondemos em até <strong>15 dias</strong>. Dados que a lei
        obriga a guardar (como os fiscais) são mantidos até o fim do prazo legal, e depois apagados.
      </p>

      <h2>Incidentes de segurança</h2>
      <p>
        Se ocorrer um incidente que possa trazer risco ou dano relevante a você, avisaremos os titulares afetados e a
        Autoridade Nacional de Proteção de Dados (ANPD), informando o que aconteceu, quais dados foram envolvidos e as
        medidas tomadas.
      </p>

      <h2>Encarregado (DPO)</h2>
      <p>
        O responsável pelo tratamento dos dados pode ser contatado pelo e-mail{" "}
        <a href={`mailto:${SITE.email}`}>{SITE.email}</a>.
      </p>
    </TextPage>
  );
}
