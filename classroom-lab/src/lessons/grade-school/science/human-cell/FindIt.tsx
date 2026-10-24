import { useEffect, useRef, useState, type KeyboardEvent, type MouseEvent, type PointerEvent } from 'react';
import { Scene } from './Scene';
import { H, W } from './geometry';
import { lower, partById, parts, type PartId } from './parts';
import { partAt } from './Explore';
import { canSpeak, speak } from './useView';

type ClueKind = 'job' | 'name' | 'city';
type Item = { id: PartId; misses: number; shown: boolean };
const ROUND = 8;

const near: Partial<Record<`${PartId}>${PartId}`, string>> = {
 'nucleus>nucleolus': "That's the nucleolus. It's inside the nucleus, but the clue is about the whole nucleus. Look at the bigger shape around it.",
 'nucleolus>nucleus': "You're in the right place! The nucleolus is inside the nucleus. Look for the dark spot.",
 'ribosomes>roughER': "Close! The bumps on the rough ER are ribosomes. Tap one of the tiny dots.",
 'roughER>ribosomes': "Those dots are ribosomes. The clue is about the folded sheets they sit on.",
 'roughER>smoothER': "That's the smooth ER. It has no ribosomes. Look for the ER that is covered with dots.",
 'smoothER>roughER': "That's the rough ER. It's covered with ribosomes. The smooth ER has none.",
 'lysosomes>vesicles': "That's a vesicle, which carries materials around. Lysosomes are bigger round sacs with dark enzymes inside.",
 'vesicles>lysosomes': "That's a lysosome, the recycling sac. Vesicles are the small bubbles, many near the Golgi.",
 'cytoskeleton>membrane': "That's the cell membrane. The cytoskeleton's fibers are the thin lines inside the cell.",
 'membrane>cytoplasm': "That's the cytoplasm, the filling. The membrane is the outer edge.",
 'cytoplasm>membrane': "That's the membrane at the edge. The cytoplasm is the filling inside it."
};

const shuffle = <T,>(a: T[]) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
const deal = (ids?: PartId[]): Item[] => (ids ?? shuffle(parts.map(p => p.id)).slice(0, ROUND)).map(id => ({ id, misses: 0, shown: false }));

