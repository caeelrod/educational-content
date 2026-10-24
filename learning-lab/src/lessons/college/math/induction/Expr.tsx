import { Fragment } from 'react';

// Renders a line of math written with Unicode symbols and superscripts.
// [[top//bottom]] becomes a stacked fraction.
export function Expr({ s }: { s: string }) {
 const parts = s.split(/\[\[(.+?)\/\/(.+?)\]\]/);
 return <span className="ind-expr">{parts.map((p, i) => i % 3 === 0 ? <Fragment key={i}>{p}</Fragment>
  : i % 3 === 1 ? <span key={i} className="ind-frac"><span>{p}</span><span>{parts[i + 1]}</span></span> : null)}</span>;
}

// Plain-text version for screen readers and aria-labels.
export const spoken = (s: string) => s.replace(/\[\[(.+?)\/\/(.+?)\]\]/g, '($1)/($2)');
