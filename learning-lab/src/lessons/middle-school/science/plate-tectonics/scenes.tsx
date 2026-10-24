import type { ReactNode } from 'react';
import { between, bendingPlate, bump, firstBelow, line, offset, piece, pointAt, poly, range, ribbon, totalLength, type Pt } from './shapes';

// Cross-sections are 800 × 360 and stretched vertically so thin layers are visible.
export const SEA = 120;
export type SceneProps = { t: number; labels: boolean; quakes: boolean };
const clamp = (v: number) => Math.max(0, Math.min(1, v));

function Arrow({ x, y, dir }: { x: number; y: number; dir: 1 | -1 }) {
 const L = 64, h = 9, hw = 18, tip = x + dir * L / 2, back = x - dir * L / 2, neck = tip - dir * hw;
 return <path className="pt-arrow" d={`M${back} ${y - h / 2} L${neck} ${y - h / 2} L${neck} ${y - h} L${tip} ${y} L${neck} ${y + h} L${neck} ${y + h / 2} L${back} ${y + h / 2}Z`} />;
}
function Quake({ p }: { p: Pt }) {
 const depth = p[1] < 210 ? 'shallow' : p[1] < 285 ? 'mid' : 'deep';
 return <circle className={`pt-quake ${depth}`} cx={p[0]} cy={p[1]} r={4.2} />;
}
function Volcano({ x, base, h, erupting = true, spread = 1.15 }: { x: number; base: number; h: number; erupting?: boolean; spread?: number }) {
 if (h <= 1) return null;
 const w = h * spread;
 return <g className="pt-volcano">
  <path d={`M${x - w} ${base + 2} L${x - 5} ${base - h} L${x + 5} ${base - h} L${x + w} ${base + 2}Z`} />
  {erupting && <path className="pt-lava" d={`M${x - 5} ${base - h} L${x + 5} ${base - h} L${x + 2} ${base - h + Math.min(14, h * 0.5)} L${x - 1} ${base - h + Math.min(9, h * 0.35)}Z`} />}
  {erupting && <path className="pt-plume" d={`M${x} ${base - h - 3} q -6 -8 0 -14 q 7 -6 2 -14`} />}
 </g>;
}
function Label({ x, y, children, anchor = 'middle', small }: { x: number; y: number; children: ReactNode; anchor?: 'start' | 'middle' | 'end'; small?: boolean }) {
 return <text className={`pt-scene-label${small ? ' small' : ''}`} x={x} y={y} textAnchor={anchor}>{children}</text>;
}
// Alternating stripes along a plate's crust, so you can see the plate move.
function Bands({ path, shift, thick, spacing = 40 }: { path: Pt[]; shift: number; thick: number; spacing?: number }) {
 const len = totalLength(path), out: ReactNode[] = [];
 for (let u = (shift % spacing) - spacing; u < len; u += spacing) {
  const u0 = Math.max(0, u), u1 = Math.min(len, u + spacing / 2);
  if (u1 > u0) out.push(<path key={u} className="pt-band" d={ribbon(piece(path, u0, u1), 0, thick)} />);
 }
 return <>{out}</>;
}

