import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import Staff, { Glyph, beatColumns, type Item } from './Staff';
import { useSound, usePlayer, type Ev } from './audio';
import { beatsText } from './notes';

type Tok = 'whole' | 'dottedHalf' | 'half' | 'quarter' | 'eighths' | 'wholeRest' | 'halfRest' | 'quarterRest';
type TokInfo = { name: string; beats: number; rest: boolean; fraction: string; sounds: string; items: Item[] };
const B = 71; // the pitch used to draw notes on the one-line rhythm staff
const note = (value: Item['value']): Item => ({ kind: 'note', midi: [B], value });
const rest = (value: Item['value']): Item => ({ kind: 'rest', value });
const info: Record<Tok, TokInfo> = {
 whole: { name: 'Whole note', beats: 4, rest: false, fraction: '1', sounds: 'one sound held for 4 beats', items: [note('whole')] },
 dottedHalf: { name: 'Dotted half note', beats: 3, rest: false, fraction: '¾', sounds: 'one sound held for 3 beats', items: [note('dottedHalf')] },
 half: { name: 'Half note', beats: 2, rest: false, fraction: '½', sounds: 'one sound held for 2 beats', items: [note('half')] },
 quarter: { name: 'Quarter note', beats: 1, rest: false, fraction: '¼', sounds: 'one sound for 1 beat', items: [note('quarter')] },
 eighths: { name: 'Two eighth notes', beats: 1, rest: false, fraction: '⅛ + ⅛', sounds: 'two quick sounds in 1 beat', items: [note('eighth'), note('eighth')] },
 wholeRest: { name: 'Whole rest', beats: 4, rest: true, fraction: '1', sounds: '4 beats of silence', items: [rest('whole')] },
 halfRest: { name: 'Half rest', beats: 2, rest: true, fraction: '½', sounds: '2 beats of silence', items: [rest('half')] },
 quarterRest: { name: 'Quarter rest', beats: 1, rest: true, fraction: '¼', sounds: '1 beat of silence', items: [rest('quarter')] }
};
const noteToks: Tok[] = ['whole', 'dottedHalf', 'half', 'quarter', 'eighths'];
const restToks: Tok[] = ['wholeRest', 'halfRest', 'quarterRest'];
const MEASURES = 2;

const echoes: Tok[][][] = [
 [['quarter', 'quarter', 'quarter', 'quarter'], ['half', 'half']],
 [['half', 'quarter', 'quarter'], ['whole']],
 [['quarter', 'quarter', 'half'], ['quarter', 'quarter', 'half']],
 [['eighths', 'eighths', 'quarter', 'quarter'], ['eighths', 'eighths', 'half']],
 [['quarter', 'quarterRest', 'quarter', 'quarterRest'], ['dottedHalf', 'quarter']],
 [['eighths', 'quarter', 'eighths', 'quarter'], ['halfRest', 'half']]
];

const used = (m: Tok[]) => m.reduce((a, t) => a + info[t].beats, 0);
const article = (t: Tok) => t === 'eighths' ? info[t].name.toLowerCase() : `a ${info[t].name.toLowerCase()}`;

// What is happening at each half beat: which token covers it, and whether a sound starts there.
function timeline(ms: Tok[][]) {
 return ms.map(m => {
  const slots: { tok: Tok | null; starts: boolean }[] = Array.from({ length: 8 }, () => ({ tok: null, starts: false }));
  let at = 0;
  for (const t of m) {
   const len = info[t].beats * 2;
   for (let k = 0; k < len && at + k < 8; k++) slots[at + k] = { tok: t, starts: !info[t].rest && (k === 0 || (t === 'eighths' && k === 1)) };
   at += len;
  }
  return slots;
 });
}

function compare(target: Tok[][], mine: Tok[][]): string | null {
 const a = timeline(target), b = timeline(mine);
 for (let m = 0; m < MEASURES; m++) for (let s = 0; s < 8; s++) {
  const x = a[m][s], y = b[m][s];
  if (x.tok === y.tok && x.starts === y.starts) continue;
  const where = `In measure ${m + 1}, ${s % 2 ? `the "and" after beat ${(s - 1) / 2 + 1}` : `beat ${s / 2 + 1}`}`;
  if (!y.tok) return `${where} is still empty. The rhythm has ${article(x.tok!)} there (${info[x.tok!].sounds}).`;
  return `${where}: the rhythm has ${article(x.tok!)} (${info[x.tok!].sounds}), but you have ${article(y.tok)} (${info[y.tok].sounds}).`;
 }
 return null;
}

