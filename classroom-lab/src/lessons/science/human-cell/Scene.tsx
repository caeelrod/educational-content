import { memo, type ReactNode } from 'react';
import {
 CENTROSOME, ER_FROM, ER_RADII, ER_TO, EXO, EXO_T, FREE_RIBOS, GENE, GOLGI, GX, GY, LYSOSOMES, LYSO_R, MITOS, MITO_H, MITO_W,
 NRX, NRY, NUCLEOLUS, NX, NY, PORES, POLYSOME, RIBO_EDGE, SMOOTH_ER, VESICLES,
 cellArc, cellTangent, cellPath, cellPoint, deg, erArc, erPoint, microtubules, nucPoint, rng, type Pt
} from './geometry';
import type { PartId } from './parts';

// Everything here is drawn once and reused: the overview, the zoom lens, and the journey stage
// are all the same picture seen at different zoom levels.
const OUTLINE = cellPath(0), OUTLINE_IN = cellPath(9), OUTLINE_MID = cellPath(4.5), CORTEX = cellPath(14), CORTEX2 = cellPath(18);
const MT = microtubules();
const CHANNELS = [-0.5, 0.95, 2.2, -2.6, 1.7, -1.2];

const rand = rng(11);
const CHROMATIN = Array.from({ length: 11 }, () => {
 let t = rand() * Math.PI * 2, k = 0.25 + rand() * 0.5;
 let [x, y] = [NX + Math.cos(t) * NRX * k, NY + Math.sin(t) * NRY * k];
 let a = rand() * Math.PI * 2;
 let d = `M${x.toFixed(1)} ${y.toFixed(1)}`;
 for (let i = 0; i < 9; i++) {
  a += (rand() - 0.5) * 2.2;
  let nx = x + Math.cos(a) * 9, ny = y + Math.sin(a) * 9;
  if (((nx - NX) / (NRX - 14)) ** 2 + ((ny - NY) / (NRY - 14)) ** 2 > 1) { a += Math.PI; nx = x + Math.cos(a) * 9; ny = y + Math.sin(a) * 9; }
  const qx = (x + nx) / 2 + Math.cos(a + 1.57) * 4, qy = (y + ny) / 2 + Math.sin(a + 1.57) * 4;
  d += `Q${qx.toFixed(1)} ${qy.toFixed(1)} ${nx.toFixed(1)} ${ny.toFixed(1)}`;
  x = nx; y = ny;
 }
 return d;
});
const NUCLEOLUS_GRAINS = Array.from({ length: 22 }, () => {
 const t = rand() * Math.PI * 2, r = Math.sqrt(rand()) * 22;
 return [NUCLEOLUS[0] + Math.cos(t) * r, NUCLEOLUS[1] + Math.sin(t) * r] as Pt;
});
const ENZYMES = LYSOSOMES.map(() => Array.from({ length: 8 }, () => {
 const t = rand() * Math.PI * 2, r = 3 + rand() * 9;
 return [Math.cos(t) * r, Math.sin(t) * r] as Pt;
}));
const POLY_TURN = FREE_RIBOS.map((_, i) => i === 0 ? 0 : Math.round(rand() * 360));

// Ribosomes on the rough ER: along the outside of every sac, plus the inside of the first one.
const ER_RIBOS: { p: Pt; a: number; out: boolean }[] = [];
ER_RADII.forEach((r, i) => {
 for (let d = ER_FROM + 2 + (i % 2) * 3; d <= ER_TO - 2; d += 6) ER_RIBOS.push({ p: erPoint(r + RIBO_EDGE, d), a: d, out: true });
 if (i === 0) for (let d = ER_FROM + 4; d <= ER_TO - 2; d += 6) ER_RIBOS.push({ p: erPoint(r - RIBO_EDGE, d), a: d, out: false });
});

function Ribosome({ p, a, out }: { p: Pt; a: number; out: boolean }) {
 const s = out ? 1 : -1, r = deg(a);
 return <g className="hc-ribo">
  <circle cx={p[0]} cy={p[1]} r="2.4" />
  <circle className="hc-ribo-small" cx={p[0] + Math.cos(r) * 2.6 * s} cy={p[1] + Math.sin(r) * 2.6 * s} r="1.6" />
 </g>;
}

function Polysome({ at, turn, hit }: { at: Pt; turn: number; hit: boolean }) {
 const xs = [-9, -3, 3, 9];
 return <g transform={`translate(${at[0]} ${at[1]}) rotate(${turn})`}>
  <path className="hc-mrna" d="M-14 1C-11 -1 -8 3 -5 1S1 -1 4 1 10 3 14 1" />
  {xs.map((x, i) => <g key={x}>
   <path className="hc-chain" d={`M${x + 3} -3.2` + Array.from({ length: i + 2 }, (_, k) => `L${x + 3 + (k % 2 ? 1.6 : -1)} ${-4.6 - k * 1.5}`).join('')} />
   <circle className="hc-ribo-large" cx={x} cy={0.3} r="2.6" />
   <circle className="hc-ribo-small" cx={x + 3} cy={-2.3} r="1.7" />
  </g>)}
  {hit && <circle className="hc-hit" r="15" />}
 </g>;
}