// ---------- Divergent: mid-ocean ridge ----------
export function Ridge({ t, labels, quakes }: SceneProps) {
 const xs = range(-20, 820, 10);
 const sf = (x: number) => 146 + 40 * Math.sqrt(Math.min(1, Math.abs(x - 400) / 400));
 const lb = (x: number) => 172 + 85 * Math.sqrt(Math.min(1, Math.abs(x - 400) / 400));
 const top: Pt[] = xs.map(x => [x, sf(x)]), cb: Pt[] = xs.map(x => [x, sf(x) + 14]), base: Pt[] = xs.map(x => [x, lb(x)]);
 const slice = (a: number, b: number) => { const s = range(Math.min(a, b), Math.max(a, b), 4); return poly(s.map(x => [x, sf(x)] as Pt), s.map(x => [x, sf(x) + 14] as Pt)); };
 const shift = (t * 176) % 44, bands: ReactNode[] = [];
 for (let k = 0; k < 12; k++) {
  const d0 = Math.max(0, shift + 44 * (k - 1)), d1 = Math.max(0, shift + 44 * (k - 1) + 22);
  if (d1 > d0) [1, -1].forEach(s => bands.push(<path key={`${k}${s}`} className="pt-band" d={slice(400 + s * d0, 400 + s * d1)} />));
 }
 return <g>
  <rect className="pt-water" x={0} y={SEA} width={800} height={240} />
  <path className="pt-asth" d={poly(base, xs.map(x => [x, 380] as Pt))} />
  <path className="pt-lith" d={poly(cb, base)} />
  <path className="pt-ocrust" d={poly(top, cb)} />
  {bands}
  <path className="pt-newcrust" d={slice(392, 408)} />
  <ellipse className="pt-magma" cx={400} cy={170} rx={26} ry={7} />
  <path className="pt-flow" d="M360 340 C 370 280, 390 230, 394 186 M440 340 C 430 280, 410 230, 406 186" />
  <circle className="pt-pillow" cx={396} cy={146} r={3.5} /><circle className="pt-pillow" cx={404} cy={147} r={3} />
  <Arrow x={230} y={214} dir={-1} /><Arrow x={570} y={214} dir={1} />
  {quakes && ([[372, 162], [428, 164], [388, 172], [414, 175], [356, 170], [446, 168]] as Pt[]).map((p, i) => <Quake key={i} p={p} />)}
  {labels && <>
   <Label x={400} y={138}>Mid-ocean ridge</Label>
   <Label x={400} y={298}>Hot rock rises and partly melts</Label>
   <Label x={150} y={244}>Ocean plate</Label><Label x={650} y={244}>Ocean plate</Label>
   <Label x={640} y={158} small>Older floor is colder and sits deeper</Label>
   <Label x={470} y={190} anchor="start" small>Magma becomes new ocean floor</Label>
  </>}
 </g>;
}

