// "Spot the flaw" proofs. flaw is the index of the broken part, or null for a correct proof.
export type Part = { label: string; text: string; ok: string }; // ok: why this part is fine (shown if picked by mistake)
export type FlawedProof = { title: string; parts: Part[]; flaw: number | null; explain: string; fix: string };

export const proofs: FlawedProof[] = [
 {
  title: 'All horses are the same color',
  parts: [
   { label: 'Claim', text: 'For every n ≥ 1, any group of n horses are all the same color.', ok: 'The claim is false, which is why you’re hunting for the flaw. But stating it is fine.' },
   { label: 'Base case', text: 'A group of 1 horse is all one color.', ok: 'One horse is trivially the same color as itself. This part holds.' },
   { label: 'Inductive hypothesis', text: 'Assume any group of k horses are all the same color, for some k ≥ 1.', ok: 'A correctly stated hypothesis: one particular k.' },
   { label: 'Inductive step', text: 'Take k+1 horses. Leave out the first: the other k are one color. Leave out the last: those k are one color. The horses in the middle belong to both groups, so both groups share a color, and all k+1 match.', ok: '' },
   { label: 'Conclusion', text: 'By induction, all horses are the same color.', ok: 'The conclusion follows correctly, if the step were valid.' }
  ],
  flaw: 3,
  explain: 'The step quietly needs a horse “in the middle,” in both groups. Go from k = 1 to k + 1 = 2: the groups are {horse 1} and {horse 2}, with nobody in common. The step works for every k ≥ 2 but fails at k = 1, and that one broken link stops the chain right after the first domino.',
  fix: 'There is no fix: the claim is false. The lesson is that the step has to work for every k from the base case on, including the smallest.'
 },
 {
  title: 'Every number equals the next one',
  parts: [
   { label: 'Claim', text: 'For every n ≥ 1, n = n + 1.', ok: 'Obviously false, but stating it is fine.' },
   { label: 'Base case', text: 'The step is the hard part, so we skip straight to it.', ok: '' },
   { label: 'Inductive hypothesis', text: 'Assume k = k + 1 for some k ≥ 1.', ok: 'This is a correct form for the hypothesis, even though it’s never true.' },
   { label: 'Inductive step', text: 'Add 1 to both sides: k + 1 = k + 2. That is the claim for n = k + 1.', ok: 'Surprisingly, this step is valid. If k = k + 1 were true, then k + 1 = k + 2 would follow.' },
   { label: 'Conclusion', text: 'By induction, n = n + 1 for every n ≥ 1.', ok: 'The conclusion would follow from a base case and a step. Look for the part that’s missing.' }
  ],
  flaw: 1,
  explain: 'There is no base case, and there can’t be one: 1 = 2 is false. The step is a valid if-then, but nobody pushes the first domino. A valid step on its own proves nothing.',
  fix: 'Always prove the base case, even when it looks trivial. Here, checking it shows the claim is false.'
 },
 {
  title: 'The sum formula, backwards',
  parts: [
   { label: 'Claim', text: 'For every n ≥ 1, 1 + 2 + ⋯ + n = [[n(n+1)//2]].', ok: 'This claim is true, and it’s stated correctly.' },
   { label: 'Base case', text: 'n = 1: 1 = [[1·2//2]]. ✓', ok: 'The base case is checked correctly.' },
   { label: 'Inductive hypothesis', text: 'Assume 1 + 2 + ⋯ + (k+1) = [[(k+1)(k+2)//2]].', ok: '' },
   { label: 'Inductive step', text: 'Subtract (k+1) from both sides. The right side simplifies to [[k(k+1)//2]], so 1 + 2 + ⋯ + k = [[k(k+1)//2]], which is the claim for k. ✓', ok: 'The algebra here is correct. The problem is what it starts from.' },
   { label: 'Conclusion', text: 'By induction, the formula holds for every n ≥ 1.', ok: 'Look earlier. The conclusion would be fine if the step had shown the right thing.' }
  ],
  flaw: 2,
  explain: 'The “hypothesis” is P(k+1), the thing the step is supposed to prove. Starting from the goal and arriving at something true (P(k)) shows P(k+1) ⇒ P(k), the wrong direction. Dominoes falling backwards don’t reach the end of the line.',
  fix: 'Assume P(k) and work toward P(k+1). Scratch work can go backwards, but the written proof has to run forwards. See the proof workshop for the correct version.'
 },
 {
  title: 'Powers of 2 beat squares',
  parts: [
   { label: 'Claim', text: 'For every n ≥ 1, 2ⁿ > n².', ok: 'Stating the claim is fine. Is it true for small n, though? Try n = 2, 3, and 4.' },
   { label: 'Base case', text: 'n = 1: 2 > 1. ✓', ok: 'This check is correct. But it’s not where the proof breaks.' },
   { label: 'Inductive hypothesis', text: 'Assume 2ᵏ > k² for some k ≥ 1.', ok: 'Correct form: one particular k.' },
   { label: 'Inductive step', text: '2ᵏ⁺¹ = 2·2ᵏ > 2k² ≥ (k+1)², so 2ᵏ⁺¹ > (k+1)².', ok: '' },
   { label: 'Conclusion', text: 'By induction, 2ⁿ > n² for every n ≥ 1.', ok: 'The conclusion would follow if the step held for every k ≥ 1.' }
  ],
  flaw: 3,
  explain: 'The step uses 2k² ≥ (k+1)², which is only true for k ≥ 3 (at k = 2: 8 ≥ 9 is false). The claim itself fails at n = 2 (4 > 4), n = 3 (8 > 9), and n = 4 (16 > 16).',
  fix: 'Start the induction at n = 5, where 32 > 25. Then every k in the step is at least 5 and 2k² ≥ (k+1)² holds. The corrected theorem is “2ⁿ > n² for every n ≥ 5.”'
 },
 {
  title: 'Odd numbers add up to squares',
  parts: [
   { label: 'Claim', text: 'For every n ≥ 1, 1 + 3 + ⋯ + (2n−1) = n².', ok: '' },
   { label: 'Base case', text: 'n = 1: 1 = 1². ✓', ok: '' },
   { label: 'Inductive hypothesis', text: 'Assume 1 + 3 + ⋯ + (2k−1) = k² for some k ≥ 1.', ok: '' },
   { label: 'Inductive step', text: '1 + 3 + ⋯ + (2k−1) + (2k+1) = k² + 2k + 1 = (k+1)².', ok: '' },
   { label: 'Conclusion', text: 'By induction, the formula holds for every n ≥ 1.', ok: '' }
  ],
  flaw: null,
  explain: 'This proof is correct. The base case is checked, the hypothesis is P(k) for one k, the step starts from the left side of P(k+1), uses the hypothesis once, and reaches the right side. It’s terse, but every piece is there.',
  fix: ''
 },
 {
  title: 'Postage from 4¢ and 5¢ stamps',
  parts: [
   { label: 'Claim', text: 'Every amount of postage of 12¢ or more can be made from 4¢ and 5¢ stamps.', ok: '' },
   { label: 'Base case', text: '12¢ = three 4¢ stamps. ✓', ok: '' },
   { label: 'Inductive hypothesis', text: 'Assume k¢ can be made, for some k ≥ 12.', ok: '' },
   { label: 'Inductive step', text: 'If the stamps for k¢ include a 4¢, swap it for a 5¢. If not, they are all 5¢ stamps, and since k ≥ 12 there are at least three; swap three 5¢ for four 4¢ (15¢ out, 16¢ in). Either way you get k+1 cents.', ok: '' },
   { label: 'Conclusion', text: 'By induction, every amount from 12¢ up can be made.', ok: '' }
  ],
  flaw: null,
  explain: 'This proof is correct, and the base case at 12 matters. The step needs “at least three 5¢ stamps” whenever there’s no 4¢ stamp, which is guaranteed because k ≥ 12. (11¢ really can’t be made.)',
  fix: ''
 }
];
