import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import Board, { type Range } from './Board';
import PlaceChart from './PlaceChart';
import {
 apply, callFits, callWords, checkCommas, classifyPoint, commaGaps, exponentForm, format, needsCommaStep, opSymbol, parse,
 decimalPlaces, powerWithCommas, randomCall, randomStart, validCalls, allCalls, type Call, type CommaCheck, type Num, type Op, type PointMistake, type Settings
} from './decimal';

type Mode = 'class' | 'solo';
type Kind = 'move' | 'mystery';
type Phase = 'pick' | 'predict' | 'move' | 'commas' | 'choose' | 'feedback' | 'summary';
type Turn = { id: number; kind: Kind; start: Num; call: Call | null; showPower: boolean };
type Miss = Exclude<PointMistake, 'none'> | 'commas' | 'mystery' | 'predict';
type Feedback = { done: boolean; firstTry: boolean; miss?: Miss; commas?: CommaCheck; guess?: Call; revealed?: boolean };
type Result = { turn: Turn & { call: Call }; firstTry: boolean; misses: Miss[] };

const ROUND = 10;
const defaults: Settings = {
 maxPower: 3, ops: 'both', start: 'mixed', size: 'medium', callFormat: 'number', challenge: 'move',
 commas: false, predict: true, chain: true, teacherCalls: false
};
const missNames: Record<Miss, string> = {
 predict: 'Predicted bigger or smaller the wrong way',
 stayed: "Didn't move the point",
 direction: 'Moved the point the wrong way',
 'direction-and-count': 'Wrong way and wrong number of places',
 count: 'Moved the wrong number of places',
 commas: 'Put commas in the wrong places',
 mystery: 'Named the wrong mystery call'
};
const crowd = ['#e2725b', '#4f8fd6', '#4caf7a', '#e7a43a', '#9b6bc7', '#3ab0b5', '#d0607e'];
const canSpeak = typeof window !== 'undefined' && 'speechSynthesis' in window;
const plural = (k: number, word: string) => `${k} ${word}${k === 1 ? '' : 's'}`;
const sameCall = (a: Call, b: Call) => a.op === b.op && a.power === b.power;

function rangeFor(start: Num, maxPower: number): Range {
 // Reach maxPower places either way (so the board never hints at the direction), plus one slot
 // for the 0 in the ones place when the point can land left of every digit.
 const lo = start.point - maxPower;
 return { min: lo <= 0 ? lo - 1 : 0, max: Math.max(start.digits.length, start.point + maxPower) };
}

let turnIds = 0;
const nextId = () => ++turnIds;

function newTurn(s: Settings, mode: Mode, from?: Num, previous?: Call): Turn {
 const start = from && validCalls(from, s).length ? from : randomStart(s);
 const kind: Kind = s.challenge === 'mystery' || (s.challenge === 'mix' && Math.random() < 0.35) ? 'mystery' : 'move';
 const teacherPicks = mode === 'class' && s.teacherCalls && kind === 'move';
 return {
  id: nextId(), kind, start, call: teacherPicks ? null : randomCall(start, s, previous),
  showPower: s.callFormat === 'power' || (s.callFormat === 'mixed' && Math.random() < 0.5)
 };
}

function CallLabel({ call, power }: { call: Call; power: boolean }) {
 return <>{opSymbol(call.op)} {power ? exponentForm(call.power) : powerWithCommas(call.power)}</>;
}

function speak(text: string) {
 if (!canSpeak) return;
 window.speechSynthesis.cancel();
 window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));
}

