// Shared coordinates for the cell drawing. The scene, the zoom targets, and the protein
// journey all read from here so the parts stay lined up when the drawing changes.
export type Pt = [number, number];

export const W = 800, H = 560;
export const LENS_W = 480, LENS_H = 360;

const CX = 400, CY = 285, RX = 365, RY = 245;
// A gentle wobble keeps the outline from looking like a perfect oval.
const wobble = (t: number) => 1 + 0.022 * Math.sin(3 * t + 0.6) + 0.016 * Math.sin(5 * t + 2.1);
export function cellPoint(t: number, inset = 0): Pt {
 const f = wobble(t);
 return [CX + (RX * f - inset) * Math.cos(t), CY + (RY * f - inset) * Math.sin(t)];
}
export function cellTangent(t: number): number {
 const [x0, y0] = cellPoint(t - 0.01), [x1, y1] = cellPoint(t + 0.01);
 return Math.atan2(y1 - y0, x1 - x0) * 180 / Math.PI; // degrees
}

export function rng(seed: number) {
 return () => {
  seed |= 0; seed = seed + 0x6d2b79f5 | 0;
  let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
  t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
  return ((t ^ t >>> 14) >>> 0) / 4294967296;
 };
}

const r1 = (n: number) => Math.round(n * 10) / 10;
export function smooth(pts: Pt[], closed: boolean): string {
 const n = pts.length;
 const at = (i: number) => closed ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))];
 let d = `M${r1(pts[0][0])} ${r1(pts[0][1])}`;
 const last = closed ? n : n - 1;
 for (let i = 0; i < last; i++) {
  const p0 = at(i - 1), p1 = at(i), p2 = at(i + 1), p3 = at(i + 2);
  const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
  const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
  d += `C${r1(c1[0])} ${r1(c1[1])} ${r1(c2[0])} ${r1(c2[1])} ${r1(p2[0])} ${r1(p2[1])}`;
 }
 return closed ? d + 'Z' : d;
}
export const cellPath = (inset = 0) =>
 smooth(Array.from({ length: 72 }, (_, i) => cellPoint(i / 72 * Math.PI * 2, inset)), true);
export function cellArc(t0: number, t1: number, inset: number): string {
 const n = 24;
 return smooth(Array.from({ length: n + 1 }, (_, i) => cellPoint(t0 + (t1 - t0) * i / n, inset)), false);
}

// Nucleus
export const NX = 350, NY = 280, NRX = 108, NRY = 96;
export const nucPoint = (t: number, inset = 0): Pt => [NX + (NRX - inset) * Math.cos(t), NY + (NRY - inset) * Math.sin(t)];
export const PORES = [-2.6, -1.9, -1.25, -0.9, -0.35, 0.35, 1.05, 1.75, 2.45, 3.05];
export const PORE_EXIT = -0.35;
export const NUCLEOLUS: Pt = [378, 250];
export const GENE = 'M300 312c6-9 14-9 18-1s12 8 17 0 12-9 18-1';
export const GENE_START: Pt = [326, 311];

// Rough ER: flattened sacs curving around the nucleus
export const ER_RADII = [126, 142, 158, 174];
export const ER_FROM = -68, ER_TO = 62; // degrees
export const deg = (d: number) => d * Math.PI / 180;
export const erPoint = (r: number, d: number): Pt => [NX + r * Math.cos(deg(d)), NY + r * Math.sin(deg(d))];
export function erArc(r: number, from = ER_FROM, to = ER_TO): string {
 const a0 = deg(from), a1 = deg(to), large = to - from > 180 ? 1 : 0;
 const [x0, y0] = [NX + r * Math.cos(a0), NY + r * Math.sin(a0)];
 const [x1, y1] = [NX + r * Math.cos(a1), NY + r * Math.sin(a1)];
 return `M${r1(x0)} ${r1(y0)}A${r} ${r} 0 ${large} 1 ${r1(x1)} ${r1(y1)}`;
}
export const RIBO_EDGE = 6.5;
export const RIBO_ON_ER: Pt = erPoint(ER_RADII[0] - RIBO_EDGE, -14);

