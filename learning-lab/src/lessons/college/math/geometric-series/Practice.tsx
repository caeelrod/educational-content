import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ONE, abs, div, eq, mul, neg, parse, pow, q, say, sub, val, type Q } from './frac';
import { Frac, Num, Sigma, V } from './MathText';

type Problem = { start: number; body: ReactNode; label: string; term: (n: number) => Q; coef?: Q };
type Stage = 'a' | 'r' | 'conv' | 'sum' | 'done';
type Entry = { p: Problem; misses: number; shown: boolean };
const ROUND = 6;

const rand = (lo: number, hi: number) => lo + Math.floor(Math.random() * (hi - lo + 1));
const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];
const shuffle = <T,>(a: T[]) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
// A proper fraction p/q in lowest terms with q from 2 to 5.
function proper() { for (;;) { const d = rand(2, 5), n = rand(1, d - 1); if (q(n, d).d === d) return { p: n, d }; } }
const pf = (p: number, d: number) => <>(<Frac top={p} bottom={d} />)</>;
const n_ = <V>n</V>;

// Each maker returns a series written the way textbooks and exams write them.
// The first term and ratio are always computed from term(), so answers are correct by construction.
const makers: (() => Problem)[] = [
 () => { const c = rand(2, 6), { p, d } = proper(); return { start: 0, coef: q(c), label: `sum from n equals 0 to infinity of ${c} times (${p}/${d}) to the n`,
  body: <>{c}{pf(p, d)}<sup>n</sup></>, term: n => mul(q(c), pow(q(p, d), n)) }; },
 () => { const c = rand(2, 6), { p, d } = proper(); return { start: 1, coef: q(c), label: `sum from n equals 1 to infinity of ${c} times (${p}/${d}) to the n`,
  body: <>{c}{pf(p, d)}<sup>n</sup></>, term: n => mul(q(c), pow(q(p, d), n)) }; },
 () => { const c = rand(2, 6), { p, d } = proper(); return { start: 1, coef: q(c), label: `sum from n equals 1 to infinity of ${c} times (${p}/${d}) to the n minus 1`,
  body: <>{c}{pf(p, d)}<sup>n−1</sup></>, term: n => mul(q(c), pow(q(p, d), n - 1)) }; },
 () => { const c = rand(1, 5), d = rand(2, 5); return { start: 0, coef: q(c), label: `sum from n equals 0 to infinity of (−1) to the n times ${c} over ${d} to the n`,
  body: <><Frac top={<>(−1)<sup>n</sup>{c > 1 ? `·${c}` : ''}</>} bottom={<>{d}<sup>n</sup></>} /></>, term: n => q((n % 2 ? -1 : 1) * c, d ** n) }; },
 () => { const c = rand(2, 6), d = rand(2, 5); return { start: 1, coef: q(c), label: `sum from n equals 1 to infinity of (−1) to the n plus 1 times ${c} over ${d} to the n`,
  body: <><Frac top={<>(−1)<sup>n+1</sup>·{c}</>} bottom={<>{d}<sup>n</sup></>} /></>, term: n => q((n % 2 ? 1 : -1) * c, d ** n) }; },
 () => { const [p, d] = pick([[2, 3], [2, 5], [3, 4], [3, 5], [4, 5]]); return { start: 1, label: `sum from n equals 1 to infinity of ${p} to the n over ${d} to the n plus 1`,
  body: <Frac top={<>{p}<sup>n</sup></>} bottom={<>{d}<sup>n+1</sup></>} />, term: n => q(p ** n, d ** (n + 1)) }; },
 () => { const { p, d } = proper(); return { start: 2, label: `sum from n equals 2 to infinity of (${p}/${d}) to the n`,
  body: <>{pf(p, d)}<sup>n</sup></>, term: n => pow(q(p, d), n) }; },
 () => { const m = pick([3, 5, 7, 9]); return { start: 0, label: `sum from n equals 0 to infinity of 2 to the 2n over ${m} to the n`,
  body: <Frac top={<>2<sup>2n</sup></>} bottom={<>{m}<sup>n</sup></>} />, term: n => q(4 ** n, m ** n) }; },
 () => { const c = rand(2, 6), { p, d } = proper(); return { start: 0, coef: q(c), label: `sum from n equals 0 to infinity of ${c} times (negative ${p}/${d}) to the n`,
  body: <>{c}(−<Frac top={p} bottom={d} />)<sup>n</sup></>, term: n => mul(q(c), pow(q(-p, d), n)) }; },
];
// Always-divergent makers, so every round has at least one series that fails the test.
const divergent: (() => Problem)[] = [
 () => { const c = rand(1, 4), [m, d] = pick([[3, 2], [5, 4], [4, 3], [5, 3]]); return { start: 1, coef: q(c), label: `sum from n equals 1 to infinity of ${c > 1 ? c + ' times ' : ''}${m} to the n over ${d} to the n`,
  body: <Frac top={<>{c > 1 ? `${c}·` : ''}{m}<sup>n</sup></>} bottom={<>{d}<sup>n</sup></>} />, term: n => q(c * m ** n, d ** n) }; },
 () => { const c = rand(2, 5); return { start: 0, coef: q(c), label: `sum from n equals 0 to infinity of ${c} times (−1) to the n`,
  body: <>{c}(−1)<sup>n</sup></>, term: n => q((n % 2 ? -1 : 1) * c) }; },
];

