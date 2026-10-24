// Map data for the continent puzzle. Outlines are hand-simplified coastlines (longitude, latitude)
// drawn on a plain longitude/latitude grid, so shapes near the poles are stretched a little.
export type LonLat = [number, number];
export type Pt = [number, number];

export const MAP_W = 560, MAP_H = 400;
const K = 4, LON0 = -85, LAT0 = 40;
export const project = ([lon, lat]: LonLat): Pt => [(lon - LON0) * K, (LAT0 - lat) * K];
export const pathOf = (pts: LonLat[]) => 'M' + pts.map(p => project(p).map(v => v.toFixed(1)).join(' ')).join(' L') + 'Z';

export const southAmerica: LonLat[] = [[-71.7, 12.4], [-70, 12], [-67, 10.6], [-64, 10.6], [-61.5, 10.2], [-60, 8.5], [-58.2, 6.8], [-55.2, 5.9], [-52.3, 4.9], [-51, 3.5], [-50, 1], [-49.5, -0.5], [-48.5, -1.2], [-46, -1], [-44.3, -2.5], [-41.5, -2.9], [-38.5, -3.7], [-36.5, -5], [-35.2, -5.5], [-34.9, -8], [-35.7, -9.7], [-37.2, -11.2], [-38.5, -13], [-39, -14.8], [-39.1, -17.5], [-39.7, -19.5], [-40.3, -20.3], [-41, -22], [-42, -23], [-44.5, -23.3], [-46.3, -24], [-48.5, -26], [-48.6, -28.5], [-50.2, -30.5], [-52.1, -32.2], [-53.4, -33.7], [-54.9, -34.9], [-56.2, -34.9], [-57.5, -35.3], [-56.7, -36.4], [-57.5, -38], [-60, -38.9], [-62.3, -38.9], [-62.2, -40.6], [-65, -41], [-63.6, -42.6], [-65, -43.5], [-67.5, -46], [-65.7, -47.1], [-67.5, -49], [-69, -50.5], [-68.4, -52.3], [-66.5, -54.5], [-65.3, -54.8], [-67.5, -55.5], [-70.5, -55], [-73.5, -53], [-75, -50], [-75.5, -47.5], [-74, -45.5], [-74, -42], [-73.4, -39.8], [-73.6, -37.5], [-72.2, -35], [-71.6, -33], [-71.4, -30], [-70.6, -26], [-70.4, -23.6], [-70.2, -20], [-70.3, -18.4], [-71.4, -17.6], [-73.5, -16.3], [-76.2, -13.7], [-77.1, -12], [-78.6, -9.1], [-79.9, -6.8], [-81.3, -4.7], [-80.3, -3.4], [-80.9, -2.2], [-80.1, -0.5], [-79.7, 1], [-78.6, 2.5], [-77.4, 4], [-77.4, 6.5], [-77.9, 7.4], [-77.3, 8.6], [-76.8, 8.5], [-75.5, 10.4], [-74.8, 11], [-73.2, 11.3]];