export default function FindIt() {
 const [kind, setKind] = useState<ClueKind>('job');
 const [items, setItems] = useState<Item[]>(() => deal());
 const [at, setAt] = useState(0);
 const [picked, setPicked] = useState<PartId | null>(null);
 const [done, setDone] = useState(false); // current item answered
 const [flash, setFlash] = useState(false);
 const [cursor, setCursor] = useState<PartId | null>(null);
 const [hover, setHover] = useState<PartId | null>(null);
 const [said, setSaid] = useState('');
 const nextRef = useRef<HTMLButtonElement>(null);
 const touched = useRef(false);

 const finished = at >= items.length;
 const item = items[Math.min(at, items.length - 1)];
 const target = partById[item.id];
 const clue = kind === 'job' ? target.clue : kind === 'name' ? `Find the ${lower(target)}.` : `If the cell were a city, find its ${target.city.name.toLowerCase()}.`;

 useEffect(() => { if (touched.current && done) nextRef.current?.focus({ preventScroll: true }); }, [done]);

 function restart(ids?: PartId[]) {
  setItems(deal(ids)); setAt(0); setPicked(null); setDone(false); setFlash(false); setCursor(null);
 }

 function choose(id: PartId) {
  if (done || finished) return;
  touched.current = true;
  setPicked(id);
  if (id === item.id) {
   setDone(true); setFlash(false);
   setSaid(`Yes! You found the ${lower(target)}.`);
  } else {
   setItems(list => list.map((it, i) => i === at ? { ...it, misses: it.misses + 1 } : it));
   setSaid(`Not that one. You picked the ${lower(partById[id])}.`);
  }
 }

 function showMe() {
  setFlash(true);
  setItems(list => list.map((it, i) => i === at ? { ...it, shown: true } : it));
 }

 function next() {
  setAt(at + 1); setPicked(null); setDone(false); setFlash(false);
 }

 function onClick(e: MouseEvent<SVGSVGElement>) { const id = partAt(e.target); if (id) choose(id); }
 function onMove(e: PointerEvent<SVGSVGElement>) { if (e.pointerType === 'mouse') setHover(partAt(e.target)); }
 function onKey(e: KeyboardEvent<SVGSVGElement>) {
  const i = cursor ? parts.findIndex(p => p.id === cursor) : -1;
  const move = (k: number) => { const p = parts[(k + parts.length) % parts.length]; setCursor(p.id); setSaid(`${p.short}. Press Enter to choose it.`); };
  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') move(i + 1);
  else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') move(i < 0 ? -1 : i - 1);
  else if ((e.key === 'Enter' || e.key === ' ') && cursor) choose(cursor);
  else return;
  e.preventDefault();
 }

 const firstTry = items.filter(it => it.misses === 0 && !it.shown).length;
 const wrongPick = picked && !done ? picked : null;

 if (finished) {
  const missed = items.filter(it => it.misses > 0 || it.shown).map(it => it.id);
  const stars = firstTry === items.length ? 3 : firstTry >= items.length * 0.6 ? 2 : 1;
  return <div className="hc-find hc-summary">
   <p className="hc-stars" aria-label={`${stars} of 3 stars`}>{'★'.repeat(stars)}{'☆'.repeat(3 - stars)}</p>
   <p className="hc-score">You found <strong>{firstTry}</strong> of {items.length} on the first try.</p>
   <ol className="hc-review">{items.map(it => <li key={it.id} className={it.misses || it.shown ? 'miss' : 'good'}>
    <span>{it.misses || it.shown ? '↺' : '✓'}</span> {partById[it.id].short}{it.misses ? ` (${it.misses} ${it.misses === 1 ? 'try' : 'tries'} before finding it)` : ''}{it.shown ? ', shown' : ''}
   </li>)}</ol>
   <div className="hc-actions">
    {missed.length > 0 && <button className="hc-primary" onClick={() => restart(shuffle(missed))}>Practice the ones I missed</button>}
    <button className={missed.length ? '' : 'hc-primary'} onClick={() => restart()}>Play a new round</button>
   </div>
  </div>;
 }

 return <div className="hc-find">
  <div className="hc-toolbar">
   <div className="hc-seg" role="group" aria-label="Kind of clue">
    {([['job', 'What it does'], ['name', 'Its name'], ['city', 'Its city job']] as const).map(([k, label]) =>
     <button key={k} aria-pressed={kind === k} onClick={() => { setKind(k); restart(); }}>{label}</button>)}
   </div>
   <div className="hc-progress" aria-label={`Clue ${at + 1} of ${items.length}`}>
    {items.map((it, i) => <span key={i} className={i < at ? (it.misses || it.shown ? 'miss' : 'good') : i === at ? 'now' : ''} />)}
    <span className="hc-progress-text">{at + 1} / {items.length}</span>
   </div>
  </div>

  <div className="hc-clue">
   <span className="hc-clue-label">Find it</span>
   <p className="hc-clue-text">{clue}</p>
   {canSpeak && <button className="hc-speak" aria-label="Read the clue aloud" onClick={() => speak(clue)}>🔊</button>}
  </div>

  <div className="hc-find-grid">
   <svg viewBox={`0 0 ${W} ${H}`} tabIndex={0} role="group" className="hc-cell-svg"
    aria-label="Model of a human cell. Use the arrow keys to move between parts, then press Enter to choose one."
    onClick={onClick} onPointerMove={onMove} onPointerLeave={() => setHover(null)} onKeyDown={onKey}>
    <Scene active={done ? item.id : null} hover={cursor ?? hover} flash={flash ? item.id : null} hits />
   </svg>

   <div className="hc-find-side" aria-live="polite">
    {!picked && !flash && <p className="hc-hint">Tap or click the part of the cell that matches the clue. On a keyboard, use the arrow keys and Enter.</p>}
    {wrongPick && <div className="hc-feedback wrong">
     <p className="hc-headline">Not that one.</p>
     <p>{near[`${item.id}>${wrongPick}`] ?? <>You picked the <strong>{lower(partById[wrongPick])}</strong>: {partById[wrongPick].job.replace(/^\w/, c => c.toLowerCase())}</>}</p>
     <p>Try again!</p>
    </div>}
    {!done && flash && <p className="hc-feedback shown">The {lower(target)} is blinking. Tap it to keep going.</p>}
    {!done && item.misses >= 2 && !flash && <button onClick={showMe}>Show me</button>}
    {done && <div className="hc-feedback right">
     <p className="hc-headline">{item.misses || item.shown ? 'There it is!' : 'Yes, first try!'} You found the {lower(target)}.</p>
     <p>{target.job}</p>
     {kind === 'city' && <p><strong>{target.city.name}:</strong> {target.city.text}</p>}
     <button ref={nextRef} className="hc-primary" onClick={next}>{at + 1 === items.length ? 'See my score' : 'Next clue →'}</button>
    </div>}
   </div>
  </div>
  <div className="hc-sr" aria-live="assertive">{said}</div>
 </div>;
}
