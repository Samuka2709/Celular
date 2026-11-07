-- 5. PRODUTOS DE EXEMPLO (opcional). Gerado por scripts/gerar-seed.mts.
-- Pule este arquivo se for cadastrar os produtos reais direto no /admin.
-- Pode rodar de novo: produtos com o mesmo slug são substituídos.
-- As fotos apontam para as imagens ilustrativas em public/produtos do site.

delete from public.products where slug in ('iphone-15', 'iphone-16-pro', 'galaxy-s24', 'galaxy-a55', 'galaxy-a15', 'moto-g84', 'motorola-edge-50-fusion', 'redmi-note-13', 'poco-x6-pro', 'xiaomi-14t', 'iphone-13-seminovo', 'iphone-12-seminovo', 'galaxy-s23-seminovo', 'iphone-11-seminovo', 'moto-g54-seminovo', 'capa-silicone', 'carregador-turbo-25w', 'fone-bluetooth', 'cabo-usb-c', 'pelicula-vidro', 'power-bank-10000');

with p as (insert into public.products (slug, nome, marca, categoria, condicao, descricao, ficha_tecnica, detalhes_seminovo, destaque, ativo, vendas, modelo_visual, created_at)
  values ('iphone-15', 'iPhone 15', 'Apple', 'celular', 'novo', 'Tela Super Retina de 6,1 polegadas, câmera principal de 48 MP e conector USB-C. Aparelho novo, lacrado, com nota fiscal e garantia de 1 ano do fabricante.', '{"Tela":"6,1\" OLED, 60 Hz","Processador":"A16 Bionic","Câmera traseira":"48 MP + 12 MP ultra-angular","Câmera frontal":"12 MP","Bateria":"Até 20 h de vídeo","Conector":"USB-C"}'::jsonb, null, true, true, 240, 'lentes-quadrado', '2026-03-10')
  returning id),
v as (insert into public.product_variants (product_id, cor, cor_hex, armazenamento, preco, preco_antigo, preco_pix, estoque, sku, ordem)
  select p.id, x.* from p, (values
    ('Preto', '#26262a', '128 GB', 4999, 5499, 4749.05, 6, 'APP-001-1', 0),
    ('Preto', '#26262a', '256 GB', 5699, null::numeric, 5414.05, 3, 'APP-001-2', 1),
    ('Azul', '#b9cbd9', '128 GB', 4999, 5499, 4749.05, 4, 'APP-001-3', 2),
    ('Azul', '#b9cbd9', '256 GB', 5699, null::numeric, 5414.05, 0, 'APP-001-4', 3),
    ('Rosa', '#efd3d6', '128 GB', 4999, 5499, 4749.05, 2, 'APP-001-5', 4)
  ) as x(cor, cor_hex, armazenamento, preco, preco_antigo, preco_pix, estoque, sku, ordem) returning 1)
insert into public.product_images (product_id, url, cor, alt, ordem)
  select p.id, x.* from p, (values
    ('/produtos/iphone-15/preto-verso.webp', 'Preto', 'iPhone 15 na cor Preto, vista traseira', 0),
    ('/produtos/iphone-15/preto-frente.webp', 'Preto', 'iPhone 15 na cor Preto, vista frontal', 1),
    ('/produtos/iphone-15/preto-lateral.webp', 'Preto', 'iPhone 15 na cor Preto, vista lateral', 2),
    ('/produtos/iphone-15/azul-verso.webp', 'Azul', 'iPhone 15 na cor Azul, vista traseira', 0),
    ('/produtos/iphone-15/azul-frente.webp', 'Azul', 'iPhone 15 na cor Azul, vista frontal', 1),
    ('/produtos/iphone-15/azul-lateral.webp', 'Azul', 'iPhone 15 na cor Azul, vista lateral', 2),
    ('/produtos/iphone-15/rosa-verso.webp', 'Rosa', 'iPhone 15 na cor Rosa, vista traseira', 0),
    ('/produtos/iphone-15/rosa-frente.webp', 'Rosa', 'iPhone 15 na cor Rosa, vista frontal', 1),
    ('/produtos/iphone-15/rosa-lateral.webp', 'Rosa', 'iPhone 15 na cor Rosa, vista lateral', 2)
  ) as x(url, cor, alt, ordem);

with p as (insert into public.products (slug, nome, marca, categoria, condicao, descricao, ficha_tecnica, detalhes_seminovo, destaque, ativo, vendas, modelo_visual, created_at)
  values ('iphone-16-pro', 'iPhone 16 Pro', 'Apple', 'celular', 'novo', 'Estrutura em titânio, tela de 6,3 polegadas com taxa de atualização adaptável e sistema de câmeras com zoom óptico de 5x. Novo, lacrado, garantia de 1 ano.', '{"Tela":"6,3\" OLED, até 120 Hz","Processador":"A18 Pro","Câmera traseira":"48 MP + 48 MP ultra-angular + 12 MP tele 5x","Câmera frontal":"12 MP","Bateria":"Até 27 h de vídeo","Conector":"USB-C"}'::jsonb, null, true, true, 180, 'lentes-quadrado', '2026-09-20')
  returning id),
v as (insert into public.product_variants (product_id, cor, cor_hex, armazenamento, preco, preco_antigo, preco_pix, estoque, sku, ordem)
  select p.id, x.* from p, (values
    ('Titânio natural', '#b8b0a3', '128 GB', 7999, null::numeric, 7599.05, 3, 'APP-002-1', 0),
    ('Titânio natural', '#b8b0a3', '256 GB', 8899, null::numeric, 8454.05, 2, 'APP-002-2', 1),
    ('Titânio natural', '#b8b0a3', '512 GB', 10499, null::numeric, 9974.05, 0, 'APP-002-3', 2),
    ('Titânio preto', '#3a3a3c', '128 GB', 7999, null::numeric, 7599.05, 4, 'APP-002-4', 3),
    ('Titânio preto', '#3a3a3c', '256 GB', 8899, null::numeric, 8454.05, 1, 'APP-002-5', 4)
  ) as x(cor, cor_hex, armazenamento, preco, preco_antigo, preco_pix, estoque, sku, ordem) returning 1)
