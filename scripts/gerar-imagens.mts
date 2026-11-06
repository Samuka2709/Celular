// Gera imagens ilustrativas (WebP, fundo transparente) para os produtos de exemplo.
// Uso: npm run imagens
// Quando a loja tiver fotos reais, este script deixa de ser necessário.
import { mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { PRODUCTS } from "../src/lib/data/products.ts";

const OUT = path.join(process.cwd(), "public", "produtos");
const S = 800;

function slug(t: string) {
  return t
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function hexToRgb(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function mix(hex: string, alvo: string, t: number) {
  const a = hexToRgb(hex);
  const b = hexToRgb(alvo);
  const c = a.map((v, i) => Math.round(v + (b[i] - v) * t));
  return `#${c.map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}
const lighter = (h: string, t = 0.25) => mix(h, "#ffffff", t);
const darker = (h: string, t = 0.25) => mix(h, "#000000", t);
function luminancia(hex: string) {
  const [r, g, b] = hexToRgb(hex).map((v) => v / 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

const BX = 250;
const BY = 90;
const BW = 300;
const BH = 620;

function defs(cor: string, id: string) {
  return `
  <defs>
    <linearGradient id="body-${id}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${lighter(cor, 0.18)}"/>
      <stop offset="0.5" stop-color="${cor}"/>
      <stop offset="1" stop-color="${darker(cor, 0.22)}"/>
    </linearGradient>
    <linearGradient id="sheen-${id}" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#fff" stop-opacity="0"/>
      <stop offset="0.35" stop-color="#fff" stop-opacity="0.10"/>
      <stop offset="0.5" stop-color="#fff" stop-opacity="0"/>
    </linearGradient>
    <radialGradient id="lens-${id}" cx="0.35" cy="0.35" r="0.7">
      <stop offset="0" stop-color="#3a4660"/>
      <stop offset="0.45" stop-color="#151a24"/>
      <stop offset="1" stop-color="#050608"/>
    </radialGradient>
    <linearGradient id="wall-${id}" x1="0" y1="0" x2="0.4" y2="1">
      <stop offset="0" stop-color="#121218"/>
      <stop offset="0.55" stop-color="${darker(cor, 0.35)}"/>
      <stop offset="1" stop-color="#ff6a00"/>
    </linearGradient>
    <radialGradient id="blob-${id}" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="#ff8a33" stop-opacity="0.85"/>
      <stop offset="1" stop-color="#ff6a00" stop-opacity="0"/>
    </radialGradient>
    <filter id="shadow-${id}" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="18" stdDeviation="18" flood-color="#000" flood-opacity="0.45"/>
    </filter>
  </defs>`;
}

function lente(cx: number, cy: number, r: number, cor: string, id: string) {
  return `
    <circle cx="${cx}" cy="${cy}" r="${r + 5}" fill="${darker(cor, 0.35)}" stroke="${lighter(cor, 0.35)}" stroke-width="2"/>
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#lens-${id})"/>
    <circle cx="${cx}" cy="${cy}" r="${r * 0.42}" fill="#0b0e14" stroke="#2b3550" stroke-width="2"/>
    <circle cx="${cx - r * 0.32}" cy="${cy - r * 0.32}" r="${r * 0.16}" fill="#fff" opacity="0.55"/>`;
}
function flash(cx: number, cy: number) {
  return `<circle cx="${cx}" cy="${cy}" r="9" fill="#f3ecd8" stroke="#bdb6a2" stroke-width="2"/>`;
}

function camera(modelo: string, cor: string, id: string) {
  const mod = luminancia(cor) > 0.6 ? darker(cor, 0.08) : lighter(cor, 0.08);
  switch (modelo) {
    case "lentes-quadrado":
      return `
      <rect x="${BX + 20}" y="${BY + 20}" width="136" height="136" rx="36" fill="${mod}" stroke="${lighter(cor, 0.3)}" stroke-width="2"/>
      ${lente(BX + 58, BY + 58, 24, cor, id)}
      ${lente(BX + 58, BY + 118, 24, cor, id)}
      ${lente(BX + 118, BY + 88, 24, cor, id)}
      ${flash(BX + 120, BY + 42)}`;
    case "lentes-coluna":
      return `
      ${lente(BX + 56, BY + 58, 22, cor, id)}
      ${lente(BX + 56, BY + 118, 22, cor, id)}
      ${lente(BX + 56, BY + 178, 22, cor, id)}
      ${flash(BX + 104, BY + 58)}`;
    case "lentes-circulo":
      return `
      <circle cx="${BX + BW / 2}" cy="${BY + 132}" r="86" fill="${darker(cor, 0.4)}" stroke="${lighter(cor, 0.35)}" stroke-width="3"/>
      ${lente(BX + BW / 2 - 30, BY + 102, 22, cor, id)}
      ${lente(BX + BW / 2 + 30, BY + 102, 22, cor, id)}
      ${lente(BX + BW / 2 - 30, BY + 162, 22, cor, id)}
      ${flash(BX + BW / 2 + 30, BY + 162)}`;
    default: // lentes-barra
      return `
      <rect x="${BX + 20}" y="${BY + 20}" width="${BW - 40}" height="112" rx="32" fill="${mod}" stroke="${lighter(cor, 0.3)}" stroke-width="2"/>
      ${lente(BX + 70, BY + 76, 30, cor, id)}
      ${lente(BX + 146, BY + 76, 24, cor, id)}
      ${flash(BX + 206, BY + 62)}
      <circle cx="${BX + 206}" cy="${BY + 94}" r="6" fill="#0b0e14"/>`;
  }
}

function botoes(cor: string) {
  const c = darker(cor, 0.3);
  return `
    <rect x="${BX - 5}" y="${BY + 150}" width="7" height="44" rx="3" fill="${c}"/>
    <rect x="${BX - 5}" y="${BY + 210}" width="7" height="70" rx="3" fill="${c}"/>
    <rect x="${BX + BW - 2}" y="${BY + 190}" width="7" height="90" rx="3" fill="${c}"/>`;
}

function verso(modelo: string, cor: string, id: string) {
  return `
  <g filter="url(#shadow-${id})">
    ${botoes(cor)}
    <rect x="${BX}" y="${BY}" width="${BW}" height="${BH}" rx="52" fill="url(#body-${id})"/>
    <rect x="${BX + 3}" y="${BY + 3}" width="${BW - 6}" height="${BH - 6}" rx="49" fill="none" stroke="#fff" stroke-opacity="0.18" stroke-width="2"/>
    <rect x="${BX}" y="${BY}" width="${BW}" height="${BH}" rx="52" fill="url(#sheen-${id})"/>
    ${camera(modelo, cor, id)}
  </g>`;
}

function frente(cor: string, id: string) {
  const sx = BX + 12;
  const sy = BY + 12;
  const sw = BW - 24;
  const sh = BH - 24;
  return `
  <g filter="url(#shadow-${id})">
    ${botoes(cor)}
    <rect x="${BX}" y="${BY}" width="${BW}" height="${BH}" rx="52" fill="${cor}"/>
    <rect x="${BX + 4}" y="${BY + 4}" width="${BW - 8}" height="${BH - 8}" rx="48" fill="#0a0a0c"/>
    <clipPath id="tela-${id}"><rect x="${sx}" y="${sy}" width="${sw}" height="${sh}" rx="42"/></clipPath>
    <g clip-path="url(#tela-${id})">
      <rect x="${sx}" y="${sy}" width="${sw}" height="${sh}" fill="url(#wall-${id})"/>
      <circle cx="${sx + sw * 0.8}" cy="${sy + sh * 0.78}" r="200" fill="url(#blob-${id})"/>
      <path d="M ${sx} ${sy + sh * 0.62} C ${sx + 90} ${sy + sh * 0.5}, ${sx + 180} ${sy + sh * 0.75}, ${sx + sw} ${sy + sh * 0.58} L ${sx + sw} ${sy + sh} L ${sx} ${sy + sh} Z" fill="#000" opacity="0.25"/>
      <rect x="${sx + 36}" y="${sy + 110}" width="150" height="44" rx="10" fill="#fff" opacity="0.9"/>
      <rect x="${sx + 36}" y="${sy + 166}" width="96" height="12" rx="6" fill="#fff" opacity="0.55"/>
      ${[0, 1, 2, 3]
        .map(
          (i) =>
            `<rect x="${sx + 30 + i * 60}" y="${sy + sh - 92}" width="44" height="44" rx="12" fill="#fff" opacity="0.16"/>`,
        )
        .join("")}
      <rect x="${sx + sw / 2 - 50}" y="${sy + sh - 22}" width="100" height="5" rx="3" fill="#fff" opacity="0.6"/>
    </g>
    <circle cx="${BX + BW / 2}" cy="${BY + 36}" r="10" fill="#000" stroke="#1d1d22" stroke-width="2"/>
    <rect x="${sx}" y="${sy}" width="${sw}" height="${sh}" rx="42" fill="url(#sheen-${id})"/>
  </g>`;
}

function lateral(modelo: string, cor: string, id: string) {
  // Perspectiva simples: inclina e estreita a traseira e adiciona a espessura.
  return `
  <g transform="translate(400 400) matrix(0.8 -0.1 0 1 0 0) translate(-400 -400)">
    <rect x="${BX - 14}" y="${BY + 6}" width="${BW}" height="${BH}" rx="52" fill="${darker(cor, 0.45)}"/>
    ${verso(modelo, cor, id)}
  </g>`;
}

function acessorio(modelo: string, cor: string, id: string) {
  const sombra = `filter="url(#shadow-${id})"`;
  switch (modelo) {
    case "capa":
      return `
      <g ${sombra}>
        <rect x="${BX - 10}" y="${BY - 10}" width="${BW + 20}" height="${BH + 20}" rx="62" fill="url(#body-${id})"/>
        <rect x="${BX + 20}" y="${BY + 20}" width="150" height="150" rx="40" fill="#0b0b0d"/>
        <rect x="${BX + 20}" y="${BY + 20}" width="150" height="150" rx="40" fill="none" stroke="${lighter(cor, 0.3)}" stroke-width="4"/>
        <rect x="${BX - 10}" y="${BY - 10}" width="${BW + 20}" height="${BH + 20}" rx="62" fill="url(#sheen-${id})"/>
        <rect x="${BX + BW + 4}" y="${BY + 190}" width="10" height="90" rx="5" fill="${darker(cor, 0.25)}"/>
      </g>`;
    case "carregador":
      return `
      <g ${sombra}>
        <rect x="370" y="150" width="18" height="90" rx="5" fill="#b9bcc4"/>
        <rect x="412" y="150" width="18" height="90" rx="5" fill="#b9bcc4"/>
        <rect x="260" y="220" width="280" height="300" rx="56" fill="url(#body-${id})"/>
        <rect x="260" y="220" width="280" height="300" rx="56" fill="url(#sheen-${id})"/>
        <rect x="350" y="430" width="100" height="34" rx="17" fill="#1a1a1e"/>
        <rect x="368" y="442" width="64" height="10" rx="5" fill="#3a3a42"/>
        <rect x="380" y="290" width="40" height="6" rx="3" fill="${darker(cor, 0.2)}"/>
      </g>`;
    case "fone":
      return `
      <g ${sombra}>
        <rect x="230" y="330" width="340" height="260" rx="120" fill="url(#body-${id})"/>
        <path d="M 236 420 H 564" stroke="${darker(cor, 0.25)}" stroke-width="3"/>
        <circle cx="400" cy="500" r="7" fill="#ff6a00"/>
        <g transform="rotate(-18 320 230)">
          <ellipse cx="320" cy="210" rx="48" ry="56" fill="url(#body-${id})"/>
          <rect x="300" y="240" width="40" height="120" rx="20" fill="url(#body-${id})"/>
          <ellipse cx="320" cy="200" rx="22" ry="26" fill="${darker(cor, 0.35)}"/>
        </g>
        <g transform="rotate(18 480 230)">
          <ellipse cx="480" cy="210" rx="48" ry="56" fill="url(#body-${id})"/>
          <rect x="460" y="240" width="40" height="120" rx="20" fill="url(#body-${id})"/>
          <ellipse cx="480" cy="200" rx="22" ry="26" fill="${darker(cor, 0.35)}"/>
        </g>
      </g>`;
    case "cabo":
      return `
      <g ${sombra}>
        <path d="M 250 230 C 250 520, 560 300, 560 470 S 360 640, 300 560 S 470 380, 540 600"
          fill="none" stroke="${lighter(cor, 0.12)}" stroke-width="22" stroke-linecap="round"/>
        <path d="M 250 230 C 250 520, 560 300, 560 470 S 360 640, 300 560 S 470 380, 540 600"
          fill="none" stroke="#fff" stroke-opacity="0.12" stroke-width="22" stroke-dasharray="6 8"/>
        <rect x="226" y="140" width="48" height="100" rx="14" fill="#d5d7dc"/>
        <rect x="236" y="110" width="28" height="40" rx="8" fill="#a6a9b0"/>
        <g transform="rotate(-20 540 610)">
          <rect x="516" y="600" width="48" height="100" rx="14" fill="#d5d7dc"/>
          <rect x="526" y="690" width="28" height="36" rx="8" fill="#a6a9b0"/>
        </g>
      </g>`;
    case "pelicula":
      return `
      <g transform="rotate(-8 400 400)" ${sombra}>
        <rect x="${BX}" y="${BY}" width="${BW}" height="${BH}" rx="52" fill="#dfe6ee" fill-opacity="0.22" stroke="#fff" stroke-opacity="0.75" stroke-width="3"/>
        <path d="M ${BX + 40} ${BY + 260} L ${BX + 220} ${BY + 80}" stroke="#fff" stroke-opacity="0.5" stroke-width="10" stroke-linecap="round"/>
        <path d="M ${BX + 60} ${BY + 330} L ${BX + 250} ${BY + 140}" stroke="#fff" stroke-opacity="0.25" stroke-width="5" stroke-linecap="round"/>
        <circle cx="${BX + BW / 2}" cy="${BY + 36}" r="11" fill="none" stroke="#fff" stroke-opacity="0.6" stroke-width="2"/>
      </g>`;
    default: // powerbank
      return `
      <g ${sombra}>
        <rect x="270" y="150" width="260" height="500" rx="44" fill="url(#body-${id})"/>
        <rect x="270" y="150" width="260" height="500" rx="44" fill="url(#sheen-${id})"/>
        ${[0, 1, 2, 3].map((i) => `<circle cx="${358 + i * 28}" cy="560" r="6" fill="${i < 3 ? "#ff6a00" : darker(cor, 0.3)}"/>`).join("")}
        <rect x="355" y="636" width="90" height="14" rx="7" fill="#1a1a1e"/>
      </g>`;
  }
}

function svg(conteudo: string, cor: string, id: string) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}" viewBox="0 0 ${S} ${S}">${defs(cor, id)}${conteudo}</svg>`;
}

async function main() {
  let total = 0;
  for (const p of PRODUCTS) {
    const dir = path.join(OUT, p.slug);
    await mkdir(dir, { recursive: true });
    for (const img of p.images) {
      const variante = p.variants.find((v) => v.cor === img.cor) ?? p.variants[0];
      const cor = variante.corHex;
      const id = `${slug(variante.cor)}`;
      const vista = path.basename(img.url, ".webp").split("-").pop();
      let corpo: string;
      if (p.categoria === "acessorio") corpo = acessorio(p.modeloVisual, cor, id);
      else if (vista === "frente") corpo = frente(cor, id);
      else if (vista === "lateral") corpo = lateral(p.modeloVisual, cor, id);
      else corpo = verso(p.modeloVisual, cor, id);

      await sharp(Buffer.from(svg(corpo, cor, id)))
        .webp({ quality: 82, alphaQuality: 90 })
        .toFile(path.join(process.cwd(), "public", img.url));
      total++;
    }
  }
  console.log(`${total} imagens geradas em public/produtos`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