function Mito({ x, y, rot }: { x: number; y: number; rot: number }) {
 const w = MITO_W / 2, h = MITO_H / 2;
 return <g transform={`translate(${x} ${y}) rotate(${rot})`}>
  <rect className="hc-mito-out" x={-w} y={-h} width={MITO_W} height={MITO_H} rx={h} />
  <rect className="hc-mito-in" x={-w + 4} y={-h + 4} width={MITO_W - 8} height={MITO_H - 8} rx={h - 4} />
  {[-27, -18, -9, 0, 9, 18, 27].map((cx, i) => <path key={cx} className="hc-crista" d={i % 2 ? `M${cx} ${h - 4}V${-2}` : `M${cx} ${-h + 4}V${2}`} />)}
  <circle className="hc-mtdna" cx="10" cy="4" r="2.6" />
  {[[-34, 2], [22, -8], [32, 6], [-14, -9]].map(([gx, gy]) => <circle key={gx} className="hc-granule" cx={gx} cy={gy} r=".9" />)}
 </g>;
}

export type SceneProps = {
 active?: PartId | null; // other parts fade back
 hover?: PartId | null;
 flash?: PartId | null; // pulses, e.g. "show me" in the game
 gene?: boolean; // highlight one gene in the nucleus (protein journey)
 hits?: boolean; // add generous invisible tap targets
 children?: ReactNode; // drawn on top, e.g. journey travellers
};