function deal(): Entry[] {
 const list = [...shuffle(makers).slice(0, ROUND - 1).map(m => m()), pick(divergent)()];
 return shuffle(list).map(p => ({ p, misses: 0, shown: false }));
}

const facts = (p: Problem) => { const a = p.term(p.start), r = div(p.term(p.start + 1), a); return { a, r, conv: Math.abs(val(r)) < 1, sum: div(a, sub(ONE, r)) }; };
const termsText = (p: Problem) => [0, 1, 2].map(i => p.term(p.start + i));

// A decimal close to the exact answer counts, with a note about the exact value.
function matches(ans: Q, want: Q, typed: string) { return eq(ans, want) || (typed.includes('.') && Math.abs(val(ans) - val(want)) < 5e-4); }

export default function Practice() {
 const [round, setRound] = useState<Entry[]>(deal);
 const [i, setI] = useState(0);
 const [stage, setStage] = useState<Stage>('a');
 const [text, setText] = useState('');
 const [msg, setMsg] = useState<{ tone: 'good' | 'bad' | 'info'; body: ReactNode } | null>(null);
 const [stageMisses, setStageMisses] = useState(0);
 const [showTerms, setShowTerms] = useState(false);
 const input = useRef<HTMLInputElement>(null);
 const entry = round[i];
 const finished = i >= round.length;
 const p = entry?.p;
 const f = p ? facts(p) : null;

 useEffect(() => { if (stage === 'a' || stage === 'r' || stage === 'sum') input.current?.focus({ preventScroll: true }); }, [stage, i]);

 function miss() {
  setStageMisses(m => m + 1);
  setRound(rs => rs.map((e, k) => k === i ? { ...e, misses: e.misses + 1 } : e));
 }
 function advance(next: Stage, good: ReactNode) {
  setMsg({ tone: 'good', body: good }); setStage(next); setText(''); setStageMisses(0);
 }

 function check() {
  if (!p || !f) return;
  const ans = parse(text);
  if (!ans) { setMsg({ tone: 'info', body: 'Type a number or fraction, such as 3/4, −2/5, or 1.5.' }); return; }
  const approx = (want: Q) => !eq(ans, want) ? <> (exactly <Num v={want} />)</> : null;
  const [t0, t1] = termsText(p);
  if (stage === 'a') {
   if (matches(ans, f.a, text)) return advance('r', <>Yes. Plugging in the starting index <V>n</V> = {p.start} gives <V>a</V> = <Num v={f.a} />{approx(f.a)}.</>);
   miss();
   const body = p.coef && eq(ans, p.coef) && !eq(p.coef, f.a) ? <>That's the number in front, but the first term is the whole expression at the starting index. This sum starts at <V>n</V> = {p.start}, so plug that in.</>
    : eq(ans, t1) ? <>That's the second term. The sum starts at <V>n</V> = {p.start}, so the first term is what <V>n</V> = {p.start} gives.</>
    : p.start !== 0 && eq(ans, p.term(0)) ? <>That's what <V>n</V> = 0 would give, but look under the ∑: this sum starts at <V>n</V> = {p.start}.</>
    : eq(ans, f.r) ? <>That's the ratio between terms. The first term is the expression evaluated at <V>n</V> = {p.start}.</>
    : <>Not quite. Plug <V>n</V> = {p.start} into the expression and simplify. Writing out the first few terms helps.</>;
   setMsg({ tone: 'bad', body });
  } else if (stage === 'r') {
   if (matches(ans, f.r, text)) return advance('conv', <>Right: <V>r</V> = second term ÷ first term = <Num v={t1} /> ÷ <Num v={t0} paren /> = <Num v={f.r} />{approx(f.r)}.</>);
   miss();
   const body = !eq(f.r, q(0)) && eq(ans, div(ONE, f.r)) ? <>That's upside down. The ratio is what you <em>multiply</em> one term by to get the next: second ÷ first.</>
    : eq(ans, neg(f.r)) ? <>Check the sign. Do the terms switch between positive and negative? If so, <V>r</V> is negative.</>
    : eq(ans, f.a) && !eq(f.a, f.r) ? <>That's the first term. The ratio is second term ÷ first term.</>
    : <>Divide the second term by the first: <Num v={t1} /> ÷ <Num v={t0} paren />.</>;
   setMsg({ tone: 'bad', body });
  } else if (stage === 'sum') {
   if (matches(ans, f.sum, text)) return finish(<>Correct: <Frac top={<Num v={f.a} />} bottom={<>1 − <Num v={f.r} paren /></>} /> = <Num v={f.sum} />{approx(f.sum)}.</>);
   miss();
   const oneMinus = sub(ONE, f.r);
   const body = p.coef && !eq(p.coef, f.a) && eq(ans, div(p.coef, oneMinus)) ? <>You used {say(p.coef)}, the number in front, as the first term. Use the actual first term <V>a</V> = <Num v={f.a} />.</>
    : !eq(f.a, ONE) && eq(ans, div(ONE, oneMinus)) ? <>That's 1/(1 − <V>r</V>). Don't forget to multiply by the first term <V>a</V> = <Num v={f.a} />.</>
    : val(f.r) < 0 && eq(ans, div(f.a, sub(ONE, abs(f.r)))) ? <>Watch the sign: with <V>r</V> = <Num v={f.r} />, 1 − <V>r</V> = 1 + <Num v={abs(f.r)} /> = <Num v={oneMinus} />.</>
    : <>Use <V>S</V> = <Frac top={<V>a</V>} bottom={<>1 − <V>r</V></>} /> with <V>a</V> = <Num v={f.a} /> and <V>r</V> = <Num v={f.r} />. First work out 1 − <V>r</V>.</>;
   setMsg({ tone: 'bad', body });
  }
 }

 function judge(says: boolean) {
  if (!f) return;
  const R = <>|<V>r</V>| = <Num v={abs(f.r)} /></>;
  if (says === f.conv) {
   if (f.conv) return advance('sum', <>Yes: {R} &lt; 1, so <V>r</V><sup>n</sup> → 0 and the series converges. Now find its sum.</>);
   return finish(<>Right: {R} ≥ 1, so the terms never shrink toward 0 and the partial sums can't settle. It diverges, and <V>a</V>/(1 − <V>r</V>) would give a number that is <em>not</em> its sum.</>);
  }
  miss();
  setMsg({ tone: 'bad', body: f.conv
   ? <>Look again: {R}, which is less than 1. {val(f.r) < 0 ? 'Negative terms are fine; the size of r is what matters.' : 'Only the size of r matters, not how big the first term is.'}</>
   : <>{R}, which is not less than 1. {Math.abs(val(f.r)) === 1 ? 'The terms keep the same size forever, so the partial sums never settle.' : 'Each term is bigger than the last, so the partial sums run away.'}</> });
 }

 function finish(good: ReactNode) { setMsg({ tone: 'good', body: good }); setStage('done'); setText(''); setStageMisses(0); }

 function showMe() {
  if (!f || !p) return;
  setRound(rs => rs.map((e, k) => k === i ? { ...e, shown: true } : e));
  setShowTerms(true);
  if (stage === 'a') advance('r', <>The first term is the expression at <V>n</V> = {p.start}: <V>a</V> = <Num v={f.a} />.</>);
  else if (stage === 'r') advance('conv', <><V>r</V> = second ÷ first = <Num v={f.r} />.</>);
  else if (stage === 'conv') { if (f.conv) advance('sum', <>|<V>r</V>| &lt; 1, so it converges.</>); else finish(<>|<V>r</V>| ≥ 1, so it diverges.</>); }
  else if (stage === 'sum') finish(<><V>S</V> = <Frac top={<Num v={f.a} />} bottom={<>1 − <Num v={f.r} paren /></>} /> = <Num v={f.sum} />.</>);
 }

 function next() { setI(i + 1); setStage('a'); setMsg(null); setText(''); setStageMisses(0); setShowTerms(false); }
 function restart(rs = deal()) { setRound(rs); setI(0); setStage('a'); setMsg(null); setText(''); setStageMisses(0); setShowTerms(false); }

 if (finished) {
  const clean = round.filter(e => e.misses === 0 && !e.shown).length;
  const missed = round.filter(e => e.misses > 0 || e.shown);
  return <div className="gs-panel gs-practice">
   <h3>Round complete: {clean} of {round.length} without a slip</h3>
   <p>{clean === round.length ? 'Clean sweep. You can read a geometric series off its sigma notation without writing out the terms.' : 'The usual slips are the starting index and the sign of r. Writing out the first two terms catches both.'}</p>
   <ul className="gs-review">{round.map((e, k) => { const ef = facts(e.p); return <li key={k}><span aria-hidden="true">{e.misses === 0 && !e.shown ? '✓' : '↺'}</span> <Sigma from={<>n={e.p.start}</>} label={e.p.label}>{e.p.body}</Sigma> {ef.conv ? <>= <Num v={ef.sum} /></> : 'diverges'}</li>; })}</ul>
   <div className="gs-row">
    <button className="gs-primary" onClick={() => restart()}>New round</button>
    {missed.length > 0 && <button onClick={() => restart(missed.map(e => ({ p: e.p, misses: 0, shown: false })))}>Redo the {missed.length} I slipped on</button>}
   </div>
  </div>;
 }

 const prompts: Record<Stage, ReactNode> = {
  a: <>What is the first term <V>a</V>?</>,
  r: <>What is the common ratio <V>r</V>?</>,
  conv: <>Does the series converge or diverge?</>,
  sum: <>What does it converge to?</>,
  done: null
 };
 const ts = termsText(p!);
 const order: Stage[] = f!.conv ? ['a', 'r', 'conv', 'sum'] : ['a', 'r', 'conv'];

 return <div className="gs-panel gs-practice">
  <div className="gs-progress" aria-label={`Problem ${i + 1} of ${round.length}`}>
   {round.map((e, k) => <span key={k} className={k < i ? (e.misses === 0 && !e.shown ? 'done' : 'slip') : k === i ? 'now' : ''} />)}
  </div>
  <p className="gs-eyebrow">Problem {i + 1} of {round.length}</p>
  <div className="gs-problem"><Sigma from={<>{n_}={p!.start}</>} label={p!.label}>{p!.body}</Sigma></div>
  <div className="gs-row">
   <button aria-expanded={showTerms} onClick={() => setShowTerms(s => !s)}>{showTerms ? 'Hide the first terms' : 'Write out the first terms'}</button>
  </div>
  {showTerms && <p className="gs-series big" aria-label={`First terms: ${ts.map(say).join(', ')}, and so on`}>= {ts.map((t, k) => <span key={k}>{k > 0 && ' + '}<Num v={t} paren={k > 0 && t.n < 0} /></span>)} + ⋯</p>}

  <ol className="gs-stages">
   {order.map(s => { const idx = order.indexOf(s), cur = order.indexOf(stage === 'done' ? order[order.length - 1] : stage); const doneHere = stage === 'done' || idx < cur;
    return <li key={s} className={doneHere ? 'done' : s === stage ? 'now' : ''}>
     {prompts[s]} {doneHere && <strong>{s === 'a' ? <Num v={f!.a} /> : s === 'r' ? <Num v={f!.r} /> : s === 'conv' ? (f!.conv ? 'Converges' : 'Diverges') : <Num v={f!.sum} />}</strong>}
    </li>; })}
  </ol>

  {stage !== 'done' && <div className="gs-answer">
   {stage === 'conv'
    ? <div className="gs-row"><button onClick={() => judge(true)}>Converges</button><button onClick={() => judge(false)}>Diverges</button></div>
    : <form className="gs-row" onSubmit={e => { e.preventDefault(); check(); }}>
       <label className="gs-sr" htmlFor="gs-ans">{stage === 'a' ? 'First term' : stage === 'r' ? 'Common ratio' : 'Sum'}</label>
       <input id="gs-ans" ref={input} className="gs-input" value={text} autoComplete="off" placeholder="e.g. 3/4" onChange={e => setText(e.target.value)} />
       <button className="gs-primary" type="submit">Check</button>
      </form>}
   {stageMisses >= 2 && <button className="gs-link" onClick={showMe}>Show me this step</button>}
  </div>}

  <div aria-live="polite">{msg && <p className={`gs-feedback ${msg.tone}`}>{msg.body}</p>}</div>

  {stage === 'done' && <div className="gs-row"><button className="gs-primary" onClick={next}>{i + 1 < round.length ? 'Next problem →' : 'See my round'}</button></div>}
 </div>;
}
