import { useEffect, useRef, useState, type ReactNode } from 'react';
import { bySym, fmt, ionCharge, ionMatches, mainGroup, properties, superscript, valence, type Element, type Property } from './elements';
import { Formula, formulaOptions, formulaSub, formulaText, ratio } from './Ionic';
import { bondLabel, bondType, isMetal, type BondType } from './Polarity';

type Option = { key: string; label: ReactNode };
type Q = { topic: string; prompt: ReactNode; text: string; options: Option[]; answer: string; explain: (picked: string) => string };
type Entry = { q: Q; picked: string | null };
const ROUND = 8;

const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];
const shuffle = <T,>(a: T[]) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
const elOpt = (e: Element): Option => ({ key: e.sym, label: <><strong>{e.sym}</strong> {e.name}</> });

function valenceQ(): Q {
 const e = pick(mainGroup.filter(x => x.sym !== 'H' && x.sym !== 'He')), v = valence(e);
 return {
  topic: 'Valence electrons', text: `How many valence electrons does ${e.name} have?`,
  prompt: <>How many valence electrons does <strong>{e.name} ({e.sym})</strong> have? It is in group {e.group}, period {e.period}.</>,
  options: [1, 2, 3, 4, 5, 6, 7, 8].map(n => ({ key: String(n), label: n })), answer: String(v),
  explain: p => {
   const rule = e.group! <= 2 ? `Group ${e.group} has ${v}.` : `Group ${e.group} has ${e.group} − 10 = ${v}.`;
   if (p === String(v)) return rule;
   if (+p === e.period) return `${p} is the period, which counts shells, not outer electrons. ${rule}`;
   if (+p === e.group! - 12) return `Groups 13 to 18 hold 3 to 8 outer electrons, because the 2 from groups 1 and 2 are already in that shell. ${rule}`;
   return rule;
  }
 };
}

// Two elements in the same row or column whose data follow the textbook trend by a clear margin.
function compareQ(p: Property): Q {
 const P = properties[p], margin = p === 'radius' ? 5 : p === 'ie' ? 40 : 0.15;
 const pool = mainGroup.filter(e => P.get(e) !== null && e.sym !== 'H');
 const higher = (x: Element, y: Element) => x.period === y.period ? (p === 'radius' ? x.group! < y.group! : x.group! > y.group!) : (p === 'radius' ? x.period > y.period : x.period < y.period);
 for (;;) {
  const [x, y] = shuffle(pool).slice(0, 2);
  if (x.period !== y.period && x.group !== y.group) continue;
  const vx = P.get(x)!, vy = P.get(y)!;
  if (Math.abs(vx - vy) < margin || (vx > vy) !== higher(x, y)) continue;
  const win = vx > vy ? x : y, lose = win === x ? y : x;
  const same = x.period === y.period ? 'period' : 'group';
  const word = p === 'radius' ? 'larger' : p === 'ie' ? 'has the higher first ionization energy' : 'is more electronegative';
  const reason = same === 'period'
   ? (p === 'radius' ? `Across period ${x.period}, more protons pull the same shell in tighter, so ${win.sym}, farther left, is bigger.` : `Across period ${x.period}, more protons pull harder on the same shell, so ${win.sym}, farther right, ${p === 'ie' ? 'holds its electrons more tightly' : 'pulls shared electrons harder'}.`)
   : (p === 'radius' ? `Down group ${x.group}, each period adds a shell, so ${win.sym}, lower down, is bigger.` : `Down group ${x.group}, outer electrons are farther out and more shielded, so ${win.sym}, higher up, ${p === 'ie' ? 'holds its electrons more tightly' : 'pulls harder'}.`);
  return {
   topic: P.label, text: `Which ${p === 'radius' ? 'atom is larger' : `atom ${word}`}: ${x.sym} or ${y.sym}?`,
   prompt: <>Which atom {p === 'radius' ? 'is larger' : word}?</>,
   options: [elOpt(x), elOpt(y)], answer: win.sym,
   explain: () => `${reason} Data: ${win.sym} ${fmt(p, P.get(win)!)}, ${lose.sym} ${fmt(p, P.get(lose)!)}${P.unit ? ' ' + P.unit : ''}.`
  };
 }
}

