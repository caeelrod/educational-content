import { shells, valence, type Element } from './elements';

/** How many dots go on each side (top, right, bottom, left) of a Lewis symbol: one per side first, then pairs. */
export function dotSides(n: number, sym?: string) {
 if (sym === 'He') return [2, 0, 0, 0];
 return [0, 1, 2, 3].map(k => (n > k ? 1 : 0) + (n > k + 4 ? 1 : 0));
}

/**
 * A Lewis dot symbol drawn at (x, y). `dots` lists a class for each valence electron so the
 * ionic builder can color electrons by the atom they came from.
 */
export function LewisSymbol({ x, y, sym, dots, size = 1, sup, brackets }: { x: number; y: number; sym: string; dots: string[]; size?: number; sup?: string; brackets?: boolean }) {
 const sides = dotSides(dots.length, sym);
 const d = 22 * size, gap = 5 * size, rDot = 3.4 * size;
 const out: { cx: number; cy: number; cls: string }[] = [];
 let k = 0;
 const dirs = [[0, -1], [1, 0], [0, 1], [-1, 0]];
 sides.forEach((count, s) => {
  const [dx, dy] = dirs[s];
  for (let j = 0; j < count; j++) {
   const off = count === 1 ? 0 : (j ? gap : -gap);
   out.push({ cx: x + dx * d + (dy ? off : 0), cy: y + dy * d + (dx ? off : 0), cls: dots[k++] });
  }
 });
 return <g>
  {brackets && <>
   <path className="cb-bracket" d={`M${x - d - 8 * size},${y - d - 6 * size} h-5 v${2 * d + 12 * size} h5`} />
   <path className="cb-bracket" d={`M${x + d + 8 * size},${y - d - 6 * size} h5 v${2 * d + 12 * size} h-5`} />
  </>}
  <text x={x} y={y} className="cb-lewis-sym" style={{ fontSize: 22 * size }} textAnchor="middle" dominantBaseline="central">{sym}</text>
  {sup && <text x={x + (brackets ? d + 16 * size : 14 * size)} y={y - d + (brackets ? -2 : 6) * size} className="cb-lewis-sup" style={{ fontSize: 14 * size }}>{sup}</text>}
  {out.map((p, i) => <circle key={i} cx={p.cx} cy={p.cy} r={rDot} className={`cb-e ${p.cls}`} />)}
 </g>;
}

/** Shell (Bohr) model: a counting diagram, not a picture of where electrons really are. */
export function ShellModel({ e }: { e: Element }) {
 const sh = shells(e), C = 120;
 const radius = (i: number) => 30 + i * 19;
 return <svg viewBox="0 0 240 240" role="img" aria-label={`Shell model of ${e.name}: ${sh.join(', ')} electrons in shells 1 to ${sh.length}; ${valence(e)} in the outer shell.`}>
  {sh.map((_, i) => <circle key={i} cx={C} cy={C} r={radius(i)} className={`cb-ring ${i === sh.length - 1 ? 'outer' : ''}`} />)}
  <circle cx={C} cy={C} r={19} className="cb-nucleus" />
  <text x={C} y={C} textAnchor="middle" dominantBaseline="central" className="cb-nucleus-label">{e.z}+</text>
  {sh.map((n, i) => Array.from({ length: n }, (_, j) => {
   const a = -Math.PI / 2 + (2 * Math.PI * j) / n + i * 0.35;
   return <circle key={`${i}-${j}`} cx={C + radius(i) * Math.cos(a)} cy={C + radius(i) * Math.sin(a)} r={4.2} className={`cb-e ${i === sh.length - 1 ? 'val' : 'core'}`} />;
  }))}
 </svg>;
}
