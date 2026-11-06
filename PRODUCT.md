# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Next.js (App Router) + TypeScript + Tailwind CSS, hospedagem na Vercel. Backend planejado: Supabase (catálogo, estoque, pedidos) e Mercado Pago Checkout Pro (ver `docs/prompt-2-backend.md`).

## Users

Clientes de Ilhéus e região que querem comprar um smartphone (novo ou seminovo) ou acessório, na maioria das vezes pelo próprio celular. Compram sem criar conta e esperam tirar dúvidas pelo WhatsApp antes e depois da compra.

## Product Purpose

Loja virtual de celulares novos e seminovos (iPhone, Samsung, Motorola, Xiaomi) e acessórios. Sucesso = cliente encontra o aparelho, entende preço/condição/estoque sem precisar perguntar, paga (Pix, cartão ou boleto via Mercado Pago) e acompanha o pedido até a entrega ou retirada.

## Positioning

Loja física local com venda online: o cliente pode retirar na loja ou receber rápido na cidade, compra seminovos revisados com saúde da bateria informada e garantia da loja, paga menos no Pix e fala com uma pessoa de verdade no WhatsApp.

## Operating Context

- Compra majoritariamente mobile, sem login, checkout em uma página.
- Entrega local (Ilhéus e região) ou retirada na loja.
- Estoque baixo por variação (muitas vezes 1 ou 2 unidades); esgotado precisa ficar claro.
- Confirmação e acompanhamento do pedido por e-mail e WhatsApp.

## Capabilities and Constraints

- Variações por cor e armazenamento, cada uma com preço, preço Pix e estoque próprios.
- Seminovos exibem estado do aparelho, saúde da bateria, o que acompanha e garantia.
- Carrinho salvo no navegador (localStorage).
- Dados de exemplo vêm de um único serviço (`src/lib/catalog.ts`) para trocar pelo Supabase depois.
- Sem emojis em nenhum lugar do site. Sem logos oficiais de marcas de celular.

## Brand Commitments

- Nome da loja: **ainda não definido**. Usar nome provisório num único arquivo de configuração (`src/lib/site.ts`).
- Identidade visual definida pelo cliente em `docs/prompt-1-estetica.md` (tema escuro, laranja #FF6A00, Space Grotesk/Sora + Inter).

## Evidence on Hand

- Sem fotos reais de produto: imagens ilustrativas geradas (genéricas) até a loja fornecer fotos.
- Sem depoimentos reais: placeholders marcados como EXEMPLO.
- Sem número de WhatsApp, endereço ou CNPJ reais: placeholders a substituir.

## Product Principles

1. Preço, condição e disponibilidade visíveis sem clique extra.
2. O WhatsApp é parte do atendimento, não um enfeite: sempre a um toque.
3. Seminovo com transparência: dados de bateria e estado antes do preço chamar atenção.
4. Mobile primeiro; desktop é a versão ampliada.

## Accessibility & Inclusion

Contraste WCAG AA, foco visível, rótulos acessíveis em botões de ícone, alt em imagens, respeito a prefers-reduced-motion.
