import { gcd, paint, pct } from './ratio';

// Pieces shared by the paint missions: a bucket swatch, a row of cans (a tape diagram),
// and a bar showing what share of the paint is blue.

export function Bucket({ blue, yellow, label, sub, big }: { blue: number; yellow: number; label: string; sub?: string; big?: boolean }) {
 const color = paint(blue, yellow);
 const empty = blue + yellow === 0;
 return <figure className={`rp-bucket${big ? ' big' : ''}`}>
  <svg viewBox="0 0 120 120" role="img" aria-label={`${label}: ${empty ? 'empty' : `${blue} blue to ${yellow} yellow, ${pct(blue / (blue + yellow))} blue`}`}>
   <path className="rp-bucket-handle" d="M22 44 Q60 -4 98 44" />
   <path className="rp-bucket-body" d="M18 42 H102 L92 112 H28 Z" />
   <ellipse cx="60" cy="44" rx="40" ry="10" style={{ fill: color }} className="rp-bucket-paint" />
   <path d="M24 50 H96 L90 106 H30 Z" style={{ fill: color }} className="rp-bucket-paint" />
   {empty && <text x="60" y="84" textAnchor="middle" className="rp-bucket-empty">empty</text>}
  </svg>
  <figcaption><strong>{label}</strong>{sub && <span>{sub}</span>}</figcaption>
 </figure>;
}

// One square per can: blue cans first, then yellow, grouped into copies of the simplest recipe.
export function Cans({ blue, yellow, group = true }: { blue: number; yellow: number; group?: boolean }) {
 const g = gcd(blue, yellow);
 const groups = group && g > 1 && blue > 0 && yellow > 0 ? g : 1;
 const per = [blue / groups, yellow / groups];
 return <div className="rp-cans" aria-label={`${blue} blue cans and ${yellow} yellow cans${groups > 1 ? `, in ${groups} groups of ${per[0]} blue and ${per[1]} yellow` : ''}`}>
  {blue + yellow > 0 && Array.from({ length: groups }, (_, k) => <span key={k} className="rp-can-group" aria-hidden="true">
   {Array.from({ length: per[0] }, (_, i) => <i key={`b${i}`} className="b" />)}
   {Array.from({ length: per[1] }, (_, i) => <i key={`y${i}`} className="y" />)}
  </span>)}
  {blue + yellow === 0 && <span className="rp-muted">No cans yet</span>}
 </div>;
}

export function ShareBar({ blue, yellow, target, label = 'Blue share' }: { blue: number; yellow: number; target?: number; label?: string }) {
 const total = blue + yellow, s = total ? blue / total : 0;
 return <div className="rp-share">
  <div className="rp-share-head"><span>{label}</span><strong>{total ? <>{blue} of {total} cans = {pct(s)}</> : '—'}</strong></div>
  <div className="rp-share-track" aria-hidden="true">
   <span className="rp-share-fill" style={{ width: `${s * 100}%` }} />
   {target !== undefined && <span className="rp-share-target" style={{ left: `${target * 100}%` }} title="Target" />}
  </div>
 </div>;
}

export const simplest = (a: number, b: number) => { const g = gcd(a, b) || 1; return [a / g, b / g]; };
