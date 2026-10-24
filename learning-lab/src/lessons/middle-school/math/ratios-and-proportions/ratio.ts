// Exact fractions for answers, plus the paint-color model used by the mixer.
// Numbers stay small (recipes, prices, map scales), so plain numbers are enough.
export type Q = { n: number; d: number };

export const gcd = (a: number, b: number): number => b === 0 ? Math.abs(a) : gcd(b, a % b);

export function q(n: number, d = 1): Q {
 if (d === 0) throw new Error('zero denominator');
 if (d < 0) { n = -n; d = -d; }
 const g = gcd(n, d) || 1;
 return { n: n / g, d: d / g };
}

export const add = (a: Q, b: Q) => q(a.n * b.d + b.n * a.d, a.d * b.d);
export const sub = (a: Q, b: Q) => q(a.n * b.d - b.n * a.d, a.d * b.d);
export const mul = (a: Q, b: Q) => q(a.n * b.n, a.d * b.d);
export const div = (a: Q, b: Q) => q(a.n * b.d, a.d * b.n);
export const eq = (a: Q, b: Q) => a.n === b.n && a.d === b.d;
export const val = (a: Q) => a.n / a.d;

// True when the fraction has a short exact decimal (denominator only 2s and 5s, at most 3 places).
function shortDecimal(a: Q) {
 let d = a.d, places = 0;
 while (d % 10 === 0) { d /= 10; places++; }
 while (d % 2 === 0) { d /= 2; places++; }
 while (d % 5 === 0) { d /= 5; places++; }
 return d === 1 && places <= 3;
}

// How a number is shown to students: 12, 2.5, 0.375, or 13 1/3 when there is no short decimal.
export function show(a: Q): string {
 if (a.d === 1) return `${a.n}`;
 if (shortDecimal(a)) return String(Number(val(a).toFixed(3)));
 const whole = Math.trunc(a.n / a.d), rest = Math.abs(a.n % a.d);
 return whole ? `${whole} ${rest}/${a.d}` : `${a.n}/${a.d}`;
}
export const money = (a: Q | number) => `$${(typeof a === 'number' ? a : val(a)).toFixed(2)}`;
export const pct = (x: number) => `${Number((x * 100).toFixed(1))}%`;

// Reads what a student types: "12", "2.5", ".5", "3/4", "13 1/3", "$4.50", "52.5 km".
export function parse(text: string): Q | null {
 const s = text.trim().replace(/[−–]/g, '-').replace(/,/g, '').replace(/^\$/, '').replace(/\s*[a-zA-Z%][a-zA-Z%\s.]*$/, '').trim();
 if (!s) return null;
 let m = s.match(/^(\d+)\s+(\d+)\s*\/\s*(\d+)$/);
 if (m) return Number(m[3]) === 0 ? null : add(q(Number(m[1])), q(Number(m[2]), Number(m[3])));
 m = s.match(/^(-?\d+)\s*\/\s*(\d+)$/);
 if (m) return Number(m[2]) === 0 ? null : q(Number(m[1]), Number(m[2]));
 m = s.match(/^(-?)(\d*)\.?(\d*)$/);
 if (m && (m[2] || m[3])) {
  const digits = m[3] ?? '';
  const scale = 10 ** digits.length;
  const whole = Number(m[2] || '0') * scale + Number(digits || '0');
  return q(m[1] ? -whole : whole, scale);
 }
 return null;
}

// A typed answer counts if it is exact, or a decimal within half a hundredth (so 13.33 works for 13 1/3).
export function close(ans: Q, want: Q, typed: string) {
 return eq(ans, want) || (typed.includes('.') && Math.abs(val(ans) - val(want)) < 0.006);
}

// ---- Paint color model ----
// The mixer colors paint by one number only: the share of the paint that is blue.
// That is the point of the model (same ratio, same share, same color). Real paint mixing is
// more complicated, and the teacher guide says so.
const stops: [number, [number, number, number]][] = [
 [0, [246, 210, 58]], [0.2, [196, 207, 52]], [0.35, [126, 186, 62]], [0.5, [44, 156, 92]],
 [0.65, [24, 132, 128]], [0.8, [30, 98, 176]], [1, [36, 66, 166]]
];
export function paint(blue: number, yellow: number): string {
 if (blue + yellow === 0) return '#eef2f4';
 const s = blue / (blue + yellow);
 let i = 0;
 while (i < stops.length - 2 && s > stops[i + 1][0]) i++;
 const [s0, c0] = stops[i], [s1, c1] = stops[i + 1];
 const t = (s - s0) / (s1 - s0);
 const c = c0.map((v, k) => Math.round(v + (c1[k] - v) * t));
 return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
}

export const rand = (lo: number, hi: number) => lo + Math.floor(Math.random() * (hi - lo + 1));
export const pick = <T,>(a: readonly T[]) => a[Math.floor(Math.random() * a.length)];
export const shuffle = <T,>(a: readonly T[]) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };

// Nice tick spacing for a 0..max axis.
export function ticks(max: number, count = 6) {
 const raw = max / count, mag = 10 ** Math.floor(Math.log10(raw || 1));
 const step = [1, 2, 2.5, 5, 10].map(m => m * mag).find(s => max / s <= count) ?? mag * 10;
 const out: number[] = [];
 for (let t = 0; t <= max + 1e-9; t += step) out.push(Number(t.toFixed(6)));
 return out;
}
