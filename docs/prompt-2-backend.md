# Prompt 2 – Backend (Supabase + Mercado Pago)

O front-end da loja de celulares já existe (Next.js App Router + TypeScript + Tailwind, com dados de exemplo). Agora ligue tudo a um backend real com: catálogo e estoque no Supabase, pagamento pelo Checkout Pro do Mercado Pago, compra sem conta de cliente, e confirmação e status do pedido por e-mail e WhatsApp. Hospedagem: Vercel. Explique cada passo de configuração que eu precisar fazer manualmente (painel do Supabase, Mercado Pago, Vercel).

## 1. Banco de dados (Supabase / Postgres)
Crie as migrations SQL com estas tabelas:

- **products**: id, slug, nome, marca, categoria (celular/acessorio), condicao (novo/seminovo), descricao, ficha_tecnica (jsonb), detalhes_seminovo (jsonb: saude_bateria, estado, acompanha), destaque (bool), ativo (bool), created_at
- **product_variants**: id, product_id, cor, armazenamento, preco (numeric), preco_antigo, preco_pix, estoque (int, check >= 0), estoque_reservado (int, default 0), sku
- **product_images**: id, product_id, url, ordem
- **orders**: id (uuid), codigo (curto e legível, ex.: PED-4F7K2), token_acompanhamento (uuid aleatório), nome, email, whatsapp, cpf, tipo_entrega (retirada/entrega), endereco (jsonb), subtotal, frete, total, status, mp_preference_id, mp_payment_id, reserva_expira_em, created_at
- **order_items**: id, order_id, variant_id, nome_snapshot, preco_unitario, quantidade
- **order_status_history**: id, order_id, status, observacao, created_at
- **admins**: user_id (referência a auth.users)

Status do pedido: aguardando_pagamento, pago, separando, enviado, pronto_retirada, entregue, cancelado, expirado.

## 2. Segurança (obrigatório)
- Ativar RLS em todas as tabelas
- Público (anon) pode só LER products, product_variants e product_images onde ativo = true. Não pode ler nada de orders
- Somente usuários que estão em admins podem inserir/editar/excluir produtos e ver/editar pedidos
- Toda escrita de pedido acontece no servidor com a service_role key, nunca no navegador
- A service_role key, o access token do Mercado Pago e as chaves de e-mail ficam apenas em variáveis de ambiente do servidor
- O preço cobrado SEMPRE vem do banco. Ignorar qualquer preço enviado pelo navegador
- Validar todos os dados do checkout com Zod (e-mail, WhatsApp, CEP, quantidades)
- Rate limit simples na rota de criar pedido

## 3. Estoque
- O site mostra disponível = estoque - estoque_reservado
- Ao criar o pedido, reservar as unidades numa função SQL (RPC) com transação e SELECT ... FOR UPDATE, para dois clientes não comprarem a última unidade ao mesmo tempo. Se não houver estoque, retornar erro claro ("Este item acabou de esgotar")
- Reserva vale 30 minutos (reserva_expira_em)
- Pagamento aprovado: baixar do estoque e do estoque_reservado
- Pagamento recusado/cancelado ou reserva expirada: devolver a reserva
- Criar um job com pg_cron a cada 5 minutos que expira pedidos vencidos e libera a reserva

## 4. Fluxo de pagamento (Checkout Pro)
1. Rota POST /api/checkout: valida dados, recalcula o total pelo banco, cria o pedido e a reserva, cria a preferência no Mercado Pago com:
   - items com os preços do banco
   - external_reference = id do pedido
   - back_urls para /pedido/sucesso, /pedido/pendente e /pedido/falha
   - auto_return = approved
   - notification_url = /api/webhooks/mercadopago
   - expiração da preferência alinhada com os 30 minutos da reserva
   Retorna o init_point e o front redireciona o cliente
2. Rota POST /api/webhooks/mercadopago:
   - Validar a assinatura (header x-signature com o segredo do webhook)
   - Nunca confiar no corpo: buscar o pagamento na API do Mercado Pago pelo id recebido
   - Atualizar o pedido conforme o status (approved, pending, rejected, cancelled, refunded)
   - Ser idempotente: se o mesmo aviso chegar duas vezes, não baixar o estoque duas vezes
   - Registrar cada mudança em order_status_history
3. As páginas de retorno só mostram mensagens. Quem confirma o pagamento é o webhook

Usar o SDK oficial do Mercado Pago para Node. Deixar tudo funcionando primeiro com as credenciais de TESTE e explicar como trocar para produção.

## 5. Notificações
- **E-mail** com Resend (plano gratuito) e templates simples e sóbrios, sem emojis:
  - Pedido recebido (aguardando pagamento)
  - Pagamento aprovado (com itens, total e link de acompanhamento)
  - Mudança de status (separando, enviado/pronto para retirada, entregue)
- **WhatsApp**, versão simples para começar:
  - Quando um pedido for pago, enviar e-mail para a loja com um link wa.me já com a mensagem pronta para o cliente
  - No painel admin, cada pedido tem um botão "Avisar cliente no WhatsApp" que abre o wa.me com o texto do status atual
  - Deixar a estrutura pronta (uma função sendWhatsApp isolada) para trocar depois pela API oficial do WhatsApp Cloud, se a loja quiser automatizar
- Link de acompanhamento: /pedido/[codigo]?t=[token_acompanhamento]. A página só mostra o pedido se o token bater, e exibe só o necessário (sem CPF, endereço completo apenas parcial)

## 6. Painel administrativo (/admin)
- Login com Supabase Auth (e-mail e senha), apenas para quem está na tabela admins
- Produtos: listar, buscar, criar, editar, ativar/desativar, duplicar
- Variações: cor, armazenamento, preço, preço Pix, estoque, editáveis direto na tabela
- Upload de fotos para o Supabase Storage, comprimindo e convertendo para WebP no navegador antes de enviar (máx. ~200 KB)
- Pedidos: lista com filtro por status, detalhe do pedido, botões para avançar o status (cada mudança dispara o e-mail e grava no histórico)
- Painel inicial com: pedidos de hoje, aguardando pagamento, produtos com estoque baixo (menor ou igual a 2), produtos esgotados
- Layout responsivo para usar pelo celular

## 7. Entrega
- Opção "Retirar na loja" (frete zero)
- Opção "Entrega local" com tabela simples de taxa por bairro/cidade, editável no admin
- Deixar o cálculo de frete isolado numa função para eu poder plugar o Melhor Envio no futuro

## 8. Entregáveis
- Migrations SQL, políticas RLS, função de reserva de estoque e job de pg_cron
- Arquivo .env.example com todas as variáveis (SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, MP_ACCESS_TOKEN, MP_WEBHOOK_SECRET, RESEND_API_KEY, LOJA_EMAIL, LOJA_WHATSAPP, SITE_URL)
- Script de seed com uns 10 produtos de exemplo
- README em português com o passo a passo: criar projeto no Supabase, rodar migrations, criar o primeiro admin, criar a aplicação no Mercado Pago, configurar o webhook, testar com cartão de teste e Pix de teste, publicar na Vercel
- Lista de testes que eu devo fazer antes de entregar ao cliente (compra aprovada, recusada, Pix expirado, dois clientes na última unidade, webhook duplicado)
