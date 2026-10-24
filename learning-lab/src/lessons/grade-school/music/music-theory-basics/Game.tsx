import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import Staff, { Glyph, type Item } from './Staff';
import { noteOn, speak, canSpeak, useSound, usePlayer, type Ev } from './audio';
import { LETTERS, beatsOf, beatsText, freq, fullName, name, onLine, restNames, staffStep, valueNames, whereOnStaff, type Value } from './notes';

type Kind = 'read' | 'length' | 'ear' | 'mix';
type Shape = { value: Value; rest: boolean };
type Q = { kind: 'read'; midi: number } | { kind: 'length'; shape: Shape } | { kind: 'ear'; a: number; b: number; va: number; vb: number };
type Entry = { q: Q; misses: number; shown: boolean };
const ROUND = 8;

const readPool = [60, 62, 64, 65, 67, 69, 71, 72, 74, 76, 77, 79]; // C4 to G5, white keys
const shapes: Shape[] = [
 { value: 'whole', rest: false }, { value: 'dottedHalf', rest: false }, { value: 'half', rest: false }, { value: 'quarter', rest: false },
 { value: 'eighth', rest: false }, { value: 'whole', rest: true }, { value: 'half', rest: true }, { value: 'quarter', rest: true }
];
const beatChoices = [0.5, 1, 2, 3, 4];
const ears = ['higher', 'lower', 'same'] as const;

const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];
const shuffle = <T,>(a: T[]) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
const shapeName = (s: Shape) => s.rest ? restNames[s.value]! : valueNames[s.value];
const shapeItem = (s: Shape): Item => s.rest ? { kind: 'rest', value: s.value } : { kind: 'note', midi: [71], value: s.value };

function earQ(): Q {
 const a = 60 + Math.floor(Math.random() * 17);
 const diff = pick([-7, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 7, 12, -12]);
 const b = Math.min(84, Math.max(55, a + diff));
 // Sometimes make the higher note quieter, so loudness can't be used to guess pitch.
 const trick = b !== a && Math.random() < 0.45;
 const higher = b > a;
 return { kind: 'ear', a, b, va: trick ? (higher ? 0.95 : 0.35) : 0.75, vb: trick ? (higher ? 0.35 : 0.95) : 0.75 };
}

function deal(kind: Kind): Entry[] {
 const reads = shuffle(readPool), lens = shuffle(shapes);
 return Array.from({ length: ROUND }, (_, i) => {
  const k = kind === 'mix' ? (['read', 'length', 'ear'] as const)[i % 3] : kind;
  const q: Q = k === 'read' ? { kind: 'read', midi: reads[i % reads.length] } : k === 'length' ? { kind: 'length', shape: lens[i % lens.length] } : earQ();
  return { q, misses: 0, shown: false };
 });
}

const answerOf = (q: Q): string => q.kind === 'read' ? name(q.midi) : q.kind === 'length' ? String(beatsOf[q.shape.value]) : q.b > q.a ? 'higher' : q.b < q.a ? 'lower' : 'same';
const reviewLabel = (q: Q) => q.kind === 'read' ? `Read ${fullName(q.midi)}` : q.kind === 'length' ? `How long: ${shapeName(q.shape)}` : `Listen: ${fullName(q.a)} then ${fullName(q.b)}`;

// The nearest staff position with a given letter, for "one step too high" feedback.
function nearestStep(target: number, letter: string) {
 for (let d = 0; d <= 3; d++) for (const s of [target - d, target + d]) if (LETTERS[(((s + 2) % 7) + 7) % 7] === letter) return s;
 return target;
}

function readHelp(midi: number, picked: string) {
 const t = staffStep(midi), s = nearestStep(t, picked);
 const gap = s - t;
 const parts: string[] = [];
 parts.push(Math.abs(gap) === 1 ? `Close! ${picked} is one step ${gap > 0 ? 'higher' : 'lower'}, ${whereOnStaff(s)}.` : `${picked} would be ${whereOnStaff(s)}.`);
 if (gap % 2 !== 0 && t >= 0 && t <= 8) parts.push(onLine(t) ? 'A line runs right through the middle of this note, so it is a line note.' : 'This note sits between two lines, so it is a space note.');
 if (t === -2) parts.push('Middle C sits on its own short line below the staff.');
 else if (t === -1) parts.push('This note hangs just below the bottom line, which is E.');
 else if (t === 9) parts.push('This note sits just above the top line, which is F.');
 else if (onLine(t)) parts.push('Lines from the bottom: E, G, B, D, F (Every Good Bird Does Fly). Count up to this line.');
 else parts.push('The spaces from the bottom spell F, A, C, E.');
 return parts.join(' ');
}