insert into public.product_images (product_id, url, cor, alt, ordem)
  select p.id, x.* from p, (values
    ('/produtos/iphone-16-pro/titanio-natural-verso.webp', 'Titânio natural', 'iPhone 16 Pro na cor Titânio natural, vista traseira', 0),
    ('/produtos/iphone-16-pro/titanio-natural-frente.webp', 'Titânio natural', 'iPhone 16 Pro na cor Titânio natural, vista frontal', 1),
    ('/produtos/iphone-16-pro/titanio-natural-lateral.webp', 'Titânio natural', 'iPhone 16 Pro na cor Titânio natural, vista lateral', 2),
    ('/produtos/iphone-16-pro/titanio-preto-verso.webp', 'Titânio preto', 'iPhone 16 Pro na cor Titânio preto, vista traseira', 0),
    ('/produtos/iphone-16-pro/titanio-preto-frente.webp', 'Titânio preto', 'iPhone 16 Pro na cor Titânio preto, vista frontal', 1),
    ('/produtos/iphone-16-pro/titanio-preto-lateral.webp', 'Titânio preto', 'iPhone 16 Pro na cor Titânio preto, vista lateral', 2)
  ) as x(url, cor, alt, ordem);

with p as (insert into public.products (slug, nome, marca, categoria, condicao, descricao, ficha_tecnica, detalhes_seminovo, destaque, ativo, vendas, modelo_visual, created_at)
  values ('galaxy-s24', 'Galaxy S24', 'Samsung', 'celular', 'novo', 'Compacto e potente: tela de 6,2 polegadas a 120 Hz, câmera de 50 MP com zoom de 3x e recursos de inteligência artificial integrados.', '{"Tela":"6,2\" AMOLED, 120 Hz","Processador":"Exynos 2400","Câmera traseira":"50 MP + 12 MP + 10 MP tele 3x","Câmera frontal":"12 MP","Bateria":"4.000 mAh, carregamento 25 W","Memória":"8 GB RAM"}'::jsonb, null, true, true, 210, 'lentes-coluna', '2026-02-01')
  returning id),
v as (insert into public.product_variants (product_id, cor, cor_hex, armazenamento, preco, preco_antigo, preco_pix, estoque, sku, ordem)
  select p.id, x.* from p, (values
    ('Preto', '#26262a', '256 GB', 4299, 4999, 4084.05, 5, 'SAM-003-1', 0),
    ('Lilás', '#cbbde0', '256 GB', 4299, 4999, 4084.05, 3, 'SAM-003-2', 1),
    ('Amarelo', '#efd67a', '256 GB', 4299, 4999, 4084.05, 0, 'SAM-003-3', 2)
  ) as x(cor, cor_hex, armazenamento, preco, preco_antigo, preco_pix, estoque, sku, ordem) returning 1)
insert into public.product_images (product_id, url, cor, alt, ordem)
  select p.id, x.* from p, (values
    ('/produtos/galaxy-s24/preto-verso.webp', 'Preto', 'Galaxy S24 na cor Preto, vista traseira', 0),
    ('/produtos/galaxy-s24/preto-frente.webp', 'Preto', 'Galaxy S24 na cor Preto, vista frontal', 1),
    ('/produtos/galaxy-s24/preto-lateral.webp', 'Preto', 'Galaxy S24 na cor Preto, vista lateral', 2),
    ('/produtos/galaxy-s24/lilas-verso.webp', 'Lilás', 'Galaxy S24 na cor Lilás, vista traseira', 0),
    ('/produtos/galaxy-s24/lilas-frente.webp', 'Lilás', 'Galaxy S24 na cor Lilás, vista frontal', 1),
    ('/produtos/galaxy-s24/lilas-lateral.webp', 'Lilás', 'Galaxy S24 na cor Lilás, vista lateral', 2),
    ('/produtos/galaxy-s24/amarelo-verso.webp', 'Amarelo', 'Galaxy S24 na cor Amarelo, vista traseira', 0),
    ('/produtos/galaxy-s24/amarelo-frente.webp', 'Amarelo', 'Galaxy S24 na cor Amarelo, vista frontal', 1),
    ('/produtos/galaxy-s24/amarelo-lateral.webp', 'Amarelo', 'Galaxy S24 na cor Amarelo, vista lateral', 2)
  ) as x(url, cor, alt, ordem);

with p as (insert into public.products (slug, nome, marca, categoria, condicao, descricao, ficha_tecnica, detalhes_seminovo, destaque, ativo, vendas, modelo_visual, created_at)
  values ('galaxy-a55', 'Galaxy A55 5G', 'Samsung', 'celular', 'novo', 'Acabamento em metal e vidro, tela Super AMOLED de 6,6 polegadas e bateria que aguenta o dia todo. Resistente à água e poeira (IP67).', '{"Tela":"6,6\" Super AMOLED, 120 Hz","Processador":"Exynos 1480","Câmera traseira":"50 MP + 12 MP + 5 MP","Câmera frontal":"32 MP","Bateria":"5.000 mAh, carregamento 25 W","Memória":"8 GB RAM"}'::jsonb, null, false, true, 300, 'lentes-coluna', '2026-04-02')
  returning id),
v as (insert into public.product_variants (product_id, cor, cor_hex, armazenamento, preco, preco_antigo, preco_pix, estoque, sku, ordem)
  select p.id, x.* from p, (values
    ('Azul-marinho', '#2c3a56', '128 GB', 2199, 2499, 2089.05, 7, 'SAM-004-1', 0),
    ('Azul-marinho', '#2c3a56', '256 GB', 2499, null::numeric, 2374.05, 4, 'SAM-004-2', 1),
    ('Lilás', '#cbbde0', '128 GB', 2199, 2499, 2089.05, 3, 'SAM-004-3', 2)
  ) as x(cor, cor_hex, armazenamento, preco, preco_antigo, preco_pix, estoque, sku, ordem) returning 1)
insert into public.product_images (product_id, url, cor, alt, ordem)
  select p.id, x.* from p, (values
    ('/produtos/galaxy-a55/azul-marinho-verso.webp', 'Azul-marinho', 'Galaxy A55 5G na cor Azul-marinho, vista traseira', 0),
    ('/produtos/galaxy-a55/azul-marinho-frente.webp', 'Azul-marinho', 'Galaxy A55 5G na cor Azul-marinho, vista frontal', 1),
    ('/produtos/galaxy-a55/azul-marinho-lateral.webp', 'Azul-marinho', 'Galaxy A55 5G na cor Azul-marinho, vista lateral', 2),
    ('/produtos/galaxy-a55/lilas-verso.webp', 'Lilás', 'Galaxy A55 5G na cor Lilás, vista traseira', 0),
    ('/produtos/galaxy-a55/lilas-frente.webp', 'Lilás', 'Galaxy A55 5G na cor Lilás, vista frontal', 1),
    ('/produtos/galaxy-a55/lilas-lateral.webp', 'Lilás', 'Galaxy A55 5G na cor Lilás, vista lateral', 2)
  ) as x(url, cor, alt, ordem);

