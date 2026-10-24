import { useState, type ReactNode } from 'react';
import { near, parseNum, useCentered, useFrames } from './motion';

const SPAN = 4; // million years shown by the simulator
const VIEW_KM = 60; // kilometers shown on each side of the ridge
const PX = 380 / VIEW_KM, MID = 400;
const SECONDS = 24; // real seconds for the whole run

// Times when Earth's field was normal (pointing the way it does today), in millions of years ago.
// Rounded from the geomagnetic polarity time scale: Brunhes, Jaramillo, Olduvai, and the Gauss chron with its two reversed breaks.
const NORMAL_AGO: [number, number][] = [[0, 0.78], [0.99, 1.07], [1.78, 1.95], [2.58, 3.03], [3.12, 3.21], [3.33, 3.6]];
const normalAgo = (ago: number) => NORMAL_AGO.some(([a, b]) => ago >= a && ago < b);

type Speed = 'slow' | 'fast';
const speeds: Record<Speed, { label: string; total: number; place: string }> = {
 slow: { label: 'Slow ridge', total: 2.5, place: 'like the Mid-Atlantic Ridge' },
 fast: { label: 'Fast ridge', total: 15, place: 'like the fastest parts of the East Pacific Rise' }
};
type Rec = 'mine' | 'earth';
type Color = 'magnet' | 'age';

