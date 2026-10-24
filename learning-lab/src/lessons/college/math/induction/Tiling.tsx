import { useMemo, useState, type KeyboardEvent, type ReactNode } from 'react';
import { skipped, tile, type Cell } from './tromino';

const BOARD = 320;
type Phase = 'pick' | 'guess' | 'build';
const same = (a: Cell | null, b: Cell | null) => !!a && !!b && a[0] === b[0] && a[1] === b[1];

export default function Tiling() {
 const [n, setN] = useState(3);
 const [hole, setHole] = useState<Cell>([1, 5]);
 const [phase, setPhase] = useState<Phase>('pick');
 const [level, setLevel] = useState(0);
 const [wrong, setWrong] = useState<Cell | null>(null);
 const [misses, setMisses] = useState(0);
 const [cursor, setCursor] = useState<Cell>([1, 5]);
 const side = 2 ** n, cell = BOARD / side;
 const pieces = useMemo(() => tile(n, hole), [n, hole]);
 const owner = useMemo(() => {
  const m: number[][] = Array.from({ length: side }, () => Array(side).fill(-1));
  pieces.forEach((p, i) => p.cells.forEach(([r, c]) => { m[r][c] = i; }));
  return m;
 }, [pieces, side]);
 const target = skipped(n, hole);
 const half = side / 2;
 const isCenter = ([r, c]: Cell) => (r === half - 1 || r === half) && (c === half - 1 || c === half);
 const showing = (i: number) => phase === 'build' && pieces[i].depth < level;
 // Sub-boards still to tile at this level, outlined on the board.
 const boxSize = side / 2 ** Math.min(phase === 'guess' ? 1 : level, Math.max(n - 1, 1));
 const count = pieces.length;

 function resize(m: number) {
  const s = 2 ** m, h: Cell = [Math.min(hole[0], s - 1), Math.min(hole[1], s - 1)];
  setN(m); setHole(h); setCursor(h); reset();
 }
 function reset() { setPhase('pick'); setLevel(0); setWrong(null); setMisses(0); }
 function choose(c: Cell) {
  setCursor(c);
  if (phase === 'pick') { setHole(c); return; }
  if (phase !== 'guess') return;
  if (same(c, target)) { setPhase('build'); setLevel(1); setWrong(null); }
  else { setWrong(c); setMisses(m => m + 1); }
 }
 function key(e: KeyboardEvent) {
  const d: Record<string, Cell> = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] };
  if (d[e.key]) { e.preventDefault(); setCursor(([r, c]) => [Math.max(0, Math.min(side - 1, r + d[e.key][0])), Math.max(0, Math.min(side - 1, c + d[e.key][1]))]); }
  else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); choose(cursor); }
 }

 // Thick borders wherever two neighboring squares belong to different trominoes.
 const edges: ReactNode[] = [];
 if (phase === 'build') for (let r = 0; r < side; r++) for (let c = 0; c < side; c++) {
  const me = owner[r][c], on = me >= 0 && showing(me);
  if (!on) continue;
  ([[0, 1], [1, 0], [0, -1], [-1, 0]] as Cell[]).forEach(([dr, dc]) => {
   const rr = r + dr, cc = c + dc;
   if (rr >= 0 && rr < side && cc >= 0 && cc < side && owner[rr][cc] === me) return;
   const x1 = (dc === 1 ? c + 1 : c) * cell, y1 = (dr === 1 ? r + 1 : r) * cell;
   edges.push(<line key={`${r}-${c}-${dr}-${dc}`} x1={x1} y1={y1} x2={dr ? x1 + cell : x1} y2={dr ? y1 : y1 + cell} className="ind-edge" />);
  });
 }

 const where = `row ${cursor[0] + 1}, column ${cursor[1] + 1}`;
 return <div className="ind-tile">
  <div className="ind-claim">
   <span className="ind-tag">Claim</span>
   <div className="ind-claim-math">For every n ≥ 1, a 2ⁿ × 2ⁿ board with any one square removed can be covered exactly by L-shaped tiles of three squares.</div>
   <div className="ind-reading">Nobody has to find the tiling by trial and error. The induction proof builds it, and the same idea is a recursive program.</div>
  </div>

  <div className="ind-tile-grid">
   <div>
    <svg className="ind-board" viewBox={`-2 -2 ${BOARD + 4} ${BOARD + 4}`} tabIndex={0} role="application" onKeyDown={key}
     aria-label={`${side} by ${side} board. Use arrow keys to move, Enter to choose. Selected square: ${where}.`}>
     {Array.from({ length: side }, (_, r) => Array.from({ length: side }, (_, c) => {
      const isHole = r === hole[0] && c === hole[1], i = owner[r][c], on = !isHole && i >= 0 && showing(i);
      const cls = isHole ? 'hole' : on ? `d${pieces[i].depth % 4}` : phase === 'guess' && isCenter([r, c]) ? 'center' : 'empty';
      return <rect key={`${r}-${c}`} x={c * cell} y={r * cell} width={cell} height={cell} className={`ind-sq ${cls}${same(wrong, [r, c]) ? ' miss' : ''}`}
       onClick={() => choose([r, c])} />;
     }))}
     {edges}
     {phase !== 'pick' && Array.from({ length: side / boxSize - 1 }, (_, i) => (i + 1) * boxSize * cell).map(p =>
      <g key={p} className="ind-split"><line x1={p} x2={p} y1={0} y2={BOARD} /><line y1={p} y2={p} x1={0} x2={BOARD} /></g>)}
     <text x={(hole[1] + .5) * cell} y={(hole[0] + .5) * cell} dy=".35em" textAnchor="middle" className="ind-hole-x" style={{ fontSize: cell * .6 }}>✕</text>
     <rect x={cursor[1] * cell} y={cursor[0] * cell} width={cell} height={cell} className="ind-cursor" />
    </svg>
    <div className="ind-row">
     <span className="ind-field">Board size</span>
     <div className="ind-seg" role="group" aria-label="Board size">
      {[1, 2, 3, 4].map(m => <button key={m} aria-pressed={m === n} onClick={() => resize(m)}>{2 ** m}×{2 ** m}</button>)}
     </div>
    </div>
   </div>

   <div className="ind-side" aria-live="polite">
    {phase === 'pick' && <>
     <h3>1. Remove any square</h3>
     <p>Click a square (or use the arrow keys and Enter) to choose the missing one, marked ✕. Try a corner, an edge, or somewhere in the middle. The claim says it works for every choice.</p>
     <p className="ind-small">Quick check: {side}×{side} has {side * side} squares. Remove one and {side * side - 1} are left, which is {count} tiles of 3 exactly. (4ⁿ − 1 is always divisible by 3.)</p>
     <button className="ind-primary" onClick={() => { setPhase('guess'); setCursor([half - 1, half - 1]); }}>Start the proof</button>
    </>}
    {phase === 'guess' && <>
     <h3>2. The inductive step</h3>
     {n === 1 ? <p>This is the base case: a 2×2 board missing one square is already an L. Click the square the L leaves uncovered.</p>
      : <p>Cut the board into four {half}×{half} quadrants. One of them contains the missing square. Place one L in the middle so it covers one square of each of the other three. <strong>Which of the four highlighted middle squares does it leave uncovered?</strong></p>}
     {wrong && <div className="ind-feedback bad">{isCenter(wrong)
      ? 'That square is in a quadrant that has no hole yet. The L has to cover it so that quadrant also ends up missing exactly one square.'
      : 'Pick one of the four highlighted squares in the middle of the board.'}
      {misses >= 2 && <div><button onClick={() => choose(target)}>Show me</button></div>}
     </div>}
    </>}
    {phase === 'build' && <>
     <h3>{level >= n ? 'Done: every square is covered' : `Level ${level} of ${n}`}</h3>
     {n > 1 && level === 1 && <p>Now each {half}×{half} quadrant is a smaller board with exactly one square missing: the original hole, or a square covered by the middle L. <strong>That is the inductive hypothesis:</strong> boards one size smaller can always be tiled. The proof is finished, because it never has to say how.</p>}
     {level > 1 && level < n && <p>Here is the “how,” for the curious. Inside each {boxSize * 2}×{boxSize * 2} board from the last level, make the same move: one L in its middle, leaving four {boxSize}×{boxSize} boards that are each missing one square.</p>}
     {level >= n && <p>{n === 1 ? 'The base case covers the whole board in one tile.' : `At the bottom are 2×2 boards missing one square: the base case. ${count} tiles cover all ${side * side - 1} squares.`} Colors show the level each tile was placed at.</p>}
     {level < n && <button className="ind-primary" onClick={() => setLevel(l => l + 1)}>Show the next level</button>}
     {level < n && <button onClick={() => setLevel(n)}>Show it all</button>}
     <button onClick={reset}>Try another square</button>
     <details className="ind-why">
      <summary>Proof and program</summary>
      <p><strong>Base case (n = 1):</strong> a 2×2 board missing one square is one L.</p>
      <p><strong>Step:</strong> assume every 2ᵏ × 2ᵏ board missing one square can be tiled. Split a 2ᵏ⁺¹ × 2ᵏ⁺¹ board into four 2ᵏ × 2ᵏ quadrants, place one L in the middle covering a square of each quadrant without the hole, and tile each quadrant by the hypothesis.</p>
      <p>A recursive function that tiles the board has the same shape: the base case is where the recursion stops, and “tile each quadrant by the hypothesis” is the recursive call. Proving a recursive program correct is an induction proof.</p>
     </details>
    </>}
   </div>
  </div>
 </div>;
}