// ---------- Divergent: continental rift ----------
export function Rift({ t, labels, quakes }: SceneProps) {
 const Y0 = 72, w = 46 + 110 * t, D = 12 + 58 * t, floor = Y0 + D, step = Y0 + D * 0.5;
 const surface: Pt[] = [[-20, Y0], [400 - w - 2, Y0], [400 - w + 3, step], [400 - w + 22, step], [400 - w + 27, floor], [400 + w - 27, floor], [400 + w - 22, step], [400 + w - 3, step], [400 + w + 2, Y0], [820, Y0]];
 const xs = range(-20, 820, 8);
 const cbAt = (x: number) => Math.max(200 - 45 * t * bump(x, 400, w + 60), floor + 14);
 const lbAt = (x: number) => 262 - 110 * t * bump(x, 400, w + 140);
 const ocean = t > 0.72 ? (t - 0.72) / 0.28 * 46 : 0; // half-width of new ocean floor
 const oceanTop = floor + 6;
 const magmaY = cbAt(400) + 10;
 const vk = clamp((t - 0.2) / 0.5);
 const shoulders = [400 - w - 20, 400 + w + 20];
 return <g>
  <path className="pt-asth" d={poly(xs.map(x => [x, lbAt(x)] as Pt), xs.map(x => [x, 380] as Pt))} />
  <path className="pt-lith" d={poly(xs.map(x => [x, cbAt(x) - 1] as Pt), xs.map(x => [x, lbAt(x)] as Pt))} />
  {t > 0.72 && <rect className="pt-water" x={400 - w + 24} y={SEA} width={2 * w - 48} height={floor - SEA + 12} />}
  <path className="pt-ccrust" d={poly(surface, xs.map(x => [x, cbAt(x)] as Pt))} />
  {ocean > 0 && <path className="pt-ocrust" d={`M${400 - ocean} ${oceanTop} L${400 + ocean} ${oceanTop} L${400 + ocean} ${cbAt(400) + 2} L${400 - ocean} ${cbAt(400) + 2}Z`} />}
  {ocean > 0 && <rect className="pt-water" x={400 - ocean} y={floor} width={2 * ocean} height={oceanTop - floor} />}
  {t > 0.25 && t <= 0.72 && <><rect className="pt-water" x={400 - w * 0.55} y={floor - 3} width={w * 0.4} height={3} /><rect className="pt-water" x={400 + w * 0.2} y={floor - 3} width={w * 0.28} height={3} /></>}
  <path className="pt-fault" d={`M${400 - w} ${Y0} L${400 - w + 18} ${cbAt(400 - w)} M${400 + w} ${Y0} L${400 + w - 18} ${cbAt(400 + w)} M${400 - w + 25} ${step} L${400 - w + 40} ${cbAt(400 - w + 30)} M${400 + w - 25} ${step} L${400 + w - 40} ${cbAt(400 + w - 30)}`} />
  {t > 0.15 && <ellipse className="pt-magma" cx={400} cy={magmaY} rx={30 + 20 * t} ry={8} />}
  {vk > 0 && <path className="pt-dike" d={`M392 ${magmaY} L${shoulders[0] + 6} ${Y0} M408 ${magmaY} L${shoulders[1] - 6} ${Y0}`} />}
  {shoulders.map(x => <Volcano key={x} x={x} base={Y0} h={vk > 0 ? 8 + 18 * vk : 0} />)}
  {t > 0.45 && t <= 0.85 && <Volcano x={400 + w * 0.12} base={floor} h={10} />}
  <Arrow x={150} y={150} dir={-1} /><Arrow x={650} y={150} dir={1} />
  {quakes && t > 0.04 && ([[400 - w + 6, 100], [400 - w + 11, 130], [400 - w + 15, 160], [400 + w - 6, 104], [400 + w - 11, 134], [400 + w - 15, 166], [400 - w + 31, 140], [400 + w - 33, 150]] as Pt[]).map((p, i) => <Quake key={i} p={p} />)}
  {labels && <>
   <Label x={400} y={34}>Land stretches and cracks along faults</Label>
   {t > 0.1 && t <= 0.72 && <Label x={400} y={floor - 12} small>Rift valley</Label>}
   {t > 0.72 && <Label x={400} y={SEA - 10} small>{ocean > 12 ? 'Sea floods in; new ocean floor forms' : 'Sea floods in'}</Label>}
   
   {vk > 0 && <Label x={shoulders[1] + 20} y={Y0 - 26} anchor="start" small>Volcanoes</Label>}
   <Label x={150} y={186}>Continent</Label><Label x={650} y={186}>Continent</Label>
   <Label x={400} y={318}>Hot rock rises as the plate thins</Label>
  </>}
 </g>;
}

