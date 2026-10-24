// The classic induction proof as a program: tile a 2ⁿ × 2ⁿ board missing one square with L-trominoes.
export type Cell = [number, number]; // [row, col]
export type Tromino = { cells: Cell[]; depth: number };

export function tile(n: number, hole: Cell): Tromino[] {
 const out: Tromino[] = [];
 function go(top: number, left: number, size: number, [hr, hc]: Cell, depth: number) {
  const half = size / 2, quads: Cell[] = [[top, left], [top, left + half], [top + half, left], [top + half, left + half]];
  // The square of each quadrant that touches the center of this board.
  const centers: Cell[] = [[top + half - 1, left + half - 1], [top + half - 1, left + half], [top + half, left + half - 1], [top + half, left + half]];
  const holeQ = (hr >= top + half ? 2 : 0) + (hc >= left + half ? 1 : 0);
  // Inductive step: one tromino at the center covers a corner of the three quadrants without the hole.
  out.push({ cells: centers.filter((_, q) => q !== holeQ), depth });
  // Base case (size 2): that tromino was the whole tiling.
  if (size === 2) return;
  quads.forEach(([r, c], q) => go(r, c, half, q === holeQ ? [hr, hc] : centers[q], depth + 1));
 }
 go(0, 0, 2 ** n, hole, 0);
 return out;
}

// The center square the first tromino leaves uncovered: the one in the hole's quadrant.
export function skipped(n: number, [hr, hc]: Cell): Cell {
 const half = 2 ** (n - 1);
 return [hr < half ? half - 1 : half, hc < half ? half - 1 : half];
}
