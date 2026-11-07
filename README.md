# Loja de celulares

Loja virtual de celulares novos e seminovos e acessórios.
**Next.js (App Router) + TypeScript + Tailwind**, com **Supabase** (catálogo, estoque, pedidos, painel), **Mercado Pago Checkout Pro** (pagamento), **Resend** (e-mails) e hospedagem na **Vercel**.

Sem as variáveis do Supabase o site funciona em **modo demonstração**, com os produtos de exemplo de `src/lib/data/products.ts`.

```bash
npm install
npm run dev        # http://localhost:3000
```

---

## Como funciona

```
Cliente ── /checkout ──▶ POST /api/checkout
                          ├─ valida os dados (Zod) e aplica rate limit
                          ├─ calcula o frete (tabela delivery_zones)
                          ├─ criar_pedido(): reserva o estoque por 30 min (SELECT ... FOR UPDATE)
                          │                   e calcula o total com os preços DO BANCO
                          ├─ cria a preferência no Mercado Pago (expira junto com a reserva)
                          └─ e-mail "pedido recebido" ──▶ redireciona para o Mercado Pago

Mercado Pago ── POST /api/webhooks/mercadopago
                          ├─ valida a assinatura (x-signature)
                          ├─ busca o pagamento na API do Mercado Pago (não confia no corpo)
                          ├─ aprovado  → confirmar_pagamento(): baixa o estoque uma única vez
                          ├─ recusado  → liberar_reserva()
                          └─ estornado → estornar_pedido(): devolve ao estoque

pg_cron (a cada 5 min) → expirar_reservas(): libera reservas vencidas
```

- O site mostra **disponível = estoque − estoque_reservado**.
- O preço cobrado sempre vem do banco. O navegador só envia variação e quantidade.
- O cliente escolhe **Pix** (preço Pix) ou **cartão/boleto** (preço cheio, até 10x) antes de ir ao Mercado Pago.
- As páginas `/pedido/sucesso`, `/pendente` e `/falha` só mostram mensagens. Quem confirma o pagamento é o webhook.
- O acompanhamento (`/pedido/PED-XXXXX?t=token`) só abre com o token do e-mail e não mostra CPF nem endereço completo.

---

## Passo a passo de configuração

Faça na ordem. Use primeiro as **credenciais de teste** do Mercado Pago.

### 1. Supabase (banco de dados)