// ---------- Convergent: one plate sinks under another ----------
function Subduction({ t, labels, quakes, over }: SceneProps & { over: 'continent' | 'ocean' }) {
 const yf = 180, bendX = 290;
 const L = 150 + 270 * t;
 const slab = bendingPlate(yf, bendX, L), full = bendingPlate(yf, bendX, 420);
 const T = firstBelow(full, over === 'continent' ? 206 : 222);
 const M = firstBelow(full, 318);
 const idx = full.findIndex(p => p[1] >= 318);
 const tOn = ((idx - 2) * 6 - 150) / 270;
 const vk = clamp((t - tOn) / 0.3);
 const lithBase = over === 'continent' ? 264 : 234;
 const Hm = over === 'continent' ? 10 + 26 * t : 0;
 const landY = over === 'continent' ? 106 : 170;
 const xs = range(T[0] + 95, 830, 6);
 const top: Pt[] = over === 'continent'
  ? [T, [T[0] + 45, 140], [T[0] + 75, SEA + 2], ...xs.map(x => [x, landY - Hm * bump(x, M[0], 60)] as Pt)]
  : [T, [T[0] + 40, 178], [T[0] + 70, landY], [830, landY]];
 const surfaceAt = (x: number) => over === 'continent' ? landY - Hm * bump(x, M[0], 60) : landY;
 const P264 = firstBelow(full, lithBase);
 const body = line([...top, [830, lithBase], P264, ...between(full, T[1], lithBase).reverse()]) + 'Z';
 const cBase = 216, Pc = firstBelow(full, cBase);
 const crust = over === 'continent'
  ? line([...top, [830, cBase], Pc, ...between(full, T[1], cBase).reverse()]) + 'Z'
  : ribbon(top.slice(1), 0, 12);
 const vBase = surfaceAt(M[0]);
 const vh = over === 'continent' ? (vk > 0 ? 8 + 18 * vk : 0) : (vk > 0 ? 10 + 72 * vk : 0);
 const len = totalLength(slab), tu = totalLength(slab.slice(0, slab.indexOf(T) + 1)) || totalLength(full.slice(0, full.indexOf(T) + 1));
 const inside = offset(slab, 8);
 const eqs: Pt[] = [];
 for (let u = tu + 10; u < len - 8; u += 24) eqs.push(pointAt(inside, u));
 if (over === 'continent') eqs.push([T[0] + 70, 170], [T[0] + 120, 150]); else eqs.push([T[0] + 60, 200]);
 const sinkLabel = firstBelow(full, 286);
 return <g>
  <rect className="pt-water" x={0} y={SEA} width={800} height={240} />
  <rect className="pt-asth" x={0} y={228} width={800} height={140} />
  <path className="pt-lith" d={body} />
  <path className={over === 'continent' ? 'pt-ccrust' : 'pt-ocrust'} d={crust} />
  <path className="pt-lith" d={ribbon(slab, 0, 52)} />
  <path className="pt-ocrust" d={ribbon(slab, 0, 12)} />
  <Bands path={slab} shift={t * 150} thick={12} />
  {vk > 0 && <>
   <ellipse className="pt-magma soft" cx={M[0] + 8} cy={M[1] - 22} rx={16} ry={9} />
   <path className="pt-dike" d={`M${M[0] + 6} ${M[1] - 30} C ${M[0] + 2} ${M[1] - 80}, ${M[0] - 2} ${vBase + 40}, ${M[0]} ${vBase - 2}`} />
  </>}
  <Volcano x={M[0]} base={vBase} h={vh} spread={over === 'ocean' ? 0.75 : 1.15} />
  <Arrow x={150} y={206} dir={1} />
  <Arrow x={720} y={over === 'continent' ? 240 : 205} dir={-1} />
  {quakes && eqs.map((p, i) => <Quake key={i} p={p} />)}
  {labels && <>
   <Label x={T[0] - 8} y={T[1] - 32} anchor="end" small>Deep trench</Label>
   <Label x={130} y={168} small>{over === 'continent' ? 'Ocean plate (thin, dense)' : 'Older, denser ocean plate'}</Label>
   {over === 'continent' ? <Label x={710} y={160}>Continent (thick, light)</Label> : <Label x={700} y={156} small>Younger ocean plate</Label>}
   <Label x={sinkLabel[0] - 34} y={sinkLabel[1] + 4} anchor="end" small>Plate sinks into the mantle</Label>
   {vk > 0 && <><Label x={790} y={M[1] + 8} anchor="end" small>Water from the sinking plate</Label><Label x={790} y={M[1] + 24} anchor="end" small>helps the rock above it melt</Label></>}
   {vk > 0 && <Label x={M[0]} y={over === 'continent' ? vBase - vh - 26 : Math.min(SEA - 8, vBase - vh - 20)} small>{over === 'continent' ? 'Volcanoes in mountains' : vBase - vh < SEA ? 'Volcanic islands (island arc)' : 'Undersea volcano growing'}</Label>}
  </>}
 </g>;
}
export const OceanContinent = (p: SceneProps) => <Subduction {...p} over="continent" />;
export const OceanOcean = (p: SceneProps) => <Subduction {...p} over="ocean" />;

