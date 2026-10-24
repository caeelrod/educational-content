// Exact, string-based decimal logic for Decimal Magnets. No floating point is used anywhere,
// so 0.1 × 100 is always 10, never 10.000000000000002.
//
// A number on the board is a row of significant digits plus the position of the decimal point.
// `point` counts how many slots sit to the LEFT of the point, measured from the first digit:
//   digits "4072", point 1  →  4.072
//   digits "4072", point 4  →  4072
//   digits "45",   point 3  →  450     (slot 2 is a placeholder zero)
//   digits "45",   point -1 →  0.045   (slot -1 is a placeholder zero)

export type Num = { digits: string; point: number };
export type Op = 'times' | 'divide';
export type Call = { op: Op; power: number };

export const MAX_WHOLE_DIGITS = 7;   // up to millions
export const MAX_DECIMAL_PLACES = 4; // down to ten-thousandths

export type Settings = {
 maxPower: 1 | 2 | 3 | 4;
 ops: 'both' | 'times' | 'divide';
 start: 'whole' | 'decimal' | 'mixed';
 size: 'small' | 'medium' | 'large';
 callFormat: 'number' | 'power' | 'mixed';
 challenge: 'move' | 'mystery' | 'mix';
 commas: boolean;
 predict: boolean;
 chain: boolean;
 teacherCalls: boolean;
};

export const wholeDigits = (n: Num) => Math.max(n.point, 0);
export const decimalPlaces = (n: Num) => Math.max(n.digits.length - n.point, 0);
export const fits = (n: Num) => wholeDigits(n) <= MAX_WHOLE_DIGITS && decimalPlaces(n) <= MAX_DECIMAL_PLACES;

export function apply(n: Num, call: Call): Num {
 return { digits: n.digits, point: n.point + (call.op === 'times' ? call.power : -call.power) };
}

/** Gaps (by slot index on their right) where commas belong: every 3 places left of the point. */
export function commaGaps(point: number): number[] {
 const gaps: number[] = [];
 for (let g = point - 3; g > 0; g -= 3) gaps.push(g);
 return gaps;
}

/** The whole-number and decimal parts as plain digit strings, with placeholder zeros filled in. */
export function parts(n: Num): { whole: string; decimal: string } {
 const { digits, point } = n;
 if (point <= 0) return { whole: '0', decimal: '0'.repeat(-point) + digits };
 if (point >= digits.length) return { whole: digits + '0'.repeat(point - digits.length), decimal: '' };
 return { whole: digits.slice(0, point), decimal: digits.slice(point) };
}

export function format(n: Num, commas = true): string {
 const { whole, decimal } = parts(n);
 const w = commas ? whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : whole;
 return decimal ? `${w}.${decimal}` : w;
}

/** What the board reads with the student's own comma placement (used for screen-reader text). */
export function formatWithCommas(n: Num, gaps: Set<number>): string {
 let out = '';
 const first = Math.min(0, n.point - 1);
 const last = Math.max(n.digits.length, n.point) - 1;
 for (let i = first; i <= last; i++) {
  if (i === n.point) out += '.';
  else if (gaps.has(i) && i > first) out += ',';
  out += i >= 0 && i < n.digits.length ? n.digits[i] : '0';
 }
 return out;
}

/** Parses something a teacher types, like "4,072.5" or ".045". Returns null if it won't fit. */
export function parse(text: string): Num | null {
 const t = text.replace(/[,\s]/g, '');
 if (!/^\d*\.?\d*$/.test(t) || !/\d/.test(t)) return null;
 const [w = '', d = ''] = t.split('.');
 const all = w + d;
 const lead = all.search(/[1-9]/);
 if (lead < 0) return null; // zero has nothing to move
 const trimmed = all.slice(lead).replace(/0+$/, '');
 const n = { digits: trimmed, point: w.length - lead };
 return fits(n) && trimmed.length <= 7 ? n : null;
}

export const powerOfTen = (p: number) => '1' + '0'.repeat(p);
export const powerWithCommas = (p: number) => format({ digits: '1', point: p + 1 });
const powerWords = ['one', 'ten', 'one hundred', 'one thousand', 'ten thousand'];
const superscripts = '⁰¹²³⁴';
export const exponentForm = (p: number) => `10${superscripts[p]}`;
export const callWords = (c: Call) => `${c.op === 'times' ? 'Multiply' : 'Divide'} by ${powerWords[c.power]}`;
export const opSymbol = (op: Op) => (op === 'times' ? '×' : '÷');