export default function Spreading() {
 const [speed, setSpeed] = useState<Speed>('slow');
 const [record, setRecord] = useState<Rec>('mine');
 const [color, setColor] = useState<Color>('magnet');
 const [t, setT] = useState(0);
 const [running, setRunning] = useState(false);
 const [flips, setFlips] = useState<number[]>([]);
 const [notice, setNotice] = useState<string | null>(null);
 const [young, setYoung] = useState<string | null>(null);
 const scroller = useCentered<HTMLDivElement>();

 const kmPerMyr = speeds[speed].total / 2 * 10; // half rate: 1 cm/yr = 10 km per million years
 useFrames(running, dt => setT(v => { const n = Math.min(SPAN, v + dt * SPAN / SECONDS); if (n >= SPAN) setRunning(false); return n; }));

 // Is the field normal at simulator time s?
 const normalAt = (s: number) => record === 'earth' ? normalAgo(SPAN - s) : flips.filter(f => f <= s).length % 2 === 0;
 const nowNormal = normalAt(t);
 const breaks = record === 'earth'
  ? NORMAL_AGO.flat().map(a => SPAN - a).filter(s => s > 0 && s < SPAN)
  : flips;
 const edges = [0, ...breaks.filter(b => b < t).sort((a, b) => a - b), t];
 // Each block of rock formed between two field changes; it now sits between these distances from the ridge.
 const blocks = edges.slice(1).map((end, i) => {
  const start = edges[i];
  return { near: (t - end) * kmPerMyr, far: (t - start) * kmPerMyr, normal: normalAt((start + end) / 2), start, end };
 }).filter(b => b.far > b.near);
 const oldKm = t * kmPerMyr; // rock older than the run starts here
 const x = (km: number) => MID + km * PX;
 const clampKm = (km: number) => Math.min(km, VIEW_KM + 2);

 function reset(next?: Partial<{ speed: Speed; record: Rec }>) {
  setRunning(false); setT(0); setFlips([]); setNotice(null); setYoung(null);
  if (next?.speed) setSpeed(next.speed);
  if (next?.record) setRecord(next.record);
 }
 const flip = () => { if (t < SPAN) setFlips(f => [...f, t]); };

 const ageColor = (ageMyr: number) => {
  const k = Math.min(1, ageMyr / SPAN);
  return `hsl(${Math.round(8 + k * 200)} 70% ${Math.round(58 + k * 10)}%)`;
 };

 const stripes: ReactNode[] = [];
 blocks.forEach((b, i) => [1, -1].forEach(side => {
  const a = x(side * b.near), c = x(side * clampKm(b.far));
  const fill = color === 'magnet' ? (b.normal ? 'var(--pt-normal)' : 'var(--pt-reversed)') : ageColor(t - (b.start + b.end) / 2);
  if (color === 'age') {
   // Age changes smoothly, so split each block into thin slices.
   const n = Math.max(1, Math.ceil(Math.abs(c - a) / 6));
   for (let k = 0; k < n; k++) {
    const k0 = b.near + (b.far - b.near) * k / n, k1 = b.near + (b.far - b.near) * (k + 1) / n;
    if (k0 > VIEW_KM + 2) break;
    const p = x(side * k0), q = x(side * clampKm(k1));
    stripes.push(<rect key={`${i}${side}${k}`} x={Math.min(p, q)} width={Math.abs(q - p) + 0.6} y={116} height={128} fill={ageColor((k0 + k1) / 2 / kmPerMyr)} />);
   }
  } else stripes.push(<rect key={`${i}${side}`} x={Math.min(a, c)} width={Math.abs(c - a) + 0.4} y={116} height={128} fill={fill} />);
 }));

 // Magnetometer line: high over normal rock, low over reversed rock.
 const prof: string[] = [];
 for (let px = 20; px <= 780; px += 2) {
  const km = Math.abs((px - MID) / PX);
  const formed = t - km / kmPerMyr;
  const y = formed < 0 ? 62 : normalAt(formed) ? 40 : 84;
  prof.push(`${px},${y}`);
 }

 const tLabel = record === 'earth'
  ? (t >= SPAN ? 'Today' : `${(SPAN - t).toFixed(2)} million years ago`)
  : `${t.toFixed(2)} million years have passed`;

 return <div className="pt-panel">
  <h3>Clue 2: The ocean floor is spreading</h3>
  <p>In the 1950s, <strong>Marie Tharp</strong> and <strong>Bruce Heezen</strong> mapped a mountain range running down the middle of the Atlantic Ocean floor, with a deep valley along its top. In the early 1960s <strong>Harry Hess</strong> proposed that hot rock rises at these <strong>mid-ocean ridges</strong>, cools into new ocean floor, and spreads away on both sides. Magnetism gave scientists a way to test it.</p>
  <details className="pt-more"><summary>How does rock record magnetism?</summary>
   <p>Earth acts like a giant magnet. When lava cools into rock, tiny iron-rich mineral grains line up with Earth's magnetic field like little compass needles and get locked in place. Every so often (at uneven times, often hundreds of thousands of years apart) Earth's field flips, so a compass would point south. The last flip was about 780,000 years ago. Rock that cools during a flipped time records the flipped direction.</p>
  </details>

  <div className="pt-controls">
   <div><span className="pt-label">Who flips the field?</span>
    <div className="pt-seg" role="group" aria-label="Magnetic field record">
     <button aria-pressed={record === 'mine'} onClick={() => reset({ record: 'mine' })}>You do</button>
     <button aria-pressed={record === 'earth'} onClick={() => reset({ record: 'earth' })}>Earth's real record</button>
    </div></div>
   <div><span className="pt-label">Spreading speed</span>
    <div className="pt-seg" role="group" aria-label="Spreading speed">
     {(Object.keys(speeds) as Speed[]).map(s => <button key={s} aria-pressed={speed === s} onClick={() => reset({ speed: s })}>{speeds[s].label}</button>)}
    </div></div>
   <div><span className="pt-label">Color the rock by</span>
    <div className="pt-seg" role="group" aria-label="Color the rock by">
     <button aria-pressed={color === 'magnet'} onClick={() => setColor('magnet')}>Magnetism</button>
     <button aria-pressed={color === 'age'} onClick={() => setColor('age')}>Age</button>
    </div></div>
  </div>

  <div className="pt-scroll" ref={scroller}><svg className="pt-ridge" viewBox="0 0 800 300" role="img" aria-labelledby="pt-ridge-title">
   <title id="pt-ridge-title">{`View from above of a mid-ocean ridge. ${tLabel}. ${blocks.length} bands of new rock on each side, ${color === 'magnet' ? 'colored by magnetic direction' : 'colored by age'}. The pattern on the left is a mirror image of the right.`}</title>
   <text className="pt-axis-title" x="20" y="18">Ship's magnetometer reading</text>
   <line className="pt-axis" x1="20" x2="780" y1="62" y2="62" />
   <text className="pt-small" x="784" y="44" textAnchor="end">stronger</text>
   <text className="pt-small" x="784" y="96" textAnchor="end">weaker</text>
   <polyline className="pt-profile" points={prof.join(' ')} />
   <rect className="pt-oldfloor" x={20} width={760} y={116} height={128} />
   {x(-oldKm) - 20 > 130 && <>
    <text className="pt-small pt-old-label" x={(20 + x(-oldKm)) / 2} y={186} textAnchor="middle">older ocean floor</text>
    <text className="pt-small pt-old-label" x={(780 + x(oldKm)) / 2} y={186} textAnchor="middle">older ocean floor</text>
   </>}
   <g clipPath="url(#pt-clip)">{stripes}</g>
   <clipPath id="pt-clip"><rect x={20} width={760} y={116} height={128} /></clipPath>
   <line className="pt-ridge-line" x1={MID} x2={MID} y1={110} y2={250} />
   <text className="pt-ridge-label" x={MID} y={107} textAnchor="middle">ridge</text>
   <g className="pt-spread-arrows" aria-hidden="true">
    <path d="M370 268 H250 M262 261 L250 268 L262 275" /><path d="M430 268 H550 M538 261 L550 268 L538 275" />
   </g>
   <g className="pt-scalebar"><line x1={x(-VIEW_KM)} x2={x(-VIEW_KM + 20)} y1={290} y2={290} /><text x={x(-VIEW_KM + 10)} y={285} textAnchor="middle">20 km</text></g>
   <text className="pt-small" x={MID} y={292} textAnchor="middle">plates move apart</text>
  </svg></div>

  <div className="pt-row pt-sim-row">
   <button className="pt-primary" onClick={() => { if (t >= SPAN) reset(); setRunning(r => !r); }}>{running ? '❚❚ Pause' : t >= SPAN ? '↺ Run again' : t > 0 ? '▶ Keep going' : '▶ Start spreading'}</button>
   {record === 'mine' && <button onClick={flip} disabled={t >= SPAN} aria-label="Flip Earth's magnetic field">🧲 Flip the field</button>}
   {t > 0 && <button onClick={() => reset()}>Reset</button>}
   <span className="pt-compass" aria-live="polite">
    <span className={`pt-needle${nowNormal ? '' : ' flipped'}`} aria-hidden="true">▲</span>
    Field now: <strong>{nowNormal ? 'normal' : 'reversed'}</strong>
   </span>
  </div>
  <p className="pt-readout"><strong>{tLabel}</strong> · Each side moves {speeds[speed].total / 2} cm per year ({speeds[speed].total} cm per year in total, {speeds[speed].place}).</p>
  {color === 'magnet'
   ? <p className="pt-legend"><span className="pt-sw normal" /> rock that recorded a normal field <span className="pt-sw reversed" /> rock that recorded a reversed field</p>
   : <p className="pt-legend"><span className="pt-sw" style={{ background: ageColor(0) }} /> youngest <span className="pt-age-bar" /> <span className="pt-sw" style={{ background: ageColor(SPAN) }} /> {SPAN} million years old</p>}
  {record === 'mine' && t === 0 && <p className="pt-muted">Press Start, then press Flip the field a few times while the ridge spreads. Watch what gets recorded on each side.</p>}
  {speed === 'fast' && t > 1 && <p className="pt-muted">On a fast ridge the same few million years make much wider bands. Most of them have already slid off the edges of the picture.</p>}

  {t >= 1.2 && <div className="pt-quiz">
   <p><strong>What do you notice about the two sides?</strong></p>
   <div className="pt-row">
    {[['mirror', 'They are mirror images of each other'], ['random', 'The bands are random on each side'], ['one', 'One side has more bands than the other']].map(([id, label]) =>
     <button key={id} aria-pressed={notice === id} onClick={() => setNotice(id)}>{label}</button>)}
   </div>
   <div aria-live="polite">{notice && <p className={`pt-feedback ${notice === 'mirror' ? 'good' : 'bad'}`}>{notice === 'mirror'
    ? 'Yes. Each band of rock formed at the ridge and then split, half moving each way. That mirror pattern is exactly what scientists found in real ocean floor in the 1960s, and it convinced most of them that seafloor spreading is real.'
    : 'Look again at the bands just left and right of the ridge, then the next ones out. Each band formed at the ridge and split in two, so the left side matches the right side, flipped like a mirror.'}</p>}</div>
   {notice === 'mirror' && <>
    <p><strong>Where is the youngest ocean floor?</strong></p>
    <div className="pt-row">
     {[['ridge', 'At the ridge'], ['edges', 'Far from the ridge'], ['same', 'It is all the same age']].map(([id, label]) =>
      <button key={id} aria-pressed={young === id} onClick={() => { setYoung(id); setColor('age'); }}>{label}</button>)}
    </div>
    <div aria-live="polite">{young && <p className={`pt-feedback ${young === 'ridge' ? 'good' : 'bad'}`}>{young === 'ridge'
     ? 'Right. New rock forms at the ridge and gets older the farther it has traveled. The colors now show age. Real ocean floor is never more than about 200 million years old, while some continental rock is about 4 billion years old.'
     : 'The colors now show age. New rock forms at the ridge, so the youngest rock is right at the ridge and it gets older the farther away it is.'}</p>}</div>
   </>}
  </div>}
  {young === 'ridge' && <div className="pt-takeaway"><p><strong>The missing piece for Wegener:</strong> continents don't plow through the ocean floor. The ocean floor itself moves, carrying the continents along like packages on a conveyor belt. Each moving slab of ocean floor and continent is a <strong>tectonic plate</strong>. And if new floor keeps forming but Earth isn't growing, old floor must be going somewhere. Part 3 shows where.</p></div>}

  <SpeedCheck />
  <p className="pt-note">Model simplifications: the view from above is drawn as straight bands; real ridges are broken into offset segments and real bands are wavy. Real rock records the field less cleanly, and real reversals take thousands of years instead of an instant. "Earth's real record" uses reversal dates rounded to the nearest 0.01 million years.</p>
 </div>;
}