// ---------- Convergent: continent meets continent ----------
const scatter: [number, number][] = [[-120, .3], [-95, .7], [-70, .45], [-40, .2], [-30, .8], [-5, .5], [15, .3], [40, .65], [60, .25], [85, .55], [110, .4], [130, .75], [-140, .6], [150, .35]];
export function Collision({ t, labels, quakes }: SceneProps) {
 const C = 0.45, p = clamp(t / C), k = clamp((t - C) / (1 - C));
 const yf = 185, full = bendingPlate(yf, 330, 350), slab = bendingPlate(yf, 330, 150 + 200 * p);
 const T = firstBelow(full, 210), M = firstBelow(full, 318);
 const idx = full.findIndex(q => q[1] >= 318), pOn = ((idx - 2) * 6 - 150) / 200;
 const xc = T[0] + 20, H = 10 + 80 * k;
 const xs = range(-30, 830, 6);
 const topAt = (x: number) => 106 - 10 * bump(x, M[0], 55) - (k > 0 ? H * bump(x, xc, 120) : 0);
 const rootAt = (x: number) => 222 + 70 * k * bump(x, xc, 110);
 const CL = 60 + p * (T[0] - 90);
 // Right-hand continent and its plate, as in the ocean-continent case.
 const rtop: Pt[] = [T, [T[0] + 45, 140], [T[0] + 75, SEA + 2], ...range(T[0] + 95, 830, 6).map(x => [x, topAt(x)] as Pt)];
 const P264 = firstBelow(full, 264), Pc = firstBelow(full, 222);
 const vOn = p >= pOn ? clamp((p - pOn) / 0.25) : 0;
 const vFade = 1 - clamp(k * 1.6);
 const eqs: Pt[] = [];
 if (k === 0) { const inside = offset(slab, 8), len = totalLength(slab), tu = totalLength(full.slice(0, full.indexOf(T) + 1)); for (let u = tu + 10; u < len - 8; u += 24) eqs.push(pointAt(inside, u)); }
 else scatter.forEach(([dx, f], i) => { if (i < 5 + k * 10) { const x = xc + dx; eqs.push([x, topAt(x) + 18 + f * (rootAt(x) - topAt(x) - 30)]); } });
 const folds = [0, 1, 2].map(j => range(xc - 150, xc + 150, 4).map(x => [x, 150 + j * 24 - H * 0.7 * (1 - j * 0.25) * bump(x, xc, 120) + Math.sin(x / 13 + j) * 5 * k] as Pt));
 return <g>
  <rect className="pt-water" x={0} y={SEA} width={800} height={240} />
  <rect className="pt-asth" x={0} y={226} width={800} height={140} />
  {k === 0 && <path className="pt-lith" d={line([...rtop, [830, 264], P264, ...between(full, T[1], 264).reverse()]) + 'Z'} />}
  <path className="pt-lith" d={ribbon(slab, 0, 66)} />
  <path className="pt-ocrust" d={ribbon(slab, 0, 12)} />
  <Bands path={slab} shift={t * 150} thick={12} />
  {k === 0 ? <>
   <path className="pt-ccrust" d={line([...rtop, [830, 222], Pc, ...between(full, T[1], 222).reverse()]) + 'Z'} />
   <path className="pt-ccrust" d={`M-30 106 L${CL - 40} 106 L${CL - 12} 128 L${CL + 18} ${yf} L${CL - 22} 222 L-30 222Z`} />
  </> : <>
   <path className="pt-lith" d={`M${xc} 222 L830 222 L830 264 L${P264[0]} 264Z`} />
   <path className="pt-ccrust" d={poly(xs.map(x => [x, topAt(x)] as Pt), xs.map(x => [x, rootAt(x)] as Pt))} />
   {folds.map((f, j) => <path key={j} className="pt-fold" d={line(f)} />)}
   <path className="pt-suture" d={`M${xc - 6} ${topAt(xc - 6) + 6} L${xc + 40} ${rootAt(xc + 40) - 6}`} />
  </>}
  {vOn > 0 && vFade > 0 && <g opacity={vFade}>
   <path className="pt-dike" d={`M${M[0] + 6} ${M[1] - 28} C ${M[0] + 2} ${M[1] - 80}, ${M[0]} ${topAt(M[0]) + 40}, ${M[0]} ${topAt(M[0]) - 2}`} />
   <Volcano x={M[0]} base={topAt(M[0])} h={8 + 18 * vOn} erupting={k === 0} />
  </g>}
  <Arrow x={140} y={248} dir={1} /><Arrow x={730} y={244} dir={-1} />
  {quakes && eqs.map((q, i) => <Quake key={i} p={q} />)}
  {labels && <>
   <Label x={Math.max(60, Math.min(140, CL - 70))} y={170}>Continent</Label>
   <Label x={720} y={170}>Continent</Label>
   {k === 0 && T[0] - CL > 90 && <Label x={(CL + T[0]) / 2 + 10} y={162} small>Ocean gets narrower</Label>}
   {k === 0 && <Label x={T[0] - 10} y={T[1] + 32} anchor="end" small>Ocean floor sinks</Label>}
   {k > 0 && <Label x={xc} y={Math.max(14, topAt(xc) - 10)} small>Crust crumples and stacks up into huge mountains</Label>}
   {k > 0.3 && <Label x={xc + 40} y={rootAt(xc) + 18} small>Thick root of crust</Label>}
   {k > 0 && k < 0.7 && <Label x={M[0] + 70} y={topAt(M[0]) - 30} small>Volcanoes stop once the ocean is gone</Label>}
   {k > 0 && <Label x={170} y={300} small>Neither continent sinks: they are too thick and light</Label>}
  </>}
 </g>;
}