export default function DecimalMagnets() {
 const [settings, setSettings] = useState<Settings>(defaults);
 const [mode, setMode] = useState<Mode>('class');
 const [turn, setTurn] = useState<Turn>(() => newTurn(defaults, 'class'));
 const [phase, setPhase] = useState<Phase>(() => turn.kind === 'mystery' ? 'choose' : defaults.predict ? 'predict' : 'move');
 const [placed, setPlaced] = useState(turn.start.point);
 const [commas, setCommas] = useState<Set<number>>(new Set());
 const [prediction, setPrediction] = useState<'bigger' | 'smaller' | null>(null);
 const [guess, setGuess] = useState<{ op: Op | null; power: number | null }>({ op: null, power: null });
 const [feedback, setFeedback] = useState<Feedback | null>(null);
 const [misses, setMisses] = useState<Miss[]>([]);
 const [settle, setSettle] = useState(false);
 const [showWhy, setShowWhy] = useState(true);
 const [stats, setStats] = useState({ turns: 0, firstTry: 0, streak: 0, best: 0 });
 const [results, setResults] = useState<Result[]>([]);
 const [replays, setReplays] = useState<Result['turn'][]>([]);
 const [custom, setCustom] = useState('');
 const [customError, setCustomError] = useState('');

 const boardRef = useRef<HTMLDivElement>(null);
 const primaryRef = useRef<HTMLButtonElement>(null);
 const touched = useRef(false); // don't steal focus on first load

 const { start, call, kind } = turn;
 const answer = call ? apply(start, call) : start;
 const range = rangeFor(start, settings.maxPower);
 const times = call?.op === 'times';
 const P = call ? powerWithCommas(call.power) : '';
 const moved = placed - start.point;
 const roundNumber = results.length + (feedback?.done ? 0 : 1);

 useEffect(() => {
  if (!touched.current) return;
  if (phase === 'move') boardRef.current?.focus({ preventScroll: true });
  else if (phase === 'feedback' || phase === 'summary') primaryRef.current?.focus({ preventScroll: true });
 }, [phase, turn]);

 function begin(next: Turn, s = settings) {
  setTurn(next);
  setPhase(next.call === null ? 'pick' : next.kind === 'mystery' ? 'choose' : s.predict ? 'predict' : 'move');
  setPlaced(next.start.point);
  setCommas(new Set());
  setPrediction(null);
  setGuess({ op: null, power: null });
  setFeedback(null);
  setMisses([]);
  setSettle(false);
 }

 function restart(s: Settings, m: Mode, from?: Num) {
  touched.current = true;
  setStats({ turns: 0, firstTry: 0, streak: 0, best: 0 });
  setResults([]);
  setReplays([]);
  begin(newTurn(s, m, from), s);
 }

 function change<K extends keyof Settings>(key: K, value: Settings[K]) {
  const next = { ...settings, [key]: value };
  setSettings(next);
  restart(next, mode);
 }

 function switchMode(m: Mode) {
  setMode(m);
  restart(settings, m);
 }

 function next() {
  touched.current = true;
  if (mode === 'solo' && results.length >= ROUND) { setPhase('summary'); return; }
  if (mode === 'solo' && replays.length) {
   const [first, ...rest] = replays;
   setReplays(rest);
   begin({ ...first, id: nextId() });
   return;
  }
  const chainFrom = mode === 'class' && settings.chain && feedback?.done ? answer : undefined;
  begin(newTurn(settings, mode, chainFrom, call ?? undefined));
 }

 function finish(firstTry: boolean, extra: Partial<Feedback> = {}) {
  const fb = { done: true, firstTry, ...extra };
  setFeedback(fb);
  setPhase('feedback');
  if (!call) return;
  setStats(st => {
   const streak = firstTry ? st.streak + 1 : 0;
   return { turns: st.turns + 1, firstTry: st.firstTry + (firstTry ? 1 : 0), streak, best: Math.max(st.best, streak) };
  });
  setResults(r => [...r, { turn: { ...turn, call }, firstTry, misses: misses.concat(extra.miss ? [extra.miss] : []) }]);
 }

 function miss(m: Miss, extra: Partial<Feedback> = {}) {
  setMisses(ms => [...ms, m]);
  setFeedback({ done: false, firstTry: false, miss: m, ...extra });
  setPhase('feedback');
 }

 const clean = () => misses.every(m => m === 'predict');

 function pickCall(c: Call) {
  touched.current = true;
  setTurn(t => ({ ...t, call: c }));
  setPhase(settings.predict ? 'predict' : 'move');
 }

 function predict(p: 'bigger' | 'smaller') {
  touched.current = true;
  setPrediction(p);
  if ((p === 'bigger') !== times) setMisses(ms => [...ms, 'predict']);
  setPhase('move');
 }

 function checkPoint() {
  if (!call) return;
  touched.current = true;
  const result = classifyPoint(start, placed, call);
  if (result !== 'none') { miss(result); return; }
  if (settings.commas && needsCommaStep(answer)) { setCommas(new Set()); setFeedback(null); setPhase('commas'); return; }
  finish(clean());
 }

 function checkCommaStep() {
  touched.current = true;
  const c = checkCommas(answer, commas);
  if (c.ok) finish(clean());
  else miss('commas', { commas: c });
 }

 function checkGuess() {
  if (!call || !guess.op || !guess.power) return;
  touched.current = true;
  const g = { op: guess.op, power: guess.power };
  if (sameCall(g, call)) finish(clean());
  else miss('mystery', { guess: g });
 }

 function tryAgain() {
  touched.current = true;
  const m = feedback?.miss;
  setFeedback(null);
  if (m === 'commas') setPhase('commas');
  else if (m === 'mystery') { setGuess({ op: null, power: null }); setPhase('choose'); }
  else { setPlaced(start.point); setPhase('move'); }
 }

 function reveal() {
  touched.current = true;
  setSettle(true);
  setPlaced(answer.point);
  setCommas(new Set(settings.commas ? commaGaps(answer.point) : []));
  finish(false, { revealed: true, miss: undefined });
 }

 function applyCustom() {
  const n = parse(custom);
  if (!n) { setCustomError('Use a number that is not zero, with up to 7 digits before the point and up to 4 after.'); return; }
  if (!validCalls(n, settings).length) { setCustomError('None of the current calls fit that number on the board. Try a smaller number or change the calls.'); return; }
  setCustomError('');
  restart(settings, mode, n);
 }

 function replayMissed() {
  const missed = results.filter(r => !r.firstTry).map(r => r.turn);
  touched.current = true;
  setResults([]);
  setStats({ turns: 0, firstTry: 0, streak: 0, best: 0 });
  setReplays(missed.slice(1));
  begin({ ...missed[0], id: nextId() });
 }

 // ---- What the board shows right now ----
 const showingCommas = phase === 'commas' || (phase === 'feedback' && (feedback?.done || feedback?.miss === 'commas'))
  ? commas
  : new Set(settings.commas && placed === start.point && kind === 'move' ? commaGaps(start.point) : []);
 const boardMode = phase === 'move' ? 'point' : phase === 'commas' ? 'commas' : 'static';
 const finalShown = phase === 'feedback' && feedback?.done;
 const pointLabel = call ? `Decimal point magnet. Use the left and right arrow keys to move it, then press Enter to check. Show ${format(start)} ${opSymbol(call.op)} ${P}.` : 'Decimal point magnet.';

 const zerosIn = (n: Num) => Math.max(0, n.point - n.digits.length) + Math.max(0, -n.point);
 const zerosAdded = zerosIn(answer) - zerosIn(start);

 function hint(): ReactNode {
  if (!call || !feedback?.miss) return null;
  const dir = times ? 'right' : 'left';
  const size = times ? 'bigger' : 'smaller';
  const count = turn.showPower
   ? <>In {exponentForm(call.power)}, the small raised number (the exponent) tells you how many places to move.</>
   : <>Count the zeros in {P}.</>;
  switch (feedback.miss) {
   case 'stayed': return <>The point hasn't moved yet. {callWords(call)} changes the number, so the point has to move.</>;
   case 'direction': return <>You moved the right number of places, but the wrong way. Moving the point {times ? 'left' : 'right'} makes a number {times ? 'smaller' : 'bigger'}. {times ? 'Multiplying' : 'Dividing'} by {P} should make it {size}.</>;
   case 'direction-and-count': return <>Check the direction first: {times ? 'multiplying' : 'dividing'} by {P} makes the number {size}, so the point moves to the {dir}. Then count the places. {count}</>;
   case 'count': return <>Right direction! You moved {plural(Math.abs(moved), 'place')}, but that's not quite it. {count}</>;
   case 'commas': {
    const c = feedback.commas!;
    const want = commaGaps(answer.point).length;
    if (c.inDecimal) return <>Commas only go in the whole-number part, to the left of the point. The digits after the point never get commas.</>;
    if (!want) return <>This number doesn't need any commas. It has 3 or fewer digits before the point.</>;
    if (!commas.size) return <>This number is big enough to need {want === 1 ? 'a comma' : 'commas'}.</>;
    return <>Start at the decimal point and count three digits to the left, then put a comma. Keep going in groups of three.</>;
   }
   case 'mystery': {
    const g = feedback.guess!;
    if (g.op !== call.op) return <>Look at the two numbers again. Did it get bigger or smaller? A number gets bigger when you multiply by 10, 100, or 1,000, and smaller when you divide.</>;
    return <>Right operation! Now count how many places the point moved from the top board to the bottom board, and match that to the number of zeros.</>;
   }
   default: return null;
  }
 }

 function explanation() {
  if (!call) return null;
  const k = call.power, s = k === 1 ? '' : 's';
  return <>
   <p>{times ? 'Multiplying' : 'Dividing'} by {P} {turn.showPower && <>(that's {exponentForm(k)} = {k === 1 ? '10' : Array(k).fill('10').join(' × ')} = {P}) </>}
    {times ? <>makes every digit worth {P} times as much. On the board, the point moves <strong>{k} place{s} to the right</strong>.</> : <>makes every digit worth 1/{P} as much. On the board, the point moves <strong>{k} place{s} to the left</strong>.</>}
    {' '}{P} has {plural(k, 'zero')}, so that's {plural(k, 'hop')}.</p>
   {zerosAdded > 0 && <p>The point went past the last digit, so {zerosAdded === 1 ? 'a placeholder zero fills the empty place' : `${zerosAdded} placeholder zeros fill the empty places`}.</p>}
   {zerosAdded < 0 && <p>{zerosAdded === -1 ? 'A placeholder zero is' : 'Some placeholder zeros are'} no longer needed, so {zerosAdded === -1 ? 'it comes' : 'they come'} off the board.</p>}
   {answer.point <= 0 && <p>We write a 0 in the ones place ({format(answer)} instead of {format(answer).slice(1)}) so the point is easy to see.</p>}
   {times && decimalPlaces(start) > 0 && <p className="dm-watch"><strong>Watch out:</strong> {format(start)} × {P} is not {format(start)}{'0'.repeat(k)}. Writing zeros on the end of a decimal doesn't change its value.</p>}
  </>;
 }

 const missedCount = results.filter(r => !r.firstTry).length;
 const tally = results.flatMap(r => r.misses).reduce<Record<string, number>>((t, m) => ({ ...t, [m]: (t[m] ?? 0) + 1 }), {});

 return <div className="activity dm">
  <h2>Decimal Magnets: move the point</h2>
  <p>Digits go up on the board, and a button magnet is the decimal point. When you hear a call like <strong>“multiply by 100”</strong> or <strong>“divide by 1,000”</strong>, slide the point to show the new number.</p>

  <div className="dm-modes" role="group" aria-label="Who is playing">
   <button aria-pressed={mode === 'class'} onClick={() => switchMode('class')}><span aria-hidden="true">👥</span> Whole class line-up</button>
   <button aria-pressed={mode === 'solo'} onClick={() => switchMode('solo')}><span aria-hidden="true">🧑‍🎓</span> Practice on my own</button>
  </div>

  {mode === 'class'
   ? <div className="dm-line-wrap">
    <div key={turn.id} className="dm-line" aria-hidden="true">
     <span className="dm-up">Up now</span>
     {crowd.map((_, i) => <svg key={i} viewBox="0 0 24 34" className={i === 0 ? 'front' : ''} style={{ '--c': crowd[(turn.id + i) % crowd.length] } as CSSProperties}><circle cx="12" cy="8" r="6" /><path d="M2 34 Q2 16 12 16 Q22 16 22 34 Z" /></svg>)}
    </div>
    <dl className="dm-stats">
     <div><dt>Turn</dt><dd>{stats.turns + (feedback?.done ? 0 : 1)}</dd></div>
     <div><dt>Right first try</dt><dd>{stats.firstTry} of {stats.turns}</dd></div>
     <div><dt>Class streak</dt><dd>{stats.streak}{stats.streak >= 3 && <span aria-hidden="true"> 🔥</span>}</dd></div>
     <div><dt>Best streak</dt><dd>{stats.best}</dd></div>
    </dl>
   </div>
   : phase !== 'summary' && <div className="dm-progress" aria-label={`Problem ${Math.min(roundNumber, ROUND)} of ${ROUND}`}>
    {Array.from({ length: ROUND }, (_, i) => <span key={i} className={i < results.length ? (results[i].firstTry ? 'good' : 'miss') : i === results.length ? 'now' : ''} />)}
    <span className="dm-progress-text">Problem {Math.min(roundNumber, ROUND)} of {ROUND}{replays.length > 0 && ` · ${replays.length} more to retry`}</span>
   </div>}

  {phase === 'summary' ? <div className="dm-summary" aria-live="polite">
   <h3>Round complete</h3>
   <p className="dm-score"><strong>{ROUND - missedCount}</strong> of {ROUND} right on the first try</p>
   <p className="dm-stars" aria-hidden="true">{'★'.repeat(missedCount === 0 ? 3 : missedCount <= 2 ? 2 : 1)}{'☆'.repeat(missedCount === 0 ? 0 : missedCount <= 2 ? 1 : 2)}</p>
   {Object.keys(tally).length > 0 && <><h4>Things to work on</h4><ul>{Object.entries(tally).map(([m, c]) => <li key={m}>{missNames[m as Miss]}: {c}</li>)}</ul></>}
   <ol className="dm-review">{results.map((r, i) => <li key={i} className={r.firstTry ? 'good' : 'miss'}>
    <span aria-label={r.firstTry ? 'Right first try' : 'Needed help'}>{r.firstTry ? '✓' : '↻'}</span>{' '}
    {r.turn.kind === 'mystery' ? 'Mystery: ' : ''}{format(r.turn.start)} <CallLabel call={r.turn.call} power={r.turn.showPower} /> = {format(apply(r.turn.start, r.turn.call))}
   </li>)}</ol>
   <div className="dm-actions">
    {missedCount > 0 && <button ref={primaryRef} className="dm-primary" onClick={replayMissed}>Retry the {plural(missedCount, 'one')} I missed</button>}
    <button ref={missedCount ? undefined : primaryRef} className={missedCount ? '' : 'dm-primary'} onClick={() => restart(settings, mode)}>New round</button>
   </div>
  </div> : <>
   {/* ---- The call card ---- */}
   <div className="dm-stage">
    {phase === 'pick' ? <div className="dm-card dm-pick">
     <span className="dm-card-label">Teacher: choose the call</span>
     <div className="dm-call-grid">{allCalls(settings).map(c => <button key={`${c.op}${c.power}`} disabled={!callFits(start, c)} onClick={() => pickCall(c)}><CallLabel call={c} power={turn.showPower} /></button>)}</div>
     <button className="dm-link" onClick={() => pickCall(randomCall(start, settings))}>Surprise me</button>
    </div> : kind === 'mystery' ? <div className="dm-card dm-mystery-card">
     <span className="dm-card-label">Mystery call</span>
     <span className="dm-call" aria-hidden="true">{finalShown && call ? <CallLabel call={call} power={turn.showPower} /> : '?'}</span>
     <span className="dm-card-words">{finalShown && call ? callWords(call) : 'What call changed the top board into the bottom one?'}</span>
    </div> : call && <div className="dm-card">
     <span className="dm-card-label">The call</span>
     <span className="dm-call"><CallLabel call={call} power={turn.showPower} /></span>
     <span className="dm-card-words">{callWords(call)}</span>
     {canSpeak && <button className="dm-speak" onClick={() => speak(callWords(call))} aria-label={`Read the call aloud: ${callWords(call)}`}><span aria-hidden="true">🔊</span></button>}
    </div>}

    {/* ---- The board(s) ---- */}
    <div className="dm-boards">
     {kind === 'mystery' && <div className="dm-board-label">Before</div>}
     <Board digits={start.digits} point={kind === 'mystery' ? start.point : placed} range={range} commas={kind === 'mystery' ? new Set(settings.commas ? commaGaps(start.point) : []) : showingCommas}
      mode={kind === 'mystery' ? 'static' : boardMode} label={kind === 'mystery' ? 'Before the call.' : pointLabel} rowRef={boardRef}
      startPoint={kind === 'move' && (phase === 'move' || phase === 'feedback') ? start.point : undefined}
      hops={kind === 'move' && finalShown && showWhy ? { from: start.point, to: answer.point } : undefined}
      settle={settle} onPoint={g => { setSettle(false); setPlaced(g); }} onToggleComma={g => setCommas(c => { const n = new Set(c); if (n.has(g)) n.delete(g); else n.add(g); return n; })} onSubmit={checkPoint} />
     {kind === 'mystery' && <>
      <div className="dm-board-label">After</div>
      <Board digits={start.digits} point={answer.point} range={range} commas={new Set(settings.commas ? commaGaps(answer.point) : [])} mode="static" label="After the call."
       startPoint={start.point} hops={finalShown && showWhy ? { from: start.point, to: answer.point } : undefined} />
     </>}
    </div>
   </div>

   {/* ---- What to do now ---- */}
   <div className="dm-panel">
    {phase === 'pick' && <p className="dm-prompt">Start with <strong>{format(start)}</strong> on the board. Choose a call, read it out, and send the next student up.</p>}

    {phase === 'predict' && call && <div className="dm-ask">
     <p className="dm-prompt">Before you touch the magnet: will <strong>{format(start)} {opSymbol(call.op)} {P}</strong> be bigger or smaller than {format(start)}?</p>
     <div className="dm-choices"><button onClick={() => predict('bigger')}><span aria-hidden="true">⬆</span> Bigger</button><button onClick={() => predict('smaller')}><span aria-hidden="true">⬇</span> Smaller</button></div>
    </div>}

    {phase === 'move' && call && <div className="dm-ask">
     {prediction && <p className={`dm-predicted${(prediction === 'bigger') === times ? '' : ' off'}`} aria-live="polite">
      {(prediction === 'bigger') === times
       ? <>Yes, it will be {prediction}. {times ? 'Multiplying' : 'Dividing'} by {P} makes a number {prediction}.</>
       : <>Think again: {times ? 'multiplying' : 'dividing'} by {P} makes a number <strong>{times ? 'bigger' : 'smaller'}</strong>, not {prediction}.</>}
     </p>}
     <p className="dm-prompt">Slide the button magnet to show <strong>{format(start)} {opSymbol(call.op)} {P}</strong>. Drag it, tap where it should go, or use the arrow keys.</p>
     <p className="dm-reading">
      <span>The board reads <strong>{format({ digits: start.digits, point: placed }, false)}</strong></span>
      <span className="dm-moved">{moved === 0 ? 'Point not moved yet' : `Moved ${plural(Math.abs(moved), 'place')} ${moved > 0 ? 'right →' : '← left'}`}</span>
     </p>
     <div className="dm-actions"><button className="dm-primary" onClick={checkPoint}>Check</button></div>
    </div>}

    {phase === 'commas' && <div className="dm-ask">
     <p className="dm-good" aria-live="polite"><strong>The point is in the right place!</strong> Now the commas. They came off when the point moved.</p>
     <p className="dm-prompt">Tap between two magnets to add or remove a comma. If the number doesn't need any commas, just press Check.</p>
     <div className="dm-actions"><button className="dm-primary" onClick={checkCommaStep}>Check{commas.size === 0 ? ' (no commas)' : ''}</button></div>
    </div>}

    {phase === 'choose' && call && <div className="dm-ask">
     <p className="dm-prompt">The number changed from <strong>{format(start)}</strong> to <strong>{format(answer)}</strong>. What was the call?</p>
     <div className="dm-guess" role="group" aria-label="Multiply or divide">
      {(settings.ops === 'both' ? ['times', 'divide'] as const : [settings.ops]).map(op => <button key={op} aria-pressed={guess.op === op} onClick={() => setGuess(g => ({ ...g, op }))}>{opSymbol(op)} {op === 'times' ? 'Multiply' : 'Divide'}</button>)}
     </div>
     <div className="dm-guess" role="group" aria-label="By how much">
      {Array.from({ length: settings.maxPower }, (_, i) => i + 1).map(p => <button key={p} aria-pressed={guess.power === p} onClick={() => setGuess(g => ({ ...g, power: p }))}>{turn.showPower ? exponentForm(p) : powerWithCommas(p)}</button>)}
     </div>
     <div className="dm-actions"><button className="dm-primary" disabled={!guess.op || !guess.power} onClick={checkGuess}>Check</button></div>
    </div>}

    <div aria-live="polite">
     {phase === 'feedback' && feedback && call && (feedback.done
      ? <div className={`dm-feedback ${feedback.revealed ? 'shown' : 'right'}`}>
       <p className="dm-headline">{feedback.revealed ? 'Here it is:' : feedback.firstTry ? <><span aria-hidden="true">🎉 </span>Right on the first try!</> : 'You got it!'}</p>
       <p className="dm-equation">{format(start)} <CallLabel call={call} power={turn.showPower} /> = <strong>{format(answer)}</strong></p>
       <details open={showWhy} onToggle={e => setShowWhy((e.currentTarget as HTMLDetailsElement).open)}>
        <summary>Why does it work?</summary>
        {explanation()}
        <PlaceChart before={start} after={answer} call={call} />
       </details>
       <div className="dm-actions">
        <button ref={primaryRef} className="dm-primary" onClick={next}>{mode === 'solo' && results.length >= ROUND ? 'See my results' : mode === 'class' ? 'Next student' : 'Next problem'} →</button>
        {mode === 'class' && settings.chain && <span className="dm-chain-note">The next student starts from {format(answer)}.</span>}
       </div>
      </div>
      : <div className="dm-feedback wrong">
       <p className="dm-headline">Not quite.</p>
       <p>{hint()}</p>
       <div className="dm-actions">
        <button ref={primaryRef} className="dm-primary" onClick={tryAgain}>Try again</button>
        <button onClick={reveal}>Show the answer</button>
       </div>
      </div>)}
    </div>
   </div>
  </>}

  {/* ---- Teacher settings ---- */}
  <details className="dm-settings">
   <summary>Teacher settings</summary>
   <div className="dm-settings-grid">
    <label>Calls go up to
     <select value={settings.maxPower} onChange={e => change('maxPower', Number(e.target.value) as Settings['maxPower'])}>
      {[1, 2, 3, 4].map(p => <option key={p} value={p}>{powerWithCommas(p)}</option>)}
     </select>
    </label>
    <label>Calls
     <select value={settings.ops} onChange={e => change('ops', e.target.value as Settings['ops'])}>
      <option value="both">Multiply and divide</option><option value="times">Multiply only</option><option value="divide">Divide only</option>
     </select>
    </label>
    <label>Show calls as
     <select value={settings.callFormat} onChange={e => change('callFormat', e.target.value as Settings['callFormat'])}>
      <option value="number">× 100</option><option value="power">× 10² (exponents)</option><option value="mixed">A mix of both</option>
     </select>
    </label>
    <label>Starting numbers
     <select value={settings.start} onChange={e => change('start', e.target.value as Settings['start'])}>
      <option value="mixed">Whole numbers and decimals</option><option value="whole">Whole numbers only</option><option value="decimal">Decimals only</option>
     </select>
    </label>
    <label>How many digits
     <select value={settings.size} onChange={e => change('size', e.target.value as Settings['size'])}>
      <option value="small">2 to 3</option><option value="medium">3 to 4</option><option value="large">4 to 6</option>
     </select>
    </label>
    <label>Challenge
     <select value={settings.challenge} onChange={e => change('challenge', e.target.value as Settings['challenge'])}>
      <option value="move">Move the point</option><option value="mystery">Mystery calls (name the call)</option><option value="mix">A mix of both</option>
     </select>
    </label>
   </div>
   <div className="dm-toggles">
    <label><input type="checkbox" checked={settings.commas} onChange={e => change('commas', e.target.checked)} /> Commas: students put the commas back after moving the point</label>
    <label><input type="checkbox" checked={settings.predict} onChange={e => change('predict', e.target.checked)} /> Predict “bigger or smaller” before moving</label>
    <label><input type="checkbox" checked={settings.chain} disabled={mode !== 'class'} onChange={e => change('chain', e.target.checked)} /> Keep the digits: each student starts from the last answer (whole class only)</label>
    <label><input type="checkbox" checked={settings.teacherCalls} disabled={mode !== 'class'} onChange={e => change('teacherCalls', e.target.checked)} /> I'll choose each call myself (whole class only)</label>
   </div>
   <div className="dm-custom">
    <label>Put your own number on the board
     <input inputMode="decimal" value={custom} placeholder="e.g. 4,072.5" onChange={e => setCustom(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') applyCustom(); }} aria-describedby="dm-custom-help" />
    </label>
    <button onClick={applyCustom}>Use it</button>
    <p id="dm-custom-help" className={customError ? 'dm-error' : ''}>{customError || 'Changing a setting or the number starts fresh and clears the score.'}</p>
   </div>
  </details>
 </div>;
}