export const placeNames: Record<number, string> = {
 6: 'millions', 5: 'hundred thousands', 4: 'ten thousands', 3: 'thousands', 2: 'hundreds', 1: 'tens', 0: 'ones',
 [-1]: 'tenths', [-2]: 'hundredths', [-3]: 'thousandths', [-4]: 'ten-thousandths', [-5]: 'hundred-thousandths',
 [-6]: 'millionths', [-7]: 'ten-millionths', [-8]: 'hundred-millionths'
};

/** Place value (as a power of ten) of the digit sitting in slot i. */
export const placeOf = (n: Num, slot: number) => n.point - 1 - slot;

// ---------- Generating problems ----------

const pick = <T,>(items: readonly T[]) => items[Math.floor(Math.random() * items.length)];
const randInt = (lo: number, hi: number) => lo + Math.floor(Math.random() * (hi - lo + 1));

function randomDigits(len: number): string {
 let s = String(randInt(1, 9));
 for (let i = 1; i < len - 1; i++) s += Math.random() < 0.18 ? '0' : String(randInt(1, 9));
 if (len > 1) s += String(randInt(1, 9));
 return s;
}

export function randomNumber(s: Settings): Num {
 const len = s.size === 'small' ? randInt(2, 3) : s.size === 'medium' ? randInt(3, 4) : randInt(4, 6);
 const digits = randomDigits(len);
 const decimal = s.start === 'decimal' || (s.start === 'mixed' && Math.random() < 0.5);
 let point: number;
 if (!decimal) {
  const zeros = Math.random() < 0.3 ? randInt(1, s.size === 'large' ? 2 : 1) : 0;
  point = len + zeros;
 } else if (Math.random() < 0.2) {
  point = randInt(-1, 0); // e.g. 0.45 or 0.045
 } else {
  point = randInt(1, len - 1);
 }
 const n = { digits, point };
 // Pull the point back inside the board limits if needed.
 while (decimalPlaces(n) > MAX_DECIMAL_PLACES) n.point++;
 while (wholeDigits(n) > MAX_WHOLE_DIGITS) n.point--;
 return n;
}

export function allCalls(s: Settings): Call[] {
 const ops: Op[] = s.ops === 'both' ? ['times', 'divide'] : [s.ops];
 const out: Call[] = [];
 for (const op of ops) for (let p = 1; p <= s.maxPower; p++) out.push({ op, power: p });
 return out;
}

export const callFits = (n: Num, c: Call) => fits(apply(n, c));
export const validCalls = (n: Num, s: Settings) => allCalls(s).filter(c => callFits(n, c));

export function randomStart(s: Settings): Num {
 for (let i = 0; i < 100; i++) {
  const n = randomNumber(s);
  if (validCalls(n, s).length) return n;
 }
 return { digits: '4072', point: 1 };
}

/** Picks a call, favoring a mix of directions and sizes over many turns. */
export function randomCall(n: Num, s: Settings, previous?: Call): Call {
 const options = validCalls(n, s);
 const fresh = options.filter(c => !previous || c.op !== previous.op || c.power !== previous.power);
 return pick(fresh.length ? fresh : options);
}

// ---------- Checking answers ----------

export type PointMistake = 'none' | 'stayed' | 'direction' | 'direction-and-count' | 'count';

export function classifyPoint(start: Num, placed: number, call: Call): PointMistake {
 const expected = call.op === 'times' ? call.power : -call.power;
 const moved = placed - start.point;
 if (moved === expected) return 'none';
 if (moved === 0) return 'stayed';
 if (Math.sign(moved) !== Math.sign(expected)) return Math.abs(moved) === call.power ? 'direction' : 'direction-and-count';
 return 'count';
}

export type CommaCheck = { ok: boolean; missing: number[]; extra: number[]; inDecimal: boolean };

export function checkCommas(n: Num, placed: Set<number>): CommaCheck {
 const want = new Set(commaGaps(n.point));
 const missing = [...want].filter(g => !placed.has(g));
 const extra = [...placed].filter(g => !want.has(g));
 return { ok: !missing.length && !extra.length, missing, extra, inDecimal: extra.some(g => g > n.point) };
}

/** Comma practice only happens when there is something to decide: four or more digits showing. */
export const needsCommaStep = (n: Num) => {
 const { whole, decimal } = parts(n);
 return whole.length + decimal.length >= 4;
};