function lengthHelp(s: Shape, picked: number) {
 const right = beatsOf[s.value];
 if (s.rest) {
  if (s.value === 'half' && picked === 4) return 'This rest sits on top of the middle line, like a hat: a half rest, 2 beats. A whole rest hangs down from the 4th line, like a hole.';
  if (s.value === 'whole' && picked === 2) return 'This rest hangs down from the 4th line, like a hole: a whole rest, 4 beats. A half rest sits on top of the middle line, like a hat.';
  if (s.value === 'quarter') return 'This squiggle is a quarter rest: 1 beat of silence. Rests are counted just like notes.';
 }
 if (s.value === 'half' && picked === 4) return 'It is hollow like a whole note, but it has a stem. Hollow with a stem is a half note: 2 beats.';
 if (s.value === 'whole' && picked === 2) return 'It is hollow like a half note, but it has no stem. A whole note lasts 4 beats.';
 if (s.value === 'dottedHalf') return 'Look for the dot. A dot adds half the note\'s length: a half note is 2 beats, plus 1 more makes 3.';
 if (s.value === 'eighth') return 'See the flag on the stem? A flag cuts a quarter note\'s time in half, so an eighth note lasts half a beat.';
 if (s.value === 'quarter' && picked === 0.5) return 'No flag on this one: filled in with a plain stem is a quarter note, 1 beat.';
 return `This is a ${shapeName(s)}. It lasts ${beatsText(right)}.`;
}

function earResult(q: Extract<Q, { kind: 'ear' }>) {
 const dir = q.b > q.a ? 'higher' : q.b < q.a ? 'lower' : 'the same';
 const parts = [`The second note was ${dir}${q.b !== q.a ? `: ${fullName(q.a)} is about ${Math.round(freq(q.a))} vibrations a second, and ${fullName(q.b)} is about ${Math.round(freq(q.b))}` : ''}.`];
 if (Math.abs(q.b - q.a) === 12) parts.push('They have the same letter name, an octave apart.');
 if (q.va !== q.vb) parts.push(`The second note was also ${q.vb > q.va ? 'louder' : 'quieter'}. Louder doesn't mean higher: pitch is about how fast something vibrates, not how hard.`);
 return parts.join(' ');
}