// ---------- How fast? ----------
const HALF = [1, 1.5, 2, 2.5, 3, 4, 5]; // cm per year on one side
const AGES = [0.8, 1.8, 2.6]; // ages of real reversals, rounded, in millions of years
type Prob = { h: number; age: number; km: number };
const makeProb = (): Prob => { const h = HALF[Math.floor(Math.random() * HALF.length)], age = AGES[Math.floor(Math.random() * AGES.length)]; return { h, age, km: Math.round(h * 10 * age * 10) / 10 }; };
const ROUND = 3;
const fmt = (v: number) => (Math.round(v * 100) / 100).toString();

function SpeedCheck() {
 const [probs, setProbs] = useState<Prob[]>(() => Array.from({ length: ROUND }, makeProb));
 const [i, setI] = useState(0);
 const [stage, setStage] = useState<'side' | 'both' | 'done'>('side');
 const [text, setText] = useState('');
 const [msg, setMsg] = useState<{ good: boolean; body: ReactNode } | null>(null);
 const [misses, setMisses] = useState(0);
 const [clean, setClean] = useState(0);
 const [open, setOpen] = useState(false);
 const p = probs[i];

 function check() {
  if (!p) return;
  const v = parseNum(text);
  if (v === null) { setMsg({ good: false, body: 'Type a number of centimeters per year, such as 2.5.' }); return; }
  const rate = p.km / p.age; // km per million years = mm per year
  if (stage === 'side') {
   if (near(v, p.h)) { setMsg({ good: true, body: <>Yes: {p.km} km ÷ {p.age} million years = {fmt(rate)} km per million years = {fmt(rate)} mm per year = <strong>{p.h} cm per year</strong>.</> }); setStage('both'); setText(''); return; }
   setMisses(m => m + 1);
   setMsg({ good: false, body: near(v, rate) ? <>Good start: that's {fmt(rate)} km per million years. Here's a shortcut: 1 km per million years is the same as 1 <em>millimeter</em> per year. Now change millimeters to centimeters.</>
    : near(v, p.km) ? <>That's the distance. Speed is distance ÷ time.</>
    : near(v, p.age / p.km) ? <>That's upside down. Speed is distance ÷ time: {p.km} ÷ {p.age}.</>
    : near(v, 2 * p.h) ? <>That's both sides together. This question asks how fast <em>one</em> side moves.</>
    : <>Speed = distance ÷ time. Divide {p.km} km by {p.age} million years, then use the shortcut: 1 km per million years = 1 mm per year.</> });
  } else if (stage === 'both') {
   if (near(v, 2 * p.h)) { setMsg({ good: true, body: <>Right: both sides move away from the ridge at {p.h} cm per year, so the ocean gets <strong>{fmt(2 * p.h)} cm</strong> wider every year.</> }); setStage('done'); setText(''); if (misses === 0) setClean(c => c + 1); return; }
   setMisses(m => m + 1);
   setMsg({ good: false, body: near(v, p.h) ? <>That's one side. The other side moves away just as fast in the opposite direction.</> : near(v, p.h * p.h) ? <>Add the two sides, don't multiply them.</> : <>Each side moves {p.h} cm per year in opposite directions. How fast does the gap between them grow?</> });
  }
 }
 function next() {
  if (i + 1 >= probs.length) { setI(i + 1); return; }
  setI(i + 1); setStage('side'); setText(''); setMsg(null); setMisses(0);
 }
 function again() { setProbs(Array.from({ length: ROUND }, makeProb)); setI(0); setStage('side'); setText(''); setMsg(null); setMisses(0); setClean(0); }

 if (!open) return <div className="pt-speed-cta"><button className="pt-primary" onClick={() => setOpen(true)}>⏱ Measure how fast plates move</button></div>;
 if (i >= probs.length) return <div className="pt-speed">
  <h4>Speed check complete: {clean} of {probs.length} with no slips</h4>
  <p>Plates move a few centimeters a year, about as fast as your fingernails grow. That sounds slow, but in 100 million years, 3 cm a year adds up to 3,000 km: about the width of the South Atlantic between Brazil and West Africa.</p>
  <button onClick={again}>Try new measurements</button>
 </div>;

 const wPx = 560, kmMax = Math.max(60, Math.ceil(p.km / 20) * 20 + 20), sx = (km: number) => 40 + km / kmMax * (wPx - 70);
 return <div className="pt-speed">
  <h4>How fast? Measurement {i + 1} of {probs.length}</h4>
  <p>A ship crossed one side of a ridge. Scientists know when the field last flipped at this edge of a magnetic band, so they know the rock's age.</p>
  <svg className="pt-measure" viewBox={`0 0 ${wPx} 120`} role="img" aria-label={`The band edge is ${p.km} kilometers from the ridge and the rock there is ${p.age} million years old.`}>
   <rect x={sx(0)} y={30} width={sx(p.km) - sx(0)} height={44} fill="var(--pt-normal)" />
   <rect x={sx(p.km)} y={30} width={sx(kmMax) - sx(p.km)} height={44} fill="var(--pt-reversed)" />
   <line className="pt-ridge-line" x1={sx(0)} x2={sx(0)} y1={22} y2={82} />
   <text className="pt-small" x={sx(0) - 4} y={16}>ridge (age 0)</text>
   <line className="pt-measure-line" x1={sx(0)} x2={sx(p.km)} y1={94} y2={94} />
   <text className="pt-measure-text" x={(sx(0) + sx(p.km)) / 2} y={112} textAnchor="middle">{p.km} km</text>
   <line className="pt-band-edge" x1={sx(p.km)} x2={sx(p.km)} y1={22} y2={100} />
   <text className="pt-measure-text" x={sx(p.km) + 6} y={16} textAnchor={sx(p.km) > wPx * 0.55 ? 'end' : 'start'} dx={sx(p.km) > wPx * 0.55 ? -12 : 0}>{p.age} million years old</text>
  </svg>
  <ol className="pt-stages">
   <li className={stage === 'side' ? 'now' : 'done'}>How fast is this side of the ocean floor moving, in cm per year?{stage !== 'side' && <strong> {p.h}</strong>}</li>
   <li className={stage === 'both' ? 'now' : stage === 'done' ? 'done' : ''}>The other side moves just as fast the other way. How fast is the ocean getting wider, in cm per year?{stage === 'done' && <strong> {fmt(2 * p.h)}</strong>}</li>
  </ol>
  {stage !== 'done' && <form className="pt-row" onSubmit={e => { e.preventDefault(); check(); }}>
   <label className="pt-sr" htmlFor="pt-speed-ans">{stage === 'side' ? 'Speed of one side in centimeters per year' : 'Widening speed in centimeters per year'}</label>
   <input id="pt-speed-ans" className="pt-input" value={text} inputMode="decimal" autoComplete="off" placeholder="cm per year" onChange={e => setText(e.target.value)} />
   <button className="pt-primary" type="submit">Check</button>
  </form>}
  <div aria-live="polite">{msg && <p className={`pt-feedback ${msg.good ? 'good' : 'bad'}`}>{msg.body}</p>}</div>
  {stage === 'done' && <button className="pt-primary" onClick={next}>{i + 1 < probs.length ? 'Next measurement →' : 'Finish'}</button>}
 </div>;
}
