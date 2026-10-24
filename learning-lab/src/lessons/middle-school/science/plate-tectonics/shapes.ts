// Small geometry helpers for the cross-section drawings.
export type Pt = [number, number];

export const line = (pts: Pt[]) => 'M' + pts.map(p => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' L');
export const poly = (top: Pt[], bottom: Pt[]) => line([...top, ...[...bottom].reverse()]) + 'Z';

// Unit normals pointing "down" from a line drawn left to right.
function normals(pts: Pt[]): Pt[] {
 return pts.map((_, i) => {
  const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
  const dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy) || 1;
  return [-dy / len, dx / len];
 });
}
export const offset = (pts: Pt[], d: number): Pt[] => { const n = normals(pts); return pts.map((p, i) => [p[0] + n[i][0] * d, p[1] + n[i][1] * d]); };
// A band of thickness d1 − d0 lying under (or along) a line, like a layer of a bent plate.
export const ribbon = (pts: Pt[], d0: number, d1: number) => poly(offset(pts, d0), offset(pts, d1));

function lengths(pts: Pt[]) { const out = [0]; for (let i = 1; i < pts.length; i++) out.push(out[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1])); return out; }
export const totalLength = (pts: Pt[]) => lengths(pts)[pts.length - 1];
export function pointAt(pts: Pt[], u: number): Pt {
 const L = lengths(pts);
 if (u <= 0) return pts[0];
 for (let i = 1; i < pts.length; i++) if (L[i] >= u) {
  const k = (u - L[i - 1]) / (L[i] - L[i - 1] || 1);
  return [pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * k, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * k];
 }
 return pts[pts.length - 1];
}
// The part of a line between two distances measured along it.
export function piece(pts: Pt[], u0: number, u1: number): Pt[] {
 const L = lengths(pts), out: Pt[] = [pointAt(pts, u0)];
 for (let i = 0; i < pts.length; i++) if (L[i] > u0 && L[i] < u1) out.push(pts[i]);
 out.push(pointAt(pts, u1));
 return out;
}
// A plate that runs flat and then bends down into the mantle, getting steeper as it goes.
export function bendingPlate(y: number, bendX: number, curveLen: number, dip0 = 3, dip1 = 52, bendLen = 230): Pt[] {
 const pts: Pt[] = [[-30, y], [bendX, y]];
 let x = bendX, yy = y;
 for (let s = 0; s < curveLen; s += 6) {
  const a = (dip0 + (dip1 - dip0) * Math.min(1, s / bendLen)) * Math.PI / 180;
  x += 6 * Math.cos(a); yy += 6 * Math.sin(a);
  pts.push([x, yy]);
 }
 return pts;
}
export const firstBelow = (pts: Pt[], y: number) => pts.find(p => p[1] >= y) ?? pts[pts.length - 1];
// The slab's top surface between two depths, used as the edge of the plate above it.
export const between = (pts: Pt[], y0: number, y1: number) => pts.filter(p => p[1] >= y0 && p[1] <= y1);
export const bump = (x: number, c: number, w: number) => Math.exp(-(((x - c) / w) ** 2));
export const range = (a: number, b: number, step: number) => { const out: number[] = []; for (let v = a; v <= b + 1e-9; v += step) out.push(v); return out; };