with p as (insert into public.products (slug, nome, marca, categoria, condicao, descricao, ficha_tecnica, detalhes_seminovo, destaque, ativo, vendas, modelo_visual, created_at)
  values ('galaxy-a15', 'Galaxy A15', 'Samsung', 'celular', 'novo', 'O básico bem feito: tela grande de 6,5 polegadas, bateria de 5.000 mAh e câmera de 50 MP por um preço acessível.', '{"Tela":"6,5\" Super AMOLED, 90 Hz","Processador":"Helio G99","Câmera traseira":"50 MP + 5 MP + 2 MP","Câmera frontal":"13 MP","Bateria":"5.000 mAh, carregamento 25 W","Memória":"4 GB RAM"}'::jsonb, null, false, true, 280, 'lentes-coluna', '2025-12-15')
  returning id),
v as (insert into public.product_variants (product_id, cor, cor_hex, armazenamento, preco, preco_antigo, preco_pix, estoque, sku, ordem)
  select p.id, x.* from p, (values
    ('Azul-marinho', '#2c3a56', '128 GB', 999, null::numeric, 949.05, 2, 'SAM-005-1', 0),
    ('Azul', '#b9cbd9', '128 GB', 999, null::numeric, 949.05, 0, 'SAM-005-2', 1)
  ) as x(cor, cor_hex, armazenamento, preco, preco_antigo, preco_pix, estoque, sku, ordem) returning 1)
insert into public.product_images (product_id, url, cor, alt, ordem)
  select p.id, x.* from p, (values
    ('/produtos/galaxy-a15/azul-marinho-verso.webp', 'Azul-marinho', 'Galaxy A15 na cor Azul-marinho, vista traseira', 0),
    ('/produtos/galaxy-a15/azul-marinho-frente.webp', 'Azul-marinho', 'Galaxy A15 na cor Azul-marinho, vista frontal', 1),
    ('/produtos/galaxy-a15/azul-marinho-lateral.webp', 'Azul-marinho', 'Galaxy A15 na cor Azul-marinho, vista lateral', 2),
    ('/produtos/galaxy-a15/azul-verso.webp', 'Azul', 'Galaxy A15 na cor Azul, vista traseira', 0),
    ('/produtos/galaxy-a15/azul-frente.webp', 'Azul', 'Galaxy A15 na cor Azul, vista frontal', 1),
    ('/produtos/galaxy-a15/azul-lateral.webp', 'Azul', 'Galaxy A15 na cor Azul, vista lateral', 2)
  ) as x(url, cor, alt, ordem);

with p as (insert into public.products (slug, nome, marca, categoria, condicao, descricao, ficha_tecnica, detalhes_seminovo, destaque, ativo, vendas, modelo_visual, created_at)
  values ('moto-g84', 'Moto G84 5G', 'Motorola', 'celular', 'novo', 'Tela pOLED de 6,55 polegadas, som estéreo e 256 GB para guardar tudo. Acabamento em couro vegano.', '{"Tela":"6,55\" pOLED, 120 Hz","Processador":"Snapdragon 695","Câmera traseira":"50 MP + 8 MP","Câmera frontal":"16 MP","Bateria":"5.000 mAh, carregamento 30 W","Memória":"8 GB RAM"}'::jsonb, null, false, true, 190, 'lentes-barra', '2025-10-05')
  returning id),
v as (insert into public.product_variants (product_id, cor, cor_hex, armazenamento, preco, preco_antigo, preco_pix, estoque, sku, ordem)
  select p.id, x.* from p, (values
    ('Grafite', '#3d4046', '256 GB', 1599, 1899, 1519.05, 6, 'MOT-006-1', 0),
    ('Azul-marinho', '#2c3a56', '256 GB', 1599, 1899, 1519.05, 2, 'MOT-006-2', 1),
    ('Magenta', '#7d2a4a', '256 GB', 1599, 1899, 1519.05, 3, 'MOT-006-3', 2)
  ) as x(cor, cor_hex, armazenamento, preco, preco_antigo, preco_pix, estoque, sku, ordem) returning 1)
insert into public.product_images (product_id, url, cor, alt, ordem)
  select p.id, x.* from p, (values
    ('/produtos/moto-g84/grafite-verso.webp', 'Grafite', 'Moto G84 5G na cor Grafite, vista traseira', 0),
    ('/produtos/moto-g84/grafite-frente.webp', 'Grafite', 'Moto G84 5G na cor Grafite, vista frontal', 1),
    ('/produtos/moto-g84/grafite-lateral.webp', 'Grafite', 'Moto G84 5G na cor Grafite, vista lateral', 2),
    ('/produtos/moto-g84/azul-marinho-verso.webp', 'Azul-marinho', 'Moto G84 5G na cor Azul-marinho, vista traseira', 0),
    ('/produtos/moto-g84/azul-marinho-frente.webp', 'Azul-marinho', 'Moto G84 5G na cor Azul-marinho, vista frontal', 1),
    ('/produtos/moto-g84/azul-marinho-lateral.webp', 'Azul-marinho', 'Moto G84 5G na cor Azul-marinho, vista lateral', 2),
    ('/produtos/moto-g84/magenta-verso.webp', 'Magenta', 'Moto G84 5G na cor Magenta, vista traseira', 0),
    ('/produtos/moto-g84/magenta-frente.webp', 'Magenta', 'Moto G84 5G na cor Magenta, vista frontal', 1),
    ('/produtos/moto-g84/magenta-lateral.webp', 'Magenta', 'Moto G84 5G na cor Magenta, vista lateral', 2)
  ) as x(url, cor, alt, ordem);

with p as (insert into public.products (slug, nome, marca, categoria, condicao, descricao, ficha_tecnica, detalhes_seminovo, destaque, ativo, vendas, modelo_visual, created_at)
  values ('motorola-edge-50-fusion', 'Edge 50 Fusion', 'Motorola', 'celular', 'novo', 'Tela curva de 6,7 polegadas, câmera de 50 MP com estabilização óptica e carregamento de 68 W.', '{"Tela":"6,7\" pOLED curva, 144 Hz","Processador":"Snapdragon 7s Gen 2","Câmera traseira":"50 MP OIS + 13 MP","Câmera frontal":"32 MP","Bateria":"5.000 mAh, carregamento 68 W","Memória":"8 GB RAM"}'::jsonb, null, false, true, 120, 'lentes-barra', '2026-06-12')
  returning id),
