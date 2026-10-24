import { useEffect, useState, type ReactNode } from 'react';
import { say, type Q } from './frac';

// Small typesetting helpers so formulas read like a textbook without a math library.
// Each piece carries a plain-text aria-label so screen readers hear the math in order.

export function Frac({ top, bottom, label }: { top: ReactNode; bottom: ReactNode; label?: string }) {
 return <span className="gs-frac" role={label ? 'math' : undefined} aria-label={label}>
  <span className="gs-frac-top">{top}</span><span className="gs-frac-bot">{bottom}</span>
 </span>;
}

// A fraction value: integers stay inline, others stack, and the sign sits in front.
export function Num({ v, paren }: { v: Q; paren?: boolean }) {
 const neg = v.n < 0, n = Math.abs(v.n);
 const body = v.d === 1 ? <>{neg ? '−' : ''}{n}</> : <>{neg ? '−' : ''}<Frac top={n} bottom={v.d} /></>;
 return <span className="gs-num" aria-label={say(v)}>{paren && (neg || v.d !== 1) ? <>({body})</> : body}</span>;
}

export function Sigma({ from, to = '∞', children, label }: { from: ReactNode; to?: ReactNode; children: ReactNode; label: string }) {
 return <span className="gs-sigma" role="math" aria-label={label}>
  <span className="gs-sigma-sym" aria-hidden="true"><span className="gs-sigma-to">{to}</span><span className="gs-sigma-big">∑</span><span className="gs-sigma-from">{from}</span></span>
  <span className="gs-sigma-body" aria-hidden="true">{children}</span>
 </span>;
}

export const V = ({ children }: { children: ReactNode }) => <i className="gs-var">{children}</i>;

// True on phone-width screens, so charts can use a narrower drawing and keep labels readable.
export function useNarrow() {
 const query = '(max-width: 560px)';
 const [narrow, setNarrow] = useState(() => typeof matchMedia !== 'undefined' && matchMedia(query).matches);
 useEffect(() => {
  if (typeof matchMedia === 'undefined') return;
  const m = matchMedia(query), on = () => setNarrow(m.matches);
  m.addEventListener('change', on);
  return () => m.removeEventListener('change', on);
 }, []);
 return narrow;
}