export const africa: LonLat[] = [[-5.8, 35.8], [-7.6, 33.6], [-9.3, 32.3], [-9.6, 30.4], [-11.5, 28.3], [-12.9, 27.9], [-14.5, 26], [-15.9, 23.7], [-17, 20.9], [-16.3, 19.3], [-16, 18.1], [-16.5, 16], [-17.5, 14.7], [-16.6, 13.4], [-16.8, 12.4], [-15.6, 11.9], [-14.6, 10.7], [-13.7, 9.5], [-13.2, 8.5], [-12.5, 7.4], [-10.8, 6.3], [-9, 5], [-7.7, 4.4], [-6, 4.9], [-4, 5.2], [-2, 4.8], [-0.2, 5.6], [1.6, 6.2], [3.4, 6.4], [4.8, 6.1], [5.6, 4.9], [6.5, 4.3], [7.5, 4.5], [8.7, 4.6], [9.7, 4], [9.8, 2.5], [9.6, 1], [9.3, 0.1], [8.7, -0.6], [9.8, -2.6], [11.1, -3.8], [11.9, -4.8], [12.3, -6], [13.2, -8.8], [13.6, -10.8], [13.4, -12.6], [12.4, -14], [12.2, -15.2], [11.8, -17.2], [12.4, -18.8], [13.4, -20.6], [14.5, -22.9], [14.9, -25], [15.2, -26.6], [16.5, -28.6], [17.4, -30.6], [18.1, -32.4], [18.4, -33.9], [18.5, -34.4], [20, -34.8], [22.1, -34.1], [25.6, -34], [27.9, -33], [29.5, -31.5], [31, -29.9], [32.4, -28.6], [32.9, -26.5], [32.6, -26], [33.5, -25.3], [35.4, -23.9], [35.3, -22], [34.8, -19.8], [36.9, -17.9], [39.2, -16.6], [40.7, -15], [40.5, -12.5], [40.5, -10.5], [39.6, -8], [39.3, -6.8], [38.8, -5.2], [39.7, -4], [40.9, -2.2], [42.5, -0.4], [45.3, 2], [47.9, 4.7], [49.8, 8], [51.3, 10.4], [51.3, 11.8], [48, 11.2], [45, 10.4], [43.3, 11.9], [43.4, 12.6], [42, 14.6], [39.5, 15.6], [38.5, 18], [37.2, 19.6], [36.5, 22], [35.6, 23.9], [34, 26.5], [32.5, 29.9], [32.3, 31.3], [29.9, 31.2], [27, 31.4], [24, 32.1], [22.5, 32.8], [20.1, 32.1], [19, 30.3], [16, 31.3], [15.1, 32.4], [13.2, 32.9], [11.1, 33.2], [10.1, 33.9], [11, 35.2], [11, 37.1], [9.9, 37.3], [8.6, 36.9], [6.5, 37], [3.1, 36.8], [1, 36.5], [-0.6, 35.7], [-2.2, 35.1]];

export const madagascar: LonLat[] = [[49.3, -12], [50.5, -15.5], [49.4, -17.5], [48, -21.5], [47, -25], [45.2, -25.6], [44, -24.5], [43.3, -21.5], [44.3, -19.5], [44, -17], [45.5, -15.8], [47.5, -14.5]];

// Points on the two coasts that sat next to each other before the South Atlantic opened.
// The puzzle's "fit" is the turn and slide that best lines these pairs up.
const matches: [LonLat, LonLat][] = [
 [[-35.2, -5.5], [9.3, 3.6]], [[-38.5, -3.7], [4, 5.6]], [[-44.3, -2.5], [-0.2, 5]], [[-50, 1], [-7.7, 4.4]],
 [[-55.2, 5.9], [-12.5, 7.4]], [[-38.5, -13], [9, -0.8]], [[-41, -22], [12.8, -11.5]], [[-48.6, -28.5], [13, -19.5]],
 [[-53.4, -33.7], [15.5, -27]], [[-57.5, -38], [18.3, -33.5]]
];

// Africa's position is a slide (dx, dy) and a turn (deg, clockwise on screen) about PIVOT.
export type Pose = { dx: number; dy: number; deg: number };
const af = matches.map(m => project(m[1])), sa = matches.map(m => project(m[0]));
const mean = (ps: Pt[]): Pt => [ps.reduce((s, p) => s + p[0], 0) / ps.length, ps.reduce((s, p) => s + p[1], 0) / ps.length];
export const PIVOT = mean(af);
const target = mean(sa);
const fitDeg = (() => {
 let c = 0, s = 0;
 af.forEach((a, i) => {
  const [x1, y1] = [a[0] - PIVOT[0], a[1] - PIVOT[1]], [x2, y2] = [sa[i][0] - target[0], sa[i][1] - target[1]];
  c += x1 * x2 + y1 * y2; s += x1 * y2 - y1 * x2;
 });
 return Math.atan2(s, c) * 180 / Math.PI;
})();
// Nudged a few units so the simplified coastlines touch instead of overlapping.
export const FIT: Pose = { dx: target[0] - PIVOT[0] + 5, dy: target[1] - PIVOT[1] - 3, deg: Math.round(fitDeg) };
export const TODAY: Pose = { dx: 0, dy: 0, deg: 0 };
export const poseTransform = (p: Pose) => `translate(${p.dx.toFixed(1)} ${p.dy.toFixed(1)}) rotate(${p.deg.toFixed(1)} ${PIVOT[0].toFixed(1)} ${PIVOT[1].toFixed(1)})`;

