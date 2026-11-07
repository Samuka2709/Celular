# Testes antes de entregar ao cliente

Faça no site publicado na Vercel, com as credenciais de **teste** do Mercado Pago, numa janela anônima.
Anote o código de cada pedido e confira no `/admin` e no Supabase (**Table Editor**).

## 1. Compra aprovada (cartão)
- [ ] Adicione 1 unidade de um produto com estoque 3. Finalize com **Cartão ou boleto**.
- [ ] Antes de pagar, no Supabase: `estoque_reservado` da variação = 1 e o site mostra 2 disponíveis.
- [ ] Pague com o cartão de teste e titular `APRO`.
- [ ] Voltou para `/pedido/sucesso` e o carrinho esvaziou.
- [ ] Em até 1 minuto: pedido **Pagamento aprovado** no `/admin`, `estoque` 2 e `estoque_reservado` 0.
- [ ] Chegaram o e-mail "Pagamento aprovado" (cliente) e "Novo pedido pago" (loja). O botão do e-mail da loja abre o WhatsApp do cliente com a mensagem.
- [ ] O link "Acompanhar pedido" do e-mail abre a linha do tempo. Sem o `?t=` o pedido não aparece.

## 2. Compra recusada
- [ ] Repita pagando com titular `OTHE`.
- [ ] Pedido vai para **Cancelado** com observação "Pagamento recusado" e a reserva volta (`estoque_reservado` 0).
- [ ] Em `/pedido/falha`, "Tentar de novo" leva ao checkout com o carrinho ainda salvo.

## 3. Pix expirado
- [ ] Finalize escolhendo **Pix**. O total usa o preço Pix (5% menor) e o Mercado Pago só oferece Pix.
- [ ] Não pague. O pedido fica **Aguardando pagamento** e o e-mail "Pedido recebido" chega.
- [ ] Depois de 30 a 35 minutos (o job roda a cada 5 min): pedido **Expirado** e estoque reservado devolvido.
  - Atalho: no SQL Editor, `update orders set reserva_expira_em = now() - interval '1 minute' where codigo = 'PED-XXXXX';` e `select public.expirar_reservas();`

## 4. Dois clientes na última unidade
- [ ] Deixe uma variação com estoque 1 (pelo `/admin`).
- [ ] Em duas janelas anônimas diferentes, coloque essa variação no carrinho e preencha o checkout.
- [ ] Clique "Ir para pagamento" nas duas quase ao mesmo tempo.
- [ ] Só uma vai para o Mercado Pago. A outra mostra **"Este item acabou de esgotar"** com link para revisar o carrinho.
- [ ] `estoque_reservado` = 1, nunca 2.

## 5. Webhook duplicado
- [ ] Depois de uma compra aprovada, abra no Mercado Pago **Suas integrações > Webhooks > Histórico de notificações** e **reenvie** a notificação do pagamento.
- [ ] O estoque **não** baixa de novo, o histórico do pedido não ganha outro "Pagamento aprovado" e não chega outro e-mail.

## 6. Segurança
- [ ] `https://SEU-SITE/admin` sem login redireciona para o login.
- [ ] Um usuário criado no Supabase que não está na tabela `admins` não entra no painel.
- [ ] No navegador (F12 > Rede), o checkout não envia preço. Alterar o carrinho no `localStorage` para um preço menor não muda o valor cobrado.
- [ ] `POST /api/webhooks/mercadopago` sem assinatura válida responde 401.
- [ ] Clicar "Ir para pagamento" mais de 6 vezes em 10 minutos bloqueia temporariamente.

## 7. Painel
- [ ] Criar produto, cadastrar 2 variações, enviar fotos de celular (conferir que chegam em WebP com menos de 200 KB).
- [ ] Desativar o produto: some da loja em até 1 minuto. Ativar: volta.
- [ ] Duplicar: a cópia nasce desativada e com estoque zero.
- [ ] Avançar um pedido pago: Separando → Pronto para retirada / Saiu para entrega → Entregue. Cada passo envia e-mail e grava no histórico.
- [ ] Cancelar um pedido pago devolve as unidades ao estoque.
- [ ] Mudar a taxa de Ilhéus em **Entrega** e conferir o novo valor no checkout.
- [ ] Usar o painel pelo celular.

## 8. Entrega
- [ ] CEP de Ilhéus preenche o endereço e mostra a taxa e o prazo.
- [ ] Cidade sem taxa cadastrada mostra "Ainda não entregamos nesse endereço" e não deixa continuar.
- [ ] Retirada na loja: frete grátis.