v as (insert into public.product_variants (product_id, cor, cor_hex, armazenamento, preco, preco_antigo, preco_pix, estoque, sku, ordem)
  select p.id, x.* from p, (values
    ('Verde', '#7f9c8d', '256 GB', 2399, null::numeric, 2279.05, 4, 'MOT-007-1', 0),
    ('Azul-marinho', '#2c3a56', '256 GB', 2399, null::numeric, 2279.05, 3, 'MOT-007-2', 1)
  ) as x(cor, cor_hex, armazenamento, preco, preco_antigo, preco_pix, estoque, sku, ordem) returning 1)
insert into public.product_images (product_id, url, cor, alt, ordem)
  select p.id, x.* from p, (values
    ('/produtos/motorola-edge-50-fusion/verde-verso.webp', 'Verde', 'Edge 50 Fusion na cor Verde, vista traseira', 0),
    ('/produtos/motorola-edge-50-fusion/verde-frente.webp', 'Verde', 'Edge 50 Fusion na cor Verde, vista frontal', 1),
    ('/produtos/motorola-edge-50-fusion/verde-lateral.webp', 'Verde', 'Edge 50 Fusion na cor Verde, vista lateral', 2),
    ('/produtos/motorola-edge-50-fusion/azul-marinho-verso.webp', 'Azul-marinho', 'Edge 50 Fusion na cor Azul-marinho, vista traseira', 0),
    ('/produtos/motorola-edge-50-fusion/azul-marinho-frente.webp', 'Azul-marinho', 'Edge 50 Fusion na cor Azul-marinho, vista frontal', 1),
    ('/produtos/motorola-edge-50-fusion/azul-marinho-lateral.webp', 'Azul-marinho', 'Edge 50 Fusion na cor Azul-marinho, vista lateral', 2)
  ) as x(url, cor, alt, ordem);

with p as (insert into public.products (slug, nome, marca, categoria, condicao, descricao, ficha_tecnica, detalhes_seminovo, destaque, ativo, vendas, modelo_visual, created_at)
  values ('redmi-note-13', 'Redmi Note 13', 'Xiaomi', 'celular', 'novo', 'Tela AMOLED de 6,67 polegadas, câmera de 108 MP e muito armazenamento por um preço justo.', '{"Tela":"6,67\" AMOLED, 120 Hz","Processador":"Snapdragon 685","Câmera traseira":"108 MP + 8 MP + 2 MP","Câmera frontal":"16 MP","Bateria":"5.000 mAh, carregamento 33 W","Memória":"6 GB / 8 GB RAM"}'::jsonb, null, false, true, 260, 'lentes-circulo', '2026-01-20')
  returning id),
v as (insert into public.product_variants (product_id, cor, cor_hex, armazenamento, preco, preco_antigo, preco_pix, estoque, sku, ordem)
  select p.id, x.* from p, (values
    ('Preto', '#26262a', '128 GB', 1399, null::numeric, 1329.05, 8, 'XIA-008-1', 0),
    ('Preto', '#26262a', '256 GB', 1599, null::numeric, 1519.05, 5, 'XIA-008-2', 1),
    ('Verde-menta', '#b8d8c8', '128 GB', 1399, null::numeric, 1329.05, 4, 'XIA-008-3', 2),
    ('Azul', '#b9cbd9', '256 GB', 1599, null::numeric, 1519.05, 2, 'XIA-008-4', 3)
  ) as x(cor, cor_hex, armazenamento, preco, preco_antigo, preco_pix, estoque, sku, ordem) returning 1)
insert into public.product_images (product_id, url, cor, alt, ordem)
  select p.id, x.* from p, (values
    ('/produtos/redmi-note-13/preto-verso.webp', 'Preto', 'Redmi Note 13 na cor Preto, vista traseira', 0),
    ('/produtos/redmi-note-13/preto-frente.webp', 'Preto', 'Redmi Note 13 na cor Preto, vista frontal', 1),
    ('/produtos/redmi-note-13/preto-lateral.webp', 'Preto', 'Redmi Note 13 na cor Preto, vista lateral', 2),
    ('/produtos/redmi-note-13/verde-menta-verso.webp', 'Verde-menta', 'Redmi Note 13 na cor Verde-menta, vista traseira', 0),
    ('/produtos/redmi-note-13/verde-menta-frente.webp', 'Verde-menta', 'Redmi Note 13 na cor Verde-menta, vista frontal', 1),
    ('/produtos/redmi-note-13/verde-menta-lateral.webp', 'Verde-menta', 'Redmi Note 13 na cor Verde-menta, vista lateral', 2),
    ('/produtos/redmi-note-13/azul-verso.webp', 'Azul', 'Redmi Note 13 na cor Azul, vista traseira', 0),
    ('/produtos/redmi-note-13/azul-frente.webp', 'Azul', 'Redmi Note 13 na cor Azul, vista frontal', 1),
    ('/produtos/redmi-note-13/azul-lateral.webp', 'Azul', 'Redmi Note 13 na cor Azul, vista lateral', 2)
  ) as x(url, cor, alt, ordem);

with p as (insert into public.products (slug, nome, marca, categoria, condicao, descricao, ficha_tecnica, detalhes_seminovo, destaque, ativo, vendas, modelo_visual, created_at)
  values ('poco-x6-pro', 'Poco X6 Pro', 'Xiaomi', 'celular', 'novo', 'Desempenho de topo para jogos, tela de 6,67 polegadas a 120 Hz e carregamento de 67 W.', '{"Tela":"6,67\" AMOLED, 120 Hz","Processador":"Dimensity 8300 Ultra","Câmera traseira":"64 MP OIS + 8 MP + 2 MP","Câmera frontal":"16 MP","Bateria":"5.000 mAh, carregamento 67 W","Memória":"8 GB / 12 GB RAM"}'::jsonb, null, false, true, 150, 'lentes-barra', '2026-05-08')
  returning id),
