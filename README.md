# Loja de celulares (front-end)

Loja virtual de celulares novos e seminovos e acessórios, feita em Next.js (App Router) + TypeScript + Tailwind CSS.
Por enquanto usa **dados de exemplo**; o backend (Supabase + Mercado Pago) é a próxima etapa (`docs/prompt-2-backend.md`).

## Rodar no computador

```bash
npm install
npm run dev
```

Abra http://localhost:3000.

## Onde trocar as coisas

| O quê | Arquivo |
| --- | --- |
| Nome da loja, WhatsApp, endereço, horário, aviso do topo | `src/lib/site.ts` |
| Produtos de exemplo (preços, estoque, variações, ficha técnica) | `src/lib/data/products.ts` |
| Leitura de dados (trocar pelo Supabase) | `src/lib/catalog.ts` |
| Taxa de entrega por cidade | `calcularFrete` em `src/lib/catalog.ts` |
| Depoimentos (hoje marcados como EXEMPLO) | `src/components/home/Sections.tsx` |
| Cores e fontes | `src/app/globals.css` e `src/app/layout.tsx` |
| Textos de privacidade e trocas (revisar antes de publicar) | `src/app/politica-de-privacidade`, `src/app/trocas-e-garantia` |

## Modo de testes e lançamento

Enquanto a loja estiver em testes, o site fica fora do Google (`noindex` e `robots.txt`) e o checkout mostra um aviso.
Para lançar, na Vercel vá em **Settings → Environment Variables** e crie:

| Variável | Valor | Para quê |
| --- | --- | --- |
| `NEXT_PUBLIC_LOJA_EM_TESTES` | `false` | Libera o Google e remove os avisos de teste |
| `NEXT_PUBLIC_SITE_URL` | `https://seudominio.com.br` | Só se usar domínio próprio (sem isso, usa o domínio da Vercel) |

Depois faça um novo deploy (Deployments → Redeploy).

## Imagens

As fotos atuais são ilustrações genéricas geradas por `npm run imagens` (script em `scripts/gerar-imagens.mts`).
Quando houver fotos reais, coloque os arquivos WebP em `public/produtos/<slug>/` e ajuste os caminhos.

## Páginas

- `/` home · `/celulares` · `/acessorios` · `/ofertas` · `/busca?q=`
- `/produto/[slug]` · `/carrinho` · `/checkout`
- `/pedido/sucesso` · `/pedido/pendente` · `/pedido/falha` · `/pedido/[codigo]`
- `/contato` · `/politica-de-privacidade` · `/trocas-e-garantia`

## O que é simulado nesta etapa

- O botão "Ir para pagamento" gera um número de pedido e vai para `/pedido/sucesso` (no backend ele vai criar o pedido e abrir o Mercado Pago).
- `/pedido/[codigo]` mostra um pedido de exemplo para qualquer código no formato `PED-XXXXX`.
- A busca de endereço pelo CEP (ViaCEP) já é real.