// Golgi: a stack of curved sacs, receiving side toward the ER
export const GX = 740, GY = 300;
export const GOLGI = [{ r: 150, a: 0.42 }, { r: 138, a: 0.45 }, { r: 126, a: 0.47 }, { r: 114, a: 0.5 }, { r: 102, a: 0.52 }];
export const golgiPoint = (r: number, a: number): Pt => [GX - r * Math.cos(a), GY + r * Math.sin(a)];
export const VESICLES: Pt[] = [[664, 262], [684, 296], [674, 346], [700, 214], [548, 318]];
export const EXO_T = 0.2;
export const EXO: Pt = cellPoint(EXO_T, 8);

// Mitochondria: centre, rotation (degrees). The first one is used for the close-up.
export const MITOS: { x: number; y: number; rot: number }[] = [
 { x: 150, y: 215, rot: 25 }, { x: 300, y: 480, rot: -8 }, { x: 500, y: 470, rot: 10 },
 { x: 545, y: 118, rot: -14 }, { x: 660, y: 410, rot: -40 }
];
export const MITO_W = 86, MITO_H = 38;
export function local(o: { x: number; y: number; rot: number }, lx: number, ly: number): Pt {
 const a = deg(o.rot);
 return [o.x + lx * Math.cos(a) - ly * Math.sin(a), o.y + lx * Math.sin(a) + ly * Math.cos(a)];
}

export const LYSOSOMES: Pt[] = [[104, 300], [396, 506], [640, 168]];
export const LYSO_R = 16;

export const SMOOTH_ER = [
 'M146 362C168 340 198 350 214 370S250 402 264 382',
 'M156 402C182 390 204 412 226 404S256 420 272 410',
 'M172 442C194 426 214 448 242 438',
 'M199 352C194 378 210 394 204 410',
 'M240 392C234 408 246 422 241 438',
 'M160 400C150 386 148 374 146 362'
];

export const CENTROSOME: Pt = [245, 150];
export const MT_ANGLES = [-2.25, -1.78, -1.35, -0.92, -0.45, 2.95, 2.55];
export function microtubules(): string[] {
 const [cx, cy] = CENTROSOME;
 return MT_ANGLES.map((t, i) => {
  const [ex, ey] = cellPoint(t, 20);
  const mx = (cx + ex) / 2, my = (cy + ey) / 2;
  const dx = ex - cx, dy = ey - cy, bend = (i % 2 ? 0.1 : -0.1);
  return `M${cx} ${cy}Q${r1(mx - dy * bend)} ${r1(my + dx * bend)} ${r1(ex)} ${r1(ey)}`;
 });
}

// Free ribosomes sit in small clusters on a strand of messenger RNA.
export const POLYSOME: Pt = [560, 396];
function freeRiboClusters(): Pt[] {
 const rand = rng(7);
 const blocked: [number, number, number][] = [
  [NX, NY, 190], [GX - 120, GY, 75], [205, 395, 75], [CENTROSOME[0], CENTROSOME[1], 34], [POLYSOME[0], POLYSOME[1], 40],
  ...MITOS.map(m => [m.x, m.y, 58] as [number, number, number]),
  ...LYSOSOMES.map(([x, y]) => [x, y, 30] as [number, number, number]),
  ...VESICLES.map(([x, y]) => [x, y, 22] as [number, number, number])
 ];
 const out: Pt[] = [POLYSOME];
 for (let tries = 0; out.length < 16 && tries < 2000; tries++) {
  const t = rand() * Math.PI * 2, k = Math.sqrt(rand()) * 0.86;
  const [ex, ey] = cellPoint(t, 34);
  const p: Pt = [CX + (ex - CX) * k, CY + (ey - CY) * k];
  if (blocked.some(([x, y, r]) => Math.hypot(p[0] - x, p[1] - y) < r)) continue;
  if (out.some(q => Math.hypot(p[0] - q[0], p[1] - q[1]) < 44)) continue;
  out.push(p);
 }
 return out;
}
export const FREE_RIBOS = freeRiboClusters();

// The view a lens or stage is looking at: centre and visible width in scene units.
export type View = { x: number; y: number; w: number };
export const WHOLE: View = { x: W / 2, y: H / 2, w: W };
export function lensTransform(v: View, boxW = LENS_W, boxH = LENS_H) {
 const s = boxW / v.w;
 return `translate(${boxW / 2} ${boxH / 2}) scale(${s}) translate(${-v.x} ${-v.y})`;
}
export function toLens(v: View, [x, y]: Pt, boxW = LENS_W, boxH = LENS_H): Pt {
 const s = boxW / v.w;
 return [(x - v.x) * s + boxW / 2, (y - v.y) * s + boxH / 2];
}