v as (insert into public.product_variants (product_id, cor, cor_hex, armazenamento, preco, preco_antigo, preco_pix, estoque, sku, ordem)
  select p.id, x.* from p, (values
    ('Preto', '#26262a', '256 GB', 2299, 2599, 2184.05, 4, 'XIA-009-1', 0),
    ('Amarelo', '#efd67a', '256 GB', 2299, 2599, 2184.05, 2, 'XIA-009-2', 1),
    ('Preto', '#26262a', '512 GB', 2699, null::numeric, 2564.05, 0, 'XIA-009-3', 2)
  ) as x(cor, cor_hex, armazenamento, preco, preco_antigo, preco_pix, estoque, sku, ordem) returning 1)
insert into public.product_images (product_id, url, cor, alt, ordem)
  select p.id, x.* from p, (values
    ('/produtos/poco-x6-pro/preto-verso.webp', 'Preto', 'Poco X6 Pro na cor Preto, vista traseira', 0),
    ('/produtos/poco-x6-pro/preto-frente.webp', 'Preto', 'Poco X6 Pro na cor Preto, vista frontal', 1),
    ('/produtos/poco-x6-pro/preto-lateral.webp', 'Preto', 'Poco X6 Pro na cor Preto, vista lateral', 2),
    ('/produtos/poco-x6-pro/amarelo-verso.webp', 'Amarelo', 'Poco X6 Pro na cor Amarelo, vista traseira', 0),
    ('/produtos/poco-x6-pro/amarelo-frente.webp', 'Amarelo', 'Poco X6 Pro na cor Amarelo, vista frontal', 1),
    ('/produtos/poco-x6-pro/amarelo-lateral.webp', 'Amarelo', 'Poco X6 Pro na cor Amarelo, vista lateral', 2)
  ) as x(url, cor, alt, ordem);

with p as (insert into public.products (slug, nome, marca, categoria, condicao, descricao, ficha_tecnica, detalhes_seminovo, destaque, ativo, vendas, modelo_visual, created_at)
  values ('xiaomi-14t', 'Xiaomi 14T', 'Xiaomi', 'celular', 'novo', 'Câmeras desenvolvidas para fotografia noturna, tela de 6,67 polegadas a 144 Hz e carregamento de 67 W.', '{"Tela":"6,67\" AMOLED, 144 Hz","Processador":"Dimensity 8300 Ultra","Câmera traseira":"50 MP + 50 MP tele + 12 MP","Câmera frontal":"32 MP","Bateria":"5.000 mAh, carregamento 67 W","Memória":"12 GB RAM"}'::jsonb, null, false, true, 90, 'lentes-circulo', '2026-10-01')
  returning id),
v as (insert into public.product_variants (product_id, cor, cor_hex, armazenamento, preco, preco_antigo, preco_pix, estoque, sku, ordem)
  select p.id, x.* from p, (values
    ('Grafite', '#3d4046', '256 GB', 3999, null::numeric, 3799.05, 0, 'XIA-010-1', 0),
    ('Azul', '#b9cbd9', '256 GB', 3999, null::numeric, 3799.05, 0, 'XIA-010-2', 1)
  ) as x(cor, cor_hex, armazenamento, preco, preco_antigo, preco_pix, estoque, sku, ordem) returning 1)
insert into public.product_images (product_id, url, cor, alt, ordem)
  select p.id, x.* from p, (values
    ('/produtos/xiaomi-14t/grafite-verso.webp', 'Grafite', 'Xiaomi 14T na cor Grafite, vista traseira', 0),
    ('/produtos/xiaomi-14t/grafite-frente.webp', 'Grafite', 'Xiaomi 14T na cor Grafite, vista frontal', 1),
    ('/produtos/xiaomi-14t/grafite-lateral.webp', 'Grafite', 'Xiaomi 14T na cor Grafite, vista lateral', 2),
    ('/produtos/xiaomi-14t/azul-verso.webp', 'Azul', 'Xiaomi 14T na cor Azul, vista traseira', 0),
    ('/produtos/xiaomi-14t/azul-frente.webp', 'Azul', 'Xiaomi 14T na cor Azul, vista frontal', 1),
    ('/produtos/xiaomi-14t/azul-lateral.webp', 'Azul', 'Xiaomi 14T na cor Azul, vista lateral', 2)
  ) as x(url, cor, alt, ordem);

with p as (insert into public.products (slug, nome, marca, categoria, condicao, descricao, ficha_tecnica, detalhes_seminovo, destaque, ativo, vendas, modelo_visual, created_at)
  values ('iphone-13-seminovo', 'iPhone 13', 'Apple', 'celular', 'seminovo', 'Seminovo revisado pela nossa equipe: tela, câmeras, Face ID, áudio e bateria testados. Pronto para usar.', '{"Tela":"6,1\" OLED, 60 Hz","Processador":"A15 Bionic","Câmera traseira":"12 MP + 12 MP ultra-angular","Câmera frontal":"12 MP","Bateria":"Até 19 h de vídeo","Conector":"Lightning"}'::jsonb, '{"saude_bateria":89,"estado":"Excelente: sem marcas visíveis de uso","acompanha":["Aparelho","Cabo de carregamento","Película instalada"],"garantia":"90 dias de garantia da loja"}'::jsonb, false, true, 230, 'lentes-quadrado', '2026-08-14')
  returning id),
v as (insert into public.product_variants (product_id, cor, cor_hex, armazenamento, preco, preco_antigo, preco_pix, estoque, sku, ordem)
  select p.id, x.* from p, (values
    ('Meia-noite', '#222833', '128 GB', 2899, 3299, 2754.05, 2, 'APP-011-1', 0),
    ('Estelar', '#ece6dc', '128 GB', 2899, 3299, 2754.05, 1, 'APP-011-2', 1)
  ) as x(cor, cor_hex, armazenamento, preco, preco_antigo, preco_pix, estoque, sku, ordem) returning 1)
insert into public.product_images (product_id, url, cor, alt, ordem)
  select p.id, x.* from p, (values
    ('/produtos/iphone-13-seminovo/meia-noite-verso.webp', 'Meia-noite', 'iPhone 13 na cor Meia-noite, vista traseira', 0),
    ('/produtos/iphone-13-seminovo/meia-noite-frente.webp', 'Meia-noite', 'iPhone 13 na cor Meia-noite, vista frontal', 1),
    ('/produtos/iphone-13-seminovo/meia-noite-lateral.webp', 'Meia-noite', 'iPhone 13 na cor Meia-noite, vista lateral', 2),
    ('/produtos/iphone-13-seminovo/estelar-verso.webp', 'Estelar', 'iPhone 13 na cor Estelar, vista traseira', 0),
    ('/produtos/iphone-13-seminovo/estelar-frente.webp', 'Estelar', 'iPhone 13 na cor Estelar, vista frontal', 1),
    ('/produtos/iphone-13-seminovo/estelar-lateral.webp', 'Estelar', 'iPhone 13 na cor Estelar, vista lateral', 2)
  ) as x(url, cor, alt, ordem);

