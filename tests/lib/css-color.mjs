// A small evaluator for the colour expressions tokens.css uses, so the contract tests can measure what a browser
// computes — not only literal hex. Supported: `#rgb`/`#rrggbb`, `var(--x[, fallback])`, `color-mix(in oklab|srgb, A [p%],
// B [q%])`, and the relative form `oklch(from X <L> <C> <H>)` whose channels are numbers, the keywords `l c h`, and
// `min()` · `max()` · `clamp()` · `calc()` arithmetic. Out-of-gamut results are clipped per channel (browsers map by
// reducing chroma; for the lightness-driven contrast floors here the difference is far below the margins).

/** Top-level rule bodies inside `@layer iyu.house { … }`, in source order. */
export function blocks(source) {
  const css = source.replace(/\/\*[\s\S]*?\*\//g, '');
  const start = css.indexOf('@layer iyu.house {');
  const inner = start >= 0 ? css.slice(start + '@layer iyu.house {'.length) : css;
  const out = [];
  for (const m of inner.matchAll(/([^{}]+)\{([^{}]*)\}/g)) out.push({ selector: m[1].trim().replace(/\s+/g, ' '), decls: decls(m[2]) });
  return out;
}

export function decls(body) {
  const map = new Map();
  for (const m of body.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) map.set(m[1], m[2].trim().replace(/\s+/g, ' '));
  return map;
}

/** Merge the declarations of every block whose selector is in `selectors`, in source order (later wins). */
export function cascade(all, selectors) {
  const map = new Map();
  for (const b of all) if (selectors.includes(b.selector)) for (const [k, v] of b.decls) map.set(k, v);
  return map;
}

// ── colour maths ────────────────────────────────────────────────────────────
const toLinear = c => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const toGamma = c => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);
const clip = c => Math.min(1, Math.max(0, c));

export function hexToRgb(hex) {
  let h = hex.replace('#', '');
  if (h.length === 3) h = [...h].map(x => x + x).join('');
  return [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16) / 255);
}
export function rgbToHex(rgb) {
  return '#' + rgb.map(c => Math.round(clip(c) * 255).toString(16).padStart(2, '0')).join('').toUpperCase();
}
export function rgbToOklab([r, g, b]) {
  const [R, G, B] = [r, g, b].map(toLinear);
  const l = Math.cbrt(0.4122214708 * R + 0.5363325363 * G + 0.0514459929 * B);
  const m = Math.cbrt(0.2119034982 * R + 0.6806995451 * G + 0.1073969566 * B);
  const s = Math.cbrt(0.0883024619 * R + 0.2817188376 * G + 0.6299787005 * B);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
}
export function oklabToRgb([L, a, b]) {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ].map(toGamma).map(clip);
}
export function luminance(rgb) {
  const [r, g, b] = rgb.map(toLinear);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
export function contrast(a, b) {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}
export const oklabL = rgb => rgbToOklab(rgb)[0];
export function deltaE(a, b) {
  const [x, y] = [rgbToOklab(a), rgbToOklab(b)];
  return Math.hypot(x[0] - y[0], x[1] - y[1], x[2] - y[2]) * 100;
}

// ── expression evaluation ──────────────────────────────────────────────────
/** Split on top-level commas (or spaces when `sep` is ' '). */
function split(s, sep = ',') {
  const out = [];
  let depth = 0, cur = '';
  for (const ch of s) {
    if (ch === '(') depth++;
    if (ch === ')') depth--;
    if (depth === 0 && (sep === ' ' ? /\s/.test(ch) : ch === sep)) { if (cur.trim()) out.push(cur.trim()); cur = ''; continue; }
    cur += ch;
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}

/** Replace every `var(--x[, fallback])` with its value from `map` (recursively). */
export function substitute(value, map, seen = new Set()) {
  let out = '', i = 0;
  while (i < value.length) {
    const at = value.indexOf('var(', i);
    if (at < 0) { out += value.slice(i); break; }
    out += value.slice(i, at);
    let depth = 0, j = at + 3;
    for (; j < value.length; j++) {
      if (value[j] === '(') depth++;
      else if (value[j] === ')' && --depth === 0) break;
    }
    const [name, ...rest] = split(value.slice(at + 4, j));
    let v = map.get(name);
    if (v === undefined) {
      if (!rest.length) throw new Error(`undefined ${name}`);
      v = rest.join(',');
    }
    if (seen.has(name)) throw new Error(`cycle at ${name}`);
    out += substitute(v, map, new Set([...seen, name]));
    i = j + 1;
  }
  return out;
}

function channel(expr, env) {
  const js = expr
    .replace(/calc\(/g, '(')
    .replace(/\bmin\(/g, 'Math.min(').replace(/\bmax\(/g, 'Math.max(')
    .replace(/\bclamp\(([^,]+),([^,]+),([^)]+)\)/g, 'Math.min(Math.max($2,$1),$3)')
    .replace(/\b([lch])\b/g, (_, k) => `(${env[k]})`)
    .replace(/(\d)(deg)\b/g, '$1');
  if (!/^[\d\s+\-*/().,Mathminax]+$/.test(js)) throw new Error(`cannot evaluate channel ${expr}`);
  return Function(`return (${js})`)();
}

/** Evaluate a colour expression to sRGB [0..1]. `map` resolves `var()`. */
export function color(value, map = new Map()) {
  const v = substitute(value, map).trim();
  if (/^#[0-9a-f]{3,8}$/i.test(v)) return hexToRgb(v.slice(0, 7));
  if (/^(black|white)$/i.test(v)) return v.toLowerCase() === 'black' ? [0, 0, 0] : [1, 1, 1];
  let m = /^color-mix\(\s*in\s+(oklab|srgb)\s*,(.*)\)$/i.exec(v);
  if (m) {
    const [a, b] = split(m[2]).map(part => {
      const pm = /^(.*?)\s+(\d+(?:\.\d+)?)%$/.exec(part);
      return pm ? { c: pm[1], p: Number(pm[2]) } : { c: part, p: undefined };
    });
    let pa = a.p, pb = b.p;
    if (pa === undefined && pb === undefined) pa = pb = 50;
    else if (pa === undefined) pa = 100 - pb;
    else if (pb === undefined) pb = 100 - pa;
    const t = pb / (pa + pb);
    const [x, y] = [color(a.c, map), color(b.c, map)];
    if (m[1].toLowerCase() === 'srgb') return x.map((c, i) => c * (1 - t) + y[i] * t);
    const [p, q] = [rgbToOklab(x), rgbToOklab(y)];
    return oklabToRgb(p.map((c, i) => c * (1 - t) + q[i] * t));
  }
  m = /^oklch\(\s*from\s+(.*)\)$/i.exec(v);
  if (m) {
    const parts = split(m[1], ' ');
    const [origin, L, C, H] = parts;
    const [l, a, b] = rgbToOklab(color(origin, map));
    const env = { l, c: Math.hypot(a, b), h: ((Math.atan2(b, a) * 180) / Math.PI + 360) % 360 };
    const [nl, nc, nh] = [channel(L, env), channel(C, env), channel(H, env)];
    const rad = (nh * Math.PI) / 180;
    return oklabToRgb([nl, nc * Math.cos(rad), nc * Math.sin(rad)]);
  }
  throw new Error(`cannot evaluate colour ${value} → ${v}`);
}

/** True when the token's value is a colour (literal or expression) rather than a length or a shadow. */
export const isColour = v => /^(#|color-mix\(|oklch\(\s*from|rgba?\()/i.test(v) || /^var\(--(hs-(accent|secondary)|u-[\w-]*(color|bg))/i.test(v);
