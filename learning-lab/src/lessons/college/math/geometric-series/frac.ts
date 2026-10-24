// Exact fractions for answers and small worked examples. Values here stay small
// (practice problems, n ≤ 8 in the derivation), so plain numbers are enough.
export type Q = { n: number; d: number };

const gcd = (a: number, b: number): number => b === 0 ? Math.abs(a) : gcd(b, a % b);

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
export const neg = (a: Q) => q(-a.n, a.d);
export const eq = (a: Q, b: Q) => a.n === b.n && a.d === b.d;
export const val = (a: Q) => a.n / a.d;
export const abs = (a: Q) => q(Math.abs(a.n), a.d);
export const ONE = q(1);

export function pow(a: Q, k: number): Q {
 if (k < 0) return pow(div(ONE, a), -k);
 let r = ONE;
 for (let i = 0; i < k; i++) r = mul(r, a);
 return r;
}

export const fmt = (a: Q) => a.d === 1 ? `${a.n}` : `${a.n}/${a.d}`;
// Text for screen readers and plain-text feedback: "−3/4" with a real minus sign.
export const say = (a: Q) => fmt(a).replace('-', '−');

// Nearest simple fraction (denominator ≤ 20) to a slider value.
export function fromSlider(x: number): Q {
 let best = q(Math.round(x * 20), 20), err = Infinity;
 for (let d = 1; d <= 20; d++) {
  const n = Math.round(x * d), e = Math.abs(n / d - x);
  if (e < err - 1e-9) { err = e; best = q(n, d); }
 }
 return best;
}

// Reads what a student types: "3/4", "-3/4", "−3 / 4", "1.25", "2", "(3/4)".
export function parse(text: string): Q | null {
 const s = text.replace(/[−–]/g, '-').replace(/[\s()]/g, '');
 if (!s) return null;
 let m = s.match(/^(-?\d+)\/(-?\d+)$/);
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

// Short decimal for readouts: up to 6 significant digits, no trailing zeros.
export function dec(x: number, digits = 6): string {
 if (!isFinite(x)) return x > 0 ? '∞' : '−∞';
 if (Math.abs(x) < 1e-12) return '0';
 const a = Math.abs(x);
 const s = a >= 1e7 || a < 1e-5 ? x.toExponential(2) : String(Number(x.toPrecision(digits)));
 return s.replace('-', '−');
}