with p as (insert into public.products (slug, nome, marca, categoria, condicao, descricao, ficha_tecnica, detalhes_seminovo, destaque, ativo, vendas, modelo_visual, created_at)
  values ('iphone-12-seminovo', 'iPhone 12', 'Apple', 'celular', 'seminovo', 'Seminovo revisado. Leves marcas na lateral, tela sem riscos. Todas as funções testadas.', '{"Tela":"6,1\" OLED, 60 Hz","Processador":"A14 Bionic","Câmera traseira":"12 MP + 12 MP ultra-angular","Câmera frontal":"12 MP","Bateria":"Até 17 h de vídeo","Conector":"Lightning"}'::jsonb, '{"saude_bateria":84,"estado":"Muito bom: leves marcas na lateral","acompanha":["Aparelho","Cabo de carregamento"],"garantia":"90 dias de garantia da loja"}'::jsonb, false, true, 170, 'lentes-quadrado', '2026-07-02')
  returning id),
v as (insert into public.product_variants (product_id, cor, cor_hex, armazenamento, preco, preco_antigo, preco_pix, estoque, sku, ordem)
  select p.id, x.* from p, (values
    ('Preto', '#26262a', '64 GB', 1999, null::numeric, 1899.05, 1, 'APP-012-1', 0),
    ('Azul', '#b9cbd9', '128 GB', 2299, null::numeric, 2184.05, 2, 'APP-012-2', 1)
  ) as x(cor, cor_hex, armazenamento, preco, preco_antigo, preco_pix, estoque, sku, ordem) returning 1)
insert into public.product_images (product_id, url, cor, alt, ordem)
  select p.id, x.* from p, (values
    ('/produtos/iphone-12-seminovo/preto-verso.webp', 'Preto', 'iPhone 12 na cor Preto, vista traseira', 0),
    ('/produtos/iphone-12-seminovo/preto-frente.webp', 'Preto', 'iPhone 12 na cor Preto, vista frontal', 1),
    ('/produtos/iphone-12-seminovo/preto-lateral.webp', 'Preto', 'iPhone 12 na cor Preto, vista lateral', 2),
    ('/produtos/iphone-12-seminovo/azul-verso.webp', 'Azul', 'iPhone 12 na cor Azul, vista traseira', 0),
    ('/produtos/iphone-12-seminovo/azul-frente.webp', 'Azul', 'iPhone 12 na cor Azul, vista frontal', 1),
    ('/produtos/iphone-12-seminovo/azul-lateral.webp', 'Azul', 'iPhone 12 na cor Azul, vista lateral', 2)
  ) as x(url, cor, alt, ordem);

with p as (insert into public.products (slug, nome, marca, categoria, condicao, descricao, ficha_tecnica, detalhes_seminovo, destaque, ativo, vendas, modelo_visual, created_at)
  values ('galaxy-s23-seminovo', 'Galaxy S23', 'Samsung', 'celular', 'seminovo', 'Seminovo revisado, estado de vitrine. Acompanha caixa original e carregador.', '{"Tela":"6,1\" AMOLED, 120 Hz","Processador":"Snapdragon 8 Gen 2","Câmera traseira":"50 MP + 12 MP + 10 MP tele 3x","Câmera frontal":"12 MP","Bateria":"3.900 mAh, carregamento 25 W","Memória":"8 GB RAM"}'::jsonb, '{"saude_bateria":92,"estado":"Excelente: estado de vitrine","acompanha":["Aparelho","Caixa original","Carregador 25 W","Cabo USB-C"],"garantia":"90 dias de garantia da loja"}'::jsonb, false, true, 140, 'lentes-coluna', '2026-09-01')
  returning id),
v as (insert into public.product_variants (product_id, cor, cor_hex, armazenamento, preco, preco_antigo, preco_pix, estoque, sku, ordem)
  select p.id, x.* from p, (values
    ('Verde', '#7f9c8d', '256 GB', 2799, 3199, 2659.05, 2, 'SAM-013-1', 0),
    ('Preto', '#26262a', '256 GB', 2799, 3199, 2659.05, 1, 'SAM-013-2', 1)
  ) as x(cor, cor_hex, armazenamento, preco, preco_antigo, preco_pix, estoque, sku, ordem) returning 1)
insert into public.product_images (product_id, url, cor, alt, ordem)
  select p.id, x.* from p, (values
    ('/produtos/galaxy-s23-seminovo/verde-verso.webp', 'Verde', 'Galaxy S23 na cor Verde, vista traseira', 0),
    ('/produtos/galaxy-s23-seminovo/verde-frente.webp', 'Verde', 'Galaxy S23 na cor Verde, vista frontal', 1),
    ('/produtos/galaxy-s23-seminovo/verde-lateral.webp', 'Verde', 'Galaxy S23 na cor Verde, vista lateral', 2),
    ('/produtos/galaxy-s23-seminovo/preto-verso.webp', 'Preto', 'Galaxy S23 na cor Preto, vista traseira', 0),
    ('/produtos/galaxy-s23-seminovo/preto-frente.webp', 'Preto', 'Galaxy S23 na cor Preto, vista frontal', 1),
    ('/produtos/galaxy-s23-seminovo/preto-lateral.webp', 'Preto', 'Galaxy S23 na cor Preto, vista lateral', 2)
  ) as x(url, cor, alt, ordem);

with p as (insert into public.products (slug, nome, marca, categoria, condicao, descricao, ficha_tecnica, detalhes_seminovo, destaque, ativo, vendas, modelo_visual, created_at)
  values ('iphone-11-seminovo', 'iPhone 11', 'Apple', 'celular', 'seminovo', 'Seminovo revisado. Marcas leves de uso na traseira.', '{"Tela":"6,1\" LCD Liquid Retina","Processador":"A13 Bionic","Câmera traseira":"12 MP + 12 MP ultra-angular","Câmera frontal":"12 MP","Bateria":"Até 17 h de vídeo","Conector":"Lightning"}'::jsonb, '{"saude_bateria":81,"estado":"Bom: marcas leves na traseira","acompanha":["Aparelho","Cabo de carregamento"],"garantia":"90 dias de garantia da loja"}'::jsonb, false, true, 160, 'lentes-quadrado', '2026-05-20')
  returning id),
