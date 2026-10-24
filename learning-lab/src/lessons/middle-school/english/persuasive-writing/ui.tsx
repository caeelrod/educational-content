import { useState, type ReactNode } from 'react';
import { partInfo, type Choice, type Part } from './content';

// A colored label for one part of an argument. The name is always written out, so color is never the only cue.
export function Tag({ part }: { part: Part }) {
 return <span className={`pw-tag pw-${part}`}>{partInfo[part].name}</span>;
}

// Progress dots for a run of items: done (first try), slip (needed another try), or now.
export function Dots({ total, at, clean, label }: { total: number; at: number; clean: boolean[]; label: string }) {
 return <div className="pw-dots" aria-label={label}>
  {Array.from({ length: total }, (_, k) => <span key={k} className={k < at ? (clean[k] ? 'done' : 'slip') : k === at ? 'now' : ''} />)}
 </div>;
}

// One multiple-choice question with an explanation for every option.
// Wrong picks stay marked so students can see what they already ruled out.
export function Pick({ prompt, options, onSolved, solvedNote }: { prompt: ReactNode; options: Choice[]; onSolved: (firstTry: boolean) => void; solvedNote?: ReactNode }) {
 const [picks, setPicks] = useState<number[]>([]);
 const best = options.findIndex(o => o.best);
 const solved = picks.includes(best);
 const last = picks[picks.length - 1];
 function pick(k: number) {
  if (solved || picks.includes(k)) return;
  setPicks(p => [...p, k]);
  if (k === best) onSolved(picks.length === 0);
 }
 return <div className="pw-pick">
  <p className="pw-prompt">{prompt}</p>
  <ul className="pw-options">
   {options.map((o, k) => {
    const state = picks.includes(k) ? (k === best ? 'right' : 'wrong') : '';
    return <li key={k}><button className={state} disabled={solved && k !== best} aria-disabled={picks.includes(k) || solved} onClick={() => pick(k)}>
     {state && <span className="pw-mark" aria-hidden="true">{state === 'right' ? '✓' : '✗'}</span>}
     <span>{o.text}</span>
     {state && <span className="pw-sr">{state === 'right' ? ' (best choice)' : ' (not the best choice)'}</span>}
    </button></li>;
   })}
  </ul>
  <div aria-live="polite">
   {last !== undefined && <p className={`pw-feedback ${last === best ? 'good' : 'bad'}`}>
    <strong>{last === best ? (picks.length === 1 ? 'Yes! ' : 'That’s it. ') : 'Not the best choice. '}</strong>{options[last].why}
    {last === best && solvedNote && <> {solvedNote}</>}
    {last !== best && ' Try another.'}
   </p>}
  </div>
 </div>;
}
