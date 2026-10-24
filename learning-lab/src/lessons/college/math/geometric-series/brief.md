# Lesson brief: Geometric Series

- Section / subject / level: College / Math / Calculus II (sequences and series unit). Also useful as review for anyone meeting series again in differential equations, probability, or computer science.
- Student learning objective (observable): The student explains in their own words why a geometric series with |r| < 1 adds up to a finite number, derives S_n = a(1 − r^n)/(1 − r) by shifting and subtracting, decides convergence from the common ratio, and, given a geometric series in sigma notation with any starting index, finds its first term, common ratio, and sum or states that it diverges.
- Topic / motivating question: How can infinitely many numbers add up to something finite, and how do you get the answer without memorizing a formula you don't trust?
- Standards: None. Undergraduate math has no single standards body; course placement is in `curriculum/college/syllabus-map.md`. Checked against OpenStax *Calculus Volume 2*, Section 5.2 (Infinite Series, subsection Geometric Series, and Example 5.10 on repeating decimals).
- Lesson type: Interactive (browser), five parts meant to be done in order:
  1. **Picture it:** two picture proofs on a unit square. ½ + ¼ + ⅛ + ⋯ shades half of what is left each step, so the leftover always equals the last piece. ¼ + 1⁄16 + ⋯ shades one of three equal quarters at each level, so the shaded part is always one third.
  2. **Watch it add up:** choose a and r (slider or presets, including negative and |r| ≥ 1). Add terms one at a time or let them run. A number line shows each hop and the shrinking gap to a/(1 − r); a readout shows that gap now ÷ gap before = r. A graph and table track S_n. Students predict first whether the total will settle. Explanations change for 0 < r < 1, −1 < r < 0, r = 1, r = −1, and |r| > 1.
  3. **Why the formula works:** a six-step derivation with real numbers. Write S_n, multiply by r (the row shifts one column), subtract (the middle cancels), solve for S_n and check it against direct addition, let n grow (a table of r^n), then the S = a + rS shortcut and the 1 + 2 + 4 + ⋯ = −1 trap.
  4. **Where it shows up:** repeating decimals (any block up to 6 digits, including 0.999… = 1) and a bouncing ball (total distance, plus the bounce times forming a second geometric series with ratio √r, so infinitely many bounces finish in finite time).
  5. **Practice:** rounds of 6 randomly generated series in sigma notation with starting index 0, 1, or 2, alternating signs, powers like 2^{2n}/5^n, and at least one divergent series. Students answer in stages (a, then r, then converge or diverge, then the sum) with feedback aimed at the specific slip.
- Target duration: About 45 minutes for all five; parts 1 and 2 work alone as a 15-minute lecture opener, and part 5 alone as 10 to 15 minutes of practice.
- Setting: Self-study on a laptop or phone, projected in lecture or recitation, or in tutoring.
- Prior knowledge: Algebra with exponents and fractions, sigma notation, and the limit of a sequence (in particular that r^n → 0 when |r| < 1, which part 3 also shows numerically).
- Key misconceptions:
  - Infinitely many positive terms must add to infinity.
  - The first term is the coefficient in front, whatever the starting index.
  - The ratio is first ÷ second, or its sign can be ignored.
  - a/(1 − r) works for every r (1 + 2 + 4 + ⋯ = −1).
  - Bounded partial sums mean convergence (r = −1).
  - 0.999… is slightly less than 1.
  - An infinite sum is reached after enough terms, rather than being a limit.
- Student actions and feedback: Step picture proofs; predict, then add terms and watch the gap; switch ratios to see each regime; step through the derivation with their own a, r, and n; type repeating blocks; change ball height and bounce ratio; answer staged practice with targeted hints and a "Show me this step" option after two misses.
- Formative assessment / evidence of learning: Prediction check in part 2; the derivation's numeric check; practice round score and the list of series the student slipped on, with "Redo the ones I slipped on". Nothing is stored.
- Accessibility / device constraints: All controls are buttons, sliders, or text inputs with labels and work by keyboard. Practice input submits with Enter and returns focus to the answer box. Feedback and readouts use polite live regions. Formulas and charts have plain-text labels. Animations are short and turn off under reduced motion (the ball jumps to the end). Charts redraw at phone width with larger labels.
- Reliable educational sources: OpenStax *Calculus Volume 2*, Section 5.2; OpenStax *University Physics Volume 1*, Section 3.5 (free fall, for the bounce times). The picture proofs are classic folklore constructions, drawn here as original SVG. No textbook images or problem banks were copied.
- Known simplifications and limitations: See `lesson.json` `modelLimitations`.
- Reviewer sign-off needed: Yes, a Calculus II instructor or subject expert. Check the mathematics, the wording of the "gap" explanation, the practice feedback, and fit with how their course writes series (for example, a·r^n starting at n = 0 versus a·r^(n−1) starting at n = 1).
