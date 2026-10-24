// Claims for the proof workshop. Math strings use Unicode; [[a//b]] is a stacked fraction (see Expr.tsx).
export type Choice = { text: string; ok?: boolean; why: string };
export type Step = { prompt: string; choices: Choice[] };
export type PictureKind = 'stairs' | 'odds' | 'doubling';
export type Claim = {
 id: string;
 tab: string;
 statement: string; // P(n)
 reading: string;
 start: number;
 picture: PictureKind;
 maxN: number;
 check: (n: number) => { lhs: string; rhs: string; ok: boolean };
 base: string[];
 hypothesis: Choice[];
 goal: string;
 from: string; // left side of P(k+1), where the step starts
 steps: Step[];
 insight: string;
};

const sumTo = (n: number) => Array.from({ length: n }, (_, i) => i + 1);
const listed = (xs: number[]) => xs.length <= 6 ? xs.join(' + ') : `${xs.slice(0, 3).join(' + ')} + ⋯ + ${xs[xs.length - 1]}`;
export const sup = (n: number) => String(n).split('').map(d => '⁰¹²³⁴⁵⁶⁷⁸⁹'[+d]).join('');

export const claims: Claim[] = [
 {
  id: 'sum', tab: 'Sum of 1 to n',
  statement: '1 + 2 + ⋯ + n = [[n(n+1)//2]]',
  reading: 'Adding the whole numbers from 1 to n gives n(n+1)/2.',
  start: 1, picture: 'stairs', maxN: 10,
  check: n => { const xs = sumTo(n); return { lhs: `${listed(xs)} = ${n * (n + 1) / 2}`, rhs: `${n}·${n + 1}/2 = ${n * (n + 1) / 2}`, ok: true }; },
  base: ['Left side: 1', 'Right side: [[1·2//2]] = 1', 'They match, so P(1) is true.'],
  hypothesis: [
   { text: 'Assume 1 + 2 + ⋯ + k = [[k(k+1)//2]] for some particular k ≥ 1.', ok: true, why: 'Right. k is one fixed but arbitrary number. You aren’t claiming this is true. You’re asking what would follow if it were.' },
   { text: 'Assume 1 + 2 + ⋯ + n = [[n(n+1)//2]] for every n ≥ 1.', why: 'That is the whole claim. Assuming it would be circular. The hypothesis is about one k at a time, and it’s only the “if” half of an if-then.' },
   { text: 'Assume 1 + 2 + ⋯ + (k+1) = [[(k+1)(k+2)//2]].', why: 'That is P(k+1), the thing the step has to prove. You can’t assume it.' }
  ],
  goal: '1 + 2 + ⋯ + (k+1) = [[(k+1)(k+2)//2]]',
  from: '1 + 2 + ⋯ + k + (k+1)',
  steps: [
   { prompt: 'Find the copy of P(k) hiding inside the left side.', choices: [
    { text: '= 1 + (2 + 3 + ⋯ + (k+1))', why: 'True, but the part in parentheses doesn’t match anything you know. Look for 1 + 2 + ⋯ + k.' },
    { text: '= (1 + 2 + ⋯ + k) + (k+1)', ok: true, why: 'Grouping the first k terms exposes exactly the left side of P(k). This is the key move in almost every induction proof.' },
    { text: '= [[(k+1)(k+2)//2]]', why: 'That’s the goal. Writing it here assumes what you’re trying to prove.' }
   ] },
   { prompt: 'Use the inductive hypothesis.', choices: [
    { text: '= [[k(k+1)//2]] + (k+1)', ok: true, why: 'This is the one place the hypothesis is used: the grouped part equals k(k+1)/2 because you assumed P(k).' },
    { text: '= [[k(k+1)//2]]', why: 'The new term (k+1) disappeared. The hypothesis replaces only the grouped part.' },
    { text: '= [[(k+1)(k+2)//2]] + (k+1)', why: 'That substitutes P(k+1) instead of P(k). It assumes the goal, and it isn’t even true.' }
   ] },
   { prompt: 'Simplify until it looks like the goal.', choices: [
    { text: '= [[k(k+2)//2]]', why: 'Test it with k = 1: 1·2/2 + 2 = 3, but 1·3/2 = 1.5. Something was dropped.' },
    { text: '= [[k² + k + 1//2]]', why: 'The (k+1) also needs a denominator of 2: k + 1 = (2k + 2)/2.' },
    { text: '= (k+1)([[k//2]] + 1) = [[(k+1)(k+2)//2]]', ok: true, why: 'Factor out (k+1). The result is the formula with n = k+1, which is the goal.' }
   ] }
  ],
  insight: 'In the picture, the inductive step is one new column of k+1 squares added to the staircase. The algebra just counts that column.'
 },
 {
  id: 'odds', tab: 'Sum of odd numbers',
  statement: '1 + 3 + 5 + ⋯ + (2n−1) = n²',
  reading: 'The first n odd numbers add up to n squared.',
  start: 1, picture: 'odds', maxN: 10,
  check: n => { const xs = sumTo(n).map(i => 2 * i - 1); return { lhs: `${listed(xs)} = ${n * n}`, rhs: `${n}² = ${n * n}`, ok: true }; },
  base: ['Left side: 1 (just the first odd number)', 'Right side: 1² = 1', 'They match, so P(1) is true.'],
  hypothesis: [
   { text: 'Assume (2k−1) = k² for some particular k ≥ 1.', why: 'That is only the last term. The hypothesis is about the whole sum 1 + 3 + ⋯ + (2k−1).' },
   { text: 'Assume 1 + 3 + ⋯ + (2n−1) = n² for every n ≥ 1.', why: 'That is the whole claim, so assuming it is circular. Assume it for one particular k.' },
   { text: 'Assume 1 + 3 + ⋯ + (2k−1) = k² for some particular k ≥ 1.', ok: true, why: 'Right. One fixed k, assumed only for the sake of the if-then.' }
  ],
  goal: '1 + 3 + ⋯ + (2k+1) = (k+1)²',
  from: '1 + 3 + ⋯ + (2(k+1)−1)',
  steps: [
   { prompt: 'Split off the last term and find P(k) inside.', choices: [
    { text: '= (1 + 3 + ⋯ + (2k−1)) + 2k', why: '2k is even. The next odd number after 2k−1 is two more: 2k+1.' },
    { text: '= (k+1)²', why: 'That is the goal. You can’t write it down until you’ve shown it.' },
    { text: '= (1 + 3 + ⋯ + (2k−1)) + (2k+1)', ok: true, why: 'The last term is 2(k+1)−1 = 2k+1, and everything before it is the left side of P(k).' }
   ] },
   { prompt: 'Use the inductive hypothesis.', choices: [
    { text: '= k² + (2k+1)', ok: true, why: 'The grouped sum is k² by the hypothesis. The new odd number stays.' },
    { text: '= (k+1)² + (2k+1)', why: 'That replaces the sum with P(k+1)’s right side, which assumes the goal.' },
    { text: '= k²', why: 'The new term 2k+1 vanished. The hypothesis only covers the first k odd numbers.' }
   ] },
   { prompt: 'Simplify until it looks like the goal.', choices: [
    { text: '= 2k² + 1', why: 'k² and 2k aren’t like terms, so they can’t be combined into 2k².' },
    { text: '= k² + 2k + 1 = (k+1)²', ok: true, why: 'k² + 2k + 1 is a perfect square. That’s the goal.' },
    { text: '= k² + 2k', why: 'The +1 went missing. Check with k = 1: 1 + 3 = 4, not 3.' }
   ] }
  ],
  insight: 'In the picture, the next odd number 2k+1 is an L-shaped layer of squares: k along the top, k down the side, and 1 in the corner. It wraps the k×k square into a (k+1)×(k+1) square.'
 },
 {
  id: 'doubling', tab: '2ⁿ > n (an inequality)',
  statement: '2ⁿ > n',
  reading: 'Doubling, starting from 1, stays ahead of counting.',
  start: 1, picture: 'doubling', maxN: 6,
  check: n => ({ lhs: `2${sup(n)} = ${2 ** n}`, rhs: `n = ${n}`, ok: 2 ** n > n }),
  base: ['Left side: 2¹ = 2', 'Right side: 1', '2 > 1, so P(1) is true.'],
  hypothesis: [
   { text: 'Assume 2ᵏ⁺¹ > k + 1.', why: 'That is P(k+1), the goal of the step.' },
   { text: 'Assume 2ᵏ > k for some particular k ≥ 1.', ok: true, why: 'Right. Inequalities work the same way: one fixed k, used as the “if”.' },
   { text: 'Assume 2ᵏ = k for some particular k ≥ 1.', why: 'The claim is an inequality, so the hypothesis is too. 2ᵏ = k is never true.' }
  ],
  goal: '2ᵏ⁺¹ > k + 1',
  from: '2ᵏ⁺¹',
  steps: [
   { prompt: 'Rewrite the left side so 2ᵏ appears.', choices: [
    { text: '= 2ᵏ + 1', why: 'Raising the exponent by one doubles the number. It doesn’t add 1.' },
    { text: '= 2(k+1)', why: 'That assumes 2ᵏ = k+1, which nothing tells you.' },
    { text: '= 2ᵏ + 2ᵏ', ok: true, why: 'Doubling means adding a second copy. Now there are two places the hypothesis could help.' }
   ] },
   { prompt: 'Use the inductive hypothesis.', choices: [
    { text: '> k + 2ᵏ', ok: true, why: 'Replace one copy of 2ᵏ with the smaller k. The direction of the inequality comes from the hypothesis 2ᵏ > k.' },
    { text: '= k + 2ᵏ', why: 'The hypothesis says 2ᵏ > k, not 2ᵏ = k. Keep the inequality sign.' },
    { text: '> (k+1) + 2ᵏ', why: 'That uses 2ᵏ > k+1, which is the goal, not the hypothesis.' }
   ] },
   { prompt: 'Finish: you only need to reach k + 1.', choices: [
    { text: '> k + 2', why: 'That needs 2ᵏ > 2, which fails at k = 1. The step must work for every k ≥ 1.' },
    { text: '≥ k + 1', ok: true, why: 'Every power of 2 is at least 1, so 2ᵏ ≥ 1. With the strict > from the last line, 2ᵏ⁺¹ > k + 1.' },
    { text: '≥ 2k + 2', why: 'Too greedy: it needs 2ᵏ ≥ k + 2, which fails at k = 1.' }
   ] }
  ],
  insight: 'Inequality steps feel different because you are allowed to throw away room. Once you are above k + 1 you can stop, even if you are far above it. Pick bounds that hold for every k in the range, including the smallest one.'
 }
];