function SceneInner({ active, hover, flash, gene, hits = false, children }: SceneProps) {
 const cls = (id: PartId) => `hc-part hc-${id}${active === id ? ' on' : ''}${hover === id ? ' hov' : ''}${flash === id ? ' flash' : ''}`;
 const g = (id: PartId) => ({ className: cls(id), 'data-part': id });
 const heads = (inset: number) => {
  const out: Pt[] = [];
  for (let t = -0.72; t <= -0.28; t += 0.0058) out.push(cellPoint(t, inset));
  return out;
 };
 return <g className={`hc-scene${active ? ' has-active' : ''}${hover && hover !== active ? ' has-hover' : ''}`}>
  <rect className="hc-outside" x="-400" y="-400" width="1600" height="1400" />
  <g {...g('cytoplasm')}><path className="hc-cyto" d={OUTLINE} /></g>

  <g {...g('cytoskeleton')}>
   <path className="hc-actin" d={CORTEX} /><path className="hc-actin two" d={CORTEX2} />
   {MT.map(d => <path key={d} className="hc-mt" d={d} />)}
   {hits && MT.map(d => <path key={'h' + d} className="hc-hit-line" d={d} />)}
  </g>

  <g {...g('smoothER')}>
   {SMOOTH_ER.map(d => <path key={d} className="hc-ser" d={d} />)}
   {SMOOTH_ER.map(d => <path key={'l' + d} className="hc-ser-lumen" d={d} />)}
   {hits && SMOOTH_ER.map(d => <path key={'h' + d} className="hc-hit-line" d={d} />)}
  </g>

  <g {...g('roughER')}>
   {ER_RADII.map(r => <path key={r} className="hc-rer" d={erArc(r)} />)}
   {ER_RADII.map(r => <path key={'l' + r} className="hc-rer-lumen" d={erArc(r)} />)}
   {hits && <path className="hc-hit-line wide" d={erArc(150)} />}
  </g>

  <g {...g('nucleus')}>
   <ellipse className="hc-env" cx={NX} cy={NY} rx={NRX} ry={NRY} />
   <ellipse className="hc-nucleoplasm" cx={NX} cy={NY} rx={NRX - 5} ry={NRY - 5} />
   {CHROMATIN.map(d => <path key={d} className="hc-chromatin" d={d} />)}
   <path className={`hc-gene${gene ? ' on' : ''}`} d={GENE} />
   {PORES.map(t => {
    const [x, y] = nucPoint(t, 2.5);
    const a = Math.atan2(Math.sin(t) / NRY, Math.cos(t) / NRX) * 180 / Math.PI;
    return <g key={t} transform={`translate(${x} ${y}) rotate(${a})`} className="hc-pore">
     <rect x="-4" y="-3.2" width="8" height="6.4" rx="1.6" /><circle cx="-3" cy="-3.6" r="1.7" /><circle cx="-3" cy="3.6" r="1.7" /><circle cx="3" cy="-3.6" r="1.7" /><circle cx="3" cy="3.6" r="1.7" />
    </g>;
   })}
  </g>

  <g {...g('nucleolus')}>
   <circle className="hc-nucleolus" cx={NUCLEOLUS[0]} cy={NUCLEOLUS[1]} r="27" />
   {NUCLEOLUS_GRAINS.map(([x, y], i) => <circle key={i} className="hc-grain" cx={x} cy={y} r="1.5" />)}
  </g>

  <g {...g('golgi')}>
   {GOLGI.map(({ r, a }) => {
    const [x0, y0] = [GX - r * Math.cos(a), GY - r * Math.sin(a)], [x1, y1] = [GX - r * Math.cos(a), GY + r * Math.sin(a)];
    const d = `M${x0.toFixed(1)} ${y0.toFixed(1)}A${r} ${r} 0 0 0 ${x1.toFixed(1)} ${y1.toFixed(1)}`;
    return <g key={r}>
     <path className="hc-golgi" d={d} /><path className="hc-golgi-lumen" d={d} />
     <circle className="hc-golgi-end" cx={x0} cy={y0} r="5" /><circle className="hc-golgi-end" cx={x1} cy={y1} r="5" />
    </g>;
   })}
   {hits && <rect className="hc-hit" x="580" y="235" width="68" height="130" rx="20" />}
  </g>

  <g {...g('mitochondria')}>{MITOS.map(m => <Mito key={m.x} {...m} />)}</g>

  <g {...g('lysosomes')}>
   {LYSOSOMES.map(([x, y], i) => <g key={x} transform={`translate(${x} ${y})`}>
    <circle className="hc-lyso" r={LYSO_R} />
    {i === 0 && <path className="hc-old" d="M1 -7c5-2 9 1 8 5s-5 4-7 2-4-5-1-7z" />}
    {ENZYMES[i].map(([ex, ey], k) => <path key={k} className="hc-enzyme" d={`M${ex - 1.4} ${ey}a1.4 1.4 0 1 1 2.8 0l-1.4 1.6z`} />)}
   </g>)}
  </g>

  <g {...g('vesicles')}>
   {VESICLES.map(([x, y]) => <g key={x}><circle className="hc-vesicle" cx={x} cy={y} r="8" />
    {[[-2.5, -1], [2, 2], [1.5, -3]].map(([dx, dy]) => <circle key={dx} className="hc-cargo" cx={x + dx} cy={y + dy} r="1.4" />)}</g>)}
   <circle className="hc-vesicle" cx={EXO[0]} cy={EXO[1]} r="9" />
   {[-9, -15, -12, -20].map((inset, i) => {
    const [x, y] = cellPoint(EXO_T + (i - 1.5) * 0.025, inset);
    return <circle key={i} className="hc-cargo" cx={x} cy={y} r="1.4" />;
   })}
   {hits && VESICLES.map(([x, y]) => <circle key={'h' + x} className="hc-hit" cx={x} cy={y} r="13" />)}
  </g>

  <g {...g('ribosomes')}>
   {ER_RIBOS.map(r => <Ribosome key={`${r.p[0]},${r.p[1]}`} {...r} />)}
   {FREE_RIBOS.map((p, i) => <Polysome key={p[0]} at={p} turn={POLY_TURN[i]} hit={hits} />)}
  </g>

  <g {...g('centrosome')}>
   <circle className="hc-pcm" cx={CENTROSOME[0]} cy={CENTROSOME[1]} r="17" />
   <g transform={`translate(${CENTROSOME[0]} ${CENTROSOME[1]})`}>
    <g className="hc-centriole" transform="translate(-8 0)"><rect x="-9" y="-4" width="18" height="8" rx="2" /><path d="M-7 -1.6H7M-7 1.6H7" /></g>
    <g className="hc-centriole" transform="translate(9 -10) rotate(90)"><rect x="-9" y="-4" width="18" height="8" rx="2" /><path d="M-7 -1.6H7M-7 1.6H7" /></g>
   </g>
   {hits && <circle className="hc-hit" cx={CENTROSOME[0]} cy={CENTROSOME[1]} r="24" />}
  </g>

  <g {...g('membrane')}>
   <path className="hc-tails" d={OUTLINE_MID} />
   <path className="hc-heads" d={OUTLINE} /><path className="hc-heads" d={OUTLINE_IN} />
   {heads(1.1).concat(heads(7.9)).map(([x, y], i) => <circle key={i} className="hc-head" cx={x} cy={y} r="1.25" />)}
   <path className="hc-tail-lines" d={cellArc(-0.72, -0.28, 2.7)} /><path className="hc-tail-lines" d={cellArc(-0.72, -0.28, 6.3)} />
   {CHANNELS.map(t => {
    const [x, y] = cellPoint(t, 4.5);
    return <g key={t} className="hc-channel" transform={`translate(${x} ${y}) rotate(${cellTangent(t)})`}>
     <rect x="-4.5" y="-9" width="4" height="18" rx="2" /><rect x=".5" y="-9" width="4" height="18" rx="2" />
    </g>;
   })}
   {hits && <path className="hc-hit-line wide" d={OUTLINE_MID} />}
  </g>
  {children}
 </g>;
}

export const Scene = memo(SceneInner);
export { POLYSOME };