export default function Game() {
 const { muted } = useSound();
 const [kind, setKind] = useState<Kind>('read');
 const [items, setItems] = useState<Entry[]>(() => deal('read'));
 const [at, setAt] = useState(0);
 const [picked, setPicked] = useState<string | null>(null);
 const [done, setDone] = useState(false);
 const [flash, setFlash] = useState(false);
 const [heard, setHeard] = useState(false);
 const [said, setSaid] = useState('');
 const player = usePlayer();
 const nextRef = useRef<HTMLButtonElement>(null);
 const touched = useRef(false);

 const finished = at >= items.length;
 const item = items[Math.min(at, items.length - 1)];
 const q = item.q;
 const answer = answerOf(q);

 useEffect(() => { if (touched.current && done) nextRef.current?.focus({ preventScroll: true }); }, [done]);

 function restart(k = kind, qs?: Q[]) {
  player.stop();
  setItems(qs ? qs.map(x => ({ q: x.kind === 'ear' ? earQ() : x, misses: 0, shown: false })) : deal(k));
  setAt(0); setPicked(null); setDone(false); setFlash(false); setHeard(false);
 }

 function playEar() {
  if (q.kind !== 'ear') return;
  setHeard(true);
  player.play([{ t: 0, dur: 0.7, midi: q.a, vel: q.va }, { t: 0.9, dur: 0.9, midi: q.b, vel: q.vb }], 1.9);
 }
 function hearNote() {
  if (q.kind === 'read') { const r = noteOn(q.midi); window.setTimeout(r, 600); }
  if (q.kind === 'length') {
   const b = beatsOf[q.shape.value], spb = 0.6, n = Math.max(1, Math.ceil(b));
   const ev: Ev[] = Array.from({ length: n }, (_, i) => ({ t: i * spb, dur: 0.05, click: i === 0 ? 'accent' as const : 'beat' as const }));
   if (!q.shape.rest) ev.push({ t: 0, dur: b * spb * 0.9, midi: 67, hold: true, vel: 0.7 });
   player.play(ev, n * spb + 0.2);
  }
  if (q.kind === 'ear') playEar();
 }

 function choose(a: string) {
  if (done || finished) return;
  touched.current = true;
  setPicked(a);
  if (a === answer) {
   setDone(true); setFlash(false);
   setSaid('Correct!');
   if (q.kind === 'read') hearNote();
  } else {
   setItems(list => list.map((it, i) => i === at ? { ...it, misses: it.misses + 1 } : it));
   setSaid('Not that one. Try again.');
  }
 }

 function showMe() { setFlash(true); setItems(list => list.map((it, i) => i === at ? { ...it, shown: true } : it)); }
 function next() { player.stop(); setAt(at + 1); setPicked(null); setDone(false); setFlash(false); setHeard(false); }

 function keys(e: KeyboardEvent<HTMLDivElement>) {
  if (q.kind !== 'read' || e.ctrlKey || e.metaKey || e.altKey || (e.target as HTMLElement).tagName === 'INPUT') return;
  const L = e.key.toUpperCase();
  if ((LETTERS as readonly string[]).includes(L)) { e.preventDefault(); choose(L); }
 }

 const firstTry = items.filter(it => it.misses === 0 && !it.shown).length;
 const wrong = picked && !done ? picked : null;

 const kindBar = <div className="mu-seg" role="group" aria-label="Kind of question">
  {([['read', 'Read the note'], ['length', 'How long?'], ['ear', 'Higher or lower?'], ['mix', 'Mix']] as const).map(([k, label]) =>
   <button key={k} aria-pressed={kind === k} onClick={() => { setKind(k); restart(k); }}>{label}</button>)}
 </div>;

 if (finished) {
  const missed = items.filter(it => it.misses > 0 || it.shown).map(it => it.q);
  const stars = firstTry === items.length ? 3 : firstTry >= items.length * 0.6 ? 2 : 1;
  return <div className="mu-game mu-summary">
   <div className="mu-toolbar">{kindBar}</div>
   <p className="mu-stars" aria-label={`${stars} of 3 stars`}>{'★'.repeat(stars)}{'☆'.repeat(3 - stars)}</p>
   <p className="mu-score">You got <strong>{firstTry}</strong> of {items.length} on the first try.</p>
   <ol className="mu-review">{items.map((it, i) => <li key={i} className={it.misses || it.shown ? 'miss' : 'good'}>
    <span>{it.misses || it.shown ? '↺' : '✓'}</span> {reviewLabel(it.q)}{it.misses ? ` (${it.misses} ${it.misses === 1 ? 'try' : 'tries'} first)` : ''}{it.shown ? ', shown' : ''}
   </li>)}</ol>
   <div className="mu-actions center">
    {missed.length > 0 && <button className="mu-primary" onClick={() => restart(kind, shuffle(missed))}>Practice the ones I missed</button>}
    <button className={missed.length ? '' : 'mu-primary'} onClick={() => restart()}>Play a new round</button>
   </div>
   {missed.some(m => m.kind === 'ear') && <p className="mu-hint">Listening questions get two new notes when you practice, so you can't just remember the answer.</p>}
  </div>;
 }

 const clue = q.kind === 'read' ? 'What is the name of this note?' : q.kind === 'length' ? `How many beats does this ${q.shape.rest ? 'rest' : 'note'} last in 4/4 time?` : muted ? 'Sound is off, so read it instead: is the second note higher, lower, or the same as the first?' : 'Listen to two notes. Is the second note higher, lower, or the same as the first?';
 const choices: { id: string; label: string }[] = q.kind === 'read' ? LETTERS.slice().sort().map(l => ({ id: l, label: l }))
  : q.kind === 'length' ? beatChoices.map(b => ({ id: String(b), label: beatsText(b) }))
  : ears.map(e => ({ id: e, label: e === 'higher' ? '⬆ Higher' : e === 'lower' ? '⬇ Lower' : '＝ Same' }));
 const needEar = q.kind === 'ear' && !muted && !heard;
 const earStaff = q.kind === 'ear' && (muted || done);

 return <div className="mu-game" onKeyDown={keys}>
  <div className="mu-toolbar">
   {kindBar}
   <div className="mu-dots" aria-label={`Question ${at + 1} of ${items.length}`}>
    {items.map((it, i) => <span key={i} className={i < at ? (it.misses || it.shown ? 'miss' : 'good') : i === at ? 'now' : ''} />)}
    <span className="mu-dots-text">{at + 1} / {items.length}</span>
   </div>
  </div>

  <div className="mu-clue">
   <span className="mu-clue-label">{q.kind === 'read' ? 'Read it' : q.kind === 'length' ? 'Count it' : muted ? 'Look at it' : 'Hear it'}</span>
   <p className="mu-clue-text">{clue}</p>
   {canSpeak && !muted && <button className="mu-speak" aria-label="Read the question aloud" onClick={() => speak(clue)}>🔊</button>}
  </div>

  <div className="mu-game-grid">
   <div className="mu-card mu-game-card">
    {q.kind === 'read' && <Staff measures={[[{ kind: 'note', midi: [q.midi], value: 'whole' }]]} time={false} final={false} letters={done} label={done ? `The note ${fullName(q.midi)}.` : 'A note on the treble staff.'} />}
    {q.kind === 'length' && <div className="mu-big-glyph"><Glyph item={shapeItem(q.shape)} label={done ? shapeName(q.shape) : `A ${q.shape.rest ? 'rest' : 'note'}`} /></div>}
    {q.kind === 'ear' && (earStaff
     ? <Staff measures={[[{ kind: 'note', midi: [q.a], value: 'half' }, { kind: 'note', midi: [q.b], value: 'half' }]]} time={false} final={false} letters={done}
      label={`First note ${done ? fullName(q.a) : ''}, second note ${done ? fullName(q.b) : ''}${muted && !done ? `: the second note is written ${staffStep(q.b) > staffStep(q.a) ? 'higher' : staffStep(q.b) < staffStep(q.a) ? 'lower' : 'at the same place'}` : ''}.`} />
     : <div className="mu-ear"><button className="mu-primary mu-big" onClick={playEar}>{player.playing ? '♪ Playing…' : heard ? '↻ Play again' : '▶ Play the two notes'}</button>
      <p className="mu-hint">{player.playing ? (player.t! < 0.9 ? 'First note…' : 'Second note…') : 'You can play them as many times as you like.'}</p></div>)}
   </div>

   <div className="mu-game-side">
    <div className={`mu-answers${q.kind === 'read' ? ' letters' : ''}`} role="group" aria-label="Answers">
     {choices.map(c => <button key={c.id} disabled={needEar || done} className={`${flash && c.id === answer ? 'blink' : ''}${done && c.id === answer ? ' right' : ''}${wrong === c.id ? ' mu-shake' : ''}`} onClick={() => choose(c.id)}>{c.label}</button>)}
    </div>
    {q.kind === 'read' && !done && <p className="mu-hint">Tip: you can also press a letter key, A to G.</p>}
    <div aria-live="polite">
     {wrong && <div className="mu-feedback wrong">
      <p className="mu-headline">Not that one.</p>
      <p>{q.kind === 'read' ? readHelp(q.midi, wrong) : q.kind === 'length' ? lengthHelp(q.shape, Number(wrong)) : `Listen again. ${!muted ? 'Hum the first note, then the second. Did your voice go up or down?' : 'Which note is written higher on the staff?'}`}</p>
     </div>}
     {!done && flash && <p className="mu-feedback shown">The right answer is blinking. Press it to keep going.</p>}
     {!done && item.misses >= 2 && !flash && <button onClick={showMe}>Show me</button>}
     {done && <div className="mu-feedback right">
      <p className="mu-headline">{item.misses || item.shown ? 'There it is!' : 'Yes, first try!'}</p>
      <p>{q.kind === 'read' ? `This is ${fullName(q.midi)}, ${whereOnStaff(staffStep(q.midi))}.`
       : q.kind === 'length' ? `A ${shapeName(q.shape)} lasts ${beatsText(beatsOf[q.shape.value])}${q.shape.rest ? ' of silence' : ''}.`
       : earResult(q)}</p>
      <div className="mu-actions">
       {!muted && <button onClick={hearNote}>{q.kind === 'ear' ? '↻ Hear them again' : '▶ Hear it'}</button>}
       <button ref={nextRef} className="mu-primary" onClick={next}>{at + 1 === items.length ? 'See my score' : 'Next question →'}</button>
      </div>
     </div>}
    </div>
   </div>
  </div>
  <div className="mu-sr" aria-live="assertive">{said}</div>
 </div>;
}