function ionQ(): Q {
 const e = pick(mainGroup.filter(x => ionCharge(x) !== null && ionMatches(x) !== null)), c = ionCharge(e)!;
 const charges = [1, 2, 3, -1, -2, -3];
 return {
  topic: 'Ions', text: `What ion does ${e.name} usually form?`,
  prompt: <>What ion does <strong>{e.name} ({e.sym})</strong> usually form?</>,
  options: charges.map(k => ({ key: String(k), label: `${e.sym}${superscript(k)}` })), answer: String(c),
  explain: p => {
   const how = c > 0 ? `It has ${valence(e)} valence electron${valence(e) > 1 ? 's' : ''} and loses ${c > 1 ? 'them' : 'it'}` : `It has ${valence(e)} valence electrons and gains ${-c}`;
   const base = `${how} to match ${ionMatches(e)}: ${e.sym}${superscript(c)}.`;
   if (p === String(c)) return base;
   if (+p === -c) return `Right size, wrong sign. Electrons are negative: losing them leaves a positive ion, gaining them makes a negative ion. ${base}`;
   if (Math.sign(+p) === Math.sign(c)) return `Right sign, wrong size. Count the electrons it has to lose or gain to reach a full shell. ${base}`;
   return base;
  }
 };
}

function formulaQ(): Q {
 const combos: [string, string][] = [];
 for (const m of ['Li', 'Na', 'K', 'Mg', 'Ca', 'Sr', 'Al']) for (const n of ['N', 'O', 'S', 'F', 'Cl', 'Br', 'I']) {
  if (n === 'N' && !['Li', 'Mg', 'Ca', 'Sr'].includes(m)) continue;
  if (m === 'Al' && !['O', 'F'].includes(n)) continue;
  combos.push([m, n]);
 }
 const [m, n] = pick(combos), [a, b] = ratio(m, n), cm = ionCharge(bySym(m))!, cn = ionCharge(bySym(n))!;
 const right = formulaText(m, n, a, b);
 return {
  topic: 'Ionic formulas', text: `What is the formula of the compound of ${bySym(m).name} and ${bySym(n).name}?`,
  prompt: <>What is the formula of the ionic compound formed by <strong>{bySym(m).name.toLowerCase()}</strong> and <strong>{bySym(n).name.toLowerCase()}</strong>?</>,
  options: formulaOptions(m, n).map(([x, y]) => ({ key: formulaText(m, n, x, y), label: <Formula m={m} n={n} a={x} b={y} /> })), answer: right,
  explain: p => {
   const base = `${m} forms ${m}${superscript(cm)} and ${n} forms ${n}${superscript(cn)}. ${a} × (+${cm}) + ${b} × (−${-cn}) = 0, so the formula is ${formulaSub(right)}.`;
   if (p === right) return base;
   if (p === formulaText(m, n, b, a)) return `The numbers are swapped. Each ion's charge tells you how many of the other ion you need. ${base}`;
   return `The charges have to add up to zero. ${base}`;
  }
 };
}

function bondQ(): Q {
 const pool = ['H', 'C', 'N', 'O', 'F', 'P', 'S', 'Cl', 'Br', 'I', 'Li', 'Na', 'K', 'Mg', 'Ca'];
 for (;;) {
  const x = pick(pool), y = pick(pool), metals = [x, y].filter(isMetal).length;
  if (metals === 2) continue;
  const d = Math.abs(bySym(x).data!.en! - bySym(y).data!.en!), t = bondType(d);
  if ((metals === 1) !== (t === 'ionic')) continue; // only pairs where both rules of thumb agree
  if (Math.abs(d - 0.4) < 0.05 || Math.abs(d - 1.8) < 0.15) continue;
  const types: BondType[] = ['nonpolar', 'polar', 'ionic'];
  return {
   topic: 'Bond type', text: `What kind of bond forms between ${x} and ${y}?`,
   prompt: <>What kind of bond forms between <strong>{x}</strong> ({bySym(x).data!.en!.toFixed(2)}) and <strong>{y}</strong> ({bySym(y).data!.en!.toFixed(2)})? Electronegativities are in brackets.</>,
   options: types.map(k => ({ key: k, label: bondLabel[k] })), answer: t,
   explain: () => `The difference is ${d.toFixed(2)}${t === 'nonpolar' ? ', under 0.4' : t === 'polar' ? ', between 0.4 and 1.8' : ', over 1.8'}. ${t === 'ionic' ? 'It is also a metal with a nonmetal, so electrons transfer.' : `Both are nonmetals, so they share${t === 'polar' ? ', unequally' : ' about evenly'}.`}`
  };
 }
}