1. Crie uma conta em [supabase.com](https://supabase.com) e um **New project** (região **South America (São Paulo)**). Guarde a senha do banco.
2. Vá em **SQL Editor > New query**. Para cada arquivo abaixo, **nesta ordem**: abra o arquivo, copie tudo, cole numa query nova e clique **Run**. Espere o "Success" antes de passar para o próximo.

   | Ordem | Arquivo em `supabase/migrations/` | O que faz |
   | --- | --- | --- |
   | 1 | `20261107000001_schema.sql` | Tabelas do catálogo, estoque, pedidos, entrega e admins |
   | 2 | `20261107000002_rls.sql` | RLS, policies e bucket de fotos |
   | 3 | `20261107000003_estoque.sql` | Funções de reserva e baixa de estoque, job do pg_cron |
   | 4 | `20261107000004_taxas_entrega.sql` | Taxas de entrega iniciais (Ilhéus e região) |
   | 5 | `20261107000005_produtos_exemplo.sql` | **Opcional:** 21 produtos de exemplo. Pule se for cadastrar os reais no /admin |

   Se o arquivo 3 reclamar do `pg_cron`, ative em **Database > Extensions > pg_cron** e rode o 3 de novo (pode rodar mais de uma vez).
3. Confira que o job existe: rode `select jobname, schedule from cron.job;` e veja a linha `expirar-reservas`.
4. **Bloqueie cadastros abertos:** **Authentication > Sign In / Providers > Email** e desligue **Allow new users to sign up**. Só você cria os usuários do painel.
5. **Crie o primeiro admin:**
   1. **Authentication > Users > Add user > Create new user**.
   2. Preencha e-mail e senha, deixe marcado **Auto Confirm User** e clique **Create user**.
   3. No **SQL Editor**, rode (trocando o e-mail):
      ```sql
      insert into public.admins (user_id)
      select id from auth.users where email = 'seu-email@exemplo.com';
      ```
      Deve aparecer "Success" com 1 linha afetada. Se for 0, o e-mail está diferente do cadastrado.
   4. Confira: `select u.email from public.admins a join auth.users u on u.id = a.user_id;`
6. Pegue as chaves em **Project Settings > API Keys**:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - **Publishable key** (`sb_publishable_...`) → `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - **Secret key** (`sb_secret_...`) → `SUPABASE_SECRET_KEY`. **Nunca** com `NEXT_PUBLIC_` e nunca no GitHub.

   O código que usa a chave secreta importa `server-only`: se algum componente do navegador tentar usá-la, o build falha.

### 2. Mercado Pago (pagamento)

1. Entre em [mercadopago.com.br/developers](https://www.mercadopago.com.br/developers) com a conta da loja > **Suas integrações > Criar aplicação**. Escolha **Pagamentos on-line** e **Checkout Pro**.
2. **Contas de teste:** dentro da aplicação, abra **Contas de teste** e crie duas: um **Vendedor** e um **Comprador** (país Brasil). Anote usuário e senha de cada uma.
3. Entre no painel de desenvolvedor **com a conta Vendedor de teste**, crie uma aplicação nela e copie o **Access Token** de produção dessa conta de teste (`APP_USR-...`) → `MP_ACCESS_TOKEN`. Assim todos os pagamentos são de teste.
4. **Webhook:** na aplicação (a mesma do Access Token), vá em **Webhooks > Configurar notificações**:
   - URL: `https://SEU-SITE.vercel.app/api/webhooks/mercadopago` (modo de teste e de produção)
   - Eventos: marque **Pagamentos**
   - Salve e copie a **assinatura secreta** → `MP_WEBHOOK_SECRET`
   - O webhook precisa de um endereço público, então **teste o pagamento no site publicado na Vercel**, não no `localhost`.
5. **Parcelamento sem juros:** o site oferece até 10x. Para o cliente não pagar juros, configure em **Seu negócio > Custos > Parcelamento sem juros** na conta do Mercado Pago (a loja assume a taxa).

### 3. Resend (e-mails)

1. Crie uma conta em [resend.com](https://resend.com) e uma **API Key** → `RESEND_API_KEY`.
2. Para enviar para qualquer cliente, verifique o domínio da loja em **Domains** e use `EMAIL_REMETENTE="Nome da Loja <pedidos@seudominio.com.br>"`.
   Sem domínio verificado, use `EMAIL_REMETENTE="Loja <onboarding@resend.dev>"`: o Resend só entrega para o e-mail da sua própria conta (bom para testar).
3. `LOJA_EMAIL` recebe o aviso de cada pedido pago, com um botão que abre o WhatsApp do cliente com a mensagem pronta.

### 4. Vercel

1. No projeto da Vercel: **Settings > Environment Variables**. Cadastre todas as variáveis do `.env.example` (Production e Preview).
2. **Deployments > ⋯ > Redeploy** para valerem.
3. Abra `https://SEU-SITE/admin` e entre com o usuário admin.

Para rodar no computador com o banco: copie `.env.example` para `.env.local` e preencha.

### 5. Testar com cartão e Pix de teste

1. Abra o site publicado **numa janela anônima**, adicione um produto e finalize escolhendo **Cartão ou boleto**.
2. No Mercado Pago, entre com a **conta Comprador de teste** e pague com um cartão de teste, por exemplo:
   - Mastercard `5031 4332 1540 6351`, CVV `123`, validade `11/30`, CPF `12345678909`
   - O **nome do titular** define o resultado: `APRO` aprovado, `OTHE` recusado, `CONT` pendente.
3. **Pix de teste:** escolha Pix no checkout. O Mercado Pago gera o QR Code, mas no ambiente de teste ele não pode ser pago de verdade. Use para testar o fluxo **pendente → expirado** (a reserva cai em 30 min). Para ver um Pix aprovado de ponta a ponta, faça uma compra real de valor baixo depois de passar para produção.
4. Confira no `/admin` o pedido mudando de status, o estoque baixando e os e-mails chegando.

A lista completa de testes antes da entrega está em [TESTES.md](TESTES.md).

### 6. Passar para produção

1. No painel do Mercado Pago **da conta real da loja**, ative as credenciais de produção (pede dados do negócio) e copie o **Access Token** de produção.
2. Na Vercel, troque `MP_ACCESS_TOKEN` pelo de produção e `MP_WEBHOOK_SECRET` pela assinatura secreta da aplicação real (configure o webhook nela também).
3. Troque os dados provisórios em `src/lib/site.ts` (nome, endereço, CNPJ) e `LOJA_WHATSAPP`.
4. Apague os produtos de exemplo no `/admin` (ou desative) e cadastre os reais com fotos.
5. Crie `NEXT_PUBLIC_LOJA_EM_TESTES=false` para liberar o Google e remover os avisos de teste.
6. Redeploy e faça uma compra real de valor baixo para confirmar.

---

## Painel administrativo (`/admin`)

- **Painel:** pedidos de hoje, aguardando pagamento, para separar, estoque baixo (≤ 2) e esgotados.
- **Pedidos:** filtro por status, detalhe, botões para avançar o status (cada mudança grava no histórico e envia e-mail ao cliente), "Avisar cliente no WhatsApp" e cancelamento (devolve ao estoque).
- **Produtos:** buscar, criar, editar, ativar/desativar, duplicar. Variações (cor, armazenamento, preços, estoque) editáveis direto na tabela. Fotos comprimidas para WebP (até ~200 KB) no navegador antes do envio.
- **Entrega:** taxa por cidade ou bairro.

## Onde fica cada coisa

| O quê | Arquivo |
| --- | --- |
| Nome, endereço, horário, aviso do topo | `src/lib/site.ts` |
| Leitura do catálogo | `src/lib/catalog.ts` |
| Frete (trocar por Melhor Envio no futuro) | `src/lib/frete.ts` |
| Criação do pedido | `src/app/api/checkout/route.ts` |
| Webhook do Mercado Pago | `src/app/api/webhooks/mercadopago/route.ts` |
| E-mails | `src/lib/notificacoes/email.ts` |
| WhatsApp (`sendWhatsApp`, pronto para a API oficial) | `src/lib/notificacoes/whatsapp.ts` |
| Tabelas, RLS, funções de estoque, pg_cron | `supabase/migrations/` |
| Produtos de exemplo / gerar o seed | `src/lib/data/products.ts`, `npm run seed:gerar` |
| Imagens ilustrativas | `npm run imagens` |

## Modo de testes e lançamento

Enquanto `NEXT_PUBLIC_LOJA_EM_TESTES` não for `false`, o site fica fora do Google (`noindex` e `robots.txt`) e o checkout mostra um aviso de testes.

## Limitações conhecidas

- O rate limit da rota de pedido é em memória (por instância da Vercel). Barra abuso básico; para algo rígido, use Upstash/Redis.
- WhatsApp automático depende da API oficial (WhatsApp Cloud); hoje a loja envia pelo link wa.me pronto.