v as (insert into public.product_variants (product_id, cor, cor_hex, armazenamento, preco, preco_antigo, preco_pix, estoque, sku, ordem)
  select p.id, x.* from p, (values
    ('Branco', '#ececee', '64 GB', 1499, null::numeric, 1424.05, 0, 'APP-014-1', 0)
  ) as x(cor, cor_hex, armazenamento, preco, preco_antigo, preco_pix, estoque, sku, ordem) returning 1)
insert into public.product_images (product_id, url, cor, alt, ordem)
  select p.id, x.* from p, (values
    ('/produtos/iphone-11-seminovo/branco-verso.webp', 'Branco', 'iPhone 11 na cor Branco, vista traseira', 0),
    ('/produtos/iphone-11-seminovo/branco-frente.webp', 'Branco', 'iPhone 11 na cor Branco, vista frontal', 1),
    ('/produtos/iphone-11-seminovo/branco-lateral.webp', 'Branco', 'iPhone 11 na cor Branco, vista lateral', 2)
  ) as x(url, cor, alt, ordem);

with p as (insert into public.products (slug, nome, marca, categoria, condicao, descricao, ficha_tecnica, detalhes_seminovo, destaque, ativo, vendas, modelo_visual, created_at)
  values ('moto-g54-seminovo', 'Moto G54 5G', 'Motorola', 'celular', 'seminovo', 'Seminovo revisado com ótimo custo-benefício. Tela sem riscos.', '{"Tela":"6,5\" LCD, 120 Hz","Processador":"Dimensity 7020","Câmera traseira":"50 MP OIS + 8 MP","Câmera frontal":"16 MP","Bateria":"5.000 mAh, carregamento 30 W","Memória":"8 GB RAM"}'::jsonb, '{"saude_bateria":95,"estado":"Excelente: sem marcas visíveis de uso","acompanha":["Aparelho","Carregador 30 W","Capa transparente"],"garantia":"90 dias de garantia da loja"}'::jsonb, false, true, 110, 'lentes-barra', '2026-10-10')
  returning id),
v as (insert into public.product_variants (product_id, cor, cor_hex, armazenamento, preco, preco_antigo, preco_pix, estoque, sku, ordem)
  select p.id, x.* from p, (values
    ('Azul-marinho', '#2c3a56', '256 GB', 999, 1199, 949.05, 3, 'MOT-015-1', 0)
  ) as x(cor, cor_hex, armazenamento, preco, preco_antigo, preco_pix, estoque, sku, ordem) returning 1)
insert into public.product_images (product_id, url, cor, alt, ordem)
  select p.id, x.* from p, (values
    ('/produtos/moto-g54-seminovo/azul-marinho-verso.webp', 'Azul-marinho', 'Moto G54 5G na cor Azul-marinho, vista traseira', 0),
    ('/produtos/moto-g54-seminovo/azul-marinho-frente.webp', 'Azul-marinho', 'Moto G54 5G na cor Azul-marinho, vista frontal', 1),
    ('/produtos/moto-g54-seminovo/azul-marinho-lateral.webp', 'Azul-marinho', 'Moto G54 5G na cor Azul-marinho, vista lateral', 2)
  ) as x(url, cor, alt, ordem);

with p as (insert into public.products (slug, nome, marca, categoria, condicao, descricao, ficha_tecnica, detalhes_seminovo, destaque, ativo, vendas, modelo_visual, created_at)
  values ('capa-silicone', 'Capa de silicone', 'Genérica', 'acessorio', 'novo', 'Capa de silicone com toque macio e interior em microfibra. Protege câmeras e bordas.', '{"Material":"Silicone","Interior":"Microfibra","Compatibilidade":"Consulte o modelo no WhatsApp"}'::jsonb, null, false, true, 320, 'capa', '2026-01-05')
  returning id),
v as (insert into public.product_variants (product_id, cor, cor_hex, armazenamento, preco, preco_antigo, preco_pix, estoque, sku, ordem)
  select p.id, x.* from p, (values
    ('Preto', '#26262a', null, 79.9, null::numeric, 75.91, 20, 'GEN-016-1', 0),
    ('Azul', '#b9cbd9', null, 79.9, null::numeric, 75.91, 12, 'GEN-016-2', 1),
    ('Laranja', '#ff7a1a', null, 79.9, null::numeric, 75.91, 2, 'GEN-016-3', 2)
  ) as x(cor, cor_hex, armazenamento, preco, preco_antigo, preco_pix, estoque, sku, ordem) returning 1)
insert into public.product_images (product_id, url, cor, alt, ordem)
  select p.id, x.* from p, (values
    ('/produtos/capa-silicone/preto-verso.webp', 'Preto', 'Capa de silicone na cor Preto, vista traseira', 0),
    ('/produtos/capa-silicone/azul-verso.webp', 'Azul', 'Capa de silicone na cor Azul, vista traseira', 0),
    ('/produtos/capa-silicone/laranja-verso.webp', 'Laranja', 'Capa de silicone na cor Laranja, vista traseira', 0)
  ) as x(url, cor, alt, ordem);

with p as (insert into public.products (slug, nome, marca, categoria, condicao, descricao, ficha_tecnica, detalhes_seminovo, destaque, ativo, vendas, modelo_visual, created_at)
  values ('carregador-turbo-25w', 'Carregador turbo 25 W USB-C', 'Genérica', 'acessorio', 'novo', 'Carregador de parede USB-C com carregamento rápido de 25 W. Compatível com iPhone e Android.', '{"Potência":"25 W","Saída":"USB-C","Proteção":"Contra superaquecimento e curto"}'::jsonb, null, false, true, 290, 'carregador', '2026-02-11')
  returning id),
v as (insert into public.product_variants (product_id, cor, cor_hex, armazenamento, preco, preco_antigo, preco_pix, estoque, sku, ordem)
  select p.id, x.* from p, (values
    ('Branco', '#ececee', null, 129.9, 159.9, 123.41, 15, 'GEN-017-1', 0)
  ) as x(cor, cor_hex, armazenamento, preco, preco_antigo, preco_pix, estoque, sku, ordem) returning 1)
