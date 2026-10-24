import { useState } from 'react';
import { ONE, pow, q, say, sub, div } from './frac';
import { Frac, Num } from './MathText';

type Pic = 'halves' | 'thirds';
type Rect = { x: number; y: number; w: number; h: number };
const MAX = 12;
const S = 300; // drawing size in SVG units

// 1/2 + 1/4 + ⋯: each piece is half of what is left, splitting the leftover
// rectangle alternately left/right and top/bottom.
function halves(count: number) {
 const pieces: Rect[] = [];
 let left: Rect = { x: 0, y: 0, w: 1, h: 1 };
 for (let k = 1; k <= count; k++) {
  if (k % 2) { pieces.push({ ...left, w: left.w / 2 }); left = { ...left, x: left.x + left.w / 2, w: left.w / 2 }; }
  else { pieces.push({ ...left, h: left.h / 2 }); left = { ...left, y: left.y + left.h / 2, h: left.h / 2 }; }
 }
 return { pieces, left };
}

// 1/4 + 1/16 + ⋯: split the current square in four, shade one quarter, set two
// same-size quarters beside it, and repeat inside the last quarter.
function thirds(count: number) {
 const levels: { shaded: Rect; a: Rect; b: Rect }[] = [];
 let sq = { x: 0, y: 0, s: 1 };
 for (let k = 1; k <= count; k++) {
  const h = sq.s / 2;
  levels.push({ shaded: { x: sq.x, y: sq.y, w: h, h }, a: { x: sq.x + h, y: sq.y, w: h, h }, b: { x: sq.x + h, y: sq.y + h, w: h, h } });
  sq = { x: sq.x, y: sq.y + h, s: h };
 }
 return { levels, left: { x: sq.x, y: sq.y, w: sq.s, h: sq.s } };
}

const box = (r: Rect, cls: string, key: string | number, label?: string) => <g key={key} className={cls}>
 <rect x={r.x * S} y={r.y * S} width={r.w * S} height={r.h * S} />
 {label && r.w * S >= 34 && r.h * S >= 24 && <text x={(r.x + r.w / 2) * S} y={(r.y + r.h / 2) * S} dy="0.35em" textAnchor="middle" fontSize={Math.min(22, r.w * S / 3, r.h * S / 2)}>{label}</text>}
</g>;

export default function Pictures() {
 const [pic, setPic] = useState<Pic>('halves');
 const [n, setN] = useState(1);
 const ratio = pic === 'halves' ? q(1, 2) : q(1, 4);
 const target = pic === 'halves' ? ONE : q(1, 3);
 const rn = pow(ratio, n);
 // Partial sum of a + ar + ⋯ + ar^(n-1) with a = r: r(1 − rⁿ)/(1 − r).
 const sum = div(sub(ratio, pow(ratio, n + 1)), sub(ONE, ratio));
 const gap = sub(target, sum);
 const choose = (p: Pic) => { setPic(p); setN(1); };

 const terms = Array.from({ length: Math.min(n, 4) }, (_, i) => pow(ratio, i + 1));
 const drawing = pic === 'halves'
  ? (() => { const { pieces, left } = halves(n); return <>
     {pieces.map((r, i) => box(r, `gs-piece ${i % 2 ? 'alt' : ''} ${i === n - 1 ? 'gs-new' : ''}`, i, i < 5 ? say(pow(ratio, i + 1)) : undefined))}
     {box(left, 'gs-leftover', 'left', n < 7 ? 'left' : undefined)}
    </>; })()
  : (() => { const { levels, left } = thirds(n); return <>
     {levels.map((l, i) => <g key={i} className={i === n - 1 ? 'gs-new' : ''}>
      {box(l.shaded, `gs-piece ${i % 2 ? 'alt' : ''}`, 's', i < 3 ? say(pow(ratio, i + 1)) : undefined)}
      {box(l.a, 'gs-twin-a', 'a')}{box(l.b, 'gs-twin-b', 'b')}
     </g>)}
     {box(left, 'gs-leftover', 'left')}
    </>; })();

 return <div className="gs-panel">
  <div className="gs-seg" role="group" aria-label="Picture">
   <button aria-pressed={pic === 'halves'} onClick={() => choose('halves')}>½ + ¼ + ⅛ + ⋯</button>
   <button aria-pressed={pic === 'thirds'} onClick={() => choose('thirds')}>¼ + 1⁄16 + 1⁄64 + ⋯</button>
  </div>

  <div className="gs-two">
   <figure className="gs-figure">
    <svg viewBox={`-2 -2 ${S + 4} ${S + 4}`} role="img" aria-label={pic === 'halves'
     ? `A unit square with ${n} pieces shaded. The shaded area is ${say(sum)} and the unshaded leftover is ${say(gap)}.`
     : `A unit square. At each of ${n} levels one quarter is shaded and two equal quarters beside it are set aside. Shaded area so far: ${say(sum)}.`}>
     <rect className="gs-frame" x={0} y={0} width={S} height={S} />
     {drawing}
    </svg>
    <figcaption>The whole square has area 1.</figcaption>
   </figure>

   <div className="gs-side">
    <div className="gs-readout" aria-live="polite">
     <div><span>Pieces added</span><strong>{n}</strong></div>
     <div><span>Shaded so far</span><strong><Num v={sum} /></strong></div>
     <div><span>{pic === 'halves' ? 'Unshaded leftover' : 'Short of ⅓ by'}</span><strong><Num v={gap} /></strong></div>
    </div>
    <p className="gs-series" aria-label={`${terms.map(say).join(' plus ')}${n > 4 ? ' plus more' : ''}`}>
     {terms.map((t, i) => <span key={i}>{i > 0 && ' + '}<Num v={t} /></span>)}{n > 4 && <> + ⋯ + <Num v={rn} /></>}
     {' = '}<Num v={sum} />
    </p>
    <div className="gs-row">
     <button className="gs-primary" disabled={n >= MAX} onClick={() => setN(n + 1)}>Add the next piece</button>
     <button disabled={n >= MAX} onClick={() => setN(MAX)}>Jump to {MAX}</button>
     <button disabled={n === 1} onClick={() => setN(1)}>Start over</button>
    </div>
    {pic === 'halves'
     ? <p>Shade half the square, then half of what is left, then half of <em>that</em>. The leftover is always exactly the size of the piece you just shaded, <Num v={rn} />. Every step cuts it in half again, so you can make it smaller than any amount you name.</p>
     : <p>Each level splits a square in four: one quarter is shaded, and the two quarters beside it (orange and purple) are the same size. So at every level the shaded part is exactly one of three equal shares. Repeat forever and the three colors fill the whole square in equal amounts.</p>}
   </div>
  </div>

  <div className="gs-takeaway">
   {pic === 'halves'
    ? <p><strong>So</strong> <Frac top={1} bottom={2} /> + <Frac top={1} bottom={4} /> + <Frac top={1} bottom={8} /> + ⋯ = 1. Adding infinitely many positive numbers <em>can</em> give a finite answer, as long as they shrink fast enough. The leftover never hits zero after finitely many steps, but it closes in on zero, and that limit is what the infinite sum means.</p>
    : <p><strong>So</strong> <Frac top={1} bottom={4} /> + <Frac top={1} bottom={16} /> + <Frac top={1} bottom={64} /> + ⋯ = <Frac top={1} bottom={3} />, and you didn't need a formula, only the picture. Notice what both pictures share: every term is the previous term times the same number (½ in the first, ¼ in the second). That is what makes a series <em>geometric</em>.</p>}
  </div>
 </div>;
}