export type ClueId = 'meso' | 'gloss' | 'rocks' | 'ice';
export type Clue = { id: ClueId; name: string; key: string; color: string; pattern: string; sa: LonLat[][]; af: LonLat[][]; what: string; why: string };

// Approximate areas only, simplified from published maps of where each clue is found.
export const clues: Clue[] = [
 { id: 'meso', name: 'Mesosaurus fossils', key: '🦎', color: '#c4462f', pattern: 'pt-hatch-meso',
  sa: [[[-50.5, -22.5], [-47.5, -23], [-48.5, -27], [-50.5, -30.5], [-54.5, -32.5], [-56.5, -31.5], [-54, -28], [-52.5, -24.5]]],
  af: [[[15.5, -24], [19.5, -23.5], [24, -27], [26.5, -31], [22, -33], [18.5, -31.5], [16.5, -28]]],
  what: 'A small swimming reptile, about 1 meter long, that lived in shallow coastal seas and lagoons about 275 million years ago.',
  why: 'It lived in shallow water and could not have crossed thousands of kilometers of deep, open ocean, yet its fossils are found in Brazil, Uruguay, and southern Africa and nowhere else.' },
 { id: 'gloss', name: 'Glossopteris fossils', key: '🌿', color: '#3d8a3a', pattern: 'pt-hatch-gloss',
  sa: [[[-60, -20], [-42, -14], [-41, -22], [-50, -31], [-58, -36], [-66, -38], [-68, -30]]],
  af: [[[14, -16], [34, -12], [36, -24], [30, -32], [19, -33], [16, -26]]],
  what: 'A seed fern plant whose fossil leaves are about 260 to 300 million years old.',
  why: 'Its seeds were too big to blow across an ocean. Its fossils are found in South America, Africa, India, Antarctica, and Australia: every southern continent.' },
 { id: 'rocks', name: 'Very old rocks', key: '🪨', color: '#7a5aa8', pattern: 'pt-hatch-rocks',
  sa: [[[-46.5, -1.3], [-43.5, -2.4], [-42.5, -4.8], [-45.5, -5.5], [-47, -3.5]], [[-61, 7.5], [-55, 5.3], [-51.5, 3.5], [-52, 1], [-58, 1], [-63, 3.5]]],
  af: [[[-12, 8], [-8, 12], [-2, 13], [1.5, 10], [1, 6], [-3, 5], [-7.5, 4.8], [-11, 6.5]]],
  what: 'Rocks about 2 billion years old, with the same kinds of minerals and the same ages.',
  why: 'These old rock regions stop at the coast of Brazil and the Guianas and start again in West Africa, like a picture torn in half.' },
 { id: 'ice', name: 'Glacier marks', key: '🧊', color: '#2f74b5', pattern: 'pt-hatch-ice',
  sa: [[[-52, -19], [-46.5, -22.5], [-48.5, -28], [-53, -31.5], [-56, -30], [-55, -24]]],
  af: [[[14, -19], [22, -18], [30, -23], [31, -29], [27, -33], [18.5, -32.5], [16, -27]]],
  what: 'Scratched bedrock and jumbled rock left by thick ice sheets about 300 million years ago.',
  why: 'Today these places are warm, some near the tropics. Glaciers that big make sense if the land was joined together and sat much closer to the South Pole.' }
];
