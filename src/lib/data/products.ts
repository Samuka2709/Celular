// DADOS DE EXEMPLO. Serão substituídos pelas tabelas do Supabase.
// Este arquivo só pode ter imports de tipo: ele também é lido pelo script
// scripts/gerar-imagens.mts (Node) para gerar as imagens ilustrativas.
import type {
  Categoria,
  Condicao,
  DetalhesSeminovo,
  ModeloVisual,
  Product,
  ProductImage,
  ProductVariant,
} from "../types";

const DESCONTO_PIX = 0.05;

function slug(texto: string) {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

type Cor = { nome: string; hex: string };
type VarianteBase = {
  cor: Cor;
  armazenamento: string | null;
  preco: number;
  precoAntigo?: number;
  estoque: number;
};

const VISTAS_CELULAR = ["verso", "frente", "lateral"] as const;

interface Entrada {
  slug: string;
  nome: string;
  marca: string;
  categoria: Categoria;
  condicao: Condicao;
  descricao: string;
  fichaTecnica: Record<string, string>;
  detalhesSeminovo?: DetalhesSeminovo;
  destaque?: boolean;
  vendas: number;
  createdAt: string;
  modeloVisual: ModeloVisual;
  variantes: VarianteBase[];
}

function montar(e: Entrada, idx: number): Product {
  const variants: ProductVariant[] = e.variantes.map((v, i) => ({
    id: `${e.slug}-v${i + 1}`,
    cor: v.cor.nome,
    corHex: v.cor.hex,
    armazenamento: v.armazenamento,
    preco: v.preco,
    precoAntigo: v.precoAntigo ?? null,
    precoPix: Math.round(v.preco * (1 - DESCONTO_PIX) * 100) / 100,
    estoque: v.estoque,
    sku: `${slug(e.marca).slice(0, 3).toUpperCase()}-${String(idx + 1).padStart(3, "0")}-${i + 1}`,
  }));

  const cores = Array.from(new Map(e.variantes.map((v) => [v.cor.nome, v.cor])).values());
  const vistas = e.categoria === "celular" ? VISTAS_CELULAR : (["verso"] as const);
  const images: ProductImage[] = cores.flatMap((cor) =>
    vistas.map((vista, ordem) => ({
      url: `/produtos/${e.slug}/${slug(cor.nome)}-${vista}.webp`,
      alt: `${e.nome} na cor ${cor.nome}, ${vista === "verso" ? "vista traseira" : vista === "frente" ? "vista frontal" : "vista lateral"}`,
      cor: cor.nome,
      ordem,
    })),
  );

  return {
    id: `p${idx + 1}`,
    slug: e.slug,
    nome: e.nome,
    marca: e.marca,
    categoria: e.categoria,
    condicao: e.condicao,
    descricao: e.descricao,
    fichaTecnica: e.fichaTecnica,
    detalhesSeminovo: e.detalhesSeminovo ?? null,
    destaque: e.destaque ?? false,
    vendas: e.vendas,
    createdAt: e.createdAt,
    modeloVisual: e.modeloVisual,
    variants,
    images,
  };
}

// Paleta de cores dos aparelhos de exemplo
const C = {
  preto: { nome: "Preto", hex: "#26262a" },
  grafite: { nome: "Grafite", hex: "#3d4046" },
  branco: { nome: "Branco", hex: "#ececee" },
  azul: { nome: "Azul", hex: "#b9cbd9" },
  azulEscuro: { nome: "Azul-marinho", hex: "#2c3a56" },
  rosa: { nome: "Rosa", hex: "#efd3d6" },
  verde: { nome: "Verde", hex: "#7f9c8d" },
  menta: { nome: "Verde-menta", hex: "#b8d8c8" },
  lilas: { nome: "Lilás", hex: "#cbbde0" },
  amarelo: { nome: "Amarelo", hex: "#efd67a" },
  titanio: { nome: "Titânio natural", hex: "#b8b0a3" },
  titanioPreto: { nome: "Titânio preto", hex: "#3a3a3c" },
  magenta: { nome: "Magenta", hex: "#7d2a4a" },
  meiaNoite: { nome: "Meia-noite", hex: "#222833" },
  estelar: { nome: "Estelar", hex: "#ece6dc" },
  laranja: { nome: "Laranja", hex: "#ff7a1a" },
  transparente: { nome: "Transparente", hex: "#d9dde3" },
} satisfies Record<string, Cor>;

const ENTRADAS: Entrada[] = [
  // ---------- Celulares novos ----------
  {
    slug: "iphone-15",
    nome: "iPhone 15",
    marca: "Apple",
    categoria: "celular",
    condicao: "novo",
    descricao:
      "Tela Super Retina de 6,1 polegadas, câmera principal de 48 MP e conector USB-C. Aparelho novo, lacrado, com nota fiscal e garantia de 1 ano do fabricante.",
    fichaTecnica: {
      Tela: "6,1\" OLED, 60 Hz",
      Processador: "A16 Bionic",
      "Câmera traseira": "48 MP + 12 MP ultra-angular",
      "Câmera frontal": "12 MP",
      Bateria: "Até 20 h de vídeo",
      Conector: "USB-C",
    },
    destaque: true,
    vendas: 240,
    createdAt: "2026-03-10",
    modeloVisual: "lentes-quadrado",
    variantes: [
      { cor: C.preto, armazenamento: "128 GB", preco: 4999, precoAntigo: 5499, estoque: 6 },
      { cor: C.preto, armazenamento: "256 GB", preco: 5699, estoque: 3 },
      { cor: C.azul, armazenamento: "128 GB", preco: 4999, precoAntigo: 5499, estoque: 4 },
      { cor: C.azul, armazenamento: "256 GB", preco: 5699, estoque: 0 },
      { cor: C.rosa, armazenamento: "128 GB", preco: 4999, precoAntigo: 5499, estoque: 2 },
    ],
  },
  {
    slug: "iphone-16-pro",
    nome: "iPhone 16 Pro",
    marca: "Apple",
    categoria: "celular",
    condicao: "novo",
    descricao:
      "Estrutura em titânio, tela de 6,3 polegadas com taxa de atualização adaptável e sistema de câmeras com zoom óptico de 5x. Novo, lacrado, garantia de 1 ano.",
    fichaTecnica: {
      Tela: "6,3\" OLED, até 120 Hz",
      Processador: "A18 Pro",
      "Câmera traseira": "48 MP + 48 MP ultra-angular + 12 MP tele 5x",
      "Câmera frontal": "12 MP",
      Bateria: "Até 27 h de vídeo",
      Conector: "USB-C",
    },
    destaque: true,
    vendas: 180,
    createdAt: "2026-09-20",
    modeloVisual: "lentes-quadrado",
    variantes: [
      { cor: C.titanio, armazenamento: "128 GB", preco: 7999, estoque: 3 },
      { cor: C.titanio, armazenamento: "256 GB", preco: 8899, estoque: 2 },
      { cor: C.titanio, armazenamento: "512 GB", preco: 10499, estoque: 0 },
      { cor: C.titanioPreto, armazenamento: "128 GB", preco: 7999, estoque: 4 },
      { cor: C.titanioPreto, armazenamento: "256 GB", preco: 8899, estoque: 1 },
    ],
  },
  {
    slug: "galaxy-s24",
    nome: "Galaxy S24",
    marca: "Samsung",
    categoria: "celular",
    condicao: "novo",
    descricao:
      "Compacto e potente: tela de 6,2 polegadas a 120 Hz, câmera de 50 MP com zoom de 3x e recursos de inteligência artificial integrados.",
    fichaTecnica: {
      Tela: "6,2\" AMOLED, 120 Hz",
      Processador: "Exynos 2400",
      "Câmera traseira": "50 MP + 12 MP + 10 MP tele 3x",
      "Câmera frontal": "12 MP",
      Bateria: "4.000 mAh, carregamento 25 W",
      Memória: "8 GB RAM",
    },
    destaque: true,
    vendas: 210,
    createdAt: "2026-02-01",
    modeloVisual: "lentes-coluna",
    variantes: [
      { cor: C.preto, armazenamento: "256 GB", preco: 4299, precoAntigo: 4999, estoque: 5 },
      { cor: C.lilas, armazenamento: "256 GB", preco: 4299, precoAntigo: 4999, estoque: 3 },
      { cor: C.amarelo, armazenamento: "256 GB", preco: 4299, precoAntigo: 4999, estoque: 0 },
    ],
  },
  {
    slug: "galaxy-a55",
    nome: "Galaxy A55 5G",
    marca: "Samsung",
    categoria: "celular",
    condicao: "novo",
    descricao:
      "Acabamento em metal e vidro, tela Super AMOLED de 6,6 polegadas e bateria que aguenta o dia todo. Resistente à água e poeira (IP67).",
    fichaTecnica: {
      Tela: "6,6\" Super AMOLED, 120 Hz",
      Processador: "Exynos 1480",
      "Câmera traseira": "50 MP + 12 MP + 5 MP",
      "Câmera frontal": "32 MP",
      Bateria: "5.000 mAh, carregamento 25 W",
      Memória: "8 GB RAM",
    },
    vendas: 300,
    createdAt: "2026-04-02",
    modeloVisual: "lentes-coluna",
    variantes: [
      { cor: C.azulEscuro, armazenamento: "128 GB", preco: 2199, precoAntigo: 2499, estoque: 7 },
      { cor: C.azulEscuro, armazenamento: "256 GB", preco: 2499, estoque: 4 },
      { cor: C.lilas, armazenamento: "128 GB", preco: 2199, precoAntigo: 2499, estoque: 3 },
    ],
  },
  {
    slug: "galaxy-a15",
    nome: "Galaxy A15",
    marca: "Samsung",
    categoria: "celular",
    condicao: "novo",
    descricao:
      "O básico bem feito: tela grande de 6,5 polegadas, bateria de 5.000 mAh e câmera de 50 MP por um preço acessível.",
    fichaTecnica: {
      Tela: "6,5\" Super AMOLED, 90 Hz",
      Processador: "Helio G99",
      "Câmera traseira": "50 MP + 5 MP + 2 MP",
      "Câmera frontal": "13 MP",
      Bateria: "5.000 mAh, carregamento 25 W",
      Memória: "4 GB RAM",
    },
    vendas: 280,
    createdAt: "2025-12-15",
    modeloVisual: "lentes-coluna",
    variantes: [
      { cor: C.azulEscuro, armazenamento: "128 GB", preco: 999, estoque: 2 },
      { cor: C.azul, armazenamento: "128 GB", preco: 999, estoque: 0 },
    ],
  },
  {
    slug: "moto-g84",
    nome: "Moto G84 5G",
    marca: "Motorola",
    categoria: "celular",
    condicao: "novo",
    descricao:
      "Tela pOLED de 6,55 polegadas, som estéreo e 256 GB para guardar tudo. Acabamento em couro vegano.",
    fichaTecnica: {
      Tela: "6,55\" pOLED, 120 Hz",
      Processador: "Snapdragon 695",
      "Câmera traseira": "50 MP + 8 MP",
      "Câmera frontal": "16 MP",
      Bateria: "5.000 mAh, carregamento 30 W",
      Memória: "8 GB RAM",
    },
    vendas: 190,
    createdAt: "2025-10-05",
    modeloVisual: "lentes-barra",
    variantes: [
      { cor: C.grafite, armazenamento: "256 GB", preco: 1599, precoAntigo: 1899, estoque: 6 },
      { cor: C.azulEscuro, armazenamento: "256 GB", preco: 1599, precoAntigo: 1899, estoque: 2 },
      { cor: C.magenta, armazenamento: "256 GB", preco: 1599, precoAntigo: 1899, estoque: 3 },
    ],
  },
  {
    slug: "motorola-edge-50-fusion",
    nome: "Edge 50 Fusion",
    marca: "Motorola",
    categoria: "celular",
    condicao: "novo",
    descricao:
      "Tela curva de 6,7 polegadas, câmera de 50 MP com estabilização óptica e carregamento de 68 W.",
    fichaTecnica: {
      Tela: "6,7\" pOLED curva, 144 Hz",
      Processador: "Snapdragon 7s Gen 2",
      "Câmera traseira": "50 MP OIS + 13 MP",
      "Câmera frontal": "32 MP",
      Bateria: "5.000 mAh, carregamento 68 W",
      Memória: "8 GB RAM",
    },
    vendas: 120,
    createdAt: "2026-06-12",
    modeloVisual: "lentes-barra",
    variantes: [
      { cor: C.verde, armazenamento: "256 GB", preco: 2399, estoque: 4 },
      { cor: C.azulEscuro, armazenamento: "256 GB", preco: 2399, estoque: 3 },
    ],
  },
  {
    slug: "redmi-note-13",
    nome: "Redmi Note 13",
    marca: "Xiaomi",
    categoria: "celular",
    condicao: "novo",
    descricao:
      "Tela AMOLED de 6,67 polegadas, câmera de 108 MP e muito armazenamento por um preço justo.",
    fichaTecnica: {
      Tela: "6,67\" AMOLED, 120 Hz",
      Processador: "Snapdragon 685",
      "Câmera traseira": "108 MP + 8 MP + 2 MP",
      "Câmera frontal": "16 MP",
      Bateria: "5.000 mAh, carregamento 33 W",
      Memória: "6 GB / 8 GB RAM",
    },
    vendas: 260,
    createdAt: "2026-01-20",
    modeloVisual: "lentes-circulo",
    variantes: [
      { cor: C.preto, armazenamento: "128 GB", preco: 1399, estoque: 8 },
      { cor: C.preto, armazenamento: "256 GB", preco: 1599, estoque: 5 },
      { cor: C.menta, armazenamento: "128 GB", preco: 1399, estoque: 4 },
      { cor: C.azul, armazenamento: "256 GB", preco: 1599, estoque: 2 },
    ],
  },
  {
    slug: "poco-x6-pro",
    nome: "Poco X6 Pro",
    marca: "Xiaomi",
    categoria: "celular",
    condicao: "novo",
    descricao:
      "Desempenho de topo para jogos, tela de 6,67 polegadas a 120 Hz e carregamento de 67 W.",
    fichaTecnica: {
      Tela: "6,67\" AMOLED, 120 Hz",
      Processador: "Dimensity 8300 Ultra",
      "Câmera traseira": "64 MP OIS + 8 MP + 2 MP",
      "Câmera frontal": "16 MP",
      Bateria: "5.000 mAh, carregamento 67 W",
      Memória: "8 GB / 12 GB RAM",
    },
    vendas: 150,
    createdAt: "2026-05-08",
    modeloVisual: "lentes-barra",
    variantes: [
      { cor: C.preto, armazenamento: "256 GB", preco: 2299, precoAntigo: 2599, estoque: 4 },
      { cor: C.amarelo, armazenamento: "256 GB", preco: 2299, precoAntigo: 2599, estoque: 2 },
      { cor: C.preto, armazenamento: "512 GB", preco: 2699, estoque: 0 },
    ],
  },
  {
    slug: "xiaomi-14t",
    nome: "Xiaomi 14T",
    marca: "Xiaomi",
    categoria: "celular",
    condicao: "novo",
    descricao:
      "Câmeras desenvolvidas para fotografia noturna, tela de 6,67 polegadas a 144 Hz e carregamento de 67 W.",
    fichaTecnica: {
      Tela: "6,67\" AMOLED, 144 Hz",
      Processador: "Dimensity 8300 Ultra",
      "Câmera traseira": "50 MP + 50 MP tele + 12 MP",
      "Câmera frontal": "32 MP",
      Bateria: "5.000 mAh, carregamento 67 W",
      Memória: "12 GB RAM",
    },
    vendas: 90,
    createdAt: "2026-10-01",
    modeloVisual: "lentes-circulo",
    variantes: [
      { cor: C.grafite, armazenamento: "256 GB", preco: 3999, estoque: 0 },
      { cor: C.azul, armazenamento: "256 GB", preco: 3999, estoque: 0 },
    ],
  },

  // ---------- Seminovos ----------
  {
    slug: "iphone-13-seminovo",
    nome: "iPhone 13",
    marca: "Apple",
    categoria: "celular",
    condicao: "seminovo",
    descricao:
      "Seminovo revisado pela nossa equipe: tela, câmeras, Face ID, áudio e bateria testados. Pronto para usar.",
    fichaTecnica: {
      Tela: "6,1\" OLED, 60 Hz",
      Processador: "A15 Bionic",
      "Câmera traseira": "12 MP + 12 MP ultra-angular",
      "Câmera frontal": "12 MP",
      Bateria: "Até 19 h de vídeo",
      Conector: "Lightning",
    },
    detalhesSeminovo: {
      saudeBateria: 89,
      estado: "Excelente: sem marcas visíveis de uso",
      acompanha: ["Aparelho", "Cabo de carregamento", "Película instalada"],
      garantia: "90 dias de garantia da loja",
    },
    vendas: 230,
    createdAt: "2026-08-14",
    modeloVisual: "lentes-quadrado",
    variantes: [
      { cor: C.meiaNoite, armazenamento: "128 GB", preco: 2899, precoAntigo: 3299, estoque: 2 },
      { cor: C.estelar, armazenamento: "128 GB", preco: 2899, precoAntigo: 3299, estoque: 1 },
    ],
  },
  {
    slug: "iphone-12-seminovo",
    nome: "iPhone 12",
    marca: "Apple",
    categoria: "celular",
    condicao: "seminovo",
    descricao:
      "Seminovo revisado. Leves marcas na lateral, tela sem riscos. Todas as funções testadas.",
    fichaTecnica: {
      Tela: "6,1\" OLED, 60 Hz",
      Processador: "A14 Bionic",
      "Câmera traseira": "12 MP + 12 MP ultra-angular",
      "Câmera frontal": "12 MP",
      Bateria: "Até 17 h de vídeo",
      Conector: "Lightning",
    },
    detalhesSeminovo: {
      saudeBateria: 84,
      estado: "Muito bom: leves marcas na lateral",
      acompanha: ["Aparelho", "Cabo de carregamento"],
      garantia: "90 dias de garantia da loja",
    },
    vendas: 170,
    createdAt: "2026-07-02",
    modeloVisual: "lentes-quadrado",
    variantes: [
      { cor: C.preto, armazenamento: "64 GB", preco: 1999, estoque: 1 },
      { cor: C.azul, armazenamento: "128 GB", preco: 2299, estoque: 2 },
    ],
  },
  {
    slug: "galaxy-s23-seminovo",
    nome: "Galaxy S23",
    marca: "Samsung",
    categoria: "celular",
    condicao: "seminovo",
    descricao:
      "Seminovo revisado, estado de vitrine. Acompanha caixa original e carregador.",
    fichaTecnica: {
      Tela: "6,1\" AMOLED, 120 Hz",
      Processador: "Snapdragon 8 Gen 2",
      "Câmera traseira": "50 MP + 12 MP + 10 MP tele 3x",
      "Câmera frontal": "12 MP",
      Bateria: "3.900 mAh, carregamento 25 W",
      Memória: "8 GB RAM",
    },
    detalhesSeminovo: {
      saudeBateria: 92,
      estado: "Excelente: estado de vitrine",
      acompanha: ["Aparelho", "Caixa original", "Carregador 25 W", "Cabo USB-C"],
      garantia: "90 dias de garantia da loja",
    },
    vendas: 140,
    createdAt: "2026-09-01",
    modeloVisual: "lentes-coluna",
    variantes: [
      { cor: C.verde, armazenamento: "256 GB", preco: 2799, precoAntigo: 3199, estoque: 2 },
      { cor: C.preto, armazenamento: "256 GB", preco: 2799, precoAntigo: 3199, estoque: 1 },
    ],
  },
  {
    slug: "iphone-11-seminovo",
    nome: "iPhone 11",
    marca: "Apple",
    categoria: "celular",
    condicao: "seminovo",
    descricao: "Seminovo revisado. Marcas leves de uso na traseira.",
    fichaTecnica: {
      Tela: "6,1\" LCD Liquid Retina",
      Processador: "A13 Bionic",
      "Câmera traseira": "12 MP + 12 MP ultra-angular",
      "Câmera frontal": "12 MP",
      Bateria: "Até 17 h de vídeo",
      Conector: "Lightning",
    },
    detalhesSeminovo: {
      saudeBateria: 81,
      estado: "Bom: marcas leves na traseira",
      acompanha: ["Aparelho", "Cabo de carregamento"],
      garantia: "90 dias de garantia da loja",
    },
    vendas: 160,
    createdAt: "2026-05-20",
    modeloVisual: "lentes-quadrado",
    variantes: [{ cor: C.branco, armazenamento: "64 GB", preco: 1499, estoque: 0 }],
  },
  {
    slug: "moto-g54-seminovo",
    nome: "Moto G54 5G",
    marca: "Motorola",
    categoria: "celular",
    condicao: "seminovo",
    descricao: "Seminovo revisado com ótimo custo-benefício. Tela sem riscos.",
    fichaTecnica: {
      Tela: "6,5\" LCD, 120 Hz",
      Processador: "Dimensity 7020",
      "Câmera traseira": "50 MP OIS + 8 MP",
      "Câmera frontal": "16 MP",
      Bateria: "5.000 mAh, carregamento 30 W",
      Memória: "8 GB RAM",
    },
    detalhesSeminovo: {
      saudeBateria: 95,
      estado: "Excelente: sem marcas visíveis de uso",
      acompanha: ["Aparelho", "Carregador 30 W", "Capa transparente"],
      garantia: "90 dias de garantia da loja",
    },
    vendas: 110,
    createdAt: "2026-10-10",
    modeloVisual: "lentes-barra",
    variantes: [{ cor: C.azulEscuro, armazenamento: "256 GB", preco: 999, precoAntigo: 1199, estoque: 3 }],
  },

  // ---------- Acessórios ----------
  {
    slug: "capa-silicone",
    nome: "Capa de silicone",
    marca: "Genérica",
    categoria: "acessorio",
    condicao: "novo",
    descricao: "Capa de silicone com toque macio e interior em microfibra. Protege câmeras e bordas.",
    fichaTecnica: { Material: "Silicone", Interior: "Microfibra", Compatibilidade: "Consulte o modelo no WhatsApp" },
    vendas: 320,
    createdAt: "2026-01-05",
    modeloVisual: "capa",
    variantes: [
      { cor: C.preto, armazenamento: null, preco: 79.9, estoque: 20 },
      { cor: C.azul, armazenamento: null, preco: 79.9, estoque: 12 },
      { cor: C.laranja, armazenamento: null, preco: 79.9, estoque: 2 },
    ],
  },
  {
    slug: "carregador-turbo-25w",
    nome: "Carregador turbo 25 W USB-C",
    marca: "Genérica",
    categoria: "acessorio",
    condicao: "novo",
    descricao: "Carregador de parede USB-C com carregamento rápido de 25 W. Compatível com iPhone e Android.",
    fichaTecnica: { Potência: "25 W", Saída: "USB-C", Proteção: "Contra superaquecimento e curto" },
    vendas: 290,
    createdAt: "2026-02-11",
    modeloVisual: "carregador",
    variantes: [{ cor: C.branco, armazenamento: null, preco: 129.9, precoAntigo: 159.9, estoque: 15 }],
  },
  {
    slug: "fone-bluetooth",
    nome: "Fone Bluetooth com estojo",
    marca: "Genérica",
    categoria: "acessorio",
    condicao: "novo",
    descricao: "Fone sem fio com cancelamento de ruído passivo e até 24 h de bateria com o estojo.",
    fichaTecnica: { Conexão: "Bluetooth 5.3", Bateria: "6 h + 18 h no estojo", Resistência: "IPX4" },
    vendas: 200,
    createdAt: "2026-06-30",
    modeloVisual: "fone",
    variantes: [
      { cor: C.branco, armazenamento: null, preco: 199.9, estoque: 8 },
      { cor: C.preto, armazenamento: null, preco: 199.9, estoque: 0 },
    ],
  },
  {
    slug: "cabo-usb-c",
    nome: "Cabo USB-C trançado 1,5 m",
    marca: "Genérica",
    categoria: "acessorio",
    condicao: "novo",
    descricao: "Cabo trançado reforçado, USB-C nas duas pontas, suporta carregamento rápido de até 60 W.",
    fichaTecnica: { Comprimento: "1,5 m", Potência: "Até 60 W", Revestimento: "Nylon trançado" },
    vendas: 260,
    createdAt: "2026-03-03",
    modeloVisual: "cabo",
    variantes: [{ cor: C.preto, armazenamento: null, preco: 49.9, estoque: 30 }],
  },
  {
    slug: "pelicula-vidro",
    nome: "Película de vidro 3D",
    marca: "Genérica",
    categoria: "acessorio",
    condicao: "novo",
    descricao: "Película de vidro temperado com bordas 3D. Instalação grátis na loja.",
    fichaTecnica: { Material: "Vidro temperado 9H", Bordas: "3D", Instalação: "Grátis na loja física" },
    vendas: 350,
    createdAt: "2025-11-12",
    modeloVisual: "pelicula",
    variantes: [{ cor: C.transparente, armazenamento: null, preco: 39.9, estoque: 40 }],
  },
  {
    slug: "power-bank-10000",
    nome: "Power bank 10.000 mAh",
    marca: "Genérica",
    categoria: "acessorio",
    condicao: "novo",
    descricao: "Bateria portátil fina com saída USB-C de 20 W. Carrega um celular cerca de duas vezes.",
    fichaTecnica: { Capacidade: "10.000 mAh", Saída: "USB-C 20 W + USB-A", Peso: "210 g" },
    vendas: 140,
    createdAt: "2026-08-25",
    modeloVisual: "powerbank",
    variantes: [
      { cor: C.preto, armazenamento: null, preco: 179.9, precoAntigo: 219.9, estoque: 6 },
      { cor: C.branco, armazenamento: null, preco: 179.9, precoAntigo: 219.9, estoque: 1 },
    ],
  },
];

export const PRODUCTS: Product[] = ENTRADAS.map(montar);