insert into public.product_images (product_id, url, cor, alt, ordem)
  select p.id, x.* from p, (values
    ('/produtos/carregador-turbo-25w/branco-verso.webp', 'Branco', 'Carregador turbo 25 W USB-C na cor Branco, vista traseira', 0)
  ) as x(url, cor, alt, ordem);

with p as (insert into public.products (slug, nome, marca, categoria, condicao, descricao, ficha_tecnica, detalhes_seminovo, destaque, ativo, vendas, modelo_visual, created_at)
  values ('fone-bluetooth', 'Fone Bluetooth com estojo', 'Genérica', 'acessorio', 'novo', 'Fone sem fio com cancelamento de ruído passivo e até 24 h de bateria com o estojo.', '{"Conexão":"Bluetooth 5.3","Bateria":"6 h + 18 h no estojo","Resistência":"IPX4"}'::jsonb, null, false, true, 200, 'fone', '2026-06-30')
  returning id),
v as (insert into public.product_variants (product_id, cor, cor_hex, armazenamento, preco, preco_antigo, preco_pix, estoque, sku, ordem)
  select p.id, x.* from p, (values
    ('Branco', '#ececee', null, 199.9, null::numeric, 189.91, 8, 'GEN-018-1', 0),
    ('Preto', '#26262a', null, 199.9, null::numeric, 189.91, 0, 'GEN-018-2', 1)
  ) as x(cor, cor_hex, armazenamento, preco, preco_antigo, preco_pix, estoque, sku, ordem) returning 1)
insert into public.product_images (product_id, url, cor, alt, ordem)
  select p.id, x.* from p, (values
    ('/produtos/fone-bluetooth/branco-verso.webp', 'Branco', 'Fone Bluetooth com estojo na cor Branco, vista traseira', 0),
    ('/produtos/fone-bluetooth/preto-verso.webp', 'Preto', 'Fone Bluetooth com estojo na cor Preto, vista traseira', 0)
  ) as x(url, cor, alt, ordem);

with p as (insert into public.products (slug, nome, marca, categoria, condicao, descricao, ficha_tecnica, detalhes_seminovo, destaque, ativo, vendas, modelo_visual, created_at)
  values ('cabo-usb-c', 'Cabo USB-C trançado 1,5 m', 'Genérica', 'acessorio', 'novo', 'Cabo trançado reforçado, USB-C nas duas pontas, suporta carregamento rápido de até 60 W.', '{"Comprimento":"1,5 m","Potência":"Até 60 W","Revestimento":"Nylon trançado"}'::jsonb, null, false, true, 260, 'cabo', '2026-03-03')
  returning id),
v as (insert into public.product_variants (product_id, cor, cor_hex, armazenamento, preco, preco_antigo, preco_pix, estoque, sku, ordem)
  select p.id, x.* from p, (values
    ('Preto', '#26262a', null, 49.9, null::numeric, 47.4, 30, 'GEN-019-1', 0)
  ) as x(cor, cor_hex, armazenamento, preco, preco_antigo, preco_pix, estoque, sku, ordem) returning 1)
insert into public.product_images (product_id, url, cor, alt, ordem)
  select p.id, x.* from p, (values
    ('/produtos/cabo-usb-c/preto-verso.webp', 'Preto', 'Cabo USB-C trançado 1,5 m na cor Preto, vista traseira', 0)
  ) as x(url, cor, alt, ordem);

with p as (insert into public.products (slug, nome, marca, categoria, condicao, descricao, ficha_tecnica, detalhes_seminovo, destaque, ativo, vendas, modelo_visual, created_at)
  values ('pelicula-vidro', 'Película de vidro 3D', 'Genérica', 'acessorio', 'novo', 'Película de vidro temperado com bordas 3D. Instalação grátis na loja.', '{"Material":"Vidro temperado 9H","Bordas":"3D","Instalação":"Grátis na loja física"}'::jsonb, null, false, true, 350, 'pelicula', '2025-11-12')
  returning id),
v as (insert into public.product_variants (product_id, cor, cor_hex, armazenamento, preco, preco_antigo, preco_pix, estoque, sku, ordem)
  select p.id, x.* from p, (values
    ('Transparente', '#d9dde3', null, 39.9, null::numeric, 37.9, 40, 'GEN-020-1', 0)
  ) as x(cor, cor_hex, armazenamento, preco, preco_antigo, preco_pix, estoque, sku, ordem) returning 1)
insert into public.product_images (product_id, url, cor, alt, ordem)
  select p.id, x.* from p, (values
    ('/produtos/pelicula-vidro/transparente-verso.webp', 'Transparente', 'Película de vidro 3D na cor Transparente, vista traseira', 0)
  ) as x(url, cor, alt, ordem);

with p as (insert into public.products (slug, nome, marca, categoria, condicao, descricao, ficha_tecnica, detalhes_seminovo, destaque, ativo, vendas, modelo_visual, created_at)
  values ('power-bank-10000', 'Power bank 10.000 mAh', 'Genérica', 'acessorio', 'novo', 'Bateria portátil fina com saída USB-C de 20 W. Carrega um celular cerca de duas vezes.', '{"Capacidade":"10.000 mAh","Saída":"USB-C 20 W + USB-A","Peso":"210 g"}'::jsonb, null, false, true, 140, 'powerbank', '2026-08-25')
  returning id),
v as (insert into public.product_variants (product_id, cor, cor_hex, armazenamento, preco, preco_antigo, preco_pix, estoque, sku, ordem)
  select p.id, x.* from p, (values
    ('Preto', '#26262a', null, 179.9, 219.9, 170.91, 6, 'GEN-021-1', 0),
    ('Branco', '#ececee', null, 179.9, 219.9, 170.91, 1, 'GEN-021-2', 1)
  ) as x(cor, cor_hex, armazenamento, preco, preco_antigo, preco_pix, estoque, sku, ordem) returning 1)
insert into public.product_images (product_id, url, cor, alt, ordem)
  select p.id, x.* from p, (values
    ('/produtos/power-bank-10000/preto-verso.webp', 'Preto', 'Power bank 10.000 mAh na cor Preto, vista traseira', 0),
    ('/produtos/power-bank-10000/branco-verso.webp', 'Branco', 'Power bank 10.000 mAh na cor Branco, vista traseira', 0)
  ) as x(url, cor, alt, ordem);
