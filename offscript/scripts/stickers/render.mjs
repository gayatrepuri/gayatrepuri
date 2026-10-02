// Turns the drawings in scripts/stickers/svg/ into realistic-looking sticker
// images in assets/stickers/ (plus the gold photo frame in assets/frame.png).
//
// Each drawing gets real-world lighting (embossed shine and shading), a
// material texture (metal, wax, paper, fabric, gloss) and a soft drop shadow.
//
// You don't need to run this to use the app; the images are already made.
// To swap an icon for a real photo sticker instead, just replace its PNG in
// assets/stickers/ with a square, transparent-background PNG of the same name.
//
// Re-render (needs Playwright):  node scripts/stickers/render.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../..');
const { chromium } = await import(process.env.PLAYWRIGHT_PATH ?? 'playwright');

// how each material catches the light
const MATERIALS = {
  metal: { blur: 1.1, scale: 3.2, depth: 0.75, spec: 1.2, exp: 16, shine: 0.95, noise: 0.05, freq: 1.4 },
  gloss: { blur: 1.4, scale: 2.6, depth: 0.55, spec: 1.0, exp: 30, shine: 0.75, noise: 0.03, freq: 1.2 },
  wax: { blur: 1.7, scale: 3.6, depth: 0.7, spec: 0.7, exp: 14, shine: 0.5, noise: 0.12, freq: 0.9 },
  paper: { blur: 0.9, scale: 1.2, depth: 0.45, spec: 0.15, exp: 8, shine: 0.12, noise: 0.16, freq: 1.1 },
  soft: { blur: 2.0, scale: 2.6, depth: 0.6, spec: 0.25, exp: 10, shine: 0.2, noise: 0.1, freq: 1.6 },
};

const STICKERS = {
  headphones: 'gloss', postcard: 'paper', ticket: 'paper', waxheart: 'wax', waxseal: 'wax',
  locket: 'metal', envelope: 'paper', swan: 'soft', butterfly: 'metal', hibiscus: 'soft',
  bunny: 'soft', clip: 'metal', button: 'gloss', vinyl: 'gloss', matchbook: 'paper', bow: 'soft',
  coffee: 'gloss', books: 'paper', sparkle: 'metal', camera: 'gloss', goldseal: 'metal',
  discoball: 'gloss', champagne: 'gloss', key: 'metal', seashell: 'soft', star: 'metal',
};

/** The lighting + texture + shadow filter. `u` scales it to the drawing's units. */
function filter(m, u = 1) {
  const s = (n) => +(n * u).toFixed(3);
  return `
  <filter id="real" x="-12%" y="-12%" width="124%" height="128%" color-interpolation-filters="sRGB">
    <feGaussianBlur in="SourceAlpha" stdDeviation="${s(m.blur)}" result="bump"/>
    <feDiffuseLighting in="bump" surfaceScale="${s(m.scale)}" diffuseConstant="1" lighting-color="#ffffff" result="diff">
      <feDistantLight azimuth="235" elevation="55"/>
    </feDiffuseLighting>
    <feSpecularLighting in="bump" surfaceScale="${s(m.scale)}" specularConstant="${m.spec}" specularExponent="${m.exp}" lighting-color="#ffffff" result="spec">
      <feDistantLight azimuth="235" elevation="38"/>
    </feSpecularLighting>
    <feComposite in="spec" in2="SourceAlpha" operator="in" result="specIn"/>
    <feComposite in="SourceGraphic" in2="diff" operator="arithmetic" k1="${m.depth}" k2="${(1 - m.depth + 0.12).toFixed(2)}" result="shaded"/>
    <feTurbulence type="fractalNoise" baseFrequency="${(m.freq / u).toFixed(3)}" numOctaves="3" seed="7" result="noise"/>
    <feColorMatrix in="noise" type="matrix" values="0.33 0.33 0.33 0 0  0.33 0.33 0.33 0 0  0.33 0.33 0.33 0 0  0 0 0 0 1" result="grain"/>
    <feComposite in="shaded" in2="grain" operator="arithmetic" k1="${2 * m.noise}" k2="${1 - m.noise}" result="tex"/>
    <feComposite in="tex" in2="specIn" operator="arithmetic" k2="1" k3="${m.shine}" result="lit"/>
    <feComposite in="lit" in2="SourceAlpha" operator="in" result="final"/>
    <feGaussianBlur in="SourceAlpha" stdDeviation="${s(1.8)}" result="sb"/>
    <feOffset in="sb" dx="${s(1.2)}" dy="${s(2.4)}" result="so"/>
    <feColorMatrix in="so" type="matrix" values="0 0 0 0 0.18  0 0 0 0 0.07  0 0 0 0 0.05  0 0 0 0.38 0" result="shadow"/>
    <feMerge><feMergeNode in="shadow"/><feMergeNode in="final"/></feMerge>
  </filter>`;
}

/** Wraps a drawing's contents in the filter, with room around it for the shadow. */
function realistic(svg, m, { pad = 5, u = 1, keepBox = false } = {}) {
  const [x, y, w, h] = svg.match(/viewBox="([^"]+)"/)[1].split(/\s+/).map(Number);
  const box = keepBox ? `${x} ${y} ${w} ${h}` : `${x - pad} ${y - pad} ${w + pad * 2} ${h + pad * 2}`;
  const inner = svg.replace(/^<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');
  const defsEnd = inner.indexOf('</defs>');
  const defs = defsEnd >= 0 ? inner.slice(0, defsEnd).replace('<defs>', '') : '';
  const body = defsEnd >= 0 ? inner.slice(defsEnd + 7) : inner;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${box}" width="100%" height="100%">
    <defs>${defs}${filter(m, u)}</defs><g filter="url(#real)">${body}</g></svg>`;
}

const browser = await chromium.launch();
async function shoot(svgMarkup, outFile, width, height) {
  const page = await browser.newPage({ viewport: { width, height } });
  await page.setContent(`<html><body style="margin:0;background:transparent">${svgMarkup}</body></html>`);
  await page.screenshot({ path: outFile, omitBackground: true, clip: { x: 0, y: 0, width, height } });
  await page.close();
}

fs.mkdirSync(path.join(root, 'assets/stickers'), { recursive: true });
for (const [name, material] of Object.entries(STICKERS)) {
  const src = fs.readFileSync(path.join(here, 'svg', `${name}.svg`), 'utf8');
  await shoot(realistic(src, MATERIALS[material]), path.join(root, 'assets/stickers', `${name}.png`), 256, 256);
  console.log('sticker', name);
}

// the ornate photo frame: same size/shape as before so the photo still lines up
const frame = fs.readFileSync(path.join(here, 'svg', 'frame.svg'), 'utf8');
await shoot(realistic(frame, MATERIALS.metal, { u: 3.2, keepBox: true }), path.join(root, 'assets/frame.png'), 600, 760);
console.log('frame');
await browser.close();