function eventsFor(ms: Tok[][], spb: number, click: boolean): Ev[] {
 const ev: Ev[] = [];
 ms.forEach((m, mi) => {
  if (click) for (let b = 0; b < 4; b++) ev.push({ t: (mi * 4 + b) * spb, dur: 0.05, click: b === 0 ? 'accent' : 'beat' });
  let at = 0;
  for (const t of m) {
   const i = info[t];
   if (!i.rest) {
    const parts = t === 'eighths' ? [0.5, 0.5] : [i.beats];
    let off = 0;
    for (const p of parts) { ev.push({ t: (mi * 4 + at + off) * spb, dur: p * spb * 0.85, midi: 67, hold: true, vel: 0.7 }); off += p; }
   }
   at += i.beats;
  }
 });
 return ev;
}

// Staff items, plus which token each item belongs to.
function itemsFor(ms: Tok[][]) {
 const owner: [number, number][] = [];
 const measures = ms.map((m, mi) => m.flatMap((t, ti) => info[t].items.map(it => { owner.push([mi, ti]); return it; })));
 return { measures, owner };
}

export default function Rhythm() {
 const { muted } = useSound();
 const [mode, setMode] = useState<'free' | 'echo'>('free');
 const [ms, setMs] = useState<Tok[][]>([[], []]);
 const [sel, setSel] = useState<[number, number] | null>(null);
 const [bpm, setBpm] = useState(90);
 const [click, setClick] = useState(true);
 const [loop, setLoop] = useState(false);
 const [fractions, setFractions] = useState(false);
 const [msg, setMsg] = useState<{ tone: 'right' | 'wrong' | 'shown'; text: string } | null>(null);
 const [echo, setEcho] = useState(0);
 const [tries, setTries] = useState(0);
 const [reveal, setReveal] = useState(false);
 const [solved, setSolved] = useState(false);
 const [which, setWhich] = useState<'mine' | 'target'>('mine');
 const player = usePlayer();
 const nextRef = useRef<HTMLButtonElement>(null);

 const spb = 60 / bpm;
 const target = echoes[echo];
 const showTarget = mode === 'echo' && (reveal || muted || solved);
 const playing = player.playing ? which : null;
 const playMs = playing === 'target' ? target : ms;
 const pos = player.t !== null ? player.t / spb : null; // beats since the start
 const halfBeat = pos !== null ? Math.floor(pos * 2) : null;

 useEffect(() => { if (solved) nextRef.current?.focus({ preventScroll: true }); }, [solved]);
 useEffect(() => { player.stop(); }, [bpm, click]);

 function add(t: Tok) {
  const free = ms.findIndex(m => used(m) < 4);
  if (free < 0) { setMsg({ tone: 'wrong', text: 'Both measures are full. Remove something first, or press Clear.' }); return; }
  const left = 4 - used(ms[free]);
  if (info[t].beats > left) {
   const fits = [...noteToks, ...restToks].filter(k => info[k].beats <= left).map(k => info[k].name.toLowerCase());
   setMsg({ tone: 'wrong', text: `Measure ${free + 1} has only ${beatsText(left)} left, and ${article(t)} lasts ${beatsText(info[t].beats)}. Every measure in 4/4 holds exactly 4 beats. Try ${fits.slice(0, 3).join(' or ')}.` });
   return;
  }
  const next = ms.map((m, i) => i === free ? [...m, t] : m);
  setMs(next);
  setSel(null);
  const nowLeft = 4 - used(next[free]);
  setMsg({ tone: 'shown', text: `Added ${article(t)} to measure ${free + 1}. ${nowLeft ? `${beatsText(nowLeft)} left in this measure.` : free + 1 < MEASURES ? `Measure ${free + 1} is full!` : 'Both measures are full. Press Play to hear it.'}` });
 }

 function remove() {
  let at = sel;
  if (!at) { const mi = ms[1].length ? 1 : ms[0].length ? 0 : -1; if (mi < 0) return; at = [mi, ms[mi].length - 1]; }
  const [mi, ti] = at;
  const t = ms[mi][ti];
  setMs(ms.map((m, i) => i === mi ? m.filter((_, k) => k !== ti) : m));
  setSel(null);
  setMsg({ tone: 'shown', text: `Removed ${article(t)} from measure ${mi + 1}.` });
 }

 function clear() { setMs([[], []]); setSel(null); setMsg(null); player.stop(); }

 function play(w: 'mine' | 'target') {
  if (player.playing && which === w) { player.stop(); return; }
  setWhich(w);
  player.play(eventsFor(w === 'target' ? target : ms, spb, click), MEASURES * 4 * spb, { loop });
 }

 function check() {
  const diff = compare(target, ms);
  if (!diff) { setSolved(true); setMsg({ tone: 'right', text: tries === 0 ? 'Yes, first try! Your rhythm matches.' : 'You got it! Your rhythm matches.' }); return; }
  setTries(tries + 1);
  setMsg({ tone: 'wrong', text: diff });
 }

 function startEcho(i: number) {
  player.stop();
  setEcho(i); setMs([[], []]); setSel(null); setTries(0); setReveal(false); setSolved(false); setMsg(null);
 }

 function switchMode(m: 'free' | 'echo') { setMode(m); startEcho(0); }

 function keys(e: KeyboardEvent<HTMLDivElement>) {
  if ((e.key === 'Backspace' || e.key === 'Delete') && (e.target as HTMLElement).tagName !== 'INPUT') { e.preventDefault(); remove(); }
 }

 const mine = itemsFor(ms), owner = mine.owner;
 const geo = beatColumns(MEASURES);
 const columns = `${geo.starts[0]}fr ${geo.span}fr ${geo.starts[1] - geo.starts[0] - geo.span}fr ${geo.span}fr ${geo.width - geo.starts[1] - geo.span}fr`;
 // Which staff item is sounding now.
 let activeItem: number | null = null;
 if (pos !== null) {
  let k = 0;
  playMs.forEach((m, mi) => { let at = 0; m.forEach(t => { info[t].items.forEach((it, j) => { const st = mi * 4 + at + j * 0.5; const len = it.kind === 'note' && it.value === 'eighth' ? 0.5 : info[t].beats; if (pos >= st && pos < st + len) activeItem = k; k++; }); at += info[t].beats; }); });
 }
 const selIndex = sel ? owner.findIndex(o => o[0] === sel[0] && o[1] === sel[1]) : null;
 const describe = (it: Item, i: number) => { const [mi, ti] = owner[i]; const t = ms[mi][ti]; return `Measure ${mi + 1}: ${info[t].name}${it.kind === 'note' && it.value === 'eighth' ? ` (${i > 0 && owner[i - 1][0] === mi && owner[i - 1][1] === ti ? 'second' : 'first'})` : ''}. Press Enter to select it.`; };

 return <div className="mu-rhythm" onKeyDown={keys}>
  <div className="mu-toolbar">
   <div className="mu-seg" role="group" aria-label="Kind of activity">
    <button aria-pressed={mode === 'free'} onClick={() => switchMode('free')}>Free build</button>
    <button aria-pressed={mode === 'echo'} onClick={() => switchMode('echo')}>Echo challenge</button>
   </div>
   <label className="mu-tempo"><span>Tempo: <strong>{bpm}</strong> beats per minute</span>
    <input type="range" min={50} max={150} step={5} value={bpm} onChange={e => setBpm(Number(e.target.value))} aria-valuetext={`${bpm} beats per minute`} />
   </label>
  </div>
  <div className="mu-toolbar mu-toggles">
   <label className="mu-check"><input type="checkbox" checked={click} onChange={e => setClick(e.target.checked)} /> Click the beat</label>
   <label className="mu-check"><input type="checkbox" checked={loop} onChange={e => { setLoop(e.target.checked); player.stop(); }} /> Repeat</label>
   <label className="mu-check"><input type="checkbox" checked={fractions} onChange={e => setFractions(e.target.checked)} /> Show fractions of a measure</label>
  </div>

  {mode === 'free' ? <p>The <strong>beat</strong> is the steady pulse you tap your foot to. <strong>Rhythm</strong> is the pattern of long and short sounds (and silences) on top of the beat. In <strong>4/4 time</strong>, every measure holds 4 beats. Fill both measures, then press Play.</p>
   : <div className="mu-echo">
    <div className="eyebrow">ECHO {echo + 1} OF {echoes.length}</div>
    <p>{muted ? 'Sound is off, so the rhythm is written out for you. Build the same rhythm, then press Check.' : 'Listen to the rhythm, then build the same one below and press Check. Listen as many times as you like.'}</p>
    <div className="mu-actions">
     <button className="mu-primary" onClick={() => play('target')} disabled={muted}>{playing === 'target' ? '■ Stop' : '▶ Listen'}</button>
     <button onClick={check} disabled={solved || used(ms[0]) + used(ms[1]) === 0}>✓ Check</button>
     {tries >= 2 && !showTarget && <button onClick={() => setReveal(true)}>Show me</button>}
     {solved && <button ref={nextRef} className="mu-primary" onClick={() => startEcho((echo + 1) % echoes.length)}>{echo + 1 === echoes.length ? 'Start over ↻' : 'Next echo →'}</button>}
    </div>
    {showTarget && <div className="mu-target"><span className="mu-tag">The rhythm</span>
     <Staff measures={itemsFor(target).measures} clef="neutral" percussion active={playing === 'target' ? activeItem : null} label={`The rhythm to echo: ${target.map((m, i) => `measure ${i + 1}: ${m.map(t => info[t].name).join(', ')}`).join('; ')}.`} />
    </div>}
   </div>}

  <div className="mu-builder">
   <Staff measures={mine.measures} clef="neutral" percussion active={playing === 'mine' ? activeItem : null} selected={selIndex}
    label={`Your rhythm. ${ms.map((m, i) => `Measure ${i + 1}: ${m.length ? m.map(t => info[t].name).join(', ') : 'empty'}, ${beatsText(4 - used(m))} left.`).join(' ')}`}
    onItem={i => { const o = owner[i]; setSel(sel && sel[0] === o[0] && sel[1] === o[1] ? null : o); }} itemLabel={describe} />
   <div className="mu-counts" aria-hidden="true" style={{ gridTemplateColumns: columns }}>
    <span />{Array.from({ length: MEASURES }, (_, mi) => <div key={mi} className="mu-count-measure" style={{ gridColumn: mi * 2 + 2 }}>
     {Array.from({ length: 8 }, (_, s) => <span key={s} className={`${s % 2 ? 'and' : 'beat'}${halfBeat === mi * 8 + s ? ' now' : ''}`}>{s % 2 ? '&' : s / 2 + 1}</span>)}
    </div>)}
   </div>
   <div className="mu-grid" style={{ gridTemplateColumns: columns }}>
    {ms.map((m, mi) => { let at = 0; return <div key={mi} className="mu-grid-measure" style={{ gridColumn: mi * 2 + 2 }}>
     {m.map((t, ti) => { const start = at; at += info[t].beats; const isSel = sel?.[0] === mi && sel?.[1] === ti;
      return <button key={ti} className={`mu-block${info[t].rest ? ' rest' : ''}${t === 'eighths' ? ' split' : ''}${isSel ? ' sel' : ''}`}
       style={{ gridColumn: `${start * 2 + 1} / span ${info[t].beats * 2}` }} aria-pressed={isSel} tabIndex={-1}
       onClick={() => setSel(isSel ? null : [mi, ti])}>
       <span className="long">{fractions ? info[t].fraction : beatsText(info[t].beats)}</span>
       <span className="short" aria-hidden="true">{fractions ? info[t].fraction : info[t].beats}</span>
      </button>; })}
     {used(m) < 4 && <span className="mu-block empty" style={{ gridColumn: `${used(m) * 2 + 1} / 9` }}><span className="long">{beatsText(4 - used(m))} left</span><span className="short">{4 - used(m)}</span></span>}
    </div>; })}
   </div>
  </div>

  <div className="mu-palette" role="group" aria-label="Add a note or rest">
   {[noteToks, restToks].map((row, r) => <div key={r} className="mu-palette-row">
    {row.map(t => <button key={t} onClick={() => add(t)} aria-label={`Add ${info[t].name.toLowerCase()}, ${beatsText(info[t].beats)}`}>
     <span className="mu-pal-glyphs">{info[t].items.map((it, k) => <Glyph key={k} item={it} lines={it.kind === 'rest' && it.value !== 'quarter'} label="" />)}</span>
     <span className="mu-pal-name">{info[t].name}</span>
     <span className="mu-pal-beats">{fractions ? `${info[t].fraction} of a measure` : beatsText(info[t].beats)}</span>
    </button>)}
   </div>)}
  </div>

  <div className="mu-actions">
   <button className="mu-primary" onClick={() => play('mine')}>{playing === 'mine' ? '■ Stop' : '▶ Play my rhythm'}</button>
   <button onClick={remove} disabled={!ms[0].length && !ms[1].length}>⌫ {sel ? 'Remove selected' : 'Remove last'}</button>
   <button onClick={clear} disabled={!ms[0].length && !ms[1].length}>Clear</button>
  </div>
  <div aria-live="polite">{msg && <p className={`mu-feedback ${msg.tone}`}>{msg.text}</p>}</div>
  {fractions && <p className="mu-hint">In 4/4 time a whole note fills the whole measure, so a half note is ½ of the measure, a quarter note is ¼, and an eighth note is ⅛. Two eighths make a quarter, just like ⅛ + ⅛ = ¼.</p>}
  <p className="note">Tap a note on the staff or in the beat bar to select it. Backspace or Delete removes it. Real music uses other time signatures too, such as 3/4 for a waltz, and notes can be tied across bar lines. This builder keeps to 4/4 so every measure is exactly 4 beats.</p>
 </div>;
}