// ---------- Transform: seen from above ----------
export const SLIP = 45; // how much strain builds up before the fault slips, in drawing units
export function quakeCount(t: number) { return Math.floor(t * 150 / SLIP + 1e-9); }
export function Transform({ t, labels, quakes }: SceneProps) {
 const u = t * 150, n = quakeCount(t), S = n * SLIP, e = u - S;
 const disp = (y: number) => (y < 180 ? -1 : 1) * (S / 2 + e / 2 * Math.tanh(Math.abs(y - 180) / 60));
 const half = (x0: number, wiggle: (y: number) => number, ys: number[]) => line(ys.map(y => [x0 + wiggle(y) + disp(y), y] as Pt));
 const topYs = [...range(-10, 174, 6), 179.9], botYs = [180.1, ...range(186, 370, 6)];
 const road = (cls: string) => <><path className={cls} d={half(400, () => 0, topYs)} /><path className={cls} d={half(400, () => 0, botYs)} /></>;
 const stream = (y: number) => 9 * Math.sin(y / 28);
 const flash = n > 0 && e < 8;
 const epis = [400, 340, 455, 300, 510, 370, 430];
 return <g>
  <rect className="pt-landA" x={0} y={0} width={800} height={180} />
  <rect className="pt-landB" x={0} y={180} width={800} height={180} />
  <path className="pt-fence" d={half(200, () => 0, topYs)} /><path className="pt-fence" d={half(200, () => 0, botYs)} />
  <path className="pt-stream" d={half(620, stream, topYs)} /><path className="pt-stream" d={half(620, stream, botYs)} />
  {road('pt-road')}{road('pt-road-line')}
  <path className="pt-faultline" d="M0 180 L120 179 L260 181 L400 180 L540 179 L680 181 L800 180" />
  {[30, 330].map(y => [100, 300, 500, 700].map(x => <path key={`${x}${y}`} className="pt-marker" d={`M${x + disp(y) - 6} ${y + 5} L${x + disp(y)} ${y - 6} L${x + disp(y) + 6} ${y + 5}Z`} />))}
  <Arrow x={130} y={95} dir={-1} /><Arrow x={670} y={265} dir={1} />
  {quakes && epis.slice(0, Math.min(n, epis.length)).map((x, i) => <circle key={i} className="pt-quake shallow" cx={x} cy={180} r={4.2} />)}
  {flash && <g className="pt-burst"><path d="M400 158 L406 172 L422 168 L410 179 L424 190 L407 188 L402 204 L396 189 L379 194 L390 181 L377 169 L394 172Z" /><text x={430} y={160}>Earthquake!</text></g>}
  {labels && <>
   <Label x={20} y={170} anchor="start" small>Fault (the plate boundary)</Label>
   <Label x={680} y={60}>Plate A</Label><Label x={120} y={310}>Plate B</Label>
   <Label x={400} y={18} small>Far from the fault, the ground moves steadily all the time</Label>
   {!flash && e > 14 && <Label x={414} y={130} anchor="start" small>Rock near the fault is stuck, so it bends and stores strain</Label>}
   {n > 0 && !flash && e <= 14 && <Label x={414} y={130} anchor="start" small>The road broke and jumped during the last earthquake</Label>}
   <Label x={620} y={350} small>stream</Label><Label x={200} y={350} small>fence</Label>
  </>}
 </g>;
}
