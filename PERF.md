# Registro de desempenho

Medições com Lighthouse 12, celular simulado, em `next start` local, 3 repetições por página.
Leia antes de tentar uma otimização: as que já falharam ficam aqui para não serem repetidas.

## Linha de base (07/11/2026, commit cb8ec4a)

| Página | Nota | LCP | TBT | CLS |
|---|---|---|---|---|
| `/` | 93-94 | 3,0-3,1 s | 66-105 ms | 0 |
| `/produto/galaxy-a55` | 92-93 | 3,2-3,3 s | 47-64 ms | 0 |
| `/celulares` | 84-86 | 4,2-4,3 s | 39-140 ms | 0 |

O que pesa no LCP:
- Fase "render delay", que é a espera até o navegador desenhar: 1,2 s na home, 2,3 s em `/celulares` e 2,9 s no produto.
- Download da imagem: pouco relevante (5 a 17 KB).
- JS: 197 KB em 12 arquivos, igual em todas as páginas.

## Tentativas

| Ideia | Antes → Depois | Resultado | Por quê |
|---|---|---|---|
| `fetchPriority="high"` nas fotos prioritárias dos cards | `/celulares` LCP 4,2 s → 4,3 s | desfeita | Dentro da variação. O gargalo é a espera até desenhar, não o download da foto. |
| Separar layout da loja e do painel (grupo `(loja)`, sem `SomenteNaLoja`) | JS 197 KB → 202 KB · `/` LCP 3,0 s → 3,2 s · `/celulares` 4,2 s → 4,2 s | desfeita | Dentro da variação. O cabeçalho continua sendo de cliente, e o maior peso é o próprio React. |
| Dividir o carrossel em parte de servidor e parte de cliente | não testada | descartada | Os dados mostram que o código da loja é pequeno e o carrossel quase não pesa. Não há o que ganhar. |

## O que os dados mostram

- **No laboratório sem limitação, a loja já é rápida.** O LCP observado fica entre 0,4 e 0,6 s nas três páginas.
- **Por que a nota mostra 3 a 4 s.** O Lighthouse simula um celular lento: rede 4G lenta e processador 4x mais lento. Nessa simulação, quase todo o LCP é o tempo de executar o JavaScript (renderização "atrasada").
- **De onde vem o JS.** O maior arquivo (71 KB) é o `react-dom`, base de qualquer site Next.js. O código próprio da loja é pequeno, e o Lighthouse estima só 25 KB sem uso.
- **Próximo passo útil.** Medir usuários reais, com o Vercel Speed Insights ou o CrUX quando houver tráfego, antes de mexer de novo. Sem dado de campo ruim, nova otimização é chute.
