# Prompt 1 – Parte estética (front-end)

Crie o front-end de uma loja virtual de celulares em português do Brasil. A loja vende smartphones novos e seminovos (iPhone, Samsung, Motorola, Xiaomi etc.) e acessórios. Nome provisório: [NOME DA LOJA]. Use dados de exemplo por enquanto: o backend será ligado depois, então deixe os dados vindo de um único arquivo/serviço fácil de trocar.

## Stack
- Next.js (App Router) + TypeScript + Tailwind CSS
- Mobile-first: a maioria dos clientes vai comprar pelo celular
- Imagens com next/image, em WebP, com lazy loading

## Identidade visual
- Tema escuro premium: fundo quase preto (#0B0B0D), cards em cinza grafite (#16161A) com borda sutil (#26262C)
- Cor de destaque: laranja vibrante (#FF6A00) para botões, preços, selos e detalhes; usar com moderação
- Seções alternadas: algumas com fundo claro (#F5F5F7) para dar respiro, como no meio de uma página escura
- Tipografia: títulos em fonte geométrica forte (ex.: Space Grotesk ou Sora), texto em Inter
- Fotos de produto sobre pedestal/plataforma com brilho laranja suave atrás (efeito de luz/glow), no estilo de vitrine de loja de tecnologia
- Ícones de linha simples (Lucide). Sem emojis em nenhum lugar do site
- Microanimações discretas: hover nos cards (leve elevação e brilho na borda), transições de 150 a 250 ms, nada exagerado
- Respeitar prefers-reduced-motion

## Páginas e seções

### Home
1. Barra superior fina laranja com aviso (ex.: "Entrega em Ilhéus e região | Pague com Pix")
2. Header fixo: logo, menu (Início, Celulares, Acessórios, Ofertas, Contato), busca, ícone de carrinho com contador
3. Hero com carrossel: título grande em duas linhas (segunda linha em laranja), subtítulo, botão "Comprar agora" e foto do celular em destaque
4. Faixa de benefícios com ícones: Garantia, Pagamento seguro, Pix com desconto, Atendimento no WhatsApp
5. Comprar por marca: chips/cards com o nome de cada marca (sem usar logos oficiais)
6. Mais vendidos: grade de cards de produto
7. Banner de oferta com contador regressivo (dias, horas, min, seg)
8. Seminovos: grade separada com selo "Seminovo" e indicação de estado (ex.: "Bateria 89%")
9. Depoimentos de clientes (deixar placeholders marcados como EXEMPLO, para trocar por avaliações reais)
10. Rodapé: contato, WhatsApp, endereço, links (Política de privacidade, Trocas e garantia), formas de pagamento

### Card de produto
- Foto, nome, armazenamento e cor, preço em R$ (formato 1.299,00), preço antigo riscado se houver desconto, valor no Pix e parcelamento ("ou 10x de R$ 129,90")
- Selos: "Novo", "Seminovo", "-15%", "Últimas unidades" (estoque menor ou igual a 2)
- Produto sem estoque: foto em tons de cinza, selo "Esgotado", botão desabilitado com o texto "Avise-me no WhatsApp"
- Botão "Adicionar ao carrinho"

### Catálogo (/celulares)
- Filtros: marca, armazenamento, condição (novo/seminovo), faixa de preço, "só disponíveis"
- Ordenar por: mais vendidos, menor preço, maior preço, lançamentos
- No celular, os filtros abrem numa gaveta lateral

### Página do produto
- Galeria com miniaturas
- Seleção de variações: cor (bolinhas) e armazenamento (botões); variação esgotada aparece riscada e não clicável
- Preço, valor no Pix, parcelamento, quantidade disponível ("Restam 2")
- Ficha técnica em tabela (tela, processador, câmera, bateria)
- Para seminovos: estado do aparelho, saúde da bateria, o que acompanha, garantia da loja
- Botão "Comprar" grande e botão secundário "Tirar dúvida no WhatsApp"

### Carrinho
- Lista de itens com foto, variação, quantidade (+/-), remover
- Resumo: subtotal, entrega, total
- O carrinho fica salvo no navegador (localStorage, com try/catch)

### Checkout (sem login, em uma página só)
- Etapas visuais: Dados > Entrega > Pagamento
- Campos: nome completo, WhatsApp (com máscara), e-mail, CPF (opcional, com máscara)
- Entrega: opção "Retirar na loja" ou "Entrega"; se entrega, CEP (preenche endereço automático via ViaCEP), rua, número, complemento, bairro, cidade
- Resumo do pedido ao lado (no celular, recolhível no topo)
- Botão "Ir para pagamento", com texto dizendo que o pagamento é feito no ambiente seguro do Mercado Pago (Pix, cartão ou boleto)

### Páginas de retorno
- /pedido/sucesso: check animado, número do pedido, "Você vai receber a confirmação por e-mail e WhatsApp", botões "Acompanhar pedido" e "Continuar comprando"
- /pedido/pendente: para Pix/boleto aguardando pagamento
- /pedido/falha: pagamento recusado, com botão para tentar de novo

### Acompanhar pedido (/pedido/[codigo])
- Linha do tempo vertical: Pedido recebido > Pagamento aprovado > Separando > Saiu para entrega (ou Pronto para retirada) > Entregue
- Etapas concluídas com check laranja e data/hora
- Botão "Falar com a loja no WhatsApp" já com o número do pedido na mensagem

### Outras
- Política de privacidade (LGPD) e Trocas e garantia: páginas de texto simples
- Botão flutuante de WhatsApp no canto inferior direito em todas as páginas

## Qualidade
- Acessibilidade: contraste AA, foco visível, botões com aria-label, alt nas imagens
- Estados de carregamento (skeleton) e de erro
- Componentes reutilizáveis (ProductCard, PriceTag, Badge, VariantSelector, OrderTimeline)
- Não use marcas registradas de outras lojas nem textos copiados das referências