function bondsCountQ(): Q {
 const e = bySym(pick(['H', 'C', 'N', 'O', 'F', 'Cl', 'S', 'P', 'Br'])), v = valence(e), want = e.sym === 'H' ? 1 : 8 - v;
 return {
  topic: 'Covalent bonds', text: `How many covalent bonds does ${e.name} usually form?`,
  prompt: <>In a neutral molecule, how many covalent bonds does <strong>{e.name} ({e.sym})</strong> usually form?</>,
  options: [1, 2, 3, 4].map(n => ({ key: String(n), label: n })), answer: String(want),
  explain: p => {
   const base = e.sym === 'H' ? 'Hydrogen has 1 electron and needs 2, so it shares 1 pair: 1 bond.' : `${e.sym} has ${v} valence electrons and needs 8, so it shares ${8 - v} more: ${want} bond${want > 1 ? 's' : ''}.`;
   return +p === v && p !== String(want) ? `${v} is its number of valence electrons. Bonds = electrons it still needs. ${base}` : base;
  }
 };
}

const deal = (): Entry[] => shuffle([valenceQ(), compareQ('radius'), compareQ('ie'), compareQ('en'), ionQ(), formulaQ(), bondQ(), bondsCountQ()]).slice(0, ROUND).map(q => ({ q, picked: null }));

export default function Practice() {
 const [round, setRound] = useState<Entry[]>(deal);
 const [i, setI] = useState(0);
 const head = useRef<HTMLParagraphElement>(null);
 const finished = i >= round.length, e = round[i];
 useEffect(() => { if (i > 0) head.current?.focus({ preventScroll: false }); }, [i]);

 const answer = (k: string) => { if (!e.picked) setRound(r => r.map((x, j) => j === i ? { ...x, picked: k } : x)); };
 const right = round.filter(x => x.picked === x.q.answer).length;

 return <div className="cb-panel">
  <h3>Practice</h3>
  <p>Eight mixed questions: one on each idea in the lesson. Use the periodic table in your head, not the one in part 1. Nothing is saved.</p>
  <div className="cb-progress" aria-hidden="true">{round.map((x, j) => <span key={j} className={x.picked ? (x.picked === x.q.answer ? 'done' : 'slip') : j === i ? 'now' : ''} />)}</div>
  {!finished ? <div className="cb-q">
   <p className="cb-eyebrow" tabIndex={-1} ref={head}>QUESTION {i + 1} OF {round.length} · {e.q.topic.toUpperCase()}</p>
   <p className="cb-q-prompt">{e.q.prompt}</p>
   <div className="cb-chips big" role="group" aria-label="Answers">
    {e.q.options.map(o => <button key={o.key} aria-pressed={e.picked === o.key} disabled={!!e.picked && e.picked !== o.key && o.key !== e.q.answer}
     className={e.picked ? (o.key === e.q.answer ? 'right' : o.key === e.picked ? 'wrong' : '') : ''} onClick={() => answer(o.key)}>{o.label}</button>)}
   </div>
   <div aria-live="polite">{e.picked && <p className={`cb-feedback ${e.picked === e.q.answer ? 'good' : 'bad'}`}><strong>{e.picked === e.q.answer ? 'Correct. ' : 'Not quite. '}</strong>{e.q.explain(e.picked)}</p>}</div>
   {e.picked && <button className="cb-primary" onClick={() => setI(i + 1)}>{i + 1 < round.length ? 'Next question →' : 'See results'}</button>}
  </div> : <div className="cb-q">
   <p className="cb-eyebrow" tabIndex={-1} ref={head}>ROUND COMPLETE</p>
   <p className="cb-q-prompt"><strong>{right} of {round.length}</strong> correct.</p>
   <ul className="cb-review">{round.map((x, j) => <li key={j}><span aria-hidden="true">{x.picked === x.q.answer ? '✓' : '✗'}</span> <span className="cb-sr">{x.picked === x.q.answer ? 'Correct:' : 'Missed:'}</span> {x.q.text}{x.picked !== x.q.answer && <span className="cb-aside"> {x.q.explain(x.picked!)}</span>}</li>)}</ul>
   <button className="cb-primary" onClick={() => { setRound(deal()); setI(0); }}>New round</button>
  </div>}
 </div>;
}
