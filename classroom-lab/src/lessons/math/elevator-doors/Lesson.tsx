import { useState } from 'react';

type Attempt = { k: number; isFactor: boolean; partner: number; remainder: number; predictedYes: boolean };
const quickPicks = [24, 36, 30, 48, 17];
const MIN = 2, MAX = 100;

export default function ElevatorDoors() {
 const [n, setN] = useState(24);
 const [draft, setDraft] = useState('24');
 const [lo, setLo] = useState(2);          // next number to try
 const [hi, setHi] = useState(24);         // smallest number on the right door
 const [left, setLeft] = useState<number[]>([1]);
 const [right, setRight] = useState<number[]>([24]);
 const [middle, setMiddle] = useState<number | null>(null); // a factor that pairs with itself (square numbers)
 const [history, setHistory] = useState<Attempt[]>([]);
 const [shortcut, setShortcut] = useState(false);
 const [run, setRun] = useState(0);        // bumps on restart so chips replay their entrance

 const closed = lo >= hi;
 const remaining = Math.max(0, hi - lo);
 const open = n > 2 ? remaining / (n - 2) : 0;
 const doorWidth = 20 + (1 - open) * 30;
 const last = history[history.length - 1];
 const factors = [...left, ...(middle ? [middle] : []), ...right];
 const display = closed ? 'DONE' : remaining === 1 ? String(lo) : `${lo}–${hi - 1}`;

 function start(next: number) {
  setN(next); setDraft(String(next)); setLo(2); setHi(next);
  setLeft([1]); setRight([next]); setMiddle(null); setHistory([]); setShortcut(false); setRun(r => r + 1);
 }

 function submitNumber() {
  const value = Math.round(Number(draft));
  if (Number.isFinite(value)) start(Math.min(MAX, Math.max(MIN, value)));
 }

 function test(predictedYes: boolean) {
  const k = lo;
  const isFactor = n % k === 0;
  const partner = Math.floor(n / k);
  if (isFactor) {
   if (partner === k) setMiddle(k);
   else { setLeft(l => [...l, k]); setRight(r => [partner, ...r]); }
   setHi(partner);
  }
  setLo(k + 1);
  setHistory(h => [...h, { k, isFactor, partner, remainder: n % k, predictedYes }]);
 }

 function closeEarly() { setShortcut(true); setHi(lo); }

 return <div className="activity">
  <h2>Elevator Doors: find every factor</h2>
  <p>Put 1 on the left door and your number on the right door. Then try 2, 3, 4… in order. Each factor you find goes on the left door, and its partner goes on the right door. The doors slide closed as the possibilities run out.</p>

  <div className="elev-setup">
   <label>Number to factor ({MIN}–{MAX}):
    <input type="number" min={MIN} max={MAX} value={draft} onChange={e => setDraft(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') submitNumber(); }} />
   </label>
   <button onClick={submitNumber}>Start</button>
   <span className="elev-picks" aria-label="Quick picks">{quickPicks.map(p => <button key={p} aria-pressed={n === p} className={n === p ? 'selected' : ''} onClick={() => start(p)}>{p}</button>)}</span>
  </div>

  <div className={`elev-shaft${closed ? ' closed' : ''}`}>
   <div className="elev-header" aria-hidden="true">
    <span className="elev-lamp" />
    <span key={display} className="elev-display">{display}</span>
    <span className="elev-lamp" />
   </div>
   <div className="elevator" role="group" aria-label={`Elevator for ${n}. Left door: ${left.join(', ')}. Right door: ${right.join(', ')}.${middle ? ` Middle: ${middle}.` : ''} ${closed ? 'Doors closed.' : `Still possible: ${lo} to ${hi - 1}.`}`}>
    <div className="elev-door left" style={{ width: `${doorWidth}%` }}>{left.map(f => <span key={`${run}-${f}`} className="elev-chip in-left">{f}</span>)}</div>
    <div className="elev-gap" aria-hidden="true">
     {middle !== null && <span key={`${run}-m`} className="elev-chip middle">{middle}</span>}
     {!closed && (remaining <= 40
      ? <div className="elev-tiles">{Array.from({ length: remaining }, (_, i) => <span key={lo + i} className={i === 0 ? 'next' : ''}>{lo + i}</span>)}</div>
      : <div className="elev-range">{lo} … {hi - 1}<small>{remaining} numbers</small></div>)}
    </div>
    <div className="elev-door right" style={{ width: `${doorWidth}%` }}>{right.map(f => <span key={`${run}-${f}`} className="elev-chip in-right">{f}</span>)}</div>
    {last && !last.isFactor && !shortcut && <span key={`${run}-x${history.length}`} className="elev-reject" aria-hidden="true">{last.k}</span>}
   </div>
  </div>
  <p className="elev-status">{closed ? <strong>The doors are closed.</strong> : remaining === 1 ? <>Still possible: only <strong>{lo}</strong></> : <>Still possible: <strong>{lo}</strong> to <strong>{hi - 1}</strong> ({remaining} numbers)</>}</p>

  {!closed && <div className="elev-ask">
   <p>Next number to try: <strong className="elev-k">{lo}</strong>. Is {lo} a factor of {n}?</p>
   <div className="elev-choices"><button onClick={() => test(true)}>Yes, it is</button><button onClick={() => test(false)}>No, it isn't</button></div>
  </div>}

  <div aria-live="polite">
   {last && !shortcut && <div className="challenge">
    <strong>{last.predictedYes === last.isFactor ? 'Your prediction was right. ' : 'Not quite. '}</strong>
    {last.isFactor
     ? last.partner === last.k
      ? <>{n} ÷ {last.k} = {last.partner}, so {last.k} × {last.k} = {n}. {last.k} is its own partner, so it stands in the middle, and the doors meet.</>
      : <>{n} ÷ {last.k} = {last.partner} with nothing left over, so {last.k} × {last.partner} = {n}. {last.k} goes on the left door and {last.partner} goes on the right door.</>
     : <>{n} ÷ {last.k} = {last.partner} R {last.remainder}. There is a remainder, so {last.k} is not a factor of {n}. It stays out of the elevator.</>}
   </div>}
   {shortcut && <div className="challenge"><strong>Doors closed early.</strong> Any factor {lo} or bigger would need a partner smaller than {lo}, and you have already tried every number that small. So no new factors can be hiding inside.</div>}
  </div>

  {!closed && lo * lo > n && remaining >= 3 && <div className="challenge elev-puzzle">
   <strong>Puzzle:</strong> {lo} × {lo} = {lo * lo}, which is already bigger than {n}. If {lo} or a bigger number were a factor, what would its partner have to be? Have you already tried that partner?
   <div><button onClick={closeEarly}>I think the doors can close now</button></div>
  </div>}

  {closed && <div className="elev-result">
   <h3>Factors of {n}</h3>
   <p className="elev-list">{factors.join(', ')}</p>
   <p>{n} has {factors.length} factors{factors.length === 2 ? `, only 1 and itself, so ${n} is a prime number` : ''}.</p>
   <div className="challenge"><strong>Think about it:</strong> {middle !== null
    ? `Why did ${middle} end up alone in the middle? Which other numbers do you think will have a factor in the middle?`
    : shortcut
     ? `You stopped after trying ${lo - 1} instead of testing all the way to ${n - 1}. Explain to a partner why that was safe.`
     : factors.length === 2
     ? `The doors took a long time to close for ${n}. Why? Could you have stopped sooner?`
     : `You never had to test numbers on the right side, like ${right.length > 1 ? right[0] + 1 : n - 1}. How did the doors already know they weren't factors?`}</div>
   <button className="elev-again" onClick={() => start(n)}>Try {n} again</button>
  </div>}

  {history.length > 0 && <details className="elev-history"><summary>Numbers tried ({history.length})</summary>
   <ul>{history.map(a => <li key={a.k}>{a.k}: {a.isFactor ? `factor (${a.k} × ${a.partner} = ${n})` : `not a factor (remainder ${a.remainder})`}</li>)}</ul>
  </details>}
 </div>;
}
